import React, { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Ruler, 
  MapPin, 
  Video, 
  Upload, 
  AlertCircle, 
  ExternalLink,
  User,
  CreditCard,
  Mail,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Ticket,
  Lock,
  MessageCircle,
  Tag,
  Users,
  Send,
  Fish,
  Sparkles,
  UserPlus,
  Trash2,
  LogOut,
  Image as ImageIcon,
  Shield,
  HelpCircle,
  Share2,
  Bell,
  Calendar,
  Radio,
  Timer
} from 'lucide-react';
import { UserProfile, Catch, Tournament, TournamentCode, Team, CaptureWindow, AppNotification } from '../types';
import { 
  submitCatch, 
  subscribeUserTournamentCodes, 
  validateAndConsumeTournamentCode,
  subscribeUserTeam,
  createTeam,
  joinTeamByCode,
  removeMemberFromTeam,
  leaveTeam,
  updateTeam,
  subscribeNotifications,
  markNotificationAsRead,
  updateUserProfilePhoto,
  getTournamentSubmissionDeadline,
  getCaptureWindowStatus as getCaptureWindowStatusUtil,
  formatTimeRemainingMs
} from '../utils/dbHelpers';

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
  // Navigation tabs in profile
  const [activeTab, setActiveTab] = useState<'registration' | 'codes' | 'team' | 'windows' | 'submit' | 'catches'>('registration');

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [copiedWindowSecretId, setCopiedWindowSecretId] = useState<string | null>(null);

  // Realtime codes assigned to this user
  const [userCodes, setUserCodes] = useState<TournamentCode[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [activatingCodeId, setActivatingCodeId] = useState<string | null>(null);
  const [codeActionResult, setCodeActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // User's Team State
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [teamFormMode, setTeamFormMode] = useState<'create' | 'join'>('create');
  const [teamNameInput, setTeamNameInput] = useState('');
  const [teamSizeInput, setTeamSizeInput] = useState<number>(2);
  const [teamLogoUrlInput, setTeamLogoUrlInput] = useState('');
  const [teamLogoBase64, setTeamLogoBase64] = useState('');
  const [joinTeamCodeInput, setJoinTeamCodeInput] = useState('');
  const [teamError, setTeamError] = useState('');
  const [teamSuccess, setTeamSuccess] = useState('');
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [copiedTeamCode, setCopiedTeamCode] = useState(false);
  const teamLogoInputRef = useRef<HTMLInputElement>(null);

  // Profile Photo Upload State
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const [currentPhotoURL, setCurrentPhotoURL] = useState<string>(currentUser.photoURL || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState<string>('');
  const [photoUploadError, setPhotoUploadError] = useState<string>('');

  useEffect(() => {
    if (currentUser.photoURL) {
      setCurrentPhotoURL(currentUser.photoURL);
    }
  }, [currentUser.photoURL]);

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoUploadError('Selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoUploadError('A imagem deve ter menos de 10MB.');
      return;
    }

    setPhotoUploadError('');
    setPhotoUploadSuccess('');
    setIsUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 400; // Optimal square size for avatars
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_DIM) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              }
            } else {
              if (height > MAX_DIM) {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setCurrentPhotoURL(compressedBase64);

            await updateUserProfilePhoto(currentUser.uid, compressedBase64);
            setPhotoUploadSuccess('Foto de perfil atualizada com sucesso! Ela será exibida para todos no Ranking.');
            setTimeout(() => setPhotoUploadSuccess(''), 4000);
          };
        } catch (err: any) {
          console.error("Erro ao processar imagem:", err);
          setPhotoUploadError('Não foi possível salvar a imagem: ' + (err.message || 'Erro desconhecido'));
        } finally {
          setIsUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingPhoto(false);
      setPhotoUploadError('Erro ao carregar arquivo.');
    }
  };

  // Subscribe to codes assigned to current user
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeUserTournamentCodes(currentUser.uid, currentUser.email || '', (codes) => {
      setUserCodes(codes);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentUser?.uid, currentUser?.email]);

  // Subscribe to current user's team in real time
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeUserTeam(currentUser.uid, (team) => {
      setUserTeam(team);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentUser?.uid]);

  // Subscribe to broadcast notifications in real time
  useEffect(() => {
    const unsubscribe = subscribeNotifications((allNotifs) => {
      setNotifications(allNotifs);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

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

  // Live ticking clock for real-time validation and countdowns
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter notifications relevant to user's enrolled tournaments or general
  const userTourneyIds = (currentUser.enrolledTournaments || []).concat(participatingTournaments.map(t => t.id));
  const relevantNotifications = notifications.filter(n => {
    if (!n.tournamentId) return true;
    return userTourneyIds.includes(n.tournamentId);
  });
  const unreadNotifsCount = relevantNotifications.filter(n => !n.isRead && (!n.readBy || !n.readBy.includes(currentUser.uid))).length;

  // All capture windows across user's enrolled tournaments
  const userCaptureWindows: (CaptureWindow & { tournamentId: string; tournamentTitle: string; tournamentStatus: string })[] = [];
  participatingTournaments.forEach(tourney => {
    if (tourney.captureWindows && tourney.captureWindows.length > 0) {
      tourney.captureWindows.forEach(cw => {
        userCaptureWindows.push({
          ...cw,
          tournamentId: tourney.id,
          tournamentTitle: tourney.title,
          tournamentStatus: tourney.status
        });
      });
    }
  });

  // Helper to determine capture window status relative to now using centralized helper
  const getCaptureWindowStatus = (win: CaptureWindow) => {
    const st = getCaptureWindowStatusUtil(win, now);
    if (st.status === 'live') {
      return { 
        status: 'active', 
        label: 'Janela Aberta Agora', 
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse',
        timeRemainingStr: st.timeRemainingStr,
        isLive: true
      };
    }
    if (st.status === 'upcoming') {
      return { 
        status: 'upcoming', 
        label: `Abre em ${st.opensInStr || 'Breve'}`, 
        badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        opensInStr: st.opensInStr,
        isLive: false
      };
    }
    return { 
      status: 'ended', 
      label: 'Encerrada', 
      badgeClass: 'bg-rose-950/40 text-rose-400 border-rose-800/60',
      isLive: false
    };
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    await markNotificationAsRead(notifId, currentUser.uid);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true, readBy: [...(n.readBy || []), currentUser.uid] } : n));
  };

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(() => {
    if (selectedTournament && participatingTournaments.some(t => t.id === selectedTournament.id)) {
      return selectedTournament.id;
    }
    return participatingTournaments[0]?.id || '';
  });

  // Sync selectedTournament when participatingTournaments or selectedTournament changes
  useEffect(() => {
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

  const handleTeamLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setTeamError('Por favor, selecione um arquivo de imagem para o logo.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setTeamError('O logo deve ter no máximo 5MB.');
      return;
    }

    setTeamError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setTeamLogoBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleActivateCode = async (codeItem: TournamentCode) => {
    if (!codeItem.tournamentId || !codeItem.code) return;
    setCodeActionResult(null);
    setActivatingCodeId(codeItem.id);

    try {
      const res = await validateAndConsumeTournamentCode(codeItem.tournamentId, codeItem.code, currentUser);
      if (res.success) {
        setCodeActionResult({
          type: 'success',
          message: res.message || 'Código ativado com sucesso! Você está inscrito no torneio.'
        });
        if (!selectedTournamentId) {
          setSelectedTournamentId(codeItem.tournamentId);
        }
      } else {
        setCodeActionResult({
          type: 'error',
          message: res.message || 'Não foi possível validar este código.'
        });
      }
    } catch (err: any) {
      setCodeActionResult({
        type: 'error',
        message: 'Erro ao ativar código: ' + (err.message || 'Tente novamente.')
      });
    } finally {
      setActivatingCodeId(null);
    }
  };

  // Team Actions
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    setTeamSuccess('');

    if (!teamNameInput.trim()) {
      setTeamError('Por favor, digite o nome da sua equipe.');
      return;
    }

    const finalLogo = teamLogoBase64 || teamLogoUrlInput.trim();

    try {
      setIsTeamLoading(true);
      const res = await createTeam({
        name: teamNameInput.trim(),
        maxMembers: teamSizeInput,
        logoUrl: finalLogo || undefined,
        creatorUser: currentUser,
        tournamentIds: selectedTournamentId ? [selectedTournamentId] : []
      });

      if (res.success && res.team) {
        setTeamSuccess(res.message);
        setUserTeam(res.team);
        setTeamNameInput('');
        setTeamLogoUrlInput('');
        setTeamLogoBase64('');
      } else {
        setTeamError(res.message || 'Erro ao criar equipe.');
      }
    } catch (err: any) {
      setTeamError('Erro ao criar equipe: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    setTeamSuccess('');

    if (!joinTeamCodeInput.trim()) {
      setTeamError('Por favor, informe o código da equipe.');
      return;
    }

    try {
      setIsTeamLoading(true);
      const res = await joinTeamByCode(joinTeamCodeInput.trim(), currentUser, selectedTournamentId);
      if (res.success && res.team) {
        setTeamSuccess(res.message);
        setUserTeam(res.team);
        setJoinTeamCodeInput('');
      } else {
        setTeamError(res.message);
      }
    } catch (err: any) {
      setTeamError('Erro ao juntar-se à equipe: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string, memberName: string) => {
    if (!userTeam) return;
    if (!confirm(`Tem certeza que deseja remover ${memberName} da equipe?`)) return;

    try {
      setIsTeamLoading(true);
      const res = await removeMemberFromTeam(userTeam.id, currentUser.uid, memberUserId);
      if (res.success) {
        setTeamSuccess(res.message);
      } else {
        setTeamError(res.message);
      }
    } catch (err: any) {
      setTeamError('Erro ao remover membro: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!userTeam) return;
    if (!confirm(`Tem certeza que deseja sair da equipe "${userTeam.name}"?`)) return;

    try {
      setIsTeamLoading(true);
      const res = await leaveTeam(userTeam.id, currentUser.uid);
      if (res.success) {
        setTeamSuccess(res.message);
        setUserTeam(null);
      } else {
        setTeamError(res.message);
      }
    } catch (err: any) {
      setTeamError('Erro ao sair da equipe: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedTournamentId) {
      setErrorMsg('Por favor, selecione um torneio.');
      return;
    }

    const currentTournament = tournaments.find(t => t.id === selectedTournamentId);
    if (!currentTournament) {
      setErrorMsg('Torneio selecionado não encontrado.');
      return;
    }

    // =========================================================================
    // DEADLINE & CAPTURE WINDOW VALIDATION (ADMIN SCHEDULE ENFORCEMENT)
    // =========================================================================
    const deadlineValidation = getTournamentSubmissionDeadline(currentTournament, new Date());
    if (!deadlineValidation.canSubmit) {
      setErrorMsg(deadlineValidation.message || '🚫 Não é mais possível enviar capturas para avaliação deste campeonato.');
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

    // =========================================================================
    // TEAM VALIDATION RULE FOR SUBMISSIONS
    // =========================================================================
    const isTeamTournament = currentTournament?.teamFormat && currentTournament.teamFormat !== 'solo';
    
    if (isTeamTournament) {
      if (!userTeam) {
        setErrorMsg(`🚫 Este campeonato é no formato ${currentTournament?.teamFormat.toUpperCase()}. Você precisa criar ou juntar-se a uma equipe na aba "Minha Equipe" antes de enviar capturas.`);
        return;
      }

      // Check if team is complete
      const teamCapacity = userTeam.maxMembers || 2;
      const currentMemberCount = userTeam.members ? userTeam.members.length : 0;
      if (currentMemberCount < teamCapacity) {
        setErrorMsg(`🚫 Sua equipe precisa estar COMPLETA (${currentMemberCount}/${teamCapacity} membros) para enviar capturas neste campeonato. Compartilhe o código "${userTeam.code}" com seus parceiros para completarem a equipe.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await submitCatch({
        tournamentId: selectedTournamentId,
        tournamentTitle: currentTournament?.title || 'Torneio de Pesca',
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        teamId: userTeam ? userTeam.id : undefined,
        teamName: userTeam ? userTeam.name : (currentUser.teamName || undefined),
        teamLogo: userTeam?.logoUrl || currentUser.teamLogo || undefined,
        species: species.trim(),
        length: numLength,
        location: location.trim(),
        photoUrl: finalPhoto,
        videoStartUrl: videoStartUrl.trim() || undefined,
        videoEndUrl: videoEndUrl.trim() || undefined,
        isWithinWindow: deadlineValidation.canSubmit,
        captureWindowId: deadlineValidation.activeWindow?.id,
        captureWindowName: deadlineValidation.activeWindow?.name,
        captureWindowSecret: deadlineValidation.activeWindow?.secret,
        verifiedByAI: false
      });

      setSuccessMsg('Captura enviada com sucesso para validação da arbitragem!');
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

  const isCaptain = userTeam && (userTeam.creatorId === currentUser.uid || userTeam.members.some(m => m.userId === currentUser.uid && m.role === 'captain'));
  const isTeamComplete = userTeam && userTeam.members && userTeam.members.length >= userTeam.maxMembers;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Profile Navigation Bar */}
      <div className="bg-[#121316] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Clickable Profile Photo with upload trigger */}
          <div className="relative group shrink-0">
            <input 
              type="file" 
              ref={profilePhotoInputRef} 
              onChange={handleProfilePhotoChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div 
              onClick={() => profilePhotoInputRef.current?.click()}
              className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/30 flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden cursor-pointer hover:border-emerald-400 transition shadow-md relative"
              title="Clique para trocar sua foto de perfil"
            >
              {currentPhotoURL ? (
                <img 
                  src={currentPhotoURL} 
                  alt={currentUser.displayName} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser.displayName.charAt(0).toUpperCase()
              )}

              {/* Hover overlay icon */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Upload className="h-4 w-4 text-emerald-400" />
                <span className="text-[8px] font-bold uppercase mt-0.5">Mudar</span>
              </div>
            </div>

            {isUploadingPhoto && (
              <div className="absolute -bottom-1 -right-1 bg-sky-500 text-slate-950 p-1 rounded-full shadow">
                <Clock className="h-3 w-3 animate-spin" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                {currentUser.fullName || currentUser.displayName}
              </h2>
              {currentUser.nickname && (
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  @{currentUser.nickname}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-slate-400">
              {currentUser.email} {currentUser.cpf ? `• CPF: ${currentUser.cpf}` : ''}
              {userTeam && ` • Equipe: ${userTeam.name}`}
            </p>
            <button 
              onClick={() => profilePhotoInputRef.current?.click()}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 mt-0.5 cursor-pointer underline underline-offset-2"
            >
              <span>📷 Alterar Foto de Perfil</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap bg-[#1b1e22] p-1.5 rounded-2xl border border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('registration')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'registration'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Meu Cadastro</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'codes'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="h-4 w-4" />
            <span>Códigos de Inscrição</span>
            {userCodes.length > 0 && (
              <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                activeTab === 'codes' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {userCodes.length}
              </span>
            )}
          </button>

          {/* New Tab: Minha Equipe */}
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'team'
                ? 'bg-[#00c853] text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Minha Equipe</span>
            {userTeam && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          {/* New Tab: Janelas de Captura & Avisos */}
          <button
            onClick={() => setActiveTab('windows')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'windows'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Janelas & Avisos</span>
            {unreadNotifsCount > 0 && (
              <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('submit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'submit'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Enviar Captura</span>
          </button>

          <button
            onClick={() => setActiveTab('catches')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'catches'
                ? 'bg-purple-500 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Minhas Capturas ({userCatches.length})</span>
          </button>
        </div>
      </div>

      {/* FLASH NOTIFICATION BANNER (if there are unread notifications or open capture windows) */}
      {unreadNotifsCount > 0 && activeTab !== 'windows' && (
        <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-2xl text-amber-400 border border-amber-500/30 animate-bounce shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>Novas Janelas de Captura & Avisos Oficiais</span>
                <span className="bg-rose-500 text-white text-[10px] font-mono px-2 py-0.2 rounded-full font-bold">
                  {unreadNotifsCount} {unreadNotifsCount === 1 ? 'aviso novo' : 'avisos novos'}
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {relevantNotifications[0]?.title}: {relevantNotifications[0]?.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('windows')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shrink-0 flex items-center gap-1.5"
          >
            <Clock className="h-4 w-4" />
            <span>Ver Fases & Horários</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MEU CADASTRO & DADOS PESSOAIS */}
      {/* ========================================================================= */}
      {activeTab === 'registration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          {/* Left: Cadastro Card */}
          <div className="lg:col-span-7 bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">Dados do Cadastro de Competidor</h3>
                  <p className="text-xs text-slate-400">Informações oficiais registradas e vinculadas aos códigos antifraude</p>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold uppercase ${
                currentUser.status === 'blocked' 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {currentUser.status === 'blocked' ? '🛑 Cadastro Bloqueado' : '🟢 Cadastro Ativo & Homologado'}
              </span>
            </div>

            {/* Registration fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#1a1c20] p-4 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Nome Completo</span>
                <span className="text-sm font-bold text-white block mt-1">
                  {currentUser.fullName || currentUser.displayName}
                </span>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Apelido de Pesca</span>
                <span className="text-sm font-bold text-amber-400 block mt-1">
                  {currentUser.nickname ? `@${currentUser.nickname}` : 'Não informado'}
                </span>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">CPF (Vinculado)</span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    🔒 Antifraude
                  </span>
                </div>
                <span className="text-sm font-mono font-bold text-white block mt-1">
                  {currentUser.cpf ? currentUser.cpf : <span className="text-slate-500 italic">Não cadastrado</span>}
                </span>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">E-mail de Login</span>
                <span className="text-xs font-mono text-slate-200 block mt-1 truncate">
                  {currentUser.email}
                </span>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Equipe Vinculada</span>
                <span className="text-sm font-bold text-[#00c853] block mt-1 flex items-center gap-2">
                  {userTeam ? (
                    <>
                      <span>{userTeam.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({userTeam.code})</span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-normal">Nenhuma equipe ativa</span>
                  )}
                </span>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Endereço / Cidade e Estado</span>
                <span className="text-xs text-slate-300 block mt-1">
                  {currentUser.address || 'Não informado'}
                </span>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-xs font-bold text-emerald-300 block">
                  👥 Sistema de Equipes & Duplas
                </span>
                <span className="text-[11px] text-slate-400">
                  {userTeam
                    ? `Você é integrante da equipe "${userTeam.name}" (${userTeam.members?.length || 0}/${userTeam.maxMembers} membros).`
                    : 'Crie sua equipe de 2 a 5 pessoas ou entre na equipe de um amigo com o código único.'}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('team')}
                className="px-4 py-2 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md shrink-0"
              >
                Gerenciar Equipe
              </button>
            </div>
          </div>

          {/* Right: Anti-fraud Explanation & Security Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Foto de Perfil Card */}
            <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <ImageIcon className="h-6 w-6" />
                <div>
                  <h4 className="text-base font-black text-white uppercase">Foto de Perfil do Competidor</h4>
                  <p className="text-xs text-slate-400">Sua foto aparecerá nos rankings oficiais e pódios</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#1a1c20] p-4 rounded-2xl border border-slate-800">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-emerald-500/30 flex items-center justify-center font-black text-2xl text-emerald-400 overflow-hidden shadow-md">
                    {currentPhotoURL ? (
                      <img
                        src={currentPhotoURL}
                        alt="Foto de perfil"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUser.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <p className="text-xs text-slate-300">
                    Selecione uma foto sua segurando um peixe ou sua foto de pescador.
                  </p>
                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md mx-auto sm:mx-0"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{isUploadingPhoto ? 'Enviando...' : 'Buscar Foto no Dispositivo'}</span>
                  </button>
                </div>
              </div>

              {photoUploadSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{photoUploadSuccess}</span>
                </div>
              )}

              {photoUploadError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{photoUploadError}</span>
                </div>
              )}
            </div>

            <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
                <h4 className="text-base font-black text-white uppercase">Sistema de Proteção Antifraude</h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Na <strong>Fisgada Pro</strong>, cada código de participação emitido é <em>exclusivo e de uso único</em>. 
                Ao ser consumido, ele é permanentemente vinculado ao seu CPF e Cadastro de Competidor, prevenindo fraudes e acessos não autorizados.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Código de uso único e intransferível.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Equipes com travas de capacidade (2 a 5 participantes).</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Envio de capturas em campeonatos de duplas liberado apenas com equipe completa.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CÓDIGOS DE INSCRIÇÃO */}
      {/* ========================================================================= */}
      {activeTab === 'codes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-amber-400" />
                  <span>Meus Códigos de Inscrição Atribuídos</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Códigos exclusivos liberados pela arbitragem após a validação do pagamento.
                </p>
              </div>

              <a
                href={`https://wa.me/5519987626991?text=${encodeURIComponent(
                  `Olá! Sou o competidor ${currentUser.displayName} (${currentUser.email}). Gostaria de solicitar um novo código de participação para o torneio.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Solicitar Código no WhatsApp</span>
              </a>
            </div>

            {/* Notification alert */}
            {codeActionResult && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
                codeActionResult.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {codeActionResult.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                <span>{codeActionResult.message}</span>
              </div>
            )}

            {userCodes.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-300">Nenhum código atribuído ainda</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Assim que o Administrador gerar seu código exclusivo para um campeonato, ele aparecerá aqui com opção de ativação imediata.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {userCodes.map((c) => {
                  const isActivating = activatingCodeId === c.id;
                  const isCopied = copiedCodeId === c.id;

                  return (
                    <div
                      key={c.id}
                      className={`p-5 rounded-2xl border transition space-y-4 flex flex-col justify-between ${
                        c.isUsed
                          ? 'bg-[#15171a]/60 border-slate-850 opacity-80'
                          : 'bg-[#181a1e] border-amber-500/40 shadow-lg shadow-amber-950/20'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {c.tournamentTitle || 'Torneio Oficial'}
                          </span>
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            c.isUsed ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {c.isUsed ? '🔒 Utilizado' : '🟢 Disponível'}
                          </span>
                        </div>

                        {/* Code Display Box */}
                        <div className="bg-[#121316] p-3.5 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-slate-500">Código de Participação</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(c.code);
                                setCopiedCodeId(c.id);
                                setTimeout(() => setCopiedCodeId(null), 2000);
                              }}
                              className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="font-mono font-black text-lg text-amber-400 tracking-wider text-center select-all">
                            {c.code}
                          </div>
                        </div>
                      </div>

                      {/* Action Button: 1-Click Activate */}
                      <div>
                        {c.isUsed ? (
                          <div className="w-full py-2.5 text-center text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            ✓ Inscrição Homologada & Ativa
                          </div>
                        ) : (
                          <button
                            onClick={() => handleActivateCode(c)}
                            disabled={isActivating}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isActivating ? (
                              <span>Ativando Inscrição...</span>
                            ) : (
                              <>
                                <Key className="h-4 w-4" />
                                <span>Ativar Inscrição no Torneio</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MINHA EQUIPE (CRIAR, ENTRAR, GERENCIAR DUPLAS E EQUIPES) */}
      {/* ========================================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-fade-in">
          {/* Team Feedback Alerts */}
          {teamError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{teamError}</span>
            </div>
          )}

          {teamSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{teamSuccess}</span>
            </div>
          )}

          {userTeam ? (
            /* =================================================================== */
            /* USER HAS A TEAM: DISPLAY TEAM DASHBOARD */
            /* =================================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Team Details & Members */}
              <div className="lg:col-span-8 bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    {/* Team Logo / Shield */}
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                      {userTeam.logoUrl ? (
                        <img 
                          src={userTeam.logoUrl} 
                          alt={userTeam.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="h-8 w-8 text-emerald-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                          {userTeam.name}
                        </h2>
                        {isCaptain && (
                          <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            👑 Capitão
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Capacidade: {userTeam.maxMembers} Participantes ({userTeam.maxMembers === 2 ? 'Dupla' : userTeam.maxMembers === 3 ? 'Trio' : userTeam.maxMembers === 4 ? 'Quarteto' : 'Quinteto'})
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isTeamComplete ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>EQUIPE COMPLETA ({userTeam.members.length}/{userTeam.maxMembers})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>INCOMPLETA ({userTeam.members.length}/{userTeam.maxMembers})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Code Highlight Card */}
                <div className="bg-[#181a1e] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                      Código Único da Equipe (Para convidar parceiros)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-widest select-all">
                      {userTeam.code}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Envie este código para seus parceiros entrarem na equipe pelo perfil deles.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(userTeam.code);
                        setCopiedTeamCode(true);
                        setTimeout(() => setCopiedTeamCode(false), 2500);
                      }}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                    >
                      {copiedTeamCode ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copiar Código</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `🎣 Venha fazer parte da minha equipe "${userTeam.name}" na Fisgada Pro! Use o código de equipe: *${userTeam.code}* no seu perfil para se juntar à equipe e competirmos juntos.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Convidar no WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-400" />
                      <span>Integrantes da Equipe ({userTeam.members.length} de {userTeam.maxMembers})</span>
                    </h3>
                    {!isTeamComplete && (
                      <span className="text-[11px] font-mono text-amber-400">
                        Falta(m) {userTeam.maxMembers - userTeam.members.length} integrante(s)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {userTeam.members.map((member, idx) => (
                      <div
                        key={member.userId || idx}
                        className="bg-[#181a1e] border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-sm text-white shrink-0 overflow-hidden">
                            {member.userPhoto ? (
                              <img 
                                src={member.userPhoto} 
                                alt={member.userName} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              member.userName.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white truncate max-w-[140px]">
                                {member.userName}
                              </h4>
                              {member.role === 'captain' && (
                                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/20">
                                  👑 Capitão
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                              {member.userEmail}
                            </p>
                          </div>
                        </div>

                        {/* Captain controls: Remove member */}
                        {isCaptain && member.userId !== currentUser.uid && (
                          <button
                            onClick={() => handleRemoveMember(member.userId, member.userName)}
                            disabled={isTeamLoading}
                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                            title="Remover da equipe"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: Math.max(0, userTeam.maxMembers - userTeam.members.length) }).map((_, slotIdx) => (
                      <div
                        key={`empty-${slotIdx}`}
                        className="border-2 border-dashed border-slate-800 rounded-2xl p-3.5 flex items-center justify-center text-center text-xs text-slate-500 font-mono"
                      >
                        + Vaga disponível (Aguardando entrada)
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Controls & Leave button */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handleLeaveTeam}
                    disabled={isTeamLoading}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair da Equipe</span>
                  </button>

                  {!isTeamComplete && (
                    <span className="text-xs text-amber-400/90 font-mono">
                      ⚠️ Complete a equipe para liberar o envio de capturas em campeonatos de equipe.
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Rules & Info Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-[#00c853]">
                    <Shield className="h-5 w-5" />
                    <h3 className="text-base font-black text-white uppercase">Regras de Equipe</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Em campeonatos com formato de <strong>Dupla</strong> ou <strong>Equipe</strong>, as pontuações e capturas são creditadas tanto ao competidor quanto ao placar oficial da equipe.
                  </p>

                  <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Limite fixo de membros ({userTeam.maxMembers} pessoas).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>O Capitão pode gerenciar e remover participantes.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Não é permitido participar do mesmo campeonato por duas equipes diferentes.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* USER HAS NO TEAM: SHOW CREATE TEAM & JOIN TEAM FORMS */
            /* =================================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                {/* Form selector buttons: Criar Equipe vs Juntar-se a Equipe */}
                <div className="flex bg-[#181a1e] p-1.5 rounded-2xl border border-slate-800 gap-1">
                  <button
                    onClick={() => setTeamFormMode('create')}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                      teamFormMode === 'create'
                        ? 'bg-[#00c853] text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Criar Nova Equipe</span>
                  </button>

                  <button
                    onClick={() => setTeamFormMode('join')}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                      teamFormMode === 'join'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Juntar-se a uma Equipe</span>
                  </button>
                </div>

                {teamFormMode === 'create' ? (
                  /* Form: CRIAR EQUIPE */
                  <form onSubmit={handleCreateTeam} className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase">Criar Equipe / Dupla de Pesca</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Defina o nome, a quantidade de membros (2 a 5 pessoas) e o logotipo da sua equipe.
                      </p>
                    </div>

                    {/* 1. Nome da Equipe */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-300 block">
                        Nome da Equipe / Barco *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Tucuna Brothers, Equipe Gigantes do Rio, etc."
                        value={teamNameInput}
                        onChange={(e) => setTeamNameInput(e.target.value)}
                        className="w-full bg-[#1b1e22] border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none"
                        required
                      />
                    </div>

                    {/* 2. Quantidade de Membros (2 a 5 pessoas) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-300 block">
                        Quantidade de Integrantes da Equipe (2 a 5 Pessoas) *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { count: 2, label: 'Dupla (2 Pessoas)' },
                          { count: 3, label: 'Trio (3 Pessoas)' },
                          { count: 4, label: 'Quarteto (4 Pessoas)' },
                          { count: 5, label: 'Quinteto (5 Pessoas)' }
                        ].map((opt) => (
                          <button
                            key={opt.count}
                            type="button"
                            onClick={() => setTeamSizeInput(opt.count)}
                            className={`p-3 rounded-2xl text-xs font-bold border transition text-center cursor-pointer ${
                              teamSizeInput === opt.count
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-extrabold shadow-sm'
                                : 'bg-[#1b1e22] border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="text-base font-black block">{opt.count}</span>
                            <span className="text-[10px] block mt-0.5">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Logo / Imagem da Equipe */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-300 block">
                        Logotipo / Escudo da Equipe (Opcional)
                      </label>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="url"
                            placeholder="Cole o link da imagem (URL) ou envie abaixo"
                            value={teamLogoUrlInput}
                            onChange={(e) => {
                              setTeamLogoUrlInput(e.target.value);
                              if (e.target.value) setTeamLogoBase64('');
                            }}
                            className="w-full bg-[#1b1e22] border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                          />

                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              ref={teamLogoInputRef}
                              onChange={handleTeamLogoFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => teamLogoInputRef.current?.click()}
                              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                            >
                              <Upload className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Enviar Imagem do Dispositivo</span>
                            </button>
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {teamLogoBase64 || teamLogoUrlInput ? (
                            <img
                              src={teamLogoBase64 || teamLogoUrlInput}
                              alt="Preview Logo"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-slate-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isTeamLoading}
                      className="w-full py-3.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-950/60 disabled:opacity-50"
                    >
                      {isTeamLoading ? 'Criando Equipe...' : 'Criar Equipe e Gerar Código'}
                    </button>
                  </form>
                ) : (
                  /* Form: JUNTAR-SE A UMA EQUIPE */
                  <form onSubmit={handleJoinTeam} className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase">Juntar-se a uma Equipe Existente</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Insira o código exclusivo fornecido pelo capitão da sua equipe para entrar no time.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-300 block">
                        Código Único da Equipe (Ex: EQP-8492-XP) *
                      </label>
                      <input
                        type="text"
                        placeholder="Digite o código da equipe"
                        value={joinTeamCodeInput}
                        onChange={(e) => setJoinTeamCodeInput(e.target.value.toUpperCase())}
                        className="w-full bg-[#1b1e22] border border-slate-800 focus:border-amber-500 text-amber-400 font-mono font-bold text-center tracking-widest rounded-xl px-4 py-3.5 text-base sm:text-lg uppercase focus:outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isTeamLoading}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-lg shadow-amber-950/60 disabled:opacity-50"
                    >
                      {isTeamLoading ? 'Validando Entrada...' : 'Entrar na Equipe'}
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Info Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                    <h3 className="text-base font-black text-white uppercase">Como Funcionam as Equipes</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    O sistema de equipes da <strong>Fisgada Pro</strong> permite disputar campeonatos em duplas, trios ou quartetos com total segurança antifraude.
                  </p>

                  <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Crie a equipe e receba o código único na hora.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Compartilhe o código com seus parceiros para completarem o time.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Em campeonatos de equipe, o envio de capturas é liberado quando o time estiver completo.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: JANELAS DE CAPTURA & AVISOS OFICIAIS */}
      {/* ========================================================================= */}
      {activeTab === 'windows' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    Fases & Janelas de Captura
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Acompanhe em tempo real os dias, horários oficiais e palavras-chave de cada etapa dos seus campeonatos.
                  </p>
                </div>
              </div>

              {unreadNotifsCount > 0 && (
                <span className="px-3.5 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto">
                  <Bell className="h-3.5 w-3.5 text-rose-400 animate-bounce" />
                  <span>{unreadNotifsCount} {unreadNotifsCount === 1 ? 'Novo Aviso' : 'Novos Avisos'}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Scheduled Capture Windows */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  <span>Cronograma de Fases ({userCaptureWindows.length})</span>
                </h3>
              </div>

              {userCaptureWindows.length === 0 ? (
                <div className="bg-[#121316] border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Clock className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Nenhuma Janela Específica Cadastrada</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Os campeonatos em que você está inscrito seguem a janela geral de vigência do torneio, ou a organização ainda irá publicar as etapas.
                    </p>
                  </div>
                  {tournaments.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab('submit')}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Enviar Captura Geral
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {userCaptureWindows.map((win, idx) => {
                    const statusInfo = getCaptureWindowStatus(win);
                    return (
                      <div
                        key={win.id || idx}
                        className="bg-[#121316] border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl transition space-y-4"
                      >
                        {/* Top: Tournament Title & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                              {win.tournamentTitle}
                            </span>
                            <h4 className="text-base font-black text-white uppercase tracking-tight">
                              {win.name || `Etapa ${idx + 1}`}
                            </h4>
                          </div>

                          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border self-start sm:self-auto ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Middle: Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#181a1e] p-4 rounded-2xl border border-slate-800/80">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase text-slate-500 block">Data da Etapa:</span>
                            <div className="text-sm font-black text-white flex items-center gap-1.5 font-mono">
                              <Calendar className="h-4 w-4 text-sky-400" />
                              <span>{win.date ? win.date.split('-').reverse().join('/') : 'Data a definir'}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase text-slate-500 block">Horário de Captura:</span>
                            <div className="text-sm font-black text-white flex items-center gap-1.5 font-mono">
                              <Clock className="h-4 w-4 text-amber-400" />
                              <span>{win.startTime || '06:00'} às {win.endTime || '18:00'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Antifraud Secret Code Box */}
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-300">
                              Chave Antifraude Obrigatória da Etapa:
                            </span>
                            <div className="text-lg font-mono font-black text-amber-400 tracking-widest">
                              {win.secret}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(win.secret);
                              setCopiedWindowSecretId(win.id || win.secret);
                              setTimeout(() => setCopiedWindowSecretId(null), 2500);
                            }}
                            className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                          >
                            {copiedWindowSecretId === (win.id || win.secret) ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Copiada!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copiar Chave</span>
                              </>
                            )}
                          </button>
                        </div>

                        {win.description && (
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            📝 <strong>Observação:</strong> {win.description}
                          </p>
                        )}

                        {/* Action: Jump to Submit Catch or show status */}
                        <div className="flex justify-end pt-1">
                          {statusInfo.status === 'active' ? (
                            <button
                              onClick={() => {
                                if (win.tournamentId) setSelectedTournamentId(win.tournamentId);
                                setActiveTab('submit');
                              }}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>Enviar Captura Nesta Fase</span>
                            </button>
                          ) : statusInfo.status === 'upcoming' ? (
                            <div className="px-4 py-2 bg-slate-800/60 text-sky-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-not-allowed">
                              <Clock className="h-3.5 w-3.5 text-sky-400" />
                              <span>Aguardando Abertura ({statusInfo.opensInStr || 'Em Breve'})</span>
                            </div>
                          ) : (
                            <div className="px-4 py-2 bg-rose-950/30 text-rose-400 font-bold text-xs rounded-xl border border-rose-800/40 flex items-center gap-1.5 cursor-not-allowed">
                              <Lock className="h-3.5 w-3.5 text-rose-400" />
                              <span>Etapa Encerrada - Envios Bloqueados</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Notification Feed (Avisos em Tempo Real) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-400" />
                  <span>Avisos & Notificações ({relevantNotifications.length})</span>
                </h3>
              </div>

              {relevantNotifications.length === 0 ? (
                <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 text-center text-xs text-slate-500 shadow-xl space-y-2">
                  <Bell className="h-6 w-6 mx-auto text-slate-600" />
                  <p>Você não possui nenhum aviso no momento.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {relevantNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition space-y-2.5 ${
                        notif.isRead
                          ? 'bg-[#14161a] border-slate-800/80 text-slate-400'
                          : 'bg-amber-500/10 border-amber-500/40 text-slate-200 shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${notif.isRead ? 'bg-slate-600' : 'bg-amber-400 animate-ping'}`} />
                          <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                        </div>
                        {notif.type === 'capture_window_added' && (
                          <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                            Nova Etapa
                          </span>
                        )}
                      </div>

                      <p className="text-xs leading-relaxed text-slate-300">
                        {notif.message}
                      </p>

                      {/* Highlighted Keyword Box in Notification */}
                      {notif.windowSecret && (
                        <div className="bg-[#181a1e] border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono uppercase text-amber-400 font-bold block">
                              Palavra-Chave da Etapa:
                            </span>
                            <span className="text-xs sm:text-sm font-mono font-black text-amber-300 tracking-wider">
                              {notif.windowSecret}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(notif.windowSecret || '');
                              setCopiedWindowSecretId(notif.id || notif.windowSecret);
                              setTimeout(() => setCopiedWindowSecretId(null), 2500);
                            }}
                            className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] rounded-lg border border-amber-500/30 transition cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            {copiedWindowSecretId === (notif.id || notif.windowSecret) ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                <span>Copiada!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                        <span>{notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkNotificationRead(notif.id)}
                            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ENVIAR CAPTURA */}
      {/* ========================================================================= */}
      {activeTab === 'submit' && (() => {
        const currentSelectedTournament = tournaments.find(t => t.id === selectedTournamentId);
        const currentDeadline = getTournamentSubmissionDeadline(currentSelectedTournament, now);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            {/* Left Column: Form "ENVIAR CAPTURA" */}
            <div className="lg:col-span-8 bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  ENVIAR CAPTURA PARA MODERAÇÃO
                </h2>
                {currentDeadline.status === 'open_live' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 animate-pulse">
                    🔴 PROVA AO VIVO
                  </span>
                )}
              </div>

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

              {/* SUBMISSION DEADLINE STATUS CARD */}
              {currentSelectedTournament && (
                <>
                  {!currentDeadline.canSubmit ? (
                    <div className={`p-4 sm:p-5 rounded-2xl border-2 space-y-2.5 mb-5 shadow-lg ${
                      currentDeadline.status === 'tournament_completed'
                        ? 'bg-rose-950/50 border-rose-600/60 text-rose-200'
                        : currentDeadline.status === 'window_expired'
                        ? 'bg-rose-950/50 border-rose-600/60 text-rose-200'
                        : 'bg-amber-950/50 border-amber-600/60 text-amber-200'
                    }`}>
                      <div className="flex items-center space-x-2 text-rose-400 font-bold">
                        <Lock className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-black uppercase tracking-wider font-mono">
                          {currentDeadline.status === 'tournament_completed' && 'CAMPEONATO OFICIALMENTE ENCERRADO'}
                          {currentDeadline.status === 'window_expired' && 'JANELA DE CAPTURA ENCERRADA (PRAZO FINALIZADO)'}
                          {currentDeadline.status === 'window_upcoming' && 'JANELA DE CAPTURA AINDA NÃO INICIADA'}
                          {currentDeadline.status === 'tournament_upcoming' && 'CAMPEONATO EM BREVE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                        {currentDeadline.message}
                      </p>
                      <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5 pt-1.5 border-t border-rose-800/40">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span>O envio de capturas para avaliação está bloqueado de acordo com as regras e horários definidos pelo Administrador.</span>
                      </div>
                    </div>
                  ) : currentDeadline.status === 'open_live' ? (
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-2 border-emerald-500/50 rounded-2xl space-y-3 mb-5 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/40 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping"></span>
                          <span className="text-xs font-black uppercase tracking-wider font-mono text-emerald-400">
                            🔴 PROVA AO VIVO: {currentDeadline.activeWindow?.name || currentSelectedTournament?.title}
                          </span>
                        </div>
                        {currentDeadline.remainingFormatted && (
                          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-emerald-600/40 shadow-inner">
                            <Timer className="h-4 w-4 text-amber-400 animate-pulse" />
                            <span className="text-[11px] font-mono text-slate-400 uppercase">Tempo Restante:</span>
                            <span className="text-sm font-black text-amber-300 font-mono tracking-wider">
                              {currentDeadline.remainingFormatted}
                            </span>
                          </div>
                        )}
                      </div>
                      {currentDeadline.activeWindow?.secret && (
                        <div className="p-3 bg-slate-950/80 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                              Chave Antifraude Desta Janela (Obrigatória no Vídeo/Foto):
                            </span>
                            <span className="text-sm font-mono font-black text-amber-400 tracking-widest">
                              {currentDeadline.activeWindow.secret}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(currentDeadline.activeWindow?.secret || '');
                              setCopiedWindowSecretId('live-window');
                              setTimeout(() => setCopiedWindowSecretId(null), 2500);
                            }}
                            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-lg border border-emerald-500/40 transition cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            {copiedWindowSecretId === 'live-window' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedWindowSecretId === 'live-window' ? 'Copiada!' : 'Copiar'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </>
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
                        {participatingTournaments.map((t) => {
                          const tDeadline = getTournamentSubmissionDeadline(t, now);
                          const prefix = tDeadline.status === 'open_live' 
                            ? '🟢 [AO VIVO] ' 
                            : t.status === 'completed' || tDeadline.status === 'tournament_completed' 
                            ? '🔒 [ENCERRADO] ' 
                            : tDeadline.status === 'window_expired' 
                            ? '🚫 [JANELA ENCERRADA] ' 
                            : tDeadline.status === 'window_upcoming' 
                            ? '⏳ [EM BREVE] ' 
                            : '🏆 ';
                          return (
                            <option key={t.id} value={t.id} className="bg-[#1b1e22] text-white">
                              {prefix}{t.title} ({t.teamFormat ? t.teamFormat.toUpperCase() : 'SOLO'})
                            </option>
                          );
                        })}
                      </>
                    )}
                  </select>

                  {/* Helpful notice if user is not in any tournament yet */}
                  {participatingTournaments.length === 0 && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-3">
                      <span className="leading-tight">
                        Você ainda não está inscrito em nenhum torneio. Ative um código de participação na aba "Códigos de Inscrição".
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('codes')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider shrink-0 cursor-pointer shadow-sm"
                      >
                        Ver Códigos
                      </button>
                    </div>
                  )}
                </div>

                {/* Team info badge for this tournament */}
                {userTeam && (
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="h-4 w-4 text-emerald-400" />
                      <span>Equipe vinculada: <strong>{userTeam.name}</strong> ({userTeam.members?.length}/{userTeam.maxMembers} membros)</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isTeamComplete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isTeamComplete ? '🟢 Equipe Completa' : '⚠️ Equipe Incompleta'}
                    </span>
                  </div>
                )}

                {/* 2. Espécie */}
                <div>
                  <input
                    type="text"
                    placeholder="Espécie (Ex: Tucunaré Azul, Traíra, Dourado)"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    disabled={!currentDeadline.canSubmit}
                    className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* 3. Local da Captura */}
                <div>
                  <input
                    type="text"
                    placeholder="Local da Captura (Ex: Represa de Furnas - MG)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={!currentDeadline.canSubmit}
                    className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* 4. Comprimento (cm) */}
                <div>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    placeholder="Comprimento em cm (Ex: 58.5)"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    disabled={!currentDeadline.canSubmit}
                    className="w-full bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* 5. Foto da Captura com Régua */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Foto da Medição com Régua / Fita Métrica Oficial *
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="url"
                      placeholder="URL da Foto ou faça o upload abaixo"
                      value={photoUrl}
                      onChange={(e) => {
                        setPhotoUrl(e.target.value);
                        if (e.target.value) setPhotoBase64('');
                      }}
                      disabled={!currentDeadline.canSubmit}
                      className="flex-1 bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        disabled={!currentDeadline.canSubmit}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!currentDeadline.canSubmit}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Upload className="h-4 w-4 text-emerald-400" />
                        <span>Upload Foto</span>
                      </button>
                    </div>
                  </div>

                  {photoBase64 && (
                    <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-slate-800 bg-black/40">
                      <img 
                        src={photoBase64} 
                        alt="Preview Captura" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* 6. URLs de Vídeo (Opcionais) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <input
                    type="url"
                    placeholder="URL Vídeo Início / Fisgada (Opcional)"
                    value={videoStartUrl}
                    onChange={(e) => setVideoStartUrl(e.target.value)}
                    disabled={!currentDeadline.canSubmit}
                    className="bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-xs placeholder:text-slate-500 focus:outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
                  />

                  <input
                    type="url"
                    placeholder="URL Vídeo Final / Soltura (Opcional)"
                    value={videoEndUrl}
                    onChange={(e) => setVideoEndUrl(e.target.value)}
                    disabled={!currentDeadline.canSubmit}
                    className="bg-[#1b1e22] border border-slate-800/90 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-xs placeholder:text-slate-500 focus:outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !currentDeadline.canSubmit || participatingTournaments.length === 0}
                  className={`w-full py-4 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-lg mt-4 flex items-center justify-center gap-2 ${
                    !currentDeadline.canSubmit
                      ? 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                      : 'bg-[#00c853] hover:bg-[#00e676] text-slate-950 shadow-emerald-950/60'
                  }`}
                >
                  {!currentDeadline.canSubmit ? (
                    <>
                      <Lock className="h-4 w-4 text-slate-500" />
                      <span>🚫 Envios Bloqueados - {currentDeadline.title}</span>
                    </>
                  ) : isSubmitting ? (
                    <span>Enviando Captura...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-slate-950" />
                      <span>Submeter Captura para Arbitragem</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Submission Guidelines */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="text-base font-black text-white uppercase">Critérios de Homologação</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Para que sua captura seja validada no ranking oficial pelos moderadores:
              </p>

              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>A boca do peixe deve estar encostada no batente zero da régua.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>A numeração dos centímetros deve estar 100% nítida na foto.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Em campeonatos de equipe/duplas, a equipe deve estar completa no momento do envio.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    })()}

      {/* ========================================================================= */}
      {/* TAB 5: MINHAS CAPTURAS */}
      {/* ========================================================================= */}
      {activeTab === 'catches' && (
        <div className="space-y-6 animate-fade-in">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#121316] border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Total Enviado</span>
              <span className="text-xl font-black text-white block mt-1">{totalCatchesCount}</span>
            </div>

            <div className="bg-[#121316] border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Homologados</span>
              <span className="text-xl font-black text-emerald-400 block mt-1">{approvedCatches.length}</span>
            </div>

            <div className="bg-[#121316] border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Maior Peixe</span>
              <span className="text-xl font-black text-amber-400 block mt-1">{personalBest} cm</span>
            </div>

            <div className="bg-[#121316] border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Taxa Aprovação</span>
              <span className="text-xl font-black text-sky-400 block mt-1">{approvalRate}%</span>
            </div>
          </div>

          {userCatches.length === 0 ? (
            <div className="bg-[#121316] border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Fish className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase">Nenhuma captura registrada</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Você ainda não enviou capturas para moderação. Participe de um torneio e registre seus troféus!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('submit')}
                className="px-6 py-2.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                Enviar Primeira Captura
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCatches.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#121316] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 truncate max-w-[160px]">
                        {c.tournamentTitle}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        c.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : c.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {c.status === 'approved' ? '✓ Aprovado' : c.status === 'rejected' ? '✕ Rejeitado' : '⏳ Em Análise'}
                      </span>
                    </div>

                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                      <img 
                        src={c.photoUrl} 
                        alt={c.species} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{c.species}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{c.location}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black font-mono text-[#00c853]">{c.length} cm</span>
                        {c.teamName && (
                          <span className="text-[9px] text-slate-400 font-mono block">Equipe: {c.teamName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {c.moderatorNotes && (
                    <div className="p-2.5 bg-slate-900 rounded-xl text-[11px] text-slate-300 font-mono border border-slate-800">
                      <strong>Nota da Arbitragem:</strong> {c.moderatorNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
