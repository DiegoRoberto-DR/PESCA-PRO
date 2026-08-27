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
  Timer,
  Search,
  Filter,
  CheckCheck,
  Inbox,
  Eye,
  X,
  SlidersHorizontal,
  Crown,
  FileText,
  BookOpen
} from 'lucide-react';
import OfficialCaptureRulesModal from './OfficialCaptureRulesModal';
import { UserProfile, Catch, Tournament, TournamentCode, Team, CaptureWindow, AppNotification, SupportMessage } from '../types';
import { 
  submitCatch, 
  subscribeUserTournamentCodes, 
  validateAndConsumeTournamentCode,
  subscribeUserTeam,
  createTeam,
  joinTeamByCode,
  removeMemberFromTeam,
  leaveTeam,
  deleteTeamByCreator,
  getTeamChangeRemainingCooldownMs,
  formatCooldown,
  updateTeam,
  subscribeNotifications,
  markNotificationAsRead,
  updateUserProfilePhoto,
  getTournamentSubmissionDeadline,
  getCaptureWindowStatus as getCaptureWindowStatusUtil,
  formatTimeRemainingMs,
  sendSupportMessage,
  subscribeUserSupportMessages,
  deleteSupportMessage
} from '../utils/dbHelpers';

interface ProfileViewProps {
  currentUser: UserProfile;
  catches: Catch[];
  tournaments: Tournament[];
  selectedTournament?: Tournament | null;
  onNavigateToTournaments?: () => void;
  onSelectTournament?: (tournament: Tournament) => void;
  onOpenParticipateModal?: (tournament: Tournament, code?: string) => void;
  onOpenSubmitCatch?: () => void;
  onLogout: () => void;
}

export default function ProfileView({
  currentUser,
  catches,
  tournaments,
  selectedTournament,
  onNavigateToTournaments,
  onSelectTournament,
  onOpenParticipateModal,
  onLogout
}: ProfileViewProps) {
  // Navigation tabs in profile
  const [activeTab, setActiveTab] = useState<'registration' | 'codes' | 'team' | 'windows' | 'submit' | 'catches' | 'support'>('registration');

  // Official Capture Rules Modal State
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);

  // Support messages state
  const [userSupportTickets, setUserSupportTickets] = useState<SupportMessage[]>([]);
  const [supportSubject, setSupportSubject] = useState<string>('');
  const [supportMessageText, setSupportMessageText] = useState<string>('');
  const [isSendingSupport, setIsSendingSupport] = useState<boolean>(false);
  const [supportSuccessMsg, setSupportSuccessMsg] = useState<string>('');
  const [supportErrorMsg, setSupportErrorMsg] = useState<string>('');

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [copiedWindowSecretId, setCopiedWindowSecretId] = useState<string | null>(null);
  const [notifSearchQuery, setNotifSearchQuery] = useState<string>('');
  const [showReadNotifsHistory, setShowReadNotifsHistory] = useState<boolean>(false);

  // Capture Windows & Tournaments Search / Filter State
  const [tournamentSearchQuery, setTournamentSearchQuery] = useState<string>('');
  const [tourneyFilterId, setTourneyFilterId] = useState<string>('all');
  const [stageStatusFilter, setStageStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');

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

  // Subscribe to user's support messages in real time
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeUserSupportMessages(currentUser.uid, (messages) => {
      setUserSupportTickets(messages);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentUser?.uid]);

  // Team 7-day cooldown calculation
  const remainingCooldownMs = getTeamChangeRemainingCooldownMs(currentUser.teamLeftAt);
  const isCooldownActive = remainingCooldownMs > 0;
  const cooldownFormatted = formatCooldown(remainingCooldownMs);

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

  // Helper to check if a notification was read by current user
  const isNotifReadByUser = (notif: AppNotification) => {
    return Boolean(
      (notif.readBy && notif.readBy.includes(currentUser.uid)) ||
      (notif.isRead && (!notif.readBy || notif.readBy.length === 0))
    );
  };

  // Filter ONLY tournaments where this fisherman is actively enrolled or participating
  // User Requirement: If a user is joined in a team (duo, trio, 4 or 5), they MUST NOT see or submit to solo tournaments.
  const participatingTournaments = tournaments.filter(t => {
    // If user is actively part of a team, hide individual/solo tournaments completely from their dashboard
    if (userTeam && t.teamFormat === 'solo') {
      return false;
    }

    const isEnrolled = currentUser.enrolledTournaments?.includes(t.id);
    const hasCatchInTournament = userCatches.some(c => c.tournamentId === t.id);
    const isInTeamWithTournament = userTeam?.tournamentIds?.includes(t.id);
    const hasCodeForTournament = userCodes.some(c => c.tournamentId === t.id);
    return Boolean(isEnrolled || hasCatchInTournament || isInTeamWithTournament || hasCodeForTournament);
  });

  // Live ticking clock for real-time validation and countdowns
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter notifications relevant to user's enrolled tournaments or general
  // When a user is in a team, only show notifications corresponding to team tournaments (e.g. duo, trio, etc.) and their team's tournaments
  const userTourneyIds = (currentUser.enrolledTournaments || []).concat(participatingTournaments.map(t => t.id));
  const relevantNotifications = notifications.filter(n => {
    // If user is in a team and notification is linked to a tournament, ensure it's not a solo tournament
    if (n.tournamentId) {
      const tourney = tournaments.find(t => t.id === n.tournamentId);
      if (userTeam && tourney?.teamFormat === 'solo') {
        return false;
      }
      return userTourneyIds.includes(n.tournamentId);
    }
    // General notifications (without specific tournament)
    return true;
  });
  const unreadNotifsCount = relevantNotifications.filter(n => !isNotifReadByUser(n)).length;

  // Filtered notifications based on search and read status
  const displayedNotifications = relevantNotifications.filter(notif => {
    const isRead = isNotifReadByUser(notif);
    const search = notifSearchQuery.trim().toLowerCase();

    if (search) {
      // Searching across ALL notifications (both unread and read)
      const matchesTitle = notif.title?.toLowerCase().includes(search);
      const matchesMsg = notif.message?.toLowerCase().includes(search);
      const matchesSecret = notif.windowSecret?.toLowerCase().includes(search);
      const tourney = tournaments.find(t => t.id === notif.tournamentId);
      const matchesTourney = tourney?.title?.toLowerCase().includes(search);
      return matchesTitle || matchesMsg || matchesSecret || matchesTourney;
    }

    if (showReadNotifsHistory) {
      return true;
    }

    // Default: ONLY unread notifications are displayed! Once marked as read, they immediately disappear.
    return !isRead;
  });

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

  const isCaptain = Boolean(
    userTeam && (
      userTeam.creatorId === currentUser.uid ||
      (currentUser.email && userTeam.creatorEmail && userTeam.creatorEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      userTeam.members?.some(m => m.userId === currentUser.uid && m.role === 'captain')
    )
  );

  // User Requirement: Tournament codes for team-based tournaments (duo up to 5 people) must ONLY be shown to the Captain
  const visibleUserCodes = userCodes.filter((c) => {
    const tourney = tournaments.find(t => t.id === c.tournamentId);
    const isTeamTournament = Boolean(
      (tourney && tourney.teamFormat && tourney.teamFormat !== 'solo') ||
      c.code?.startsWith('EQP-') ||
      (c.maxParticipants && c.maxParticipants > 1) ||
      (c.category && c.category !== 'solo')
    );

    if (isTeamTournament) {
      // Must be captain to see and activate team tournament codes
      return isCaptain;
    }

    // Solo tournament codes are visible to the user
    return true;
  });

  const handleActivateCode = async (codeItem: TournamentCode) => {
    if (!codeItem.code) return;
    setActivatingCodeId(codeItem.id);
    setCodeActionResult(null);

    // Auto copy code to clipboard
    try {
      await navigator.clipboard.writeText(codeItem.code);
      setCopiedCodeId(codeItem.id);
    } catch (e) {
      console.warn("Não foi possível copiar:", e);
    }

    const targetTourney = tournaments.find(t => t.id === codeItem.tournamentId);

    setCodeActionResult({
      type: 'success',
      message: `Código ${codeItem.code} copiado! Redirecionando direto para o torneio ${targetTourney?.title ? `"${targetTourney.title}"` : ''} para ativação...`
    });

    setTimeout(() => {
      setActivatingCodeId(null);
      if (targetTourney) {
        if (onOpenParticipateModal) {
          onOpenParticipateModal(targetTourney, codeItem.code);
        } else if (onSelectTournament) {
          onSelectTournament(targetTourney);
        } else if (onNavigateToTournaments) {
          onNavigateToTournaments();
        }
      } else if (onNavigateToTournaments) {
        onNavigateToTournaments();
      }
    }, 700);
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

  const handleDeleteTeamByCreatorAction = async () => {
    if (!userTeam) return;

    // Check if user is the creator
    if (userTeam.creatorId !== currentUser.uid) {
      alert('Apenas o criador da equipe tem permissão para excluí-la.');
      return;
    }

    // Check if other members exist
    const otherMembers = (userTeam.members || []).filter(m => m.userId !== currentUser.uid);
    if (otherMembers.length > 0) {
      alert(`⚠️ Para excluir a equipe, você deve primeiro remover todos os outros ${otherMembers.length} participante(s). Clique no ícone de lixeira vermelha ao lado de cada integrante na lista de membros antes de excluir a equipe.`);
      return;
    }

    if (!confirm(`Tem certeza que deseja EXCLUIR DEFINITIVAMENTE a equipe "${userTeam.name}"?\n\nA equipe será apagada do banco de dados e você entrará no período regulamentar de 7 dias corridos de carência para criar ou entrar em outra equipe.`)) {
      return;
    }

    try {
      setIsTeamLoading(true);
      const res = await deleteTeamByCreator(userTeam.id, currentUser.uid);
      if (res.success) {
        setTeamSuccess(res.message);
        setUserTeam(null);
      } else {
        setTeamError(res.message);
      }
    } catch (err: any) {
      setTeamError('Erro ao excluir equipe: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportErrorMsg('');
    setSupportSuccessMsg('');

    if (!supportSubject.trim()) {
      setSupportErrorMsg('Por favor, informe o assunto da solicitação.');
      return;
    }
    if (!supportMessageText.trim()) {
      setSupportErrorMsg('Por favor, digite a sua mensagem detalhada para o Administrador.');
      return;
    }

    try {
      setIsSendingSupport(true);
      const res = await sendSupportMessage({
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.fullName || 'Competidor Fisgada Pro',
        userEmail: currentUser.email,
        userCpf: currentUser.cpf || '',
        userPhoto: currentPhotoURL || '',
        subject: supportSubject.trim(),
        message: supportMessageText.trim()
      });

      if (res.success) {
        setSupportSuccessMsg('Sua mensagem de suporte foi enviada com sucesso! O Administrador responderá diretamente na sua aba de suporte.');
        setSupportSubject('');
        setSupportMessageText('');
      } else {
        setSupportErrorMsg(res.message);
      }
    } catch (err: any) {
      setSupportErrorMsg('Erro ao enviar mensagem: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsSendingSupport(false);
    }
  };

  const handleDeleteSupportTicket = async (ticketId: string) => {
    if (!confirm('Deseja excluir esta mensagem do seu histórico de suporte?')) return;
    try {
      const res = await deleteSupportMessage(ticketId);
      if (res.success) {
        setSupportSuccessMsg('Mensagem de suporte removida com sucesso.');
        setTimeout(() => setSupportSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setSupportErrorMsg('Erro ao remover mensagem: ' + (err.message || 'Tente novamente.'));
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'registration'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Meu Cadastro</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer relative whitespace-nowrap shrink-0 ${
              activeTab === 'codes'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Códigos de Inscrição</span>
            {visibleUserCodes.length > 0 && (
              <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full whitespace-nowrap ${
                activeTab === 'codes' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {visibleUserCodes.length}
              </span>
            )}
          </button>

          {/* New Tab: Minha Equipe */}
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer relative whitespace-nowrap shrink-0 ${
              activeTab === 'team'
                ? 'bg-[#00c853] text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Minha Equipe</span>
            {userTeam && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          {/* New Tab: Janelas de Captura & Avisos */}
          <button
            onClick={() => setActiveTab('windows')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer relative whitespace-nowrap shrink-0 ${
              activeTab === 'windows'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Janelas & Avisos</span>
            {unreadNotifsCount > 0 && (
              <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse whitespace-nowrap">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('submit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'submit'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Enviar Captura</span>
          </button>

          <button
            onClick={() => setActiveTab('catches')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'catches'
                ? 'bg-purple-500 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Minhas Capturas ({userCatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer relative whitespace-nowrap shrink-0 ${
              activeTab === 'support'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap inline-flex items-center gap-1.5">
              Suporte
              {userSupportTickets.filter(t => t.status === 'answered').length > 0 && (
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 animate-pulse whitespace-nowrap">
                  {userSupportTickets.filter(t => t.status === 'answered').length}
                </span>
              )}
            </span>
          </button>

          {/* Regras Button (Válidas para todos os campeonatos) */}
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 shadow-sm whitespace-nowrap shrink-0"
            title="Clique para ler as Regras Oficiais de Comprovação de Captura"
          >
            <BookOpen className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Regras</span>
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
                  <span>Carência de 7 dias corridos ao sair de equipe para criar ou ingressar em outra.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Exclusão de equipe restrita ao criador após remover todos os integrantes.</span>
                </div>
              </div>
            </div>

            {/* Suporte Quick Box */}
            <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5 text-sky-400">
                <MessageCircle className="h-5 w-5" />
                <h4 className="text-sm font-black text-white uppercase">Precisa de Suporte?</h4>
              </div>
              <p className="text-xs text-slate-300">
                Tem dúvidas sobre regulamento, códigos ou capturas? Entre em contato diretamente com a Administração.
              </p>
              <button
                onClick={() => setActiveTab('support')}
                className="w-full py-2.5 bg-[#1b1e22] hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-bold text-xs rounded-xl border border-sky-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Abrir Atendimento com Admin</span>
              </button>
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

            {/* Notice for non-captain team members */}
            {userTeam && !isCaptain && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                <Crown className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">Equipe: {userTeam.name}</span>
                  <p className="text-slate-300 leading-relaxed">
                    Você está registrado como membro da equipe. Os códigos de participação em campeonatos de equipe (Dupla, Trio, Quarteto ou Quinteto) são disponibilizados e gerenciados exclusivamente pelo <strong>Capitão</strong> da equipe ({userTeam.creatorName || userTeam.creatorEmail || 'Capitão'}).
                  </p>
                </div>
              </div>
            )}

            {visibleUserCodes.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-300">
                    {userTeam && !isCaptain ? 'Nenhum código individual disponível' : 'Nenhum código atribuído ainda'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    {userTeam && !isCaptain
                      ? 'Inscrições em torneios de equipes são ativadas diretamente pelo Capitão da sua equipe.'
                      : 'Assim que o Administrador gerar seu código exclusivo para um campeonato, ele aparecerá aqui com opção de ativação imediata.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {visibleUserCodes.map((c) => {
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

                      {/* Action Button: 1-Click Activate and Redirect */}
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
                              <span>Carregando Torneio...</span>
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

                {/* Team Controls & Action buttons */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLeaveTeam}
                      disabled={isTeamLoading}
                      className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair da Equipe</span>
                    </button>

                    {/* Excluir Equipe: Visível apenas para o criador */}
                    {userTeam.creatorId === currentUser.uid && (
                      <button
                        onClick={handleDeleteTeamByCreatorAction}
                        disabled={isTeamLoading}
                        className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow"
                        title="Exclusivo do criador da equipe. Requer remoção de todos os integrantes antes."
                      >
                        <Trash2 className="h-4 w-4 text-rose-400" />
                        <span>Excluir Equipe (Criador)</span>
                      </button>
                    )}
                  </div>

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
                      <Crown className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">Inscrição em Campeonatos:</strong> Somente o Capitão pode inscrever a equipe em torneios de duplas a quintetos (2 a 5 pessoas).</span>
                    </div>
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
                {/* 7-DAY COOLDOWN BANNER */}
                {isCooldownActive && (
                  <div className="p-4 sm:p-5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase">
                      <Clock className="h-5 w-5 animate-pulse shrink-0" />
                      <span>Período Regulamentar de Carência Ativo (7 Dias Corridos)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Você abandonou ou excluiu uma equipe recentemente. De acordo com o regulamento oficial dos campeonatos, é obrigatório aguardar <strong>7 dias corridos</strong> após a saída para poder criar uma nova equipe ou ingressar em outra equipe existente.
                    </p>
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between text-amber-300">
                      <span>Tempo restante de espera regulamentar:</span>
                      <span className="font-extrabold text-amber-400">{cooldownFormatted}</span>
                    </div>
                  </div>
                )}

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
                        disabled={isCooldownActive}
                        className={`w-full bg-[#1b1e22] border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none ${
                          isCooldownActive ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
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
                            disabled={isCooldownActive}
                            onClick={() => setTeamSizeInput(opt.count)}
                            className={`p-3 rounded-2xl text-xs font-bold border transition text-center cursor-pointer ${
                              teamSizeInput === opt.count
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-extrabold shadow-sm'
                                : 'bg-[#1b1e22] border-slate-800 text-slate-400 hover:text-white'
                            } ${isCooldownActive ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                            disabled={isCooldownActive}
                            onChange={(e) => {
                              setTeamLogoUrlInput(e.target.value);
                              if (e.target.value) setTeamLogoBase64('');
                            }}
                            className={`w-full bg-[#1b1e22] border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none ${
                              isCooldownActive ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
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
                              disabled={isCooldownActive}
                              onClick={() => teamLogoInputRef.current?.click()}
                              className={`px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer ${
                                isCooldownActive ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
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
                      disabled={isTeamLoading || isCooldownActive}
                      className="w-full py-3.5 bg-[#00c853] hover:bg-[#00e676] disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-950/60"
                    >
                      {isCooldownActive
                        ? `Carência Ativa (${cooldownFormatted})`
                        : isTeamLoading
                        ? 'Criando Equipe...'
                        : 'Criar Equipe e Gerar Código'}
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
                        disabled={isCooldownActive}
                        onChange={(e) => setJoinTeamCodeInput(e.target.value.toUpperCase())}
                        className={`w-full bg-[#1b1e22] border border-slate-800 focus:border-amber-500 text-amber-400 font-mono font-bold text-center tracking-widest rounded-xl px-4 py-3.5 text-base sm:text-lg uppercase focus:outline-none ${
                          isCooldownActive ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isTeamLoading || isCooldownActive}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-lg shadow-amber-950/60"
                    >
                      {isCooldownActive
                        ? `Carência Ativa (${cooldownFormatted})`
                        : isTeamLoading
                        ? 'Validando Entrada...'
                        : 'Entrar na Equipe'}
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
                      <Crown className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white">Inscrição de Equipes:</strong> Somente o Capitão pode inscrever a equipe em torneios de duplas a quintetos (2 a 5 pessoas).</span>
                    </div>
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
                      <span>Sem equipe? Você pode disputar livremente os torneios Solo/Individual.</span>
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
                    Acompanhe os dias, horários oficiais, etapas e palavras-chave de todos os seus campeonatos inscritos.
                  </p>
                </div>
              </div>

              {unreadNotifsCount > 0 && (
                <span className="px-3.5 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-lg shadow-rose-950/30">
                  <Bell className="h-3.5 w-3.5 text-rose-400 animate-bounce" />
                  <span>{unreadNotifsCount} {unreadNotifsCount === 1 ? 'Novo Aviso Não Lido' : 'Novos Avisos Não Lidos'}</span>
                </span>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-center">
              <div className="bg-[#181a1e] p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Campeonatos Inscritos</span>
                <span className="text-lg font-black text-white font-mono">{participatingTournaments.length}</span>
              </div>
              <div className="bg-[#181a1e] p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Total de Etapas</span>
                <span className="text-lg font-black text-white font-mono">{userCaptureWindows.length}</span>
              </div>
              <div className="bg-[#181a1e] p-3 rounded-2xl border border-emerald-500/20">
                <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">🟢 Etapas Ao Vivo</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {userCaptureWindows.filter(w => getCaptureWindowStatus(w).status === 'active').length}
                </span>
              </div>
              <div className="bg-[#181a1e] p-3 rounded-2xl border border-sky-500/20">
                <span className="text-[10px] font-mono uppercase text-sky-400 block font-bold">⏳ Próximas Etapas</span>
                <span className="text-lg font-black text-sky-400 font-mono">
                  {userCaptureWindows.filter(w => getCaptureWindowStatus(w).status === 'upcoming').length}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Scheduled Capture Windows & Tournament Stage Search */}
            <div className="lg:col-span-8 space-y-4">
              {/* Search Bar for Tournaments and Stages */}
              <div className="bg-[#121316] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span>Pesquisar Campeonatos & Etapas</span>
                  </h3>
                  {participatingTournaments.length > 0 && (
                    <span className="text-[11px] font-mono text-slate-500">
                      {participatingTournaments.length} campeonato(s) vinculado(s)
                    </span>
                  )}
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={tournamentSearchQuery}
                    onChange={(e) => setTournamentSearchQuery(e.target.value)}
                    placeholder="Pesquisar por campeonato inscrito, etapa, data ou palavra-chave..."
                    className="w-full bg-[#181a1e] border border-slate-700/80 focus:border-amber-500 text-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-mono placeholder:text-slate-500 focus:outline-none transition"
                  />
                  {tournamentSearchQuery && (
                    <button
                      onClick={() => setTournamentSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                      title="Limpar busca"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Tournament Filter Pills */}
                  <button
                    onClick={() => setTourneyFilterId('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                      tourneyFilterId === 'all'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black'
                        : 'bg-[#181a1e] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>Todos os Campeonatos ({participatingTournaments.length})</span>
                  </button>

                  {participatingTournaments.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTourneyFilterId(tourneyFilterId === t.id ? 'all' : t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 border truncate max-w-[200px] ${
                        tourneyFilterId === t.id
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black'
                          : 'bg-[#181a1e] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title={t.title}
                    >
                      <Trophy className="h-3 w-3 shrink-0 text-amber-400" />
                      <span className="truncate">{t.title}</span>
                      <span className="text-[10px] opacity-75 font-mono">({t.captureWindows?.length || 0})</span>
                    </button>
                  ))}
                </div>

                {/* Stage Status Filters */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold mr-1">Status da Etapa:</span>
                  {(['all', 'live', 'upcoming', 'ended'] as const).map(st => {
                    const label = st === 'all' 
                      ? 'Todas as Etapas' 
                      : st === 'live' 
                      ? '🟢 Abertas Agora' 
                      : st === 'upcoming' 
                      ? '⏳ Próximas' 
                      : '🔒 Encerradas';
                    const count = st === 'all'
                      ? userCaptureWindows.length
                      : st === 'live'
                      ? userCaptureWindows.filter(w => getCaptureWindowStatus(w).status === 'active').length
                      : st === 'upcoming'
                      ? userCaptureWindows.filter(w => getCaptureWindowStatus(w).status === 'upcoming').length
                      : userCaptureWindows.filter(w => getCaptureWindowStatus(w).status === 'ended').length;

                    return (
                      <button
                        key={st}
                        onClick={() => setStageStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer border ${
                          stageStatusFilter === st
                            ? 'bg-slate-700 text-white border-slate-600 shadow-sm'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tournament Stages Results */}
              {participatingTournaments.length === 0 ? (
                <div className="bg-[#121316] border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Trophy className="h-7 w-7 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Você Ainda Não Está Inscrito em Campeonatos</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Inscreva-se em um campeonato ou ative um código de participação para visualizar o cronograma de etapas e horários.
                    </p>
                  </div>
                  {onNavigateToTournaments && (
                    <div className="pt-2">
                      <button
                        onClick={onNavigateToTournaments}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Explorar Campeonatos Disponíveis
                      </button>
                    </div>
                  )}
                </div>
              ) : (() => {
                // Filter Tournaments based on search & tournament selector
                const tourneyQuery = tournamentSearchQuery.trim().toLowerCase();
                const matchedTournaments = participatingTournaments.filter(tourney => {
                  if (tourneyFilterId !== 'all' && tourney.id !== tourneyFilterId) {
                    return false;
                  }
                  if (!tourneyQuery) return true;

                  const matchesTitle = tourney.title?.toLowerCase().includes(tourneyQuery);
                  const matchesFormat = tourney.teamFormat?.toLowerCase().includes(tourneyQuery);
                  const matchesDescription = tourney.description?.toLowerCase().includes(tourneyQuery);
                  const matchesSpecies = tourney.targetSpecies?.some(s => s.toLowerCase().includes(tourneyQuery));
                  const matchesAnyStage = tourney.captureWindows?.some(cw =>
                    cw.name?.toLowerCase().includes(tourneyQuery) ||
                    cw.secret?.toLowerCase().includes(tourneyQuery) ||
                    cw.date?.includes(tourneyQuery) ||
                    cw.description?.toLowerCase().includes(tourneyQuery)
                  );
                  return matchesTitle || matchesFormat || matchesDescription || matchesSpecies || matchesAnyStage;
                });

                if (matchedTournaments.length === 0) {
                  return (
                    <div className="bg-[#121316] border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <Search className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Nenhum Campeonato ou Etapa Encontrada</h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                          Nenhum resultado corresponde à busca "{tournamentSearchQuery}".
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setTournamentSearchQuery('');
                          setTourneyFilterId('all');
                          setStageStatusFilter('all');
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Limpar Filtros e Busca
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {matchedTournaments.map(tourney => {
                      // Filter stages for this tournament
                      const windows = tourney.captureWindows || [];
                      const filteredWindows = windows.filter(w => {
                        const statusInfo = getCaptureWindowStatus(w);
                        if (stageStatusFilter === 'live' && statusInfo.status !== 'active') return false;
                        if (stageStatusFilter === 'upcoming' && statusInfo.status !== 'upcoming') return false;
                        if (stageStatusFilter === 'ended' && statusInfo.status !== 'ended') return false;

                        if (!tourneyQuery) return true;
                        const matchStageName = w.name?.toLowerCase().includes(tourneyQuery);
                        const matchSecret = w.secret?.toLowerCase().includes(tourneyQuery);
                        const matchDate = w.date?.includes(tourneyQuery);
                        const matchDesc = w.description?.toLowerCase().includes(tourneyQuery);
                        const matchTourney = tourney.title?.toLowerCase().includes(tourneyQuery);
                        return matchStageName || matchSecret || matchDate || matchDesc || matchTourney;
                      });

                      return (
                        <div
                          key={tourney.id}
                          className="bg-[#121316] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
                        >
                          {/* Tournament Header Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase border border-amber-500/30">
                                  {tourney.teamFormat === 'solo' ? '👤 Individual' : tourney.teamFormat === 'dupla' ? '👥 Dupla' : `👥 Equipe (${tourney.teamFormat})`}
                                </span>
                                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase border ${
                                  tourney.status === 'active' 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                    : tourney.status === 'upcoming' 
                                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                  {tourney.status === 'active' ? '🟢 Campeonato Em Andamento' : tourney.status === 'upcoming' ? '⏳ Em Breve' : '🔒 Encerrado'}
                                </span>
                              </div>

                              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
                                <span>{tourney.title}</span>
                              </h3>

                              {tourney.targetSpecies && tourney.targetSpecies.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Espécies:</span>
                                  {tourney.targetSpecies.map(sp => (
                                    <span key={sp} className="text-[10px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                                      🐟 {sp}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setSelectedTournamentId(tourney.id);
                                setActiveTab('submit');
                              }}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-center shadow-lg shadow-emerald-950/40"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>Enviar Captura</span>
                            </button>
                          </div>

                          {/* Stages List */}
                          {windows.length === 0 ? (
                            <div className="bg-[#181a1e] border border-slate-800/90 rounded-2xl p-4 sm:p-5 text-center space-y-2">
                              <Calendar className="h-5 w-5 text-slate-500 mx-auto" />
                              <h5 className="text-xs font-bold text-slate-300">Janela Geral de Vigência</h5>
                              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                                Este torneio não possui janelas fracionadas por etapas; os envios de capturas ficam abertos durante todo o período oficial do campeonato ({tourney.startDate ? tourney.startDate.split('-').reverse().join('/') : 'Início'} até {tourney.endDate ? tourney.endDate.split('-').reverse().join('/') : 'Fim'}).
                              </p>
                            </div>
                          ) : filteredWindows.length === 0 ? (
                            <div className="bg-[#181a1e] border border-slate-800/90 rounded-2xl p-4 text-center text-xs text-slate-500">
                              Nenhuma etapa deste campeonato corresponde ao filtro de status selecionado.
                            </div>
                          ) : (
                            <div className="space-y-3.5">
                              {filteredWindows.map((win, sIdx) => {
                                const statusInfo = getCaptureWindowStatus(win);
                                return (
                                  <div
                                    key={win.id || sIdx}
                                    className="bg-[#181a1e] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition space-y-3.5 shadow-sm"
                                  >
                                    {/* Stage Title & Live Status */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-xs font-mono font-black text-amber-400">
                                          {sIdx + 1}ª
                                        </div>
                                        <div>
                                          <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                                            {win.name || `Etapa ${sIdx + 1}`}
                                          </h4>
                                          <span className="text-[10px] font-mono text-slate-400">
                                            Fase oficial de homologação
                                          </span>
                                        </div>
                                      </div>

                                      <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border self-start sm:self-auto ${statusInfo.badgeClass}`}>
                                        {statusInfo.label}
                                      </span>
                                    </div>

                                    {/* Grid: Date & Time */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#121316] p-3 rounded-xl border border-slate-800/80">
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">Data da Etapa:</span>
                                        <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 font-mono">
                                          <Calendar className="h-3.5 w-3.5 text-sky-400" />
                                          <span>{win.date ? win.date.split('-').reverse().join('/') : 'Data a definir'}</span>
                                        </div>
                                      </div>

                                      <div className="space-y-0.5">
                                        <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">Horário de Captura:</span>
                                        <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 font-mono">
                                          <Clock className="h-3.5 w-3.5 text-amber-400" />
                                          <span>{win.startTime || '06:00'} às {win.endTime || '18:00'}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Antifraud Secret Code Box */}
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] font-mono font-bold uppercase text-amber-300">
                                          Chave Antifraude Obrigatória da Etapa:
                                        </span>
                                        <div className="text-base sm:text-lg font-mono font-black text-amber-400 tracking-widest">
                                          {win.secret}
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(win.secret);
                                          setCopiedWindowSecretId(win.id || win.secret);
                                          setTimeout(() => setCopiedWindowSecretId(null), 2500);
                                        }}
                                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/30 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
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
                                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                        📝 <strong>Observação da Organização:</strong> {win.description}
                                      </p>
                                    )}

                                    {/* Stage Action Button */}
                                    <div className="flex justify-end pt-1">
                                      {statusInfo.status === 'active' ? (
                                        <button
                                          onClick={() => {
                                            setSelectedTournamentId(tourney.id);
                                            setActiveTab('submit');
                                          }}
                                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                                        >
                                          <Send className="h-3.5 w-3.5" />
                                          <span>Enviar Captura Nesta Fase</span>
                                        </button>
                                      ) : statusInfo.status === 'upcoming' ? (
                                        <div className="px-3 py-1.5 bg-slate-800 text-sky-400 font-bold text-xs rounded-lg border border-slate-700 flex items-center gap-1.5">
                                          <Clock className="h-3.5 w-3.5 text-sky-400" />
                                          <span>Abre em {statusInfo.opensInStr || 'Breve'}</span>
                                        </div>
                                      ) : (
                                        <div className="px-3 py-1.5 bg-rose-950/30 text-rose-400 font-bold text-xs rounded-lg border border-rose-800/40 flex items-center gap-1.5">
                                          <Lock className="h-3.5 w-3.5 text-rose-400" />
                                          <span>Etapa Encerrada</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Right Column: Notification Feed (Avisos em Tempo Real & Histórico Filtrável) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#121316] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-400" />
                    <span>Avisos & Notificações</span>
                  </h3>
                  {unreadNotifsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                      {unreadNotifsCount} não lido{unreadNotifsCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Search Bar for Notifications */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={notifSearchQuery}
                    onChange={(e) => setNotifSearchQuery(e.target.value)}
                    placeholder="Buscar em avisos e histórico..."
                    className="w-full bg-[#181a1e] border border-slate-700/80 focus:border-amber-500 text-slate-200 rounded-xl pl-8 pr-8 py-2 text-xs font-mono placeholder:text-slate-500 focus:outline-none transition"
                  />
                  {notifSearchQuery && (
                    <button
                      onClick={() => setNotifSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                      title="Limpar busca"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Notification Feed Mode Toggle & Info */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                  {notifSearchQuery.trim() ? (
                    <span className="text-amber-400 font-bold">
                      🔍 {displayedNotifications.length} resultado(s) da busca
                    </span>
                  ) : (
                    <span>
                      {unreadNotifsCount > 0 
                        ? 'Ao marcar como lida, a mensagem sai desta lista.' 
                        : 'Todos os avisos foram lidos.'}
                    </span>
                  )}

                  {!notifSearchQuery.trim() && (
                    <button
                      onClick={() => setShowReadNotifsHistory(!showReadNotifsHistory)}
                      className="text-slate-400 hover:text-amber-400 font-bold underline cursor-pointer"
                    >
                      {showReadNotifsHistory ? 'Apenas Não Lidos' : 'Ver Histórico'}
                    </button>
                  )}
                </div>
              </div>

              {displayedNotifications.length === 0 ? (
                <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 text-center shadow-xl space-y-3">
                  {notifSearchQuery.trim() ? (
                    <>
                      <Search className="h-6 w-6 mx-auto text-slate-600" />
                      <p className="text-xs text-slate-400 font-bold">Nenhum aviso encontrado para esta busca.</p>
                      <button
                        onClick={() => setNotifSearchQuery('')}
                        className="text-[11px] text-amber-400 hover:underline font-mono cursor-pointer"
                      >
                        Limpar busca
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Nenhum Aviso Pendente</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Você leu todas as notificações recentes! Para consultar avisos anteriores ou palavras-chave antigas, use a barra de busca acima ou clique em "Ver Histórico".
                        </p>
                      </div>
                      <button
                        onClick={() => setShowReadNotifsHistory(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-lg transition cursor-pointer"
                      >
                        Consultar Avisos Lidos
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                  {displayedNotifications.map((notif) => {
                    const isRead = isNotifReadByUser(notif);
                    return (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition space-y-2.5 ${
                          isRead
                            ? 'bg-[#14161a] border-slate-800/80 text-slate-400'
                            : 'bg-amber-500/10 border-amber-500/40 text-slate-200 shadow-lg shadow-amber-950/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${isRead ? 'bg-slate-600' : 'bg-amber-400 animate-ping'}`} />
                            <h4 className={`text-xs font-bold ${isRead ? 'text-slate-300' : 'text-white'}`}>
                              {notif.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {notif.category === 'urgent' && (
                              <span className="text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30 font-bold animate-pulse">
                                🚨 Urgente
                              </span>
                            )}
                            {notif.category === 'official' && (
                              <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                                📣 Comunicado
                              </span>
                            )}
                            {notif.category === 'direct' && (
                              <span className="text-[9px] font-mono uppercase bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30 font-bold">
                                👤 Mensagem Direta
                              </span>
                            )}
                            {notif.category === 'rule' && (
                              <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                                📜 Regulamento
                              </span>
                            )}
                            {notif.category === 'reward' && (
                              <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 font-bold">
                                🏆 Premiação
                              </span>
                            )}
                            {notif.type === 'capture_window_added' && (
                              <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                                Nova Etapa
                              </span>
                            )}
                            {isRead && (
                              <span className="text-[9px] font-mono uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-bold">
                                ✓ Lido
                              </span>
                            )}
                          </div>
                        </div>

                        {notif.senderName && (
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                            <Shield className="h-3 w-3 text-amber-400" />
                            <span>Enviado por: <strong className="text-slate-200">{notif.senderName}</strong></span>
                            {notif.tournamentTitle && (
                              <span>• Torneio: <strong className="text-emerald-300">{notif.tournamentTitle}</strong></span>
                            )}
                          </div>
                        )}

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
                          <span>
                            {notif.createdAt 
                              ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                              : ''}
                          </span>

                          {!isRead && (
                            <button
                              onClick={() => handleMarkNotificationRead(notif.id)}
                              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                            >
                              Marcar como lida
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

      {/* ========================================================================= */}
      {/* TAB 6: SUPORTE & ATENDIMENTO AO USUÁRIO */}
      {/* ========================================================================= */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form to open support ticket */}
            <div className="lg:col-span-6 bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">Falar com o Administrador</h3>
                  <p className="text-xs text-slate-400">Envie suas dúvidas, solicitações ou relatórios diretamente à equipe</p>
                </div>
              </div>

              {supportSuccessMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>{supportSuccessMsg}</span>
                </div>
              )}

              {supportErrorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  <span>{supportErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSendSupport} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-300 block">
                    Assunto da Mensagem *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dúvida sobre código, erro de envio, alteração cadastral..."
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    className="w-full bg-[#1b1e22] border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-300 block">
                    Mensagem Detalhada *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Descreva sua solicitação com o máximo de detalhes para agilizar o atendimento..."
                    value={supportMessageText}
                    onChange={(e) => setSupportMessageText(e.target.value)}
                    className="w-full bg-[#1b1e22] border border-slate-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none resize-none"
                    required
                  />
                </div>

                <div className="p-3 bg-[#181a1e] rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
                  <p><strong>Remetente:</strong> {currentUser.displayName || currentUser.fullName} ({currentUser.email})</p>
                  {currentUser.cpf && <p><strong>CPF:</strong> {currentUser.cpf}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSendingSupport}
                  className="w-full py-3.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-950/60 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSendingSupport ? 'Enviando Mensagem...' : 'Enviar Mensagem ao Admin'}</span>
                </button>
              </form>

              {/* Direct WhatsApp contact */}
              <div className="pt-4 border-t border-slate-800">
                <a
                  href="https://wa.me/5519987626991?text=Ol%C3%A1%2C%20sou%20competidor%20da%20Fisgada%20Pro%20e%20preciso%20de%20suporte%20no%20aplicativo."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                  <span>Atendimento Rápido via WhatsApp Oficial (19 98762-6991)</span>
                </a>
              </div>
            </div>

            {/* Right Column: History of Support Tickets */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>Seus Chamados de Suporte ({userSupportTickets.length})</span>
                </h3>
              </div>

              {userSupportTickets.length === 0 ? (
                <div className="bg-[#121316] border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-xl">
                  <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">Nenhum chamado aberto</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Suas mensagens enviadas ao Administrador e as respostas oficiais aparecerão aqui.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userSupportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`bg-[#121316] border rounded-3xl p-5 shadow-xl space-y-3.5 transition ${
                        ticket.status === 'answered'
                          ? 'border-emerald-500/40'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full mb-1.5 ${
                            ticket.status === 'answered'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {ticket.status === 'answered' ? '🟢 Respondida pelo Suporte' : '🟡 Aguardando Resposta'}
                          </span>
                          <h4 className="text-sm font-bold text-white">{ticket.subject}</h4>
                        </div>

                        <button
                          onClick={() => handleDeleteSupportTicket(ticket.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer shrink-0"
                          title="Excluir do histórico"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="bg-[#181a1e] p-3.5 rounded-2xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {ticket.message}
                      </div>

                      {/* Admin Response Box */}
                      {ticket.adminResponse && (
                        <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Resposta do Administrador ({ticket.answeredByName || 'ADMIN'}):</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                            {ticket.adminResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unified Official Capture Rules Modal */}
      <OfficialCaptureRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        tournamentTitle={selectedTournament?.title || 'Torneio FISGADA PRO'}
      />
    </div>
  );
}
