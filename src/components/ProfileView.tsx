import React, { useState, useRef } from 'react';
import { 
  TrendingUp, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Ruler, 
  MapPin, 
  Video, 
  Image, 
  Upload, 
  AlertCircle, 
  Sparkles,
  ExternalLink,
  Camera
} from 'lucide-react';
import { UserProfile, Catch, Tournament } from '../types';
import { submitCatch } from '../utils/dbHelpers';

interface ProfileViewProps {
  currentUser: UserProfile;
  catches: Catch[];
  tournaments: Tournament[];
  selectedTournament?: Tournament | null;
  onNavigateToTournaments?: () => void;
  onOpenSubmitCatch?: () => void;
  onLogout: () => void;
}

export default function ProfileView({
  currentUser,
  catches,
  tournaments,
  selectedTournament,
  onNavigateToTournaments,
  onLogout
}: ProfileViewProps) {
  // Filter catches for current user
  const userCatches = catches.filter(
    c => c.userId === currentUser.uid || c.userEmail === currentUser.email
  );
  const approvedCatches = userCatches.filter(c => c.status === 'approved');
  const pendingCatches = userCatches.filter(c => c.status === 'pending');
  const rejectedCatches = userCatches.filter(c => c.status === 'rejected');

  // Stats calculation
  const totalCatchesCount = userCatches.length;
  const personalBest = approvedCatches.reduce((max, c) => (c.length > max ? c.length : max), 0);
  const avgLength = approvedCatches.length > 0 
    ? Math.round(approvedCatches.reduce((sum, c) => sum + c.length, 0) / approvedCatches.length) 
    : 0;
  const approvalRate = userCatches.length > 0
    ? Math.round((approvedCatches.length / userCatches.length) * 100)
    : 0;

  // Filter ONLY tournaments where this fisherman is actively enrolled or participating
  const participatingTournaments = tournaments.filter(t => {
    const isEnrolled = currentUser.enrolledTournaments?.includes(t.id);
    const hasCatchInTournament = userCatches.some(c => c.tournamentId === t.id);
    return Boolean(isEnrolled || hasCatchInTournament);
  });

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(() => {
    if (selectedTournament && participatingTournaments.some(t => t.id === selectedTournament.id)) {
      return selectedTournament.id;
    }
    return participatingTournaments[0]?.id || '';
  });

  // Sync selectedTournament when participatingTournaments or selectedTournament changes
  React.useEffect(() => {
    if (selectedTournament && participatingTournaments.some(t => t.id === selectedTournament.id)) {
      setSelectedTournamentId(selectedTournament.id);
    } else if (participatingTournaments.length > 0 && !participatingTournaments.some(t => t.id === selectedTournamentId)) {
      setSelectedTournamentId(participatingTournaments[0].id);
    } else if (participatingTournaments.length === 0) {
      setSelectedTournamentId('');
    }
  }, [participatingTournaments.length, selectedTournament?.id]);
  const [species, setSpecies] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [videoStartUrl, setVideoStartUrl] = useState<string>('');
  const [videoEndUrl, setVideoEndUrl] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  
  // Photo upload / Base64 handling
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form feedback state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('A imagem deve ter no máximo 8MB.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setPhotoBase64(b64);
      setPhotoUrl(file.name); // show filename in text field
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedTournamentId) {
      setErrorMsg('Por favor, selecione um torneio.');
      return;
    }
    if (!species.trim()) {
      setErrorMsg('Por favor, informe a espécie do peixe.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Por favor, informe o local da captura.');
      return;
    }
    const numLength = parseFloat(length);
    if (isNaN(numLength) || numLength <= 0) {
      setErrorMsg('Por favor, informe um tamanho válido em centímetros.');
      return;
    }

    const finalPhoto = photoBase64 || photoUrl.trim();
    if (!finalPhoto) {
      setErrorMsg('Por favor, insira a URL da foto da medição ou faça o upload de uma imagem.');
      return;
    }

    const currentTournament = tournaments.find(t => t.id === selectedTournamentId);

    try {
      setIsSubmitting(true);
      await submitCatch({
        tournamentId: selectedTournamentId,
        tournamentTitle: currentTournament?.title || 'Torneio de Pesca',
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        species: species.trim(),
        length: numLength,
        location: location.trim(),
        photoUrl: finalPhoto,
        videoStartUrl: videoStartUrl.trim() || undefined,
        videoEndUrl: videoEndUrl.trim() || undefined,
        verifiedByAI: false
      });

      setSuccessMsg('Captura enviada com sucesso para validação da arbitragem!');
      // Reset form
      setSpecies('');
      setLocation('');
      setLength('');
      setVideoStartUrl('');
      setVideoEndUrl('');
      setPhotoUrl('');
      setPhotoBase64('');

      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch (err: any) {
      console.error('Erro ao enviar captura:', err);
      setErrorMsg('Erro ao enviar captura: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
      {/* Top 2-Column Grid matching exactly the provided design */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 of 12 columns) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Card 1: User Identity Card */}
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-8 text-center shadow-xl">
            <div className="relative inline-block mx-auto">
              <div className="w-28 h-28 rounded-full border-2 border-emerald-500/40 p-1 flex items-center justify-center bg-slate-900 overflow-hidden shadow-inner">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#1b1e22] flex items-center justify-center text-slate-300 font-extrabold text-3xl">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-4">
              {currentUser.displayName}
            </h2>
            <p className="text-xs font-black text-[#00c853] uppercase tracking-widest mt-1">
              {currentUser.teamName || 'SEM EQUIPE'}
            </p>
          </div>

          {/* Card 2: Estatísticas Gerais */}
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                ESTATÍSTICAS GERAIS
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Total Capturas */}
              <div className="bg-[#1a1c20] border border-slate-800/80 rounded-2xl p-4">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                  TOTAL CAPTURAS
                </span>
                <p className="text-2xl font-black text-white mt-1">
                  {totalCatchesCount}
                </p>
              </div>

              {/* Média Tamanho */}
              <div className="bg-[#1a1c20] border border-slate-800/80 rounded-2xl p-4">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                  MÉDIA TAMANHO
                </span>
                <p className="text-2xl font-black text-white mt-1">
                  {avgLength}cm
                </p>
              </div>

              {/* Maior Peixe */}
              <div className="bg-[#1a1c20] border border-slate-800/80 rounded-2xl p-4">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                  MAIOR PEIXE
                </span>
                <p className="text-2xl font-black text-white mt-1">
                  {personalBest}cm
                </p>
              </div>

              {/* Aproveitamento */}
              <div className="bg-[#1a1c20] border border-slate-800/80 rounded-2xl p-4">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                  APROVEITAMENTO
                </span>
                <p className="text-2xl font-black text-[#00c853] mt-1">
                  {approvalRate}%
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Conquistas */}
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                CONQUISTAS
              </h3>
            </div>

            <div className="py-8 text-center">
              <p className="text-xs sm:text-sm text-slate-500 italic">
                Nenhum título conquistado ainda.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column (7 of 12 columns): Form "ENVIAR CAPTURA" */}
        <div className="lg:col-span-7">
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-5">
              ENVIAR CAPTURA
            </h2>

            {/* Error & Success Feedback Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* 1. Selecionar Torneio Dropdown */}
              <div className="space-y-2">
                <select
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3.5 text-xs sm:text-sm focus:outline-none transition cursor-pointer appearance-none disabled:opacity-50"
                  required
                  disabled={participatingTournaments.length === 0}
                >
                  {participatingTournaments.length === 0 ? (
                    <option value="" disabled className="text-slate-500 bg-[#1b1e22]">
                      Nenhum campeonato inscrito
                    </option>
                  ) : (
                    <>
                      <option value="" disabled className="text-slate-500 bg-[#1b1e22]">
                        Selecionar Torneio ({participatingTournaments.length} inscrito{participatingTournaments.length > 1 ? 's' : ''})
                      </option>
                      {participatingTournaments.map((t) => (
                        <option key={t.id} value={t.id} className="bg-[#1b1e22] text-white">
                          {t.title} {t.status === 'completed' ? '(Encerrado)' : ''}
                        </option>
                      ))}
                    </>
                  )}
                </select>

                {/* Helpful notice if user is not in any tournament yet */}
                {participatingTournaments.length === 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-3">
                    <span className="leading-tight">
                      Você ainda não está inscrito em nenhum torneio. Inscreva-se para poder enviar capturas.
                    </span>
                    {onNavigateToTournaments && (
                      <button
                        type="button"
                        onClick={onNavigateToTournaments}
                        className="px-3 py-1.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider shrink-0 cursor-pointer shadow-sm"
                      >
                        Participar
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Espécie */}
              <div>
                <input
                  type="text"
                  placeholder="Espécie"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* 3. Local da Captura */}
              <div>
                <input
                  type="text"
                  placeholder="Local da Captura (Ex: Pesqueiro do Carlão)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* 4. Tamanho (cm) */}
              <div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Tamanho (cm)"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* 5. URL Vídeo Início (Fisgada) */}
              <div>
                <input
                  type="text"
                  placeholder="URL Vídeo Início (Fisgada)"
                  value={videoStartUrl}
                  onChange={(e) => setVideoStartUrl(e.target.value)}
                  className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition"
                />
              </div>

              {/* 6. URL Vídeo Final (Embarque/Medição) */}
              <div>
                <input
                  type="text"
                  placeholder="URL Vídeo Final (Embarque/Medição)"
                  value={videoEndUrl}
                  onChange={(e) => setVideoEndUrl(e.target.value)}
                  className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition"
                />
              </div>

              {/* 7. URL Foto da Medição with direct file upload trigger */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="URL Foto da Medição"
                  value={photoUrl}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    setPhotoBase64('');
                  }}
                  className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl pl-4 pr-12 py-3.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition"
                />

                {/* Upload Button overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2.5 top-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                  title="Fazer upload de foto do peixe"
                >
                  <Upload className="h-4 w-4" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Photo Preview if loaded */}
              {photoBase64 && (
                <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-emerald-500/50 shadow-md">
                  <img 
                    src={photoBase64} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-emerald-400 font-mono text-center">
                    Foto pronta
                  </span>
                </div>
              )}

              {/* 8. Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00c853] hover:bg-[#00e676] active:bg-[#00b248] text-slate-950 font-black text-xs sm:text-sm py-4 px-4 rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? 'ENVIANDO PARA VALIDAÇÃO...' : 'ENVIAR PARA VALIDAÇÃO'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Bottom Section: MINHAS CAPTURAS */}
      <div className="pt-6">
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-6">
          MINHAS CAPTURAS
        </h2>

        {userCatches.length === 0 ? (
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <Trophy className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white uppercase">Nenhuma captura enviada ainda</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Preencha o formulário acima com as medidas e fotos/vídeos da sua pesca para registrar seu primeiro exemplar no campeonato!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCatches.map((item) => (
              <div 
                key={item.id}
                className="bg-[#121316] border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  {/* Photo with status badge */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img 
                      src={item.photoUrl} 
                      alt={item.species} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {item.status === 'approved' && (
                        <span className="bg-[#00c853] text-slate-950 font-black text-[10px] uppercase font-mono px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Homologado
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase font-mono px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                          <Clock className="h-3 w-3" /> Em Moderação
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="bg-rose-500 text-white font-black text-[10px] uppercase font-mono px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Não Aceito
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs text-white font-bold">
                      <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-emerald-400">
                        {item.length} cm
                      </span>
                      {item.weight && (
                        <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-amber-400">
                          {item.weight} kg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Catch Details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-base font-bold text-white">{item.species}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{item.tournamentTitle}</p>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {/* Video Proofs links if provided */}
                    {(item.videoStartUrl || item.videoEndUrl) && (
                      <div className="pt-1 flex flex-wrap gap-2">
                        {item.videoStartUrl && (
                          <a
                            href={item.videoStartUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 bg-slate-900 text-sky-400 hover:text-sky-300 rounded-lg border border-slate-800"
                          >
                            <Video className="h-3 w-3" />
                            <span>Vídeo Fisgada</span>
                            <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                          </a>
                        )}
                        {item.videoEndUrl && (
                          <a
                            href={item.videoEndUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 bg-slate-900 text-emerald-400 hover:text-emerald-300 rounded-lg border border-slate-800"
                          >
                            <Video className="h-3 w-3" />
                            <span>Vídeo Medição</span>
                            <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Moderator Note */}
                    {item.moderatorNotes && (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                        <span className="font-mono text-amber-400 font-bold block mb-0.5">Nota da Arbitragem:</span>
                        <p className="italic">{item.moderatorNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-800/60 mt-2 text-right">
                  <span className="text-[10px] font-mono text-slate-500">
                    ID: #{item.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
