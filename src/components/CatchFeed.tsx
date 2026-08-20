import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  User, 
  Clock, 
  MapPin, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Ruler, 
  Scale, 
  ChevronDown, 
  Sparkles,
  Send
} from 'lucide-react';
import { Catch, Comment, UserProfile } from '../types';
import { toggleLikeCatch, addCommentToCatch } from '../utils/dbHelpers';

interface CatchFeedProps {
  catches: Catch[];
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
}

export default function CatchFeed({ catches, currentUser, onOpenAuthModal }: CatchFeedProps) {
  const [activeCommentsId, setActiveCommentsId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [feedFilter, setFeedFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedAIReview, setSelectedAIReview] = useState<string | null>(null);

  const getStatusIcon = (status: Catch['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Homologado</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="h-3.5 w-3.5" />
            <span>Desclassificado</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
            <span>Aguardando Revisão</span>
          </span>
        );
    }
  };

  const timeAgo = (timestamp: any) => {
    if (!timestamp) return 'Agora mesmo';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `Há ${Math.floor(interval)} anos`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `Há ${Math.floor(interval)} meses`;
    
    interval = seconds / 86400;
    if (interval > 1) return `Há ${Math.floor(interval)} dias`;
    
    interval = seconds / 3600;
    if (interval > 1) return `Há ${Math.floor(interval)} horas`;
    
    interval = seconds / 60;
    if (interval > 1) return `Há ${Math.floor(interval)} min`;
    
    return 'Agora mesmo';
  };

  const handleLike = async (item: Catch) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    const isAlreadyLiked = (item.likes || []).includes(currentUser.uid);
    try {
      await toggleLikeCatch(item.id, currentUser.uid, isAlreadyLiked);
    } catch (e) {
      console.error("Erro ao curtir:", e);
    }
  };

  const handleCommentSubmit = async (catchId: string) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    const commentText = commentInputs[catchId]?.trim();
    if (!commentText) return;

    try {
      await addCommentToCatch(catchId, currentUser.uid, currentUser.displayName, commentText);
      setCommentInputs({ ...commentInputs, [catchId]: '' });
    } catch (e) {
      console.error("Erro ao comentar:", e);
    }
  };

  const filteredCatches = catches.filter(c => {
    if (feedFilter === 'all') return true;
    return c.status === feedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Mural de Capturas</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Veja em tempo real o que os pescadores estão enviando por todo o país.</p>
        </div>

        {/* Filters */}
        <div className="inline-flex bg-slate-900 duration-200 border border-slate-800 p-1.5 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setFeedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              feedFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFeedFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              feedFilter === 'approved'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Homologadas
          </button>
          <button
            onClick={() => setFeedFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              feedFilter === 'pending'
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Em Análise
          </button>
        </div>
      </div>

      {/* Feed List */}
      {filteredCatches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Nenhuma captura pendente ou homologada encontrada neste filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCatches.map((item) => {
            const hasLiked = currentUser ? (item.likes || []).includes(currentUser.uid) : false;
            const commentsCount = item.comments?.length || 0;
            const commentsOpen = activeCommentsId === item.id;
            const showAIReview = selectedAIReview === item.id;

            return (
              <div 
                key={item.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between"
              >
                {/* Header info */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/60">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white uppercase tracking-wider text-sm border border-slate-700">
                      {item.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.userName}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        <span>{timeAgo(item.createdAt)}</span>
                        <span>•</span>
                        <span className="text-sky-400 truncate max-w-[120px] sm:max-w-[180px]">{item.tournamentTitle}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    {getStatusIcon(item.status)}
                  </div>
                </div>

                {/* Main Content Info */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  {item.photoUrl ? (
                    <img 
                      src={item.photoUrl} 
                      alt="Captura do peixe" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-600 font-mono text-xs">Captura Sem Foto</div>
                  )}

                  {/* AI Verification Overlay Badge */}
                  {item.verifiedByAI && item.aiFeedback && (
                    <button
                      onClick={() => setSelectedAIReview(showAIReview ? null : item.id)}
                      className={`absolute bottom-4 right-4 py-1.5 px-3 rounded-xl text-xs font-semibold shadow-lg transition-all backdrop-blur-md border duration-200 flex items-center space-x-1.5 ${
                        item.aiFeedback.complianceCheck 
                          ? 'bg-indigo-950/85 text-sky-300 border-indigo-500/30' 
                          : 'bg-rose-950/90 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                      <span>Análise de IA: {item.aiFeedback.complianceCheck ? 'Aprovado' : 'Suspeito'}</span>
                    </button>
                  )}
                </div>

                {/* AI Review Panel inside feed */}
                {showAIReview && item.aiFeedback && (
                  <div className="bg-indigo-950/40 border-y border-slate-800 p-4.5 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                      <span className="text-indigo-300 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Arbitragem Inteligente Gemini
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono font-bold text-[9px]">
                        Confiança: {Math.round(item.aiFeedback.confidence * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-slate-300 bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-500/10">
                      <div>
                        <span className="text-slate-400">Espécie Identificada:</span>
                        <p className="font-semibold text-white">🐟 {item.aiFeedback.identifiedSpecies}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Tamanho Estimado:</span>
                        <p className="font-semibold text-white">📏 {item.aiFeedback.estimatedLength}</p>
                      </div>
                    </div>

                    <p className="text-slate-300 italic leading-relaxed text-[11px]">
                      "{item.aiFeedback.description}"
                    </p>
                    
                    <div className="text-[10px] text-indigo-300/80 font-mono flex items-center gap-1.5">
                      <span>• Verificação técnica concluída para fins de integridade do campeonato.</span>
                    </div>
                  </div>
                )}

                {/* Metrics detail bar */}
                <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800/50 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                      <Ruler className="h-4 w-4 text-sky-400" />
                      <span className="text-slate-300 text-xs font-mono">
                        Espécie: <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">{item.species}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2.5 text-xs text-slate-300 font-mono border-l border-slate-800/80 pl-4">
                      <span>Comprimento: <strong className="text-sky-300 font-semibold">{item.length} cm</strong></span>
                      {item.weight !== undefined && (
                        <span>| Peso: <strong className="text-amber-400 font-semibold">{item.weight} kg</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span className="max-w-[120px] truncate" title={item.location}>{item.location}</span>
                  </div>
                </div>

                {/* Moderator comment if present */}
                {item.moderatorNotes && (
                  <div className="bg-amber-500/5 border-b border-slate-800/60 p-3 sm:px-5 py-3 flex items-start space-x-2 text-[11px] sm:text-xs">
                    <span className="font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider text-[9px] mt-0.5 shrink-0">
                      Dica Juiz
                    </span>
                    <p className="text-slate-300 italic">
                      "{item.moderatorNotes}"
                    </p>
                  </div>
                )}

                {/* Action feedback bar */}
                <div className="p-3 sm:px-5 py-3 bg-slate-900 border-t border-slate-800/40 flex items-center justify-between text-xs text-slate-400 font-mono">
                  {/* Likes and comments counts */}
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => handleLike(item)}
                      className={`flex items-center space-x-1.5 font-bold cursor-pointer transition ${
                        hasLiked ? 'text-rose-500 stroke-[2.5]' : 'hover:text-rose-450 text-slate-400'
                      }`}
                    >
                      <Heart className={`h-4.5 w-4.5 ${hasLiked ? 'fill-rose-500' : ''}`} />
                      <span>{item.likes?.length || 0}</span>
                    </button>

                    <button 
                      onClick={() => setActiveCommentsId(commentsOpen ? null : item.id)}
                      className={`flex items-center space-x-1.5 cursor-pointer transition hover:text-sky-400 ${
                        commentsOpen ? 'text-sky-400 font-bold' : ''
                      }`}
                    >
                      <MessageSquare className="h-4.5 w-4.5" />
                      <span>{commentsCount}</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500">COD: {item.id.slice(0, 7)}</span>
                  </div>
                </div>

                {/* Comments Expandable Section */}
                {commentsOpen && (
                  <div className="bg-slate-900/60 border-t border-slate-800 p-4.5 space-y-4">
                    {/* Add comment box */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Escreva um comentário positivo..."
                        value={commentInputs[item.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [item.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(item.id);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 tracking-wide text-slate-200"
                      />
                      <button
                        onClick={() => handleCommentSubmit(item.id)}
                        className="p-2.5 bg-sky-500 hover:bg-sky-450 hover:scale-105 rounded-xl text-white transition cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Comments List */}
                    {commentsCount === 0 ? (
                      <p className="text-[11px] text-slate-500 font-mono py-1">Nenhum comentário. Seja o primeiro a comentar!</p>
                    ) : (
                      <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                        {item.comments?.map((comment: Comment) => (
                          <div key={comment.id} className="text-xs bg-slate-950/40 border border-slate-950/80 p-2.5 rounded-lg">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pb-1">
                              <span className="font-bold text-white text-xs">{comment.userName}</span>
                              <span>
                                {comment.createdAt ? timeAgo(comment.createdAt) : ''}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
