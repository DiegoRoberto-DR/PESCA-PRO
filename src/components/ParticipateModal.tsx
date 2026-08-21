import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, MessageCircle, Key, ShieldCheck, Users } from 'lucide-react';
import { Tournament, UserProfile, Team } from '../types';
import { validateAndConsumeTournamentCode, getUserTeam } from '../utils/dbHelpers';

interface ParticipateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
  onSuccessEnroll?: (tournament: Tournament) => void;
}

export default function ParticipateModal({
  isOpen,
  onClose,
  tournament,
  currentUser,
  onRequireAuth,
  onSuccessEnroll
}: ParticipateModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser && tournament && tournament.teamFormat && tournament.teamFormat !== 'solo') {
      setIsLoadingTeam(true);
      getUserTeam(currentUser.uid).then(t => {
        setUserTeam(t);
        setIsLoadingTeam(false);
      }).catch(() => {
        setIsLoadingTeam(false);
      });
    }
  }, [isOpen, currentUser, tournament]);

  if (!isOpen || !tournament) return null;

  const isTeamTournament = tournament.teamFormat && tournament.teamFormat !== 'solo';
  const requiredSpots = tournament.teamFormat === 'dupla' ? 2 : tournament.teamFormat === 'trio' ? 3 : 4;

  // Format WhatsApp message link
  const organizerWhatsAppNumber = '5519987626991'; // WhatsApp 19987626991
  const messageText = encodeURIComponent(
    `Olá! Gostaria de receber meu código exclusivo de participação para o torneio "${tournament.title}". (Taxa: ${
      tournament.entryFeeType === 'pago' ? `R$ ${tournament.entryFeeAmount || 0}` : 'Grátis'
    })`
  );
  const whatsappUrl = `https://wa.me/${organizerWhatsAppNumber}?text=${messageText}`;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    // Check team requirements for team-based tournaments
    if (isTeamTournament) {
      const currentTeam = userTeam || await getUserTeam(currentUser.uid);
      if (!currentTeam) {
        setError(
          `👥 EXIGÊNCIA DE EQUIPE: Este campeonato é no formato ${tournament.teamFormat?.toUpperCase()} (${requiredSpots} pessoas). É obrigatório criar ou juntar-se a uma equipe no seu Perfil antes de se inscrever.`
        );
        return;
      }

      // Check team status (must be approved by admin)
      if (currentTeam.status !== 'approved') {
        const statusMsg = currentTeam.status === 'rejected'
          ? `reprovada pela moderação (${currentTeam.rejectionReason || 'Verifique com a organização'}).`
          : 'aguardando aprovação do Administrador no painel de moderação.';
        setError(
          `🛑 EQUIPE NÃO HOMOLOGADA: Sua equipe "${currentTeam.name}" está ${statusMsg} Somente equipes aprovadas pelo Administrador podem participar.`
        );
        return;
      }

      // Check all vacancies are filled
      const memberCount = currentTeam.members?.length || 0;
      const expectedCapacity = currentTeam.maxMembers || requiredSpots;
      if (memberCount < expectedCapacity) {
        setError(
          `⚠️ EQUIPE INCOMPLETA: Sua equipe "${currentTeam.name}" possui ${memberCount} de ${expectedCapacity} vagas preenchidas. Para participar deste campeonato, todas as ${expectedCapacity} vagas devem estar preenchidas antes.`
        );
        return;
      }
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Por favor, informe o código do torneio gerado pelo Administrador.');
      return;
    }

    try {
      setIsSubmitting(true);
      const validationResult = await validateAndConsumeTournamentCode(
        tournament.id,
        cleanCode,
        currentUser
      );

      if (!validationResult.success) {
        setError(validationResult.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCode('');
        onClose();
        if (onSuccessEnroll) {
          onSuccessEnroll(tournament);
        }
      }, 1600);
    } catch (err: any) {
      console.error("Erro ao registrar inscrição:", err);
      setError('Erro ao processar inscrição: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-[480px] bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-slate-800/80 cursor-pointer"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Inscrição Antifraude</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
            PARTICIPAR DO TORNEIO
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
            Insira o código de participação individual fornecido exclusivamente pelo administrador.
          </p>
        </div>

        {/* Tournament name badge */}
        <div className="mb-5 px-3.5 py-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold truncate max-w-[240px]">{tournament.title}</span>
            <span className="font-mono font-bold text-emerald-400">
              {tournament.entryFeeType === 'pago' ? `R$ ${tournament.entryFeeAmount || 0}` : 'Inscrição Grátis'}
            </span>
          </div>

          {isTeamTournament && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>Formato: {tournament.teamFormat?.toUpperCase()} ({requiredSpots} Integrantes)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Equipe Obrigatória</span>
              </div>

              {/* User's Team Status Indicator */}
              {currentUser && (
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                  {isLoadingTeam ? (
                    <span className="text-slate-500">Verificando equipe...</span>
                  ) : userTeam ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-bold flex items-center gap-1.5">
                          {userTeam.logoUrl ? (
                            <img src={userTeam.logoUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
                          ) : '👥'}
                          <span>{userTeam.name}</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                          userTeam.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : userTeam.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {userTeam.status === 'approved' ? '✓ Aprovada' : userTeam.status === 'rejected' ? '✕ Reprovada' : '⏳ Em Aprovação'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Vagas: {userTeam.members?.length || 0}/{userTeam.maxMembers || requiredSpots}</span>
                        <span className={(userTeam.members?.length || 0) >= (userTeam.maxMembers || requiredSpots) ? 'text-emerald-400' : 'text-amber-400'}>
                          {(userTeam.members?.length || 0) >= (userTeam.maxMembers || requiredSpots) ? '✓ Equipe Completa' : '⚠️ Vagas Pendentes'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-rose-400">⚠️ Você ainda não possui equipe cadastrada.</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success Alert */}
        {success ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">INSCRIÇÃO CONFIRMADA!</h3>
            <p className="text-xs text-slate-400">Código autenticado e de uso único registrado. Você já pode enviar suas capturas neste campeonato.</p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Input Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                <span>Código Único do Torneio *</span>
              </label>
              <input
                type="text"
                placeholder="Ex: TRN-8492-KF91"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#1b1e22] border border-slate-700/80 focus:border-emerald-500 text-amber-400 font-bold rounded-xl px-4 py-3.5 text-sm font-mono placeholder:text-slate-500 focus:outline-none transition shadow-inner uppercase tracking-wider"
                autoFocus
              />
              <span className="text-[10px] text-slate-500 block font-mono">
                🔒 Cada código só pode ser utilizado 1 única vez por competidor.
              </span>
            </div>

            {/* Primary Submit Button (Vibrant Green) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00c853] hover:bg-[#00e676] active:bg-[#00b248] text-slate-950 font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl transition duration-150 uppercase tracking-wider shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isSubmitting ? 'VALIDANDO CÓDIGO...' : 'CONFIRMAR INSCRIÇÃO'}</span>
            </button>

            {/* Helper Text */}
            <div className="pt-2 text-center">
              <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                AINDA NÃO TEM O CÓDIGO?
              </span>
            </div>

            {/* WhatsApp Payment / Contact Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#0d2217] hover:bg-[#112c1e] border border-emerald-500/40 hover:border-emerald-400 text-[#00c853] font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2.5 uppercase tracking-wider cursor-pointer shadow-md"
            >
              <MessageCircle className="h-4.5 w-4.5 fill-[#00c853] text-[#0d2217]" />
              <span>SOLICITAR CÓDIGO NO WHATSAPP</span>
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
