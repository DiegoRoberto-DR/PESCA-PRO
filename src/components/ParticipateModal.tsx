import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, MessageCircle, Key, ShieldCheck, Users, Crown, ArrowRight, UserPlus, Trophy, Sparkles } from 'lucide-react';
import { Tournament, UserProfile, Team } from '../types';
import { validateAndConsumeTournamentCode, getUserTeam } from '../utils/dbHelpers';

interface ParticipateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  currentUser: UserProfile | null;
  initialCode?: string;
  onRequireAuth: () => void;
  onSuccessEnroll?: (tournament: Tournament) => void;
  onNavigateToProfile?: () => void;
  onNavigateToTournaments?: () => void;
}

export default function ParticipateModal({
  isOpen,
  onClose,
  tournament,
  currentUser,
  initialCode,
  onRequireAuth,
  onSuccessEnroll,
  onNavigateToProfile,
  onNavigateToTournaments
}: ParticipateModalProps) {
  const [code, setCode] = useState(initialCode || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode || '');
      setError('');
    }
  }, [isOpen, initialCode]);

  useEffect(() => {
    if (isOpen && currentUser && tournament && tournament.teamFormat && tournament.teamFormat !== 'solo') {
      setIsLoadingTeam(true);
      getUserTeam(currentUser.uid).then(t => {
        setUserTeam(t);
        setIsLoadingTeam(false);
      }).catch(() => {
        setIsLoadingTeam(false);
      });
    } else {
      setUserTeam(null);
      setIsLoadingTeam(false);
    }
  }, [isOpen, currentUser, tournament]);

  if (!isOpen || !tournament) return null;

  const isTeamTournament = Boolean(tournament.teamFormat && tournament.teamFormat !== 'solo');
  const requiredSpots = tournament.teamFormat === 'dupla' ? 2 : tournament.teamFormat === 'trio' ? 3 : tournament.teamFormat === 'quarteto' ? 4 : 5;
  const isAlreadyEnrolled = Boolean(
    currentUser?.enrolledTournaments?.includes(tournament.id) ||
    (userTeam && userTeam.tournamentIds?.includes(tournament.id))
  );

  // Check if current user is captain
  const isCaptain = Boolean(
    currentUser &&
    userTeam && (
      userTeam.creatorId === currentUser.uid ||
      (currentUser.email && userTeam.creatorEmail && userTeam.creatorEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      userTeam.members?.some(m => m.userId === currentUser.uid && m.role === 'captain')
    )
  );

  const isTeamMemberNotCaptain = Boolean(
    currentUser &&
    userTeam &&
    !isCaptain &&
    userTeam.members?.some(m => m.userId === currentUser.uid)
  );

  const hasNoTeam = Boolean(currentUser && !userTeam && !isLoadingTeam);

  // Format WhatsApp message link
  const organizerWhatsAppNumber = '5519987626991'; // WhatsApp 19987626991
  const messageText = encodeURIComponent(
    `Olá! Sou ${currentUser?.displayName || currentUser?.fullName || 'o Capitão'} ${isCaptain && userTeam ? `da equipe "${userTeam.name}"` : ''} e gostaria de receber meu código exclusivo de participação para o torneio "${tournament.title}". (Taxa: ${
      tournament.entryFeeType === 'pago' ? `R$ ${tournament.entryFeeAmount || 0}` : 'Grátis'
    }${isTeamTournament ? ` - Equipe de ${requiredSpots} pessoas, pagamento único` : ''})`
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
          `🚫 INSCRIÇÃO EXCLUSIVA PARA CAPITÃO: Este campeonato é no formato ${tournament.teamFormat?.toUpperCase()} (${requiredSpots} pessoas). Quem não tem equipe deve montar sua própria equipe (tornando-se o Capitão) ou entrar em uma equipe já existente no Perfil. Pescadores sem equipe podem participar apenas de torneios Solo.`
        );
        return;
      }

      // Check if user is captain
      const userIsCap = currentTeam.creatorId === currentUser.uid ||
        (currentUser.email && currentTeam.creatorEmail && currentTeam.creatorEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        currentTeam.members?.some(m => m.userId === currentUser.uid && m.role === 'captain');

      if (!userIsCap) {
        setError(
          `👑 SOMENTE O CAPITÃO PODE INSCREVER A EQUIPE: Você é membro da equipe "${currentTeam.name}". Apenas o Capitão (${currentTeam.creatorName || currentTeam.creatorEmail || 'Capitão'}) tem autorização para pagar a taxa e ativar o código de inscrição da equipe.`
        );
        return;
      }

      // Check team capacity matches tournament requirement
      if (currentTeam.maxMembers !== requiredSpots) {
        setError(
          `⚠️ FORMATO INCOMPATÍVEL: Este campeonato exige uma equipe de ${requiredSpots} pessoas (${tournament.teamFormat?.toUpperCase()}), mas sua equipe "${currentTeam.name}" possui capacidade para ${currentTeam.maxMembers} pessoas.`
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
      if (memberCount < requiredSpots) {
        setError(
          `⚠️ EQUIPE INCOMPLETA: Sua equipe "${currentTeam.name}" possui ${memberCount} de ${requiredSpots} vagas preenchidas. Todas as ${requiredSpots} vagas devem estar preenchidas antes de ativar a inscrição.`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-[500px] bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        
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
            {isTeamTournament
              ? `Campeonato no formato ${tournament.teamFormat?.toUpperCase()} (${requiredSpots} pessoas) com inscrição exclusiva realizada pelo Capitão.`
              : 'Insira o código de participação individual fornecido exclusivamente pelo administrador.'}
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

          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span className="text-[#00c853] font-bold">✓ Exigência:</span>
            <span>Régua Oficial FISGADA PRO obrigatória para validar capturas.</span>
          </div>

          {isTeamTournament && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>Formato: {tournament.teamFormat?.toUpperCase()} ({requiredSpots} Integrantes)</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                  Inscrição por Equipe
                </span>
              </div>
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
            <p className="text-xs text-slate-400">
              {isTeamTournament 
                ? `Código autenticado com sucesso! O Capitão inscreveu a equipe "${userTeam?.name}". Todos os ${requiredSpots} integrantes já estão liberados para registrar capturas.`
                : 'Código autenticado e de uso único registrado. Você já está habilitado a enviar capturas neste campeonato.'}
            </p>
          </div>
        ) : isAlreadyEnrolled ? (
          <div className="py-6 text-center space-y-4 animate-fade-in bg-slate-900/60 p-6 rounded-2xl border border-emerald-500/30">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white uppercase">VOCÊ JÁ ESTÁ INSCRITO!</h3>
              <p className="text-xs text-slate-300">
                {isTeamTournament 
                  ? `Sua equipe "${userTeam?.name || 'sua equipe'}" já está oficialmente inscrita neste campeonato (taxa paga e ativada pelo Capitão). Todos os membros da equipe já podem enviar capturas!`
                  : 'Sua inscrição neste torneio já foi autenticada e está ativa.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs sm:text-sm py-3 px-4 rounded-xl transition uppercase tracking-wider cursor-pointer"
            >
              OK, ENTENDIDO
            </button>
          </div>
        ) : isTeamTournament && !currentUser ? (
          /* User Not Logged in */
          <div className="py-6 text-center space-y-4 animate-fade-in bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <div className="inline-flex p-3 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Users className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white uppercase">IDENTIFICAÇÃO NECESSÁRIA</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para se inscrever em torneios de equipes ({tournament.teamFormat?.toUpperCase()}), faça login na sua conta para verificar seu vínculo de Capitão ou membro de equipe.
              </p>
            </div>
            <button
              onClick={onRequireAuth}
              className="w-full bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs sm:text-sm py-3 px-4 rounded-xl transition uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>ENTRAR OU CADASTRAR-SE</span>
            </button>
          </div>
        ) : isTeamTournament && hasNoTeam ? (
          /* USER HAS NO TEAM -> Explicit rules explanation */
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Crown className="h-5 w-5 text-amber-400 shrink-0" />
                <span>Inscrição Exclusiva para Capitães de Equipe</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                Este campeonato é disputado na modalidade <strong>{tournament.teamFormat?.toUpperCase()} ({requiredSpots} pessoas)</strong>. Pescadores sem equipe não podem se inscrever diretamente.
              </p>

              <div className="pt-2 border-t border-amber-500/20 space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-white">Como você pode participar:</div>
                <div className="flex items-start gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-emerald-400">1.</span>
                  <div>
                    <strong className="text-white">Montar sua própria equipe:</strong> Crie sua equipe no seu Perfil tornando-se o <strong>Capitão</strong> responsável pela inscrição e pagamento único da taxa.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-sky-400">2.</span>
                  <div>
                    <strong className="text-white">Entrar em uma equipe:</strong> Peça o Código de Convite da equipe (EQP-...) ao seu Capitão e entre na equipe pelo Perfil sem pagar nova taxa.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-400">3.</span>
                  <div>
                    <strong className="text-white">Torneios Solo:</strong> Quem prefere pescar individualmente pode participar exclusivamente de campeonatos na categoria <strong>Solo</strong>.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateToProfile) onNavigateToProfile();
                }}
                className="w-full bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Users className="h-4 w-4" />
                <span>MONTAR OU ENTRAR EM UMA EQUIPE</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onNavigateToTournaments) onNavigateToTournaments();
                }}
                className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Ver Campeonatos Individuais (Solo)</span>
              </button>
            </div>
          </div>
        ) : isTeamTournament && isTeamMemberNotCaptain ? (
          /* USER IS IN A TEAM BUT NOT THE CAPTAIN */
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                <Crown className="h-5 w-5 text-amber-400 shrink-0" />
                <span>Inscrição Autorizada Apenas para o Capitão</span>
              </div>
              <p className="text-xs text-sky-100/90 leading-relaxed">
                Você é membro titular da equipe <strong className="text-white">"{userTeam?.name}"</strong>. Em campeonatos de {tournament.teamFormat?.toUpperCase()} ({requiredSpots} integrantes), a inscrição e o pagamento da taxa única são realizados exclusivamente pelo seu Capitão.
              </p>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="text-slate-400 text-[10px] uppercase">Capitão Titular da Sua Equipe:</div>
                <div className="text-amber-300 font-bold flex items-center gap-1.5 text-sm">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <span>{userTeam?.creatorName || userTeam?.creatorEmail || 'Capitão da Equipe'}</span>
                </div>
                <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-800/80">
                  Assim que o Capitão efetuar o pagamento e ativar o código da equipe, você e todos os parceiros da equipe estarão inscritos automaticamente e habilitados a enviar capturas!
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition uppercase tracking-wider cursor-pointer border border-slate-700"
            >
              OK, ENTENDIDO
            </button>
          </div>
        ) : (
          /* STANDARD SOLO TOURNAMENT OR TEAM CAPTAIN FORM */
          <form onSubmit={handleConfirm} className="space-y-5">
            {/* Team Captain Info Box */}
            {isTeamTournament && isCaptain && userTeam && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-2 text-emerald-100">
                <div className="flex items-center justify-between font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <span>Você é o Capitão da Equipe "{userTeam.name}"</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                    Capitão Titular
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  💡 Como Capitão, você efetua o <strong>pagamento único da taxa da equipe</strong> e insere o código do torneio abaixo. Ao validar, <strong>todos os {requiredSpots} integrantes da equipe estarão automaticamente inscritos</strong> sem novo pagamento!
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-emerald-500/20 text-slate-400">
                  <span>Status: <strong className="text-emerald-400 font-bold">{userTeam.status === 'approved' ? '✓ Homologada' : '⏳ Em Aprovação'}</strong></span>
                  <span>Vagas: <strong className={userTeam.members?.length === requiredSpots ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{userTeam.members?.length || 0}/{requiredSpots}</strong></span>
                </div>
              </div>
            )}

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
                🔒 Cada código só pode ser utilizado 1 única vez.
              </span>
            </div>

            {/* Primary Submit Button (Vibrant Green) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00c853] hover:bg-[#00e676] active:bg-[#00b248] text-slate-950 font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl transition duration-150 uppercase tracking-wider shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isSubmitting ? 'VALIDANDO CÓDIGO...' : isTeamTournament ? 'CONFIRMAR INSCRIÇÃO DA EQUIPE' : 'CONFIRMAR INSCRIÇÃO'}</span>
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

