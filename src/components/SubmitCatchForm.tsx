import React, { useState, useRef } from 'react';
import { 
  Trophy, 
  Upload, 
  Camera, 
  MapPin, 
  Ruler, 
  Scale, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  RefreshCw,
  X,
  Plus,
  Key
} from 'lucide-react';
import { Tournament, Catch, UserProfile, Team } from '../types';
import { submitCatch, subscribeUserTeam } from '../utils/dbHelpers';

interface SubmitCatchFormProps {
  tournaments: Tournament[];
  currentUser: UserProfile;
  initialTournament?: Tournament | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SubmitCatchForm({ 
  tournaments, 
  currentUser, 
  initialTournament, 
  onSuccess, 
  onCancel 
}: SubmitCatchFormProps) {
  const activeTournaments = tournaments.filter(t => t.status === 'active');
  
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    initialTournament?.id || activeTournaments[0]?.id || ''
  );
  
  const currentTournament = tournaments.find(t => t.id === selectedTournamentId);

  // Form states
  const [species, setSpecies] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoError, setPhotoError] = useState<string>('');
  const [userTeam, setUserTeam] = useState<Team | null>(null);

  // Subscribe to user team
  React.useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeUserTeam(currentUser.uid, (team) => {
      setUserTeam(team);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [currentUser?.uid]);

  // AI Validation variables
  const [isVerifyingAI, setIsVerifyingAI] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<Catch['aiFeedback'] | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string>('');

  // Camera integration vars
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Species options suggested by selected tournament
  const suggestedSpecies = currentTournament?.targetSpecies || [];

  // Drag and drop / local file upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPhoto(file);
    }
  };

  const processPhoto = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) { // 8MB limit
      setPhotoError('A imagem deve ter no máximo 8MB.');
      return;
    }

    setPhotoError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
      // Reset AI feedback since photo changed
      setAiFeedback(null);
      setAiErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Webcam operations
  const startCamera = async () => {
    try {
      setPhotoError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer rearview camera on mobile
      });
      setCameraStream(stream);
      setUseCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e: any) {
      console.error("Camera access failed:", e);
      setPhotoError("Permissão de câmera negada ou indisponível.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoBase64(dataUrl);
        stopCamera();
        setAiFeedback(null);
        setAiErrorMessage('');
      }
    }
  };

  // Run AI valuation before submitting
  const runAIVerification = async () => {
    if (!photoBase64) {
      setPhotoError('Faça o upload de uma foto primeiro para que a IA analise.');
      return;
    }
    if (!species) {
      setFormError('Por favor, digite ou selecione a Espécie do peixe antes da análise.');
      return;
    }

    setIsVerifyingAI(true);
    setAiErrorMessage('');
    setAiFeedback(null);

    try {
      const parsedLength = parseFloat(length) || 30; // Mock standard if empty
      const parsedWeight = parseFloat(weight) || undefined;

      const res = await fetch('/api/verify-catch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoBase64,
          targetSpecies: species,
          claimedLength: parsedLength,
          claimedWeight: parsedWeight
        })
      });

      if (!res.ok) {
        throw new Error('Falha técnica no servidor de IA.');
      }

      const data = await res.json();
      setAiFeedback(data);

      // Auto-correct species or match it based on AI consensus if positive
      if (data.complianceCheck && data.identifiedSpecies && data.identifiedSpecies !== species) {
        // Offer suggestion / keep alert
      }

    } catch (err: any) {
      console.error(err);
      setAiErrorMessage('Não foi possível obter a resposta da IA. O campeonato aceitará seu envio mesmo assim e passará por moderação comum.');
    } finally {
      setIsVerifyingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedTournamentId) {
      setFormError('Selecione um campeonato ativo.');
      return;
    }
    if (!species.trim()) {
      setFormError('Informe a espécie do peixe capturado.');
      return;
    }
    if (!length || parseFloat(length) <= 0) {
      setFormError('Informe um comprimento válido em cm.');
      return;
    }
    if (!location.trim()) {
      setFormError('Descreva o local da captura (ex: Rio Grande - MG, Represa Billings, etc).');
      return;
    }
    if (!photoBase64) {
      setPhotoError('A foto do seu peixe é obrigatória para homologação.');
      return;
    }

    // Team validation
    const isTeamTournament = currentTournament?.teamFormat && currentTournament.teamFormat !== 'solo';
    if (isTeamTournament) {
      const requiredSpots = currentTournament?.teamFormat === 'dupla' ? 2 : currentTournament?.teamFormat === 'trio' ? 3 : currentTournament?.teamFormat === 'quarteto' ? 4 : 5;
      
      if (!userTeam) {
        setFormError(`Este campeonato é no formato ${currentTournament?.teamFormat.toUpperCase()} (${requiredSpots} pessoas). Você precisa criar ou entrar em uma equipe no seu Perfil antes de enviar capturas.`);
        return;
      }
      if (userTeam.maxMembers !== requiredSpots) {
        setFormError(`Este campeonato exige uma equipe de ${requiredSpots} pessoas (${currentTournament?.teamFormat.toUpperCase()}), mas sua equipe "${userTeam.name}" tem capacidade para ${userTeam.maxMembers} pessoas.`);
        return;
      }
      if (userTeam.status !== 'approved') {
        const msg = userTeam.status === 'rejected'
          ? `Sua equipe "${userTeam.name}" foi reprovada pela moderação (${userTeam.rejectionReason || 'Verifique com a organização'}).`
          : `Sua equipe "${userTeam.name}" está aguardando aprovação do Administrador. Apenas equipes homologadas podem enviar capturas.`;
        setFormError(msg);
        return;
      }
      const memberCount = userTeam.members ? userTeam.members.length : 0;
      if (memberCount < requiredSpots) {
        setFormError(`Sua equipe precisa estar COMPLETA (${memberCount}/${requiredSpots} membros) para enviar capturas. Compartilhe o código "${userTeam.code}" com seus parceiros para preencher todas as vagas.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Setup payload matching interface
      const payload: Omit<Catch, 'id' | 'createdAt' | 'status' | 'likes' | 'comments'> = {
        tournamentId: selectedTournamentId,
        tournamentTitle: currentTournament?.title || 'Torneio',
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        teamId: userTeam?.id,
        teamName: userTeam?.name,
        teamLogo: userTeam?.logoUrl,
        species: species.trim(),
        length: parseFloat(length),
        weight: weight ? parseFloat(weight) : undefined,
        location: location.trim(),
        photoUrl: photoBase64,
        verifiedByAI: aiFeedback !== null,
        aiFeedback: aiFeedback || undefined
      };

      await submitCatch(payload);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setFormError('Ocorreu um erro ao salvar sua submissão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl max-w-3xl mx-auto">
      <div className="flex justify-between items-center pb-5 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2.5">
            <Trophy className="h-6 w-6 text-sky-400" />
            <span>Enviar Nova Captura</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Qualquer lugar do Brasil. Envie fita de medição visível.</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Tournament Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Campeonato Ativo</label>
          <select
            value={selectedTournamentId}
            onChange={(e) => {
              setSelectedTournamentId(e.target.value);
              setSpecies(''); // clear species when changing tournament
            }}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 text-xs sm:text-sm cursor-pointer"
          >
            {activeTournaments.length === 0 && (
              <option disabled>Nenhum campeonato ativo no momento</option>
            )}
            {activeTournaments.map((t) => (
              <option key={t.id} value={t.id}>
                🏆 {t.title} (Até {t.endDate.split('-')[2]}/{t.endDate.split('-')[1]})
              </option>
            ))}
          </select>
        </div>

        {/* Anti-fraud Keyword Warning Panel */}
        {currentTournament && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-400">
              <Key className="h-4 w-4 stroke-[2.2]" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Palavra-Chave Antifraude Exigida</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para comprovar que a captura foi feita hoje ou durante o torneio (evitando envio de fotos antigas), você deve tirar a foto do peixe deitado de forma que apareça uma folha, papel ou placa escrita de forma bem visível a palavra-chave oficial do campeonato:
            </p>
            <div className="flex items-center space-x-3.5 mt-2 bg-slate-950 p-2.5 rounded-xl border border-amber-500/20 w-fit">
              <span className="text-[10px] text-slate-500 font-mono uppercase">PALAVRA-CHAVE ATIVA:</span>
              <span className="font-extrabold text-amber-450 font-mono text-sm tracking-wider uppercase px-2 py-0.5 bg-amber-500/10 rounded">
                {currentTournament.keyword || "PESCA2026"}
              </span>
            </div>
            <p className="text-[10px] text-amber-500/80 italic">
              🚨 Importante: Os juízes de validação reprovarão qualquer peixe homologado sem esta palavra explicita e legível na foto.
            </p>
          </div>
        )}

        {/* Catch Info Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Species Select & Input Combo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Espécie Oficial</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Tucunaré Azul"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs sm:text-sm"
              />
            </div>
            {suggestedSpecies.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Sugestões do Campeonato:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSpecies.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSpecies(s)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition ${
                        species === s
                          ? 'bg-sky-500/10 border-sky-400 text-sky-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      +{s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Local da Captura</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-slate-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Ex: Rio Paranaíba - Itumbiara GO"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs sm:text-sm text-slate-200"
              />
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Basta informar município, represa ou rio em linhas gerais.</span>
          </div>

          {/* Length */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Comprimento (cm)</label>
            <div className="relative">
              <Ruler className="absolute left-3 top-2.5 text-slate-500 h-4 w-4" />
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 58.5"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs sm:text-sm text-slate-200"
              />
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Do focinho até a ponta da cauda sobre fita visível.</span>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Peso Estimado (kg) - Opcional</label>
            <div className="relative">
              <Scale className="absolute left-3 top-2.5 text-slate-500 h-4 w-4" />
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 4.25"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs sm:text-sm text-slate-200"
              />
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Opcional. Adicione se tiver balança homologada na foto.</span>
          </div>
        </div>

        {/* Captured Photo Upload & Camera Sector */}
        <div className="space-y-3.5 border-t border-slate-800 pt-5">
          <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Foto Oficial de Homologação</label>
          
          {photoError && (
            <p className="text-rose-450 font-semibold text-xs bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{photoError}</span>
            </p>
          )}

          {/* Photo Preview Container */}
          {photoBase64 ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800 bg-slate-950 flex justify-center items-center">
              <img 
                src={photoBase64} 
                alt="Upload preview" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoBase64('');
                  setAiFeedback(null);
                  setAiErrorMessage('');
                }}
                className="absolute top-4 right-4 bg-slate-950/80 hover:bg-rose-600 border border-slate-800 text-white p-2 rounded-xl transition cursor-pointer"
                title="Remover foto"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Verified Badge preview */}
              {aiFeedback && (
                <div className={`absolute bottom-4 left-4 z-10 px-3.5 py-1.5 rounded-xl border backdrop-blur-md flex items-center gap-2 text-xs font-semibold ${
                  aiFeedback.complianceCheck 
                    ? 'bg-indigo-950/80 text-sky-400 border-indigo-500/35' 
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/35'
                }`}>
                  <Sparkles className="h-4.5 w-4.5 text-sky-400" />
                  <span>Espécie Confirmada por IA: {aiFeedback.identifiedSpecies} ({Math.round(aiFeedback.confidence * 100)}%)</span>
                </div>
              )}
            </div>
          ) : useCamera ? (
            /* Live Camera block */
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800 bg-slate-950">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition"
                >
                  <Camera className="h-4.5 w-4.5" />
                  <span>Capturar Imagem</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-4 py-2.5 rounded-xl hover:text-white transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* Choose Source block */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/10 transition-colors group"
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="h-11 w-11 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-sky-400 transition-colors shadow-sm">
                  <Upload className="h-5.5 w-5.5" />
                </div>
                <h4 className="text-sm font-bold text-slate-200 mt-3 group-hover:text-sky-400">Escolha um Arquivo</h4>
                <p className="text-[11px] text-slate-500 mt-1">Carregue da sua galeria (Até 8MB)</p>
              </div>

              {/* Camera Box */}
              <button
                type="button"
                onClick={startCamera}
                className="border-2 border-dashed border-slate-800 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/10 transition group text-slate-200 hover:text-emerald-400"
              >
                <div className="h-11 w-11 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors shadow-sm mb-3">
                  <Camera className="h-5.5 w-5.5" />
                </div>
                <h4 className="text-sm font-bold mt-0.5">Tirar Foto com a Câmera</h4>
                <p className="text-[11px] text-slate-500 mt-1">Capture o peixe em tempo real do bote</p>
              </button>
            </div>
          )}
        </div>

        {/* Live Gemini AI validation Assistant section */}
        {photoBase64 && (
          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">Validador de Espécie por IA (Gemini)</h4>
                  <p className="text-[10px] text-slate-500 font-mono">PRÉ-AVALIAÇÃO DE SEGURANÇA E AUTO-PREENCHIMENTO</p>
                </div>
              </div>

              <button
                type="button"
                onClick={runAIVerification}
                disabled={isVerifyingAI || !species}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:shadow-indigo-500/10 shadow-md transition disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
              >
                {isVerifyingAI ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                    <span>Analisando foto...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Solicitar Análise de IA</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Response Display */}
            {aiFeedback && (
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/15 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-500/10">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Check className="h-4 w-4 text-emerald-400" /> Relatório de Arbitrabilidade
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-xs font-bold">
                    Score: {Math.round(aiFeedback.confidence * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono">Espécie Visual:</span>
                    <p className="font-semibold text-slate-200">🐟 {aiFeedback.identifiedSpecies}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono">Verificação Visual de Escala:</span>
                    <p className="font-semibold text-slate-200">📏 {aiFeedback.estimatedLength}</p>
                  </div>
                </div>

                <p className="text-slate-300 italic text-xs leading-relaxed border-t border-indigo-500/5 pt-2">
                  "{aiFeedback.description}"
                </p>

                {!aiFeedback.complianceCheck && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-lg text-[11px] flex gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Atenção: A IA sinalizou risco ou incoerência na imagem. Sendo o caso do peixe estar muito distorcido, fita de medição inelegível ou espécie errada, isso poderá ser desqualificado retroativamente por coordenadores.</span>
                  </div>
                )}
              </div>
            )}

            {aiErrorMessage && (
              <p className="text-amber-450 text-[11px] bg-amber-500/5 border border-amber-500/20 px-3.5 py-2.5 rounded-xl">
                ⚠️ {aiErrorMessage}
              </p>
            )}
          </div>
        )}

        {/* Buttons submission */}
        <div className="flex justify-end space-x-3 border-t border-slate-800 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm rounded-xl font-semibold transition"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !photoBase64 || !species || !length}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-450 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg hover:shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registrando Pescaria...</span>
              </>
            ) : (
              <>
                <Check className="h-4.5 w-4.5" />
                <span>Enviar para Homologação</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
