import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Sparkles,
  Award,
  Ruler,
  Scale,
  MapPin,
  Save,
  MessageSquare,
  PlusCircle,
  Key,
  DollarSign,
  Users,
  Calendar,
  Image,
  Info,
  Check,
  Trophy
} from 'lucide-react';
import { Catch, Tournament } from '../types';
import { updateCatchStatus, createTournament } from '../utils/dbHelpers';

interface AdminPanelProps {
  catches: Catch[];
}

const IMAGE_PRESETS = [
  {
    name: 'Tucunaré Espetacular',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&auto=format&fit=crop&q=80',
    tag: 'Tucunaré'
  },
  {
    name: 'Monstros de Couro',
    url: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=1000&auto=format&fit=crop&q=80',
    tag: 'Couro'
  },
  {
    name: 'Robalos e Manguezal',
    url: 'https://images.unsplash.com/photo-1541944743827-e04aa6427c33?w=1000&auto=format&fit=crop&q=80',
    tag: 'Costeiro'
  },
  {
    name: 'Fly Fishing & Bass',
    url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1000&auto=format&fit=crop&q=80',
    tag: 'Predadores'
  }
];

export default function AdminPanel({ catches }: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'moderation' | 'create_tournament'>('moderation');
  
  const pendingCatches = catches.filter(c => c.status === 'pending');
  const pastCatches = catches.filter(c => c.status !== 'pending');

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Tournament registration states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rulesText, setRulesText] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('2026-12-31');
  const [status, setStatus] = useState<Tournament['status']>('active');
  const [targetSpeciesInput, setTargetSpeciesInput] = useState('Tucunaré, Tucunaré Azul, Tucunaré Amarelo');
  const [metric, setMetric] = useState<'length' | 'weight' | 'both'>('length');
  const [prize, setPrize] = useState('');
  const [prizeValue, setPrizeValue] = useState<string>('');
  const [entryFeeType, setEntryFeeType] = useState<'gratis' | 'pago'>('gratis');
  const [entryFeeAmount, setEntryFeeAmount] = useState<string>('');
  const [teamFormat, setTeamFormat] = useState<'solo' | 'dupla' | 'trio' | 'quarteto'>('solo');
  const [keyword, setKeyword] = useState('');
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0].url);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (catchId: string, status: 'approved' | 'rejected') => {
    setProcessingId(catchId);
    try {
      const judgeNotes = notes[catchId]?.trim() || "";
      await updateCatchStatus(catchId, status, judgeNotes);
      // Clean notes for this item
      setNotes(prev => {
        const next = { ...prev };
        delete next[catchId];
        return next;
      });
    } catch (e) {
      console.error("Erro ao julgar captura:", e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title.trim()) {
      setFormError('Informe o título do campeonato.');
      return;
    }
    if (!description.trim()) {
      setFormError('Escreva uma descrição explicativa do campeonato.');
      return;
    }
    if (!prize.trim()) {
      setFormError('Descreva detalhadamente a premiação (Ex: Barco 6m, Kits, etc).');
      return;
    }
    if (!keyword.trim()) {
      setFormError('A palavra-chave de validação antifraude é de preenchimento obrigatório para evitar trapaças.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build rules array or fallbacks
      const parsedRules = rulesText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const computedRules = parsedRules.length > 0 ? parsedRules : [
        "A medição deve ser feita sobre fita métrica ou régua plana homologada de forma nítida.",
        `Exigido papel ou placa contendo a PALAVRA-CHAVE "${keyword.toUpperCase().trim()}" ao lado do peixe na foto.`,
        "O peixe precisa obrigatoriamente ser devolvido com vida à água (Pesque e Solte).",
        "A foto deve cobrir o peixe do focinho ao rabo sem obstruções visuais."
      ];

      const speciesArray = targetSpeciesInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const finalSpecies = speciesArray.length > 0 ? speciesArray : ['Tucunaré'];

      const payload: Omit<Tournament, 'id' | 'participantCount'> = {
        title: title.trim(),
        description: description.trim(),
        rules: computedRules,
        startDate,
        endDate,
        status,
        targetSpecies: finalSpecies,
        metric,
        prize: prize.trim(),
        prizeValue: prizeValue ? parseFloat(prizeValue) : 0,
        entryFeeType,
        entryFeeAmount: entryFeeType === 'pago' ? (entryFeeAmount ? parseFloat(entryFeeAmount) : 0) : 0,
        teamFormat,
        keyword: keyword.toUpperCase().trim(),
        imageUrl: imageUrl.trim() || IMAGE_PRESETS[0].url
      };

      await createTournament(payload);
      setFormSuccess('🏆 Parabéns, Coordenador! Novo campeonato cadastrado com sucesso e sincronizado no banco de dados!');
      
      // Clean up fields
      setTitle('');
      setDescription('');
      setRulesText('');
      setPrize('');
      setPrizeValue('');
      setEntryFeeType('gratis');
      setEntryFeeAmount('');
      setTeamFormat('solo');
      setKeyword('');
      setImageUrl(IMAGE_PRESETS[0].url);
    } catch (err: any) {
      console.error(err);
      setFormError('Erro ao registrar campeonato no Firestore: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab/Banner Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-4">
        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
          <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
            PAINEL DE ADMINISTRAÇÃO E MODERAÇÃO
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Bem-vindo, Coordenador Master. Controle as solicitações de homologações de pesca em tempo real ou crie novas competições com regras customizadas e palavra-chave antifraude.
          </p>
        </div>
      </div>

      {/* Admin Sub Nav Bar */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setAdminTab('moderation')}
          className={`pb-3 text-sm font-bold transition-all relative cursor-pointer flex items-center space-x-2 ${
            adminTab === 'moderation' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Homologações Pendentes ({pendingCatches.length})</span>
          {adminTab === 'moderation' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full"></div>
          )}
        </button>

        <button
          onClick={() => setAdminTab('create_tournament')}
          className={`pb-3 text-sm font-bold transition-all relative cursor-pointer flex items-center space-x-2 ${
            adminTab === 'create_tournament' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Cadastrar Novo Campeonato 🏆</span>
          {adminTab === 'create_tournament' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"></div>
          )}
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {adminTab === 'moderation' ? (
        <div className="space-y-8 animate-fade-in">
          {/* Pending Reviews */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-white flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
              <span>Solicitações de Homologação Pendentes ({pendingCatches.length})</span>
            </h3>

            {pendingCatches.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-405 text-sm">
                🎉 Fantástico! Nenhuma captura pendente de avaliação. Todos os peixes foram julgados.
              </div>
            ) : (
              <div className="space-y-6">
                {pendingCatches.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-0 animate-fade-in"
                  >
                    {/* Photo section */}
                    <div className="lg:col-span-4 bg-slate-950 flex items-center justify-center relative aspect-video lg:aspect-auto">
                      {item.photoUrl ? (
                        <img 
                          src={item.photoUrl} 
                          alt="Peixe para aprovação" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-600 text-xs font-mono">Sem foto</span>
                      )}
                    </div>

                    {/* Details Section */}
                    <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                      {/* Competitor & target details */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3.5 border-b border-slate-800">
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">COMPETIDOR / TORNEIO</span>
                            <h4 className="text-base font-bold text-white">{item.userName}</h4>
                            <p className="text-xs text-sky-400 font-mono mt-0.5">{item.tournamentTitle}</p>
                          </div>
                          
                          <div className="text-left sm:text-right font-mono text-xs text-slate-400">
                            <span>Código do Envio:</span>
                            <p className="font-bold text-slate-200">#{item.id.toUpperCase().slice(0, 8)}</p>
                          </div>
                        </div>

                        {/* Claims VS AI Verification info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Declared */}
                          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">DADOS DECLARADOS PELO PESCADOR</span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400 font-mono">Espécie:</span>
                                <p className="font-bold text-white">🐟 {item.species}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 font-mono">Local:</span>
                                <p className="font-semibold text-slate-300 truncate" title={item.location}>
                                  <MapPin className="inline-block h-3 w-3 text-rose-500" /> {item.location}
                                </p>
                              </div>
                              <div className="pt-2">
                                <span className="text-slate-400 font-mono">Comprimento:</span>
                                <p className="font-bold text-sky-400 flex items-center space-x-1">
                                  <Ruler className="h-3.5 w-3.5" />
                                  <span>{item.length} cm</span>
                                </p>
                              </div>
                              <div className="pt-2">
                                <span className="text-slate-400 font-mono">Peso:</span>
                                <p className="font-bold text-amber-400 flex items-center space-x-1">
                                  <Scale className="h-3.5 w-3.5" />
                                  <span>{item.weight || '-'} kg</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* AI Report */}
                          <div className="bg-indigo-950/15 p-4 rounded-xl border border-indigo-500/10 space-y-2.5">
                            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" /> ANÁLISE AUTOMÁTICA GEMINI
                            </span>
                            {item.aiFeedback ? (
                              <div className="space-y-2 text-xs">
                                <p className="text-[11px] text-slate-350 italic">
                                  "{item.aiFeedback.description}"
                                </p>
                                <div className="flex justify-between items-center bg-indigo-950/60 p-2 rounded-lg border border-indigo-500/10 font-mono text-[10px] text-slate-300">
                                  <span>Conselho: <strong>{item.aiFeedback.complianceCheck ? 'Homologável' : 'Revisar Detalhes'}</strong></span>
                                  <span>Confiança: <strong>{Math.round(item.aiFeedback.confidence * 100)}%</strong></span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-600 text-xs italic py-4">Nenhuma pré-validação de IA foi solicitada neste envio.</div>
                            )}
                          </div>
                        </div>

                        {/* Judge Commentary Input */}
                        <div className="space-y-2.5">
                          <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5 text-amber-500" /> 
                            <span>Anotações / Justificativa do Juiz</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Espécime espetacular! Certificado com palavra-chave correta."
                            value={notes[item.id] || ''}
                            onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs sm:text-sm"
                          />
                        </div>
                      </div>

                      {/* Accept-Reject Actions panel */}
                      <div className="flex justify-end space-x-3 pt-3.5 border-t border-slate-800/60">
                        <button
                          type="button"
                          disabled={processingId !== null}
                          onClick={() => handleAction(item.id, 'rejected')}
                          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl font-bold text-xs transition duration-250 flex items-center space-x-1 border border-rose-500/20 shadow-md cursor-pointer"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Rejeitar / Desclassificar</span>
                        </button>
                        
                        <button
                          type="button"
                          disabled={processingId !== null}
                          onClick={() => handleAction(item.id, 'approved')}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs transition duration-250 flex items-center space-x-1.5 shadow-lg shadow-emerald-500/15 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Homologar Captura</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Decisions history log */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-md font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-sky-400" />
              <span>Histórico de Julgamentos Recentes ({pastCatches.length})</span>
            </h3>

            {pastCatches.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
                Nenhuma decisão histórica arquivada no Firestore.
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 uppercase font-mono">
                        <th className="py-3.5 px-5">ID</th>
                        <th className="py-3.5 px-5">Competidor</th>
                        <th className="py-3.5 px-5">Torneio</th>
                        <th className="py-3.5 px-5">Físico</th>
                        <th className="py-3.5 px-5">Local</th>
                        <th className="py-3.5 px-5">Resultado</th>
                        <th className="py-3.5 px-5">Justificativa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastCatches.map((item) => (
                        <tr 
                          key={item.id} 
                          className="border-b border-slate-800 text-slate-300 hover:bg-slate-800/20 animate-fade-in"
                        >
                          <td className="py-3 px-5 font-mono text-slate-500 text-[11px]">#{item.id.slice(0, 7).toUpperCase()}</td>
                          <td className="py-3 px-5 font-bold text-white">{item.userName}</td>
                          <td className="py-3 px-5 text-slate-400 max-w-[120px] truncate" title={item.tournamentTitle}>{item.tournamentTitle}</td>
                          <td className="py-3 px-5 font-mono text-slate-350">
                            {item.species} • {item.length}cm
                          </td>
                          <td className="py-3 px-5 text-slate-400">{item.location}</td>
                          <td className="py-3 px-5">
                            {item.status === 'approved' ? (
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider text-[9px] border border-emerald-500/20">
                                Aprovado
                              </span>
                            ) : (
                              <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider text-[9px] border border-rose-500/20">
                                Rejeitado
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-5 max-w-[200px] truncate text-slate-450 italic font-mono" title={item.moderatorNotes || 'Sem justificativa'}>
                            {item.moderatorNotes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB: REGISTER NEW TOURNAMENT */
        <div id="create-tournament-tab" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
              <Award className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cadastrar Novo Campeonato</h3>
              <p className="text-slate-400 text-xs">Crie novas arenas nacionais integradas com validadores antifraude.</p>
            </div>
          </div>

          <form onSubmit={handleCreateTournament} className="space-y-6">
            {formError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-xl text-xs sm:text-sm flex items-center gap-2.5">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-450 rounded-xl text-xs sm:text-sm flex items-center gap-2.5">
                <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Nome / Título do Campeonato</label>
                <input
                  type="text"
                  placeholder="Ex: Ⅱº Grand Slam de Tucunaré Amarelo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Espécies Alvo (Separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Tucunaré, Tucunaré Amarelo, Tucunaré Azul"
                  value={targetSpeciesInput}
                  onChange={(e) => setTargetSpeciesInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Descrição do Campeonato</label>
              <textarea
                placeholder="Descreva as características gerais da arena de pesca, como as bacias hidrográficas válidas, e os propósitos de conservação."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm text-slate-205"
              />
            </div>

            {/* CONFIGURAÇÃO DE EQUIPE & VALOR DE INSCRIÇÃO & PREMIAÇÃO */}
            <div className="p-4 sm:p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                Configurações do Torneio (Formato, Valor Inscrição e Prêmios)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Formato (Solo, Dupla, Trio, Quarteto) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-sky-400" />
                    <span>Formato de Fishermen</span>
                  </label>
                  <select
                    value={teamFormat}
                    onChange={(e: any) => setTeamFormat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                  >
                    <option value="solo">Solo (1 competidor)</option>
                    <option value="dupla">Dupla (Até 2 competidores)</option>
                    <option value="trio">Trio (Equipe de 3 competidores)</option>
                    <option value="quarteto">Quarteto (Equipe de 4 competidores)</option>
                  </select>
                </div>

                {/* 2. Inscrição (Pago ou Grátis) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Tipo de Inscrição</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-850">
                    <button
                      type="button"
                      onClick={() => {
                        setEntryFeeType('gratis');
                        setEntryFeeAmount('');
                      }}
                      className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition cursor-pointer ${
                        entryFeeType === 'gratis'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      Grátis
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryFeeType('pago')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition cursor-pointer ${
                        entryFeeType === 'pago'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      Pago
                    </button>
                  </div>
                </div>

                {/* Condicional amount if Paid */}
                <div className="space-y-2">
                  <label className={`text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5 ${entryFeeType === 'pago' ? 'opacity-100' : 'opacity-40'}`}>
                    <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                    <span>Valor da Inscrição (R$)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 150"
                    disabled={entryFeeType === 'gratis'}
                    value={entryFeeAmount}
                    onChange={(e) => setEntryFeeAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 text-xs disabled:opacity-30 disabled:cursor-not-allowed font-mono text-slate-205"
                  />
                </div>
              </div>

              {/* VALUE & DESCRIPTION OF THE PRIZE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-900 pt-3.5">
                <div className="space-y-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-450" />
                    <span>Valor em Prêmios (R$)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 25000"
                    value={prizeValue}
                    onChange={(e) => setPrizeValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 text-xs font-mono text-slate-205"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-450 animate-pulse" />
                    <span>Descrição Completa da Premiação</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1º: Barco Alumínio, 2º: Motor Elétrico, 3º: Carretilha"
                    value={prize}
                    onChange={(e) => setPrize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* ANTI-FRAUD PALAVRA CHAVE */}
            <div className="p-4 sm:p-5 bg-amber-500/5 rounded-2xl border border-amber-500/20 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8 space-y-1">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Key className="h-4.5 w-4.5 stroke-[2.2]" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Palavra-Chave de Segurança Antifraude</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Para que os pescadores não enviem fotos antigas da sua galeria de fotos, crie um **Código ou Palavra-Chave específico** para esta competição. O pescador será instruído a tirar foto do peixe contendo este código escrito numa plaquinha ou papel de forma legível.
                </p>
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase block">Palavra-Chave Ativa</label>
                <input
                  type="text"
                  placeholder="Ex: TUCUNA2026"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/30 text-amber-400 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-450 text-xs sm:text-sm text-center uppercase font-mono font-extrabold tracking-wider"
                />
              </div>
            </div>

            {/* Metrics & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Métrica de Pontuação</label>
                <select
                  value={metric}
                  onChange={(e: any) => setMetric(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm cursor-pointer"
                >
                  <option value="length">Comprimento (cm)</option>
                  <option value="weight">Peso (kg)</option>
                  <option value="both">Comprimento e Peso combinados</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Data de Início</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 text-xs sm:text-sm text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">Data de Término</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 text-xs sm:text-sm text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Image selecting preset */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                <Image className="h-4 w-4 text-sky-450" />
                <span>Capa do Campeonato / Foto de Divulgação</span>
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {IMAGE_PRESETS.map((preset) => {
                  const isSelected = imageUrl === preset.url;
                  return (
                    <div
                      key={preset.name}
                      onClick={() => setImageUrl(preset.url)}
                      className={`relative aspect-video rounded-xl overflow-hidden border cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all ${
                        isSelected 
                          ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500' 
                          : 'border-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-slate-950/40 hover:bg-slate-900/10 transition-colors"></div>
                      <span className="absolute bottom-1.5 left-2 bg-slate-950/85 px-2 py-0.5 rounded-md text-[9px] text-slate-300 uppercase font-mono tracking-wider">
                        {preset.tag}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-2 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow-sm">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-xs">
                <span className="text-slate-500 font-mono block">Ou cole uma URL personalizada do Unsplash / Web se desejar:</span>
                <input
                  type="url"
                  placeholder="Ex: https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-xl px-4 py-2.5 mt-1.5 focus:outline-none focus:border-amber-500 text-[11px] font-mono"
                />
              </div>
            </div>

            {/* Custom Rules Lines */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                <Info className="h-4 w-4 text-sky-400" />
                <span>Regulamento Específico Customizado (Uma regra por linha)</span>
              </label>
              <textarea
                placeholder="Exemplo:&#10;Disputa exclusiva em represas do Estado de São Paulo.&#10;Apenas iscas artificiais são permitidas."
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs"
              />
              <span className="text-[9px] text-slate-500 font-mono">Deixe em branco para usar as regras ecológicas de Pesque-e-Solte padronizadas do sistema.</span>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-450 hover:to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sincronizando no Firestore...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4.5 w-4.5" />
                    <span>Publicar Campeonato Oficial</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
