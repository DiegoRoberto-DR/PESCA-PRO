import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Award, 
  Ruler, 
  Scale, 
  MapPin, 
  MessageSquare, 
  PlusCircle, 
  Key, 
  DollarSign, 
  Users, 
  Calendar, 
  Check, 
  Trophy, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Database, 
  UserCheck, 
  UserX, 
  CreditCard, 
  Mail, 
  User, 
  Tag, 
  Lock, 
  Copy, 
  Video, 
  X, 
  ZoomIn,
  Shield,
  UserPlus,
  Sparkles,
  AlertOctagon,
  Eye,
  CheckSquare,
  MessageCircle,
  ExternalLink,
  Share2,
  Receipt,
  Ticket,
  Send,
  RefreshCw
} from 'lucide-react';
import { Catch, Tournament, UserProfile, TournamentCode, Team, CaptureWindow } from '../types';
import { 
  updateCatchStatus, 
  createTournament, 
  updateTournament, 
  deleteTournament, 
  deleteCatch, 
  subscribeUsers, 
  updateUserStatus, 
  deleteUser, 
  updateUser,
  subscribeAllTournamentCodes,
  createAssignedTournamentCode,
  updateTournamentCodePayment,
  deleteTournamentCode,
  generateUniqueTournamentCode,
  subscribeTeams,
  updateTeamStatus,
  deleteTeamByAdmin
} from '../utils/dbHelpers';
import ConfirmationModal from './ConfirmationModal';
import ModeratorManager from './ModeratorManager';

interface AdminPanelProps {
  catches: Catch[];
  tournaments: Tournament[];
  currentUser: UserProfile | null;
  onRefresh?: () => void;
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

export const RULE_VIOLATION_PRESETS = [
  'Régua ilegível, fora de posição ou medição em ângulo inválido',
  'Chave antifraude ausente, ilegível ou incorreta para a fase atual',
  'Vídeo de soltura / medição ausente ou incompleto',
  'Espécie de peixe não permitida no regulamento deste campeonato',
  'Tamanho inferior à medida mínima regulamentar permitida',
  'Captura realizada fora do perímetro ou horário permitido',
  'Tentativa de duplicidade, foto de arquivo ou suspeita de fraude digital',
  'Peixe sem evidência clara de soltura vivo (pesque e solte)'
];

export default function AdminPanel({ catches, tournaments, currentUser }: AdminPanelProps) {
  // Permission calculation
  const isSuperAdmin = currentUser?.role === 'admin' || currentUser?.uid === 'admin_master_root';
  const canModerate = isSuperAdmin || Boolean(currentUser?.permissions?.canModerateCatches);
  const canTournaments = isSuperAdmin || Boolean(currentUser?.permissions?.canManageTournaments);
  const canFishermen = isSuperAdmin || Boolean(currentUser?.permissions?.canManageFishermen);
  const canAntifraud = isSuperAdmin || Boolean(currentUser?.permissions?.canManageAntifraud);
  const canManageModerators = isSuperAdmin;

  // Determine initial active section based on user permissions
  const getInitialSection = (): 'moderation' | 'tournaments' | 'create_tournament' | 'teams' | 'fishermen' | 'antifraud' | 'moderators' => {
    if (canModerate) return 'moderation';
    if (canTournaments) return 'tournaments';
    if (canFishermen) return 'fishermen';
    if (canAntifraud) return 'antifraud';
    if (canManageModerators) return 'moderators';
    return 'moderation';
  };

  const [activeSection, setActiveSection] = useState<'moderation' | 'tournaments' | 'create_tournament' | 'teams' | 'fishermen' | 'antifraud' | 'moderators'>(getInitialSection());
  
  // Flash / Notification state
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Safety Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary' | 'success';
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  // Moderation state
  const [catchFilter, setCatchFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchCatch, setSearchCatch] = useState('');
  const [selectedTournamentFilter, setSelectedTournamentFilter] = useState<string>('all');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Catch Zoom & Rejection Modal State
  const [previewImageModalUrl, setPreviewImageModalUrl] = useState<string | null>(null);
  const [rejectingCatch, setRejectingCatch] = useState<Catch | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>(RULE_VIOLATION_PRESETS[0]);
  const [customRejectReason, setCustomRejectReason] = useState<string>('');

  // Tournament Management & Edit Modal
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [isDeletingTourneyId, setIsDeletingTourneyId] = useState<string | null>(null);

  // Teams Management & Approval State
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [teamFilter, setTeamFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTeam, setSearchTeam] = useState('');
  const [rejectingTeam, setRejectingTeam] = useState<Team | null>(null);
  const [teamRejectReason, setTeamRejectReason] = useState('');

  // Tournament creation states (matching UI: criar torneio.png)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rulesText, setRulesText] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('2026-12-31');
  const [status, setStatus] = useState<Tournament['status']>('active');
  const [targetSpeciesInput, setTargetSpeciesInput] = useState('Tucunaré');
  const [metric, setMetric] = useState<'length' | 'weight' | 'both'>('length');
  const [prize, setPrize] = useState('');
  const [prizeValue, setPrizeValue] = useState<string>('');
  const [entryFeeType, setEntryFeeType] = useState<'gratis' | 'pago'>('gratis');
  const [entryFeeAmount, setEntryFeeAmount] = useState<string>('');
  const [teamFormat, setTeamFormat] = useState<'solo' | 'dupla' | 'trio' | 'quarteto'>('solo');
  const [keyword, setKeyword] = useState('TORNEIO2026');
  const [imageUrl, setImageUrl] = useState('');
  const [daysForRegistration, setDaysForRegistration] = useState<number>(7);
  const [maxParticipants, setMaxParticipants] = useState<number>(50);
  const [participationCode, setParticipationCode] = useState('');
  const [captureWindows, setCaptureWindows] = useState<CaptureWindow[]>([]);
  const [newWindowDate, setNewWindowDate] = useState('');
  const [newWindowSecret, setNewWindowSecret] = useState('');
  const [newWindowStartTime, setNewWindowStartTime] = useState('');
  const [newWindowEndTime, setNewWindowEndTime] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Tournament Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<Tournament['status']>('active');
  const [editPrize, setEditPrize] = useState('');
  const [editPrizeValue, setEditPrizeValue] = useState('');
  const [editKeyword, setEditKeyword] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editFeeType, setEditFeeType] = useState<'gratis' | 'pago'>('gratis');
  const [editFeeAmount, setEditFeeAmount] = useState('');
  const [editFormat, setEditFormat] = useState<'solo' | 'dupla' | 'trio' | 'quarteto'>('solo');
  const [editImage, setEditImage] = useState('');

  // Registered Users Management State
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [searchFisherman, setSearchFisherman] = useState('');
  const [fishermanSubTab, setFishermanSubTab] = useState<'users' | 'codes'>('users');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editUserStatusVal, setEditUserStatusVal] = useState<'active' | 'blocked'>('active');

  // Anti-fraud Assigned Tournament Codes State
  const [allTournamentCodes, setAllTournamentCodes] = useState<TournamentCode[]>([]);
  const [searchCodeQuery, setSearchCodeQuery] = useState('');
  const [codeTourneyFilter, setCodeTourneyFilter] = useState('all');
  const [codePaymentFilter, setCodePaymentFilter] = useState<'all' | 'paid' | 'pending' | 'free'>('all');
  const [codeUsageFilter, setCodeUsageFilter] = useState<'all' | 'active' | 'used'>('all');

  // Modal: Assign Code to User
  const [assigningUser, setAssigningUser] = useState<UserProfile | null>(null);
  const [assignTourneyId, setAssignTourneyId] = useState<string>('');
  const [assignPaymentStatus, setAssignPaymentStatus] = useState<'paid' | 'pending' | 'free'>('paid');
  const [assignPaymentAmount, setAssignPaymentAmount] = useState<string>('0');
  const [assignPaymentNotes, setAssignPaymentNotes] = useState<string>('');
  const [assignCustomCode, setAssignCustomCode] = useState<string>('');
  const [isGeneratingAssignedCode, setIsGeneratingAssignedCode] = useState(false);
  const [generatedCodeSuccess, setGeneratedCodeSuccess] = useState<{
    code: string;
    userName: string;
    userCpf: string;
    tournamentTitle: string;
    paymentStatus: string;
    whatsappUrl: string;
  } | null>(null);
  const [copiedCodeVal, setCopiedCodeVal] = useState<string | null>(null);

  // Anti-fraud Phase Key Management State
  const [selectedTourneyForPhase, setSelectedTourneyForPhase] = useState<string>('');
  const [phaseName, setPhaseName] = useState<string>('Fase 1 - Classificatória');
  const [phaseKeywordInput, setPhaseKeywordInput] = useState<string>('');
  const [isUpdatingPhaseKey, setIsUpdatingPhaseKey] = useState<boolean>(false);
  const [phaseKeySuccess, setPhaseKeySuccess] = useState<string>('');
  const [phaseKeyError, setPhaseKeyError] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync selectedTourneyForPhase with tournaments list
  useEffect(() => {
    if (tournaments.length > 0 && !selectedTourneyForPhase) {
      setSelectedTourneyForPhase(tournaments[0].id);
      setPhaseKeywordInput(tournaments[0].keyword || '');
    }
  }, [tournaments, selectedTourneyForPhase]);

  // Subscribe to real-time users from Firestore
  useEffect(() => {
    const unsubscribe = subscribeUsers((users) => {
      setRegisteredUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to all tournament codes for anti-fraud tracking
  useEffect(() => {
    const unsubscribe = subscribeAllTournamentCodes((codes) => {
      setAllTournamentCodes(codes);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to all teams for admin moderation
  useEffect(() => {
    const unsubscribe = subscribeTeams((teams) => {
      setAllTeams(teams);
    });
    return () => unsubscribe();
  }, []);

  const showFlashMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => {
      setActionMessage(null);
    }, 4500);
  };

  // Team Moderation: Approve Team
  const handleApproveTeam = async (team: Team) => {
    try {
      await updateTeamStatus(team.id, 'approved', currentUser?.displayName || currentUser?.fullName || 'Administrador');
      showFlashMessage(`✅ Equipe "${team.name}" foi APROVADA com sucesso!`, 'success');
    } catch (e: any) {
      showFlashMessage(`Erro ao aprovar equipe: ${e.message}`, 'error');
    }
  };

  // Team Moderation: Open Reject Modal
  const handleOpenRejectTeamModal = (team: Team) => {
    setRejectingTeam(team);
    setTeamRejectReason('Nome ou logotipo inadequado, ou dados incompletos.');
  };

  // Team Moderation: Confirm Reject
  const handleConfirmRejectTeam = async () => {
    if (!rejectingTeam) return;
    try {
      await updateTeamStatus(
        rejectingTeam.id,
        'rejected',
        currentUser?.displayName || currentUser?.fullName || 'Administrador',
        teamRejectReason || 'Reprovado pela moderação.'
      );
      showFlashMessage(`🛑 Equipe "${rejectingTeam.name}" foi REPROVADA.`, 'success');
      setRejectingTeam(null);
      setTeamRejectReason('');
    } catch (e: any) {
      showFlashMessage(`Erro ao reprovar equipe: ${e.message}`, 'error');
    }
  };

  // Team Moderation: Delete Team
  const handleDeleteTeam = (team: Team) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Equipe',
      message: `Tem certeza que deseja EXCLUIR DEFINITIVAMENTE a equipe "${team.name}" (${team.code})? Todos os membros serão desvinculados.`,
      confirmLabel: 'Sim, Excluir Equipe',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteTeamByAdmin(team.id);
          showFlashMessage(`🗑️ Equipe "${team.name}" excluída com sucesso!`, 'success');
        } catch (e: any) {
          showFlashMessage(`Erro ao excluir equipe: ${e.message}`, 'error');
        }
      }
    });
  };

  // Generate participation code for new tournament
  const handleGenerateParticipationCode = () => {
    const code = generateUniqueTournamentCode('TORNEIO');
    setParticipationCode(code);
    showFlashMessage(`🔑 Código gerado: ${code}`, 'success');
  };

  // Add capture window
  const handleAddCaptureWindow = () => {
    if (!newWindowDate) {
      showFlashMessage('Selecione uma data para a janela de captura.', 'error');
      return;
    }
    if (!newWindowSecret.trim()) {
      showFlashMessage('Digite a palavra-chave/segredo para esta janela.', 'error');
      return;
    }
    const newWin: CaptureWindow = {
      id: 'win_' + Date.now(),
      date: newWindowDate,
      secret: newWindowSecret.trim().toUpperCase(),
      startTime: newWindowStartTime || '06:00',
      endTime: newWindowEndTime || '18:00'
    };
    setCaptureWindows(prev => [...prev, newWin]);
    setNewWindowDate('');
    setNewWindowSecret('');
    setNewWindowStartTime('');
    setNewWindowEndTime('');
    showFlashMessage('Janela de captura adicionada com sucesso!', 'success');
  };

  // Remove capture window
  const handleRemoveCaptureWindow = (id: string) => {
    setCaptureWindows(prev => prev.filter(w => w.id !== id));
  };

  // Moderation: Approve Catch
  const handleApproveCatch = async (item: Catch) => {
    setProcessingId(item.id);
    const feedbackNote = notes[item.id] || 'Captura homologada e validada pela comissão de arbitragem.';

    try {
      await updateCatchStatus(item.id, 'approved', feedbackNote);
      showFlashMessage(`✅ Captura de ${item.species} (${item.length}cm) homologada com sucesso!`, 'success');
      
      setNotes((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    } catch (e: any) {
      console.error("Erro ao aprovar captura:", e);
      showFlashMessage('Erro ao aprovar: ' + (e.message || ''), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Open Rejection Modal
  const handleOpenRejectModal = (item: Catch) => {
    setRejectingCatch(item);
    setSelectedRejectReason(RULE_VIOLATION_PRESETS[0]);
    setCustomRejectReason('');
  };

  // Execute Rejection with explicit reason
  const handleConfirmRejectCatch = async () => {
    if (!rejectingCatch) return;

    setProcessingId(rejectingCatch.id);
    const finalReason = customRejectReason.trim()
      ? `${selectedRejectReason}: ${customRejectReason.trim()}`
      : selectedRejectReason;

    try {
      await updateCatchStatus(rejectingCatch.id, 'rejected', finalReason);
      showFlashMessage(`❌ Captura reprovada com o motivo: "${finalReason}".`, 'success');
      setRejectingCatch(null);
    } catch (e: any) {
      console.error("Erro ao julgar captura:", e);
      showFlashMessage('Erro ao atualizar captura: ' + (e.message || ''), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Catch with confirmation
  const handleDeleteCatch = (catchId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Captura',
      message: 'Tem certeza que deseja excluir permanentemente esta captura do banco de dados? Esta ação não poderá ser desfeita.',
      confirmLabel: 'Sim, Excluir',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        setProcessingId(catchId);
        try {
          await deleteCatch(catchId);
          showFlashMessage('🗑️ Captura removida com sucesso.', 'success');
        } catch (e: any) {
          showFlashMessage('Erro ao excluir: ' + e.message, 'error');
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  // Open Tournament Edit Modal
  const handleOpenEditTournament = (t: Tournament) => {
    setEditingTournament(t);
    setEditTitle(t.title);
    setEditDescription(t.description);
    setEditStatus(t.status);
    setEditPrize(t.prize);
    setEditPrizeValue(t.prizeValue ? String(t.prizeValue) : '');
    setEditKeyword(t.keyword);
    setEditStartDate(t.startDate);
    setEditEndDate(t.endDate);
    setEditFeeType(t.entryFeeType || 'gratis');
    setEditFeeAmount(t.entryFeeAmount ? String(t.entryFeeAmount) : '');
    setEditFormat(t.teamFormat || 'solo');
    setEditImage(t.imageUrl || IMAGE_PRESETS[0].url);
  };

  // Save Tournament Edit with safety confirmation
  const handleSaveTournamentEditClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTournament) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Salvar Alterações do Campeonato',
      message: `Tem certeza que deseja salvar as alterações no campeonato "${editTitle.trim() || editingTournament.title}"?`,
      confirmLabel: 'Sim, Salvar Alterações',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          setIsSubmitting(true);
          await updateTournament(editingTournament.id, {
            title: editTitle.trim(),
            description: editDescription.trim(),
            status: editStatus,
            prize: editPrize.trim(),
            prizeValue: editPrizeValue ? Number(editPrizeValue) : undefined,
            keyword: editKeyword.trim().toUpperCase(),
            startDate: editStartDate,
            endDate: editEndDate,
            entryFeeType: editFeeType,
            entryFeeAmount: editFeeType === 'pago' && editFeeAmount ? Number(editFeeAmount) : 0,
            teamFormat: editFormat,
            imageUrl: editImage
          });

          showFlashMessage('✅ Campeonato atualizado com sucesso!', 'success');
          setEditingTournament(null);
        } catch (err: any) {
          showFlashMessage('Erro ao atualizar campeonato: ' + err.message, 'error');
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  // Quick Status change for tournament with safety confirmation
  const handleQuickStatusChange = (t: Tournament, newStatus: Tournament['status']) => {
    const statusLabels: Record<string, string> = {
      active: 'Ativo (🟢 Aberto para capturas)',
      upcoming: 'Em Breve (⏳ Divulgação futura)',
      completed: 'Encerrado / Finalizado (🏁 Fechado para envios)'
    };

    const isFinalizing = newStatus === 'completed';

    setConfirmDialog({
      isOpen: true,
      title: isFinalizing ? 'Finalizar e Encerrar Campeonato' : 'Alterar Status do Campeonato',
      message: isFinalizing 
        ? `Tem certeza que deseja FINALIZAR e ENCERRAR o campeonato "${t.title}"? Os competidores não poderão mais enviar novas capturas para esta edição.`
        : `Tem certeza que deseja alterar o status do campeonato "${t.title}" para ${statusLabels[newStatus]}?`,
      confirmLabel: isFinalizing ? 'Sim, Finalizar Campeonato' : 'Sim, Alterar Status',
      variant: isFinalizing ? 'warning' : 'primary',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await updateTournament(t.id, { status: newStatus });
          showFlashMessage(`Status do campeonato alterado para "${newStatus}"!`, 'success');
        } catch (err: any) {
          showFlashMessage('Erro ao alterar status: ' + err.message, 'error');
        }
      }
    });
  };

  // Delete Tournament with safety confirmation
  const handleDeleteTournament = (t: Tournament) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Campeonato',
      message: `Tem certeza que deseja EXCLUIR DEFINITIVAMENTE o campeonato "${t.title}"? Esta ação removerá o campeonato do sistema e não poderá ser desfeita.`,
      confirmLabel: 'Sim, Excluir Definitivamente',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          setIsDeletingTourneyId(t.id);
          await deleteTournament(t.id);
          showFlashMessage(`🗑️ Campeonato "${t.title}" excluído com sucesso!`, 'success');
        } catch (err: any) {
          showFlashMessage('Erro ao excluir campeonato: ' + err.message, 'error');
        } finally {
          setIsDeletingTourneyId(null);
        }
      }
    });
  };

  // Create Tournament with safety confirmation
  const handleCreateTournamentClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title.trim()) {
      setFormError('Por favor, informe o título do campeonato.');
      return;
    }
    if (!description.trim()) {
      setFormError('Por favor, informe uma descrição detalhada do campeonato.');
      return;
    }
    if (!keyword.trim()) {
      setFormError('A palavra-chave antifraude é obrigatória.');
      return;
    }
    if (!prize.trim()) {
      setFormError('Descreva a premiação do campeonato.');
      return;
    }

    const statusLabel = status === 'active' ? '🟢 Ativo' : status === 'upcoming' ? '⏳ Em Breve' : '🏁 Encerrado';

    setConfirmDialog({
      isOpen: true,
      title: 'Cadastrar Novo Campeonato',
      message: `Tem certeza que deseja cadastrar e publicar o campeonato "${title.trim()}" com o status inicial ${statusLabel}?`,
      confirmLabel: 'Sim, Publicar Campeonato',
      variant: 'primary',
      onConfirm: async () => {
        setConfirmDialog(null);
        const species = targetSpeciesInput
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        const rules = rulesText.trim()
          ? rulesText.split('\n').map(r => r.trim()).filter(r => r.length > 0)
          : [
              'Medição obrigatória em fita métrica homologada com a palavra-chave visível.',
              'Prática estrita do pesque e solte. Exemplares abatidos serão desclassificados.',
              'Envio da foto com boa iluminação e nitidez dos números da régua.'
            ];

        try {
          setIsSubmitting(true);
          const effectiveBannerUrl = imageUrl.trim() || IMAGE_PRESETS[0].url;

          await createTournament({
            title: title.trim(),
            description: description.trim() || `Campeonato oficial ${title.trim()}`,
            rules: rules,
            startDate: startDate,
            endDate: endDate,
            status: status,
            targetSpecies: species.length > 0 ? species : ['Tucunaré'],
            metric: metric,
            prize: prize.trim(),
            prizeValue: prizeValue ? Number(prizeValue) : undefined,
            entryFeeType: entryFeeType,
            entryFeeAmount: entryFeeType === 'pago' && entryFeeAmount ? Number(entryFeeAmount) : 0,
            teamFormat: teamFormat,
            keyword: keyword.trim().toUpperCase(),
            imageUrl: effectiveBannerUrl,
            daysForRegistration: Number(daysForRegistration) || 7,
            maxParticipants: Number(maxParticipants) || 50,
            tournamentCode: participationCode.trim() || undefined,
            captureWindows: captureWindows.length > 0 ? captureWindows : undefined
          });

          setFormSuccess('Campeonato criado com sucesso no Firestore!');
          showFlashMessage('Novo campeonato publicado com sucesso!', 'success');
          
          // Reset form
          setTitle('');
          setDescription('');
          setRulesText('');
          setPrize('');
          setPrizeValue('');
          setKeyword('TORNEIO2026');
          setImageUrl('');
          setDaysForRegistration(7);
          setMaxParticipants(50);
          setParticipationCode('');
          setCaptureWindows([]);
          setActiveSection('tournaments');
        } catch (err: any) {
          setFormError('Erro ao criar campeonato: ' + err.message);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  // User/Fisherman Action: Toggle Active/Blocked
  const handleToggleUserStatus = (user: UserProfile) => {
    if (user.uid === 'admin_master_root') {
      showFlashMessage('Acesso Negado: O Administrador Geral não pode ser bloqueado.', 'error');
      return;
    }

    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    setConfirmDialog({
      isOpen: true,
      title: nextStatus === 'active' ? 'Reativar Cadastro de Pescador' : 'Bloquear Pescador',
      message: `Tem certeza que deseja ${nextStatus === 'active' ? 'reativar' : 'bloquear/suspender'} o acesso de "${user.displayName || user.fullName}"?`,
      confirmLabel: nextStatus === 'active' ? 'Sim, Reativar' : 'Sim, Bloquear',
      variant: nextStatus === 'active' ? 'success' : 'warning',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await updateUserStatus(user.uid, nextStatus);
          showFlashMessage(
            nextStatus === 'active' 
              ? `✅ Cadastro de ${user.displayName} reativado!` 
              : `🛑 Cadastro de ${user.displayName} bloqueado!`,
            'success'
          );
        } catch (e: any) {
          showFlashMessage('Erro ao alterar status do usuário: ' + e.message, 'error');
        }
      }
    });
  };

  // User/Fisherman Action: Delete User
  const handleDeleteUser = (user: UserProfile) => {
    if (user.uid === 'admin_master_root') {
      showFlashMessage('Acesso Negado: O Administrador Geral não pode ser excluído.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Cadastro de Pescador',
      message: `Tem certeza que deseja EXCLUIR PERMANENTEMENTE o cadastro de "${user.displayName || user.fullName}"? Todos os dados de login deste competidor serão removidos.`,
      confirmLabel: 'Sim, Excluir Definitivamente',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteUser(user.uid);
          showFlashMessage(`🗑️ Cadastro de "${user.displayName}" excluído com sucesso.`, 'success');
        } catch (e: any) {
          showFlashMessage('Erro ao excluir usuário: ' + e.message, 'error');
        }
      }
    });
  };

  // User/Fisherman Action: Open Edit User Modal
  const handleOpenEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditFullName(user.fullName || user.displayName || '');
    setEditCpf(user.cpf || '');
    setEditEmail(user.email || '');
    setEditNickname(user.nickname || user.displayName || '');
    setEditAddress(user.address || '');
    setEditUserStatusVal(user.status || 'active');
  };

  // User/Fisherman Action: Save Edit User Modal
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSubmitting(true);
      await updateUser(editingUser.uid, {
        fullName: editFullName.trim(),
        displayName: editNickname.trim() || editFullName.trim(),
        nickname: editNickname.trim(),
        cpf: editCpf.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
        status: editUserStatusVal
      });

      showFlashMessage(`✅ Cadastro de ${editFullName} atualizado com sucesso!`, 'success');
      setEditingUser(null);
    } catch (e: any) {
      showFlashMessage('Erro ao atualizar usuário: ' + e.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Anti-fraud Assigned Code: Open Modal for a specific user
  const handleOpenAssignCode = (user: UserProfile) => {
    setAssigningUser(user);
    const firstTourney = tournaments[0];
    const initialTourneyId = firstTourney ? firstTourney.id : '';
    setAssignTourneyId(initialTourneyId);

    const isPaid = firstTourney && firstTourney.entryFeeType === 'pago';
    setAssignPaymentStatus(isPaid ? 'paid' : 'free');
    setAssignPaymentAmount(firstTourney?.entryFeeAmount ? String(firstTourney.entryFeeAmount) : '0');
    setAssignPaymentNotes(isPaid ? 'Pagamento confirmado pela organização' : 'Inscrição gratuita / cortesia');

    // Generate suggested unique code format: TRN-[CPF_LAST_4]-[4_DIGITS]
    const cpfDigits = user.cpf ? user.cpf.replace(/\D/g, '').slice(-4) : 'USR';
    const suggested = generateUniqueTournamentCode(`TRN-${cpfDigits}`);
    setAssignCustomCode(suggested);
  };

  // Anti-fraud Assigned Code: Generate & Save Code
  const handleGenerateAssignedCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningUser) return;
    if (!assignTourneyId) {
      showFlashMessage('Por favor, selecione o campeonato.', 'error');
      return;
    }

    const tourney = tournaments.find(t => t.id === assignTourneyId);
    if (!tourney) {
      showFlashMessage('Campeonato não encontrado.', 'error');
      return;
    }

    try {
      setIsGeneratingAssignedCode(true);
      const codeCreated = await createAssignedTournamentCode({
        tournamentId: tourney.id,
        tournamentTitle: tourney.title,
        userId: assigningUser.uid,
        userName: assigningUser.fullName || assigningUser.displayName,
        userEmail: assigningUser.email,
        userCpf: assigningUser.cpf || '',
        paymentStatus: assignPaymentStatus,
        paymentAmount: Number(assignPaymentAmount) || 0,
        paymentNotes: assignPaymentNotes.trim(),
        customCode: assignCustomCode.trim() || undefined,
        createdBy: currentUser?.displayName || currentUser?.email || 'admin'
      });

      // Prepare WhatsApp Direct Message
      const fishermanName = assigningUser.fullName || assigningUser.displayName;
      const statusText = assignPaymentStatus === 'paid' ? '✅ Confirmado (Pago)' : assignPaymentStatus === 'free' ? '🆓 Isento / Grátis' : '⏳ Aguardando Validação';
      
      const whatsappMsg = `🏆 *PESCAESPORTE - CÓDIGO DE PARTICIPAÇÃO EXCLUSIVO*\n\nOlá *${fishermanName}*!\n\nSeu código individual para o campeonato *${tourney.title}* foi gerado e atribuído ao seu cadastro com proteção antifraude:\n\n🔑 *CÓDIGO DE INSCRIÇÃO:* ${codeCreated.code}\n👤 *Pescador:* ${fishermanName}\n📄 *CPF Vinculado:* ${assigningUser.cpf || 'Cadastrado no Sistema'}\n💰 *Status do Pagamento:* ${statusText}\n\n🔒 *AVISO DE SEGURANÇA:* Este código é de uso único e intransferível, vinculado exclusivamente à sua conta no aplicativo. Outros usuários não conseguirão utilizá-lo.\n\nAcesse o PescaEsporte e utilize o código para confirmar sua participação!`;
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

      setGeneratedCodeSuccess({
        code: codeCreated.code,
        userName: fishermanName,
        userCpf: assigningUser.cpf || '',
        tournamentTitle: tourney.title,
        paymentStatus: statusText,
        whatsappUrl
      });

      showFlashMessage(`🔑 Código ${codeCreated.code} gerado e vinculado a ${fishermanName} com sucesso!`, 'success');
      setAssigningUser(null);
    } catch (err: any) {
      console.error("Erro ao gerar código atribuído:", err);
      showFlashMessage('Erro ao gerar código: ' + (err.message || 'Erro desconhecido'), 'error');
    } finally {
      setIsGeneratingAssignedCode(false);
    }
  };

  // Anti-fraud Assigned Code: Toggle Payment Status
  const handleToggleCodePayment = async (codeItem: TournamentCode) => {
    const nextStatus: 'paid' | 'pending' = codeItem.paymentStatus === 'paid' ? 'pending' : 'paid';
    try {
      await updateTournamentCodePayment(
        codeItem.id, 
        nextStatus, 
        nextStatus === 'paid' ? 'Pagamento validado pela organização' : 'Pagamento pendente de conferência'
      );
      showFlashMessage(
        nextStatus === 'paid' 
          ? `✅ Pagamento do código ${codeItem.code} confirmado!` 
          : `⚠️ Pagamento do código ${codeItem.code} alterado para Pendente.`,
        'success'
      );
    } catch (e: any) {
      showFlashMessage('Erro ao atualizar pagamento: ' + e.message, 'error');
    }
  };

  // Anti-fraud Assigned Code: Delete Code
  const handleDeleteCode = (codeItem: TournamentCode) => {
    if (codeItem.isUsed) {
      showFlashMessage('Não é possível excluir um código que já foi utilizado e consumido.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Código de Inscrição',
      message: `Tem certeza que deseja excluir o código "${codeItem.code}" emitido para "${codeItem.assignedToUserName || 'Pescador'}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Sim, Excluir Código',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteTournamentCode(codeItem.id);
          showFlashMessage(`🗑️ Código ${codeItem.code} excluído com sucesso.`, 'success');
        } catch (e: any) {
          showFlashMessage('Erro ao excluir código: ' + e.message, 'error');
        }
      }
    });
  };

  // Anti-fraud: Update Keyword for Tournament Phase
  const handleUpdatePhaseKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhaseKeySuccess('');
    setPhaseKeyError('');

    if (!selectedTourneyForPhase) {
      setPhaseKeyError('Selecione um campeonato para atualizar a chave.');
      return;
    }
    if (!phaseKeywordInput.trim()) {
      setPhaseKeyError('A nova palavra-chave não pode ficar vazia.');
      return;
    }

    const cleanKey = phaseKeywordInput.trim().toUpperCase();
    const targetTourney = tournaments.find(t => t.id === selectedTourneyForPhase);

    setConfirmDialog({
      isOpen: true,
      title: 'Atualizar Chave Antifraude',
      message: `Tem certeza que deseja atualizar a palavra-chave de segurança do campeonato "${targetTourney?.title}" para "${cleanKey}"? Todas as novas capturas desta fase deverão exibir esta nova chave.`,
      confirmLabel: 'Sim, Atualizar Chave',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          setIsUpdatingPhaseKey(true);
          await updateTournament(selectedTourneyForPhase, {
            keyword: cleanKey
          });

          setPhaseKeySuccess(`Palavra-chave do campeonato atualizada com sucesso para "${cleanKey}"!`);
          showFlashMessage(`🔐 Nova palavra-chave "${cleanKey}" propagada para o campeonato!`, 'success');
        } catch (err: any) {
          setPhaseKeyError('Erro ao atualizar chave: ' + err.message);
        } finally {
          setIsUpdatingPhaseKey(false);
        }
      }
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filter Catches
  const filteredCatches = catches.filter(item => {
    const matchesFilter = catchFilter === 'all' || item.status === catchFilter;
    const matchesTourney = selectedTournamentFilter === 'all' || item.tournamentId === selectedTournamentFilter;
    const searchLower = searchCatch.toLowerCase();
    const matchesSearch = 
      !searchCatch || 
      (item.userName && item.userName.toLowerCase().includes(searchLower)) ||
      (item.species && item.species.toLowerCase().includes(searchLower)) ||
      (item.location && item.location.toLowerCase().includes(searchLower));
    
    return matchesFilter && matchesTourney && matchesSearch;
  });

  const pendingCount = catches.filter(c => c.status === 'pending').length;
  const approvedCount = catches.filter(c => c.status === 'approved').length;
  const rejectedCount = catches.filter(c => c.status === 'rejected').length;

  // Filter Registered Fishermen
  const allFishermenList = registeredUsers.filter(u => {
    const q = searchFisherman.toLowerCase();
    if (!q) return true;
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.cpf && u.cpf.toLowerCase().includes(q)) ||
      (u.address && u.address.toLowerCase().includes(q)) ||
      (u.nickname && u.nickname.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Action Flash Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between shadow-xl animate-fade-in ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Admin Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>
                {isSuperAdmin ? 'Painel do Administrador Geral (Proprietário)' : `Painel do Moderador (${currentUser?.displayName || 'Árbitro'})`}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Central de Arbitragem & Gestão Administrativa
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isSuperAdmin 
                ? 'Controle total do sistema: homologue capturas com IA, cadastre campeonatos com proteção de segurança, gerencie pescadores e credencie moderadores.'
                : 'Acesse as funções autorizadas para a comissão técnica de arbitragem.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Pendentes</span>
              <span className="text-xl font-bold font-mono text-amber-400">{pendingCount}</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Torneios</span>
              <span className="text-xl font-bold font-mono text-sky-400">{tournaments.length}</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Cadastros</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{allFishermenList.length}</span>
            </div>
          </div>
        </div>

        {/* Central Admin Navigation Tabs (Filtered by permissions) */}
        <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-slate-800/80">
          {canModerate && (
            <button
              onClick={() => setActiveSection('moderation')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeSection === 'moderation'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Homologações ({pendingCount})</span>
            </button>
          )}

          {canTournaments && (
            <>
              <button
                onClick={() => setActiveSection('tournaments')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  activeSection === 'tournaments'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Campeonatos ({tournaments.length})</span>
              </button>

              <button
                onClick={() => setActiveSection('create_tournament')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  activeSection === 'create_tournament'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ Criar Campeonato</span>
              </button>
            </>
          )}

          {canFishermen && (
            <>
              <button
                onClick={() => setActiveSection('teams')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  activeSection === 'teams'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>
                  Equipes ({allTeams.length})
                  {allTeams.filter(t => t.status === 'pending' || !t.status).length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] rounded-full font-black">
                      {allTeams.filter(t => t.status === 'pending' || !t.status).length} pendente(s)
                    </span>
                  )}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('fishermen')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  activeSection === 'fishermen'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>Pescadores ({allFishermenList.length})</span>
              </button>
            </>
          )}

          {canAntifraud && (
            <button
              onClick={() => setActiveSection('antifraud')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeSection === 'antifraud'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Key className="h-4 w-4" />
              <span>Chaves Antifraude</span>
            </button>
          )}

          {/* Super Admin Exclusive: Moderator Manager */}
          {canManageModerators && (
            <button
              onClick={() => setActiveSection('moderators')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeSection === 'moderators'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Shield className="h-4 w-4 text-amber-400" />
              <span>Moderadores & Equipe</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: MODERATION & CATCH APPROVALS */}
      {activeSection === 'moderation' && canModerate && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-mono text-slate-400">Status:</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCatchFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    catchFilter === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pendentes ({pendingCount})
                </button>
                <button
                  onClick={() => setCatchFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    catchFilter === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Homologadas ({approvedCount})
                </button>
                <button
                  onClick={() => setCatchFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    catchFilter === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Reprovadas ({rejectedCount})
                </button>
                <button
                  onClick={() => setCatchFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    catchFilter === 'all'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todas ({catches.length})
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <select
                value={selectedTournamentFilter}
                onChange={(e) => setSelectedTournamentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">Filtrar: Todos os Campeonatos</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar pescador, espécie..."
                  value={searchCatch}
                  onChange={(e) => setSearchCatch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 w-full sm:w-48 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* List of Catches */}
          {filteredCatches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <Clock className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              Nenhuma captura encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCatches.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row gap-6 hover:border-slate-700 transition"
                >
                  {/* Photo & Zoom Button */}
                  <div className="relative w-full md:w-60 h-52 shrink-0 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                    <img
                      src={item.photoUrl}
                      alt={item.species}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <button
                      onClick={() => setPreviewImageModalUrl(item.photoUrl)}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-bold text-xs transition cursor-pointer"
                    >
                      <ZoomIn className="h-5 w-5 text-amber-400" />
                      <span>Auditar Régua em Tela Cheia</span>
                    </button>
                    
                    <div className="absolute top-2 left-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.status === 'approved'
                          ? 'bg-emerald-500 text-slate-950'
                          : item.status === 'rejected'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}>
                        {item.status === 'approved' ? '✓ Homologada' : item.status === 'rejected' ? '✕ Reprovada' : '⏳ Pendente'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata & Controls */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>{item.species}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                            {item.length} cm {item.weight ? `• ${item.weight} kg` : ''}
                          </span>
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {item.createdAt ? (item.createdAt.toDate ? item.createdAt.toDate().toLocaleString('pt-BR') : new Date(item.createdAt).toLocaleString('pt-BR')) : ''}
                        </span>
                      </div>

                      {/* Angler & Tournament Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs font-mono bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Pescador</span>
                          <span className="font-bold text-slate-200">{item.userName || item.userEmail}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Localização</span>
                          <span className="font-bold text-slate-200">{item.location}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Campeonato</span>
                          <span className="font-bold text-amber-400 truncate block">{item.tournamentTitle || 'Torneio'}</span>
                        </div>
                      </div>

                      {/* Video Release Link if available */}
                      {(item.videoStartUrl || item.videoEndUrl) && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {item.videoStartUrl && (
                            <a
                              href={item.videoStartUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono hover:bg-sky-500/20 transition"
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>Vídeo 1: Fisgada / Ação</span>
                            </a>
                          )}
                          {item.videoEndUrl && (
                            <a
                              href={item.videoEndUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono hover:bg-emerald-500/20 transition"
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>Vídeo 2: Medição / Soltura</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Moderator Notes / AI note */}
                      {(item.moderatorNotes || item.aiFeedback) && (
                        <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
                          {item.moderatorNotes && (
                            <div>
                              <strong className="block text-[10px] font-mono uppercase text-amber-400">Parecer de Arbitragem:</strong>
                              <span>{item.moderatorNotes}</span>
                            </div>
                          )}
                          {item.aiFeedback && (
                            <div className="text-[11px] text-slate-400">
                              <span className="text-sky-400 font-bold">🤖 Análise IA: </span>
                              <span>{item.aiFeedback.identifiedSpecies} • Confiança {Math.round(item.aiFeedback.confidence * 100)}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Nota interna de arbitragem (opcional)..."
                        value={notes[item.id] || ''}
                        onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                        className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 flex-1 min-w-[200px] focus:outline-none focus:border-amber-500"
                      />

                      <div className="flex items-center space-x-2">
                        <button
                          disabled={processingId === item.id}
                          onClick={() => handleApproveCatch(item)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          <span>Aprovar / Homologar</span>
                        </button>

                        <button
                          disabled={processingId === item.id}
                          onClick={() => handleOpenRejectModal(item)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/40 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reprovar</span>
                        </button>

                        <button
                          disabled={processingId === item.id}
                          onClick={() => handleDeleteCatch(item.id)}
                          className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                          title="Excluir Definitivamente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: TOURNAMENTS MANAGEMENT */}
      {activeSection === 'tournaments' && canTournaments && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2">
            <div>
              <h3 className="text-xl font-bold text-white">Todos os Campeonatos Cadastrados ({tournaments.length})</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edite regulamentos, altere status (Ativo/Em Breve/Encerrado) ou exclua edições com segurança.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('create_tournament')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Adicionar Novo Campeonato</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments.map((t) => (
              <div 
                key={t.id} 
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-40 bg-slate-950 overflow-hidden">
                    <img 
                      src={t.imageUrl} 
                      alt={t.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
                    
                    {/* Status badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full shadow-md ${
                        t.status === 'active' 
                          ? 'bg-emerald-500 text-slate-950' 
                          : t.status === 'upcoming' 
                          ? 'bg-sky-500 text-white' 
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {t.status === 'active' ? '🟢 Ativo' : t.status === 'upcoming' ? '⏳ Em Breve' : '🏁 Encerrado'}
                      </span>

                      <span className="bg-slate-950/80 text-amber-400 text-[10px] font-mono px-2 py-1 rounded-full border border-amber-500/30 font-bold">
                        🔑 {t.keyword}
                      </span>
                    </div>

                    {/* Quick switch status buttons with confirmation */}
                    <div className="absolute bottom-3 right-3 flex bg-slate-950/90 rounded-xl p-1 border border-slate-800">
                      <button
                        onClick={() => handleQuickStatusChange(t, 'active')}
                        title="Tornar Ativo"
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          t.status === 'active' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Ativar
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(t, 'upcoming')}
                        title="Tornar Em Breve"
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          t.status === 'upcoming' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Em Breve
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(t, 'completed')}
                        title="Finalizar e Encerrar Torneio"
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          t.status === 'completed' ? 'bg-slate-700 text-white' : 'text-rose-400 hover:text-rose-300'
                        }`}
                      >
                        Encerrar
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-tight">{t.title}</h4>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{t.description}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Inscrição</span>
                        <span className="font-bold text-slate-200">
                          {t.entryFeeType === 'pago' ? `R$ ${t.entryFeeAmount || 0}` : 'Grátis'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Formato</span>
                        <span className="font-bold text-slate-200 capitalize">{t.teamFormat || 'Solo'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Prêmio Total</span>
                        <span className="font-bold text-amber-400 truncate block" title={t.prize}>
                          {t.prizeValue ? `R$ ${t.prizeValue}` : t.prize.slice(0, 15)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Toolbar */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    Vigência: {t.startDate} até {t.endDate}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditTournament(t)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-sky-400" />
                      <span>Editar</span>
                    </button>

                    <button
                      disabled={isDeletingTourneyId === t.id}
                      onClick={() => handleDeleteTournament(t)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                      title="Excluir Campeonato Permanentemente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CREATE TOURNAMENT FORM (MATCHING criar torneio.png) */}
      {activeSection === 'create_tournament' && canTournaments && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          {/* Header Title Badge matching criar torneio.png */}
          <div className="flex items-center justify-between">
            <div className="inline-block bg-[#00e676] text-black font-black text-xs sm:text-sm px-4 py-2 uppercase tracking-wider rounded-md shadow-md">
              CRIAR NOVO TORNEIO
            </div>
            <span className="text-xs font-mono text-slate-400">
              Configurações Oficiais & Painel Antifraude
            </span>
          </div>

          <form onSubmit={handleCreateTournamentClick} className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            {formError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Row 1: Title & Team Format Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Título do Torneio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#181a1f] border border-slate-800 text-white rounded-2xl px-4 py-3.5 text-xs sm:text-sm focus:outline-none focus:border-[#00e676] transition placeholder-slate-500"
                />
              </div>

              <div>
                <select
                  value={teamFormat}
                  onChange={(e: any) => setTeamFormat(e.target.value)}
                  className="w-full bg-[#181a1f] border border-slate-800 text-white rounded-2xl px-4 py-3.5 text-xs sm:text-sm focus:outline-none focus:border-[#00e676] transition cursor-pointer"
                >
                  <option value="solo">Solo (1 Pessoa)</option>
                  <option value="dupla">Dupla (2 Pessoas)</option>
                  <option value="trio">Trio (3 Pessoas)</option>
                  <option value="quarteto">Equipe (4 Pessoas)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Prize & Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Prêmio"
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  className="w-full bg-[#181a1f] border border-slate-800 text-white rounded-2xl px-4 py-3.5 text-xs sm:text-sm focus:outline-none focus:border-[#00e676] transition placeholder-slate-500"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="URL da Imagem"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#181a1f] border border-slate-800 text-white rounded-2xl px-4 py-3.5 text-xs sm:text-sm focus:outline-none focus:border-[#00e676] transition placeholder-slate-500 font-mono"
                />
              </div>
            </div>

            {/* Banner Presets / Live Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Sugestões de Imagens de Capa (ou insira a URL acima):</span>
                {imageUrl && (
                  <button 
                    type="button" 
                    onClick={() => setImageUrl('')}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {IMAGE_PRESETS.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setImageUrl(p.url)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                      imageUrl === p.url ? 'border-[#00e676] scale-[1.02]' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.name} referrerPolicy="no-referrer" className="h-16 w-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 p-1 flex items-end">
                      <span className="text-[10px] font-bold text-white truncate">{p.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: DIAS DE INSCRIÇÃO & LIMITE DE PARTICIPANTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5 block">
                  DIAS DE INSCRIÇÃO
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={daysForRegistration}
                  onChange={(e) => setDaysForRegistration(Number(e.target.value))}
                  className="w-full bg-[#181a1f] border border-slate-800 text-white rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#00e676] transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5 block">
                  LIMITE DE PARTICIPANTES
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="w-full bg-[#181a1f] border border-slate-800 text-white rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#00e676] transition"
                />
              </div>
            </div>

            {/* Row 4: Código de Participação (Opcional) + GERAR button */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Código de Participação (Opcional)"
                  value={participationCode}
                  onChange={(e) => setParticipationCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#181a1f] border border-slate-800 text-white rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-mono uppercase focus:outline-none focus:border-[#00e676] transition placeholder-slate-500"
                />
              </div>
              <button
                type="button"
                onClick={handleGenerateParticipationCode}
                className="bg-[#202327] hover:bg-[#2b2f35] text-white font-bold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer border border-slate-700/60 shrink-0"
              >
                GERAR
              </button>
            </div>

            {/* Row 5: JANELAS DE CAPTURA VÁLIDAS Box */}
            <div className="bg-[#181a1f] border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  JANELAS DE CAPTURA VÁLIDAS
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {captureWindows.length} {captureWindows.length === 1 ? 'janela configurada' : 'janelas configuradas'}
                </span>
              </div>

              {/* Add Window Inputs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-center">
                <input
                  type="date"
                  placeholder="dd/mm/aaaa"
                  value={newWindowDate}
                  onChange={(e) => setNewWindowDate(e.target.value)}
                  className="bg-[#121316] border border-slate-800 text-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00e676]"
                />

                <input
                  type="text"
                  placeholder="Segredo / Palavra"
                  value={newWindowSecret}
                  onChange={(e) => setNewWindowSecret(e.target.value.toUpperCase())}
                  className="bg-[#121316] border border-slate-800 text-amber-400 font-mono font-bold rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#00e676] uppercase placeholder-slate-500"
                />

                <input
                  type="time"
                  placeholder="--:--"
                  value={newWindowStartTime}
                  onChange={(e) => setNewWindowStartTime(e.target.value)}
                  className="bg-[#121316] border border-slate-800 text-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00e676]"
                />

                <input
                  type="time"
                  placeholder="--:--"
                  value={newWindowEndTime}
                  onChange={(e) => setNewWindowEndTime(e.target.value)}
                  className="bg-[#121316] border border-slate-800 text-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00e676]"
                />

                <button
                  type="button"
                  onClick={handleAddCaptureWindow}
                  className="bg-[#2a2d34] hover:bg-[#343842] text-slate-200 font-bold px-3 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer whitespace-nowrap border border-slate-700/50"
                >
                  ADICIONAR JANELA
                </button>
              </div>

              {/* List of Added Windows */}
              {captureWindows.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {captureWindows.map((win, idx) => (
                    <div key={win.id || idx} className="flex items-center justify-between bg-[#121316] p-3 rounded-xl border border-slate-800 text-xs font-mono">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-slate-400">📅 {win.date}</span>
                        <span className="text-sky-400">⏰ {win.startTime || '06:00'} às {win.endTime || '18:00'}</span>
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-bold">
                          🔑 {win.secret}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCaptureWindow(win.id)}
                        className="text-rose-400 hover:text-rose-300 transition p-1 cursor-pointer"
                        title="Remover janela"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Row 6: Descrição */}
            <div>
              <textarea
                rows={3}
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#181a1f] border border-slate-800 text-white rounded-2xl px-4 py-3.5 text-xs sm:text-sm min-h-[90px] focus:outline-none focus:border-[#00e676] transition placeholder-slate-500"
              />
            </div>

            {/* Submit Button matching criar torneio.png */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00e676] hover:bg-[#00c853] text-black font-black py-4 rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-xl transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'PUBLICANDO NO BANCO DE DADOS...' : 'PUBLICAR TORNEIO'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION: GESTÃO & APROVAÇÃO DE EQUIPES */}
      {activeSection === 'teams' && canFishermen && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Stats */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Central de Aprovação de Equipes</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Moderação Obrigatória
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Avalie, aprove ou reprove equipes criadas pelos pescadores. Somente equipes aprovadas com todas as vagas preenchidas podem participar de torneios em equipe.
              </p>
            </div>

            {/* Sub-tab filter switcher */}
            <div className="flex flex-wrap bg-slate-900 p-1 rounded-2xl border border-slate-800 shrink-0">
              <button
                onClick={() => setTeamFilter('pending')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  teamFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Pendentes ({allTeams.filter(t => t.status === 'pending' || !t.status).length})</span>
              </button>

              <button
                onClick={() => setTeamFilter('approved')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  teamFilter === 'approved'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Aprovadas ({allTeams.filter(t => t.status === 'approved').length})</span>
              </button>

              <button
                onClick={() => setTeamFilter('rejected')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  teamFilter === 'rejected'
                    ? 'bg-rose-500 text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reprovadas ({allTeams.filter(t => t.status === 'rejected').length})</span>
              </button>

              <button
                onClick={() => setTeamFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  teamFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Todas ({allTeams.length})</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar equipe por nome, código (ex: EQP-...) ou capitão..."
              value={searchTeam}
              onChange={(e) => setSearchTeam(e.target.value)}
              className="bg-transparent text-slate-200 text-xs sm:text-sm focus:outline-none w-full placeholder-slate-500"
            />
          </div>

          {/* Teams List Grid */}
          {(() => {
            const filteredTeams = allTeams.filter(team => {
              // Status filter
              if (teamFilter === 'pending' && team.status !== 'pending' && team.status !== undefined) return false;
              if (teamFilter === 'approved' && team.status !== 'approved') return false;
              if (teamFilter === 'rejected' && team.status !== 'rejected') return false;
              
              // Text query filter
              if (searchTeam) {
                const q = searchTeam.toLowerCase();
                const matchName = team.name.toLowerCase().includes(q);
                const matchCode = team.code.toLowerCase().includes(q);
                const matchCaptain = team.creatorName?.toLowerCase().includes(q) || team.creatorEmail?.toLowerCase().includes(q);
                if (!matchName && !matchCode && !matchCaptain) return false;
              }
              return true;
            });

            if (filteredTeams.length === 0) {
              return (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6" />
                  </div>
                  <h4 className="text-white font-bold">Nenhuma equipe encontrada</h4>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">
                    {teamFilter === 'pending'
                      ? 'Não existem equipes aguardando homologação no momento.'
                      : 'Nenhuma equipe corresponde aos filtros selecionados.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTeams.map((team) => {
                  const isPending = team.status === 'pending' || !team.status;
                  const isApproved = team.status === 'approved';
                  const isRejected = team.status === 'rejected';
                  const isFull = (team.members?.length || 0) >= (team.maxMembers || 2);

                  return (
                    <div
                      key={team.id}
                      className="bg-[#121316] border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl transition relative overflow-hidden"
                    >
                      {/* Top Team Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="h-12 w-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-white shrink-0">
                            {team.logoUrl ? (
                              <img
                                src={team.logoUrl}
                                alt={team.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">👥</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-white text-base leading-tight">
                                {team.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                {team.code}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                Capitão: {team.creatorName || team.creatorEmail}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Pendente</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Aprovada</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400 inline-flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              <span>Reprovada</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Vacancy / Members Stats */}
                      <div className="p-3.5 bg-[#181a1f] rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Vagas preenchidas:</span>
                          <span className={`font-mono font-bold ${isFull ? 'text-[#00e676]' : 'text-amber-400'}`}>
                            {team.members?.length || 0} / {team.maxMembers || 2} {isFull ? '(Equipe Completa)' : '(Vagas Abertas)'}
                          </span>
                        </div>

                        {/* Members list preview */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                          {team.members && team.members.length > 0 ? (
                            team.members.map((m, mIdx) => (
                              <div key={m.userId || mIdx} className="flex items-center justify-between text-xs text-slate-300">
                                <div className="flex items-center gap-2 truncate">
                                  <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white shrink-0">
                                    {m.photoUrl ? (
                                      <img src={m.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      m.name?.charAt(0) || 'P'
                                    )}
                                  </div>
                                  <span className="truncate">{m.name}</span>
                                  {m.userId === team.creatorId && (
                                    <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1 rounded">
                                      Capitão
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 truncate ml-2">
                                  {m.email}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">Sem membros registrados.</p>
                          )}
                        </div>
                      </div>

                      {/* Rejection Note if rejected */}
                      {isRejected && team.rejectionReason && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 space-y-1">
                          <span className="font-bold block">Motivo da Reprovação:</span>
                          <p>{team.rejectionReason}</p>
                        </div>
                      )}

                      {/* Approval metadata */}
                      {isApproved && team.reviewedBy && (
                        <p className="text-[10px] font-mono text-slate-500">
                          Homologada por: <strong className="text-slate-400">{team.reviewedBy}</strong>
                        </p>
                      )}

                      {/* Admin Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApproveTeam(team)}
                                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Aprovar Equipe</span>
                              </button>

                              <button
                                onClick={() => handleOpenRejectTeamModal(team)}
                                className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Reprovar</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleOpenRejectTeamModal(team)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                            >
                              Revogar / Reprovar
                            </button>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => handleApproveTeam(team)}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold text-xs rounded-xl transition cursor-pointer"
                            >
                              Reavaliar e Aprovar
                            </button>
                          )}
                        </div>

                        {/* Delete Team Button */}
                        <button
                          onClick={() => handleDeleteTeam(team)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                          title="Excluir Equipe Permanentemente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* SECTION 4: CADASTROS & PESCADORES REGISTRADOS + CÓDIGOS ANTIFRAUDE */}
      {activeSection === 'fishermen' && canFishermen && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Sub-tab Switcher */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Cadastros & Códigos de Inscrição Antifraude</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Proteção Individual
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Gerencie pescadores cadastrados e emita códigos de participação individuais vinculados ao CPF para evitar uso indevido por terceiros.
              </p>
            </div>

            {/* Sub-tab buttons */}
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shrink-0">
              <button
                onClick={() => setFishermanSubTab('users')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  fishermanSubTab === 'users'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Pescadores ({allFishermenList.length})</span>
              </button>
              <button
                onClick={() => setFishermanSubTab('codes')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  fishermanSubTab === 'codes'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="h-4 w-4" />
                <span>Códigos Emitidos ({allTournamentCodes.length})</span>
              </button>
            </div>
          </div>

          {/* SUBTAB 1: PESCADORES CADASTRADOS & GERAR CÓDIGO */}
          {fishermanSubTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar por Nome, CPF, E-mail ou Apelido..."
                    value={searchFisherman}
                    onChange={(e) => setSearchFisherman(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  💡 Clique no botão <strong className="text-amber-400">"🔑 Gerar Código"</strong> para emitir uma credencial de acesso vinculada exclusivamente ao competidor.
                </div>
              </div>

              {allFishermenList.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                  Nenhum competidor ou cadastro encontrado.
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                          <th className="py-4 px-6">Pescador / Apelido</th>
                          <th className="py-4 px-4">CPF (Vinculado)</th>
                          <th className="py-4 px-4">E-mail</th>
                          <th className="py-4 px-4">Inscrições & Códigos</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-6 text-right">Gerar Código & Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allFishermenList.map((f) => {
                          const userCodes = allTournamentCodes.filter(c => 
                            c.assignedToUserId === f.uid || 
                            (c.assignedToUserEmail && c.assignedToUserEmail.toLowerCase() === f.email?.toLowerCase())
                          );
                          const paidCodesCount = userCodes.filter(c => c.paymentStatus === 'paid').length;

                          return (
                            <tr key={f.uid} className="border-b border-slate-800/80 text-slate-300 hover:bg-slate-800/30 transition">
                              {/* Name & Nickname */}
                              <td className="py-3.5 px-6 font-bold text-white">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-9 w-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-500/30">
                                    {f.displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="block text-slate-100">{f.fullName || f.displayName}</span>
                                    {f.nickname && (
                                      <span className="text-[10px] text-amber-400 font-mono font-normal block">
                                        @{f.nickname}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* CPF */}
                              <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                                {f.cpf ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-200">
                                    <CreditCard className="h-3 w-3 text-slate-400" />
                                    {f.cpf}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 italic">Não informado</span>
                                )}
                              </td>

                              {/* Email */}
                              <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                                {f.email}
                              </td>

                              {/* Assigned Codes summary */}
                              <td className="py-3.5 px-4">
                                {userCodes.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold inline-block w-fit">
                                      🎟️ {userCodes.length} código(s) emitido(s)
                                    </span>
                                    {paidCodesCount > 0 && (
                                      <span className="text-[9px] font-mono text-emerald-400">
                                        ✓ {paidCodesCount} com pagamento confirmado
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-500 italic">Sem códigos emitidos</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                                  f.status === 'blocked'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {f.status === 'blocked' ? 'Bloqueado' : 'Ativo'}
                                </span>
                              </td>

                              {/* Actions & Code Generation */}
                              <td className="py-3.5 px-6 text-right">
                                {f.uid === 'admin_master_root' ? (
                                  <span className="text-[10px] text-amber-400 font-mono font-bold">👑 Mestre Protegido</span>
                                ) : (
                                  <div className="flex items-center justify-end space-x-2">
                                    {/* Primary Button: Gerar Código Antifraude */}
                                    <button
                                      onClick={() => handleOpenAssignCode(f)}
                                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/40"
                                      title="Gerar código de participação vinculado exclusivamente a este usuário"
                                    >
                                      <Key className="h-3.5 w-3.5" />
                                      <span>Gerar Código</span>
                                    </button>

                                    <button
                                      onClick={() => handleOpenEditUser(f)}
                                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                      title="Editar Cadastro Completo"
                                    >
                                      <Edit3 className="h-3 w-3 text-sky-400" />
                                      <span>Editar</span>
                                    </button>

                                    <button
                                      onClick={() => handleToggleUserStatus(f)}
                                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        f.status === 'blocked'
                                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                      }`}
                                      title={f.status === 'blocked' ? 'Desbloquear / Reativar Pescador' : 'Bloquear Pescador'}
                                    >
                                      {f.status === 'blocked' ? 'Ativar' : 'Bloquear'}
                                    </button>

                                    <button
                                      onClick={() => handleDeleteUser(f)}
                                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                                      title="Excluir Cadastro Permanentemente"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 2: CÓDIGOS ATRIBUÍDOS & CONTROLE DE PAGAMENTOS ANTIFRAUDE */}
          {fishermanSubTab === 'codes' && (
            <div className="space-y-4">
              {/* Filters for codes */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar por código, pescador, CPF..."
                    value={searchCodeQuery}
                    onChange={(e) => setSearchCodeQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
                  {/* Tournament Filter */}
                  <select
                    value={codeTourneyFilter}
                    onChange={(e) => setCodeTourneyFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todos os Campeonatos</option>
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>

                  {/* Payment Filter */}
                  <select
                    value={codePaymentFilter}
                    onChange={(e: any) => setCodePaymentFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Status Pagamento: Todos</option>
                    <option value="paid">🟢 Confirmados / Pagos</option>
                    <option value="pending">🟡 Pendentes</option>
                    <option value="free">🆓 Grátis / Isentos</option>
                  </select>

                  {/* Usage Filter */}
                  <select
                    value={codeUsageFilter}
                    onChange={(e: any) => setCodeUsageFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Uso: Todos</option>
                    <option value="active">🟢 Ativos (Disponíveis)</option>
                    <option value="used">🔒 Já Consumidos / Utilizados</option>
                  </select>
                </div>
              </div>

              {/* Codes Table */}
              {allTournamentCodes.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                  Nenhum código de inscrição gerado até o momento. Volte para a aba "Pescadores" e clique em "Gerar Código".
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                          <th className="py-4 px-6">Código de Inscrição</th>
                          <th className="py-4 px-4">Pescador Atribuído</th>
                          <th className="py-4 px-4">Campeonato</th>
                          <th className="py-4 px-4">Status Pagamento</th>
                          <th className="py-4 px-4">Status de Uso</th>
                          <th className="py-4 px-6 text-right">Ações & Envio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTournamentCodes
                          .filter(c => {
                            const q = searchCodeQuery.toLowerCase();
                            const matchesQ = !q ||
                              (c.code && c.code.toLowerCase().includes(q)) ||
                              (c.assignedToUserName && c.assignedToUserName.toLowerCase().includes(q)) ||
                              (c.assignedToUserEmail && c.assignedToUserEmail.toLowerCase().includes(q)) ||
                              (c.assignedToUserCpf && c.assignedToUserCpf.toLowerCase().includes(q)) ||
                              (c.tournamentTitle && c.tournamentTitle.toLowerCase().includes(q));

                            const matchesT = codeTourneyFilter === 'all' || c.tournamentId === codeTourneyFilter;
                            const matchesP = codePaymentFilter === 'all' || c.paymentStatus === codePaymentFilter;
                            const matchesU = codeUsageFilter === 'all' || (codeUsageFilter === 'active' && !c.isUsed) || (codeUsageFilter === 'used' && c.isUsed);

                            return matchesQ && matchesT && matchesP && matchesU;
                          })
                          .map((codeItem) => {
                            const isPaid = codeItem.paymentStatus === 'paid';
                            const isPending = codeItem.paymentStatus === 'pending';
                            const isFree = codeItem.paymentStatus === 'free';

                            const ownerName = codeItem.assignedToUserName || 'Pescador Geral';
                            const ownerCpf = codeItem.assignedToUserCpf || '';
                            const tourneyTitle = codeItem.tournamentTitle || 'Torneio';

                            const statusText = isPaid ? '✅ Confirmado (Pago)' : isFree ? '🆓 Isento / Grátis' : '⏳ Aguardando Validação';
                            const whatsappMsg = `🏆 *PESCAESPORTE - CÓDIGO DE PARTICIPAÇÃO EXCLUSIVO*\n\nOlá *${ownerName}*!\n\nSeu código individual para o campeonato *${tourneyTitle}* foi gerado com proteção antifraude:\n\n🔑 *CÓDIGO DE INSCRIÇÃO:* ${codeItem.code}\n👤 *Pescador:* ${ownerName}\n📄 *CPF:* ${ownerCpf || 'Cadastrado no Sistema'}\n💰 *Status do Pagamento:* ${statusText}\n\n🔒 *AVISO DE SEGURANÇA:* Este código é intransferível e vinculado exclusivamente ao seu cadastro. Acesse o sistema e confirme sua inscrição!`;
                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

                            return (
                              <tr key={codeItem.id} className="border-b border-slate-800/80 text-slate-300 hover:bg-slate-800/30 transition">
                                {/* Code */}
                                <td className="py-3.5 px-6">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-extrabold text-amber-400 text-sm bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 tracking-wider">
                                      {codeItem.code}
                                    </span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(codeItem.code);
                                        setCopiedCodeVal(codeItem.id);
                                        setTimeout(() => setCopiedCodeVal(null), 2000);
                                      }}
                                      className="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer"
                                      title="Copiar Código"
                                    >
                                      {copiedCodeVal === codeItem.id ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* Assigned User */}
                                <td className="py-3.5 px-4 font-bold text-white">
                                  {codeItem.assignedToUserName ? (
                                    <div>
                                      <span className="block text-slate-100">{codeItem.assignedToUserName}</span>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono font-normal">
                                        {codeItem.assignedToUserCpf && (
                                          <span>CPF: {codeItem.assignedToUserCpf}</span>
                                        )}
                                        {codeItem.assignedToUserEmail && (
                                          <span className="truncate max-w-[140px]">• {codeItem.assignedToUserEmail}</span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 font-normal italic">Não vinculado a usuário</span>
                                  )}
                                </td>

                                {/* Tournament */}
                                <td className="py-3.5 px-4 font-bold text-slate-200">
                                  <span className="truncate block max-w-[180px]">{codeItem.tournamentTitle}</span>
                                </td>

                                {/* Payment Status */}
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                                      isPaid
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : isFree
                                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}>
                                      {isPaid ? '🟢 Confirmado' : isFree ? '🆓 Grátis / Isento' : '🟡 Pendente'}
                                    </span>

                                    {/* Quick toggle payment button */}
                                    <button
                                      onClick={() => handleToggleCodePayment(codeItem)}
                                      className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                                      title="Alternar entre Pago / Pendente"
                                    >
                                      {isPaid ? 'Pendente?' : 'Confirmar?'}
                                    </button>
                                  </div>
                                </td>

                                {/* Usage Status */}
                                <td className="py-3.5 px-4">
                                  {codeItem.isUsed ? (
                                    <div>
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                                        🔒 Já Utilizado
                                      </span>
                                      <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                                        Por: {codeItem.usedByUserName || codeItem.usedByUserEmail || 'Pescador'}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      🟢 Ativo / Disponível
                                    </span>
                                  )}
                                </td>

                                {/* Actions & WhatsApp Share */}
                                <td className="py-3.5 px-6 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <a
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                      title="Enviar código formatado via WhatsApp para o Pescador"
                                    >
                                      <MessageCircle className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">WhatsApp</span>
                                    </a>

                                    {!codeItem.isUsed && (
                                      <button
                                        onClick={() => handleDeleteCode(codeItem)}
                                        className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                                        title="Excluir Código"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: PALAVRAS-CHAVE ANTIFRAUDE */}
      {activeSection === 'antifraud' && canAntifraud && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-400">
                <Key className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gerenciamento de Palavras-Chave de Fases (Antifraude)</h3>
                <p className="text-slate-400 text-xs">
                  Atualize em tempo real a palavra-chave de medição para cada torneio ou fase classificatória.
                </p>
              </div>
            </div>

            {phaseKeyError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2.5">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{phaseKeyError}</span>
              </div>
            )}

            {phaseKeySuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>{phaseKeySuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePhaseKeyword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                  Selecione o Campeonato
                </label>
                <select
                  value={selectedTourneyForPhase}
                  onChange={(e) => {
                    setSelectedTourneyForPhase(e.target.value);
                    const found = tournaments.find(t => t.id === e.target.value);
                    if (found) setPhaseKeywordInput(found.keyword || '');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm cursor-pointer font-bold"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} (Chave Atual: {t.keyword || 'SEM CHAVE'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                    Nome da Fase / Rodada
                  </label>
                  <input
                    type="text"
                    value={phaseName}
                    onChange={(e) => setPhaseName(e.target.value)}
                    placeholder="Ex: Fase 1 - Classificatória Sábado"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-400 font-mono uppercase tracking-wider block">
                    Nova Palavra-Chave / Código Antifraude *
                  </label>
                  <input
                    type="text"
                    value={phaseKeywordInput}
                    onChange={(e) => setPhaseKeywordInput(e.target.value)}
                    placeholder="Ex: TUCUNA2026"
                    className="w-full bg-slate-950 border border-amber-500/40 text-amber-400 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-sm font-mono font-extrabold uppercase"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPhaseKey}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  <span>{isUpdatingPhaseKey ? 'Atualizando...' : 'Publicar Nova Palavra-Chave'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 6: MODERATORS & TEAM (Super Admin Exclusive) */}
      {activeSection === 'moderators' && canManageModerators && (
        <ModeratorManager
          currentUser={currentUser}
          registeredUsers={registeredUsers}
          onFlashMessage={showFlashMessage}
        />
      )}

      {/* MODAL: EDIT TOURNAMENT MODAL */}
      {editingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Edit3 className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Editar Dados do Campeonato</h3>
              </div>
              <button
                onClick={() => setEditingTournament(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTournamentEditClick} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Nome do Campeonato</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Descrição Geral</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status Flag */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Status do Campeonato</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="upcoming">⏳ Em Breve (Futuro)</option>
                  <option value="active">🟢 Ativo (Em Andamento)</option>
                  <option value="completed">🏁 Encerrado / Histórico</option>
                </select>
              </div>

              {/* Grid 2 cols: Keyword and Prize */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Chave Antifraude</label>
                  <input
                    type="text"
                    value={editKeyword}
                    onChange={(e) => setEditKeyword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold rounded-xl px-4 py-2 text-xs uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Prêmio (R$)</label>
                  <input
                    type="number"
                    value={editPrizeValue}
                    onChange={(e) => setEditPrizeValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Descrição dos Prêmios</label>
                <input
                  type="text"
                  value={editPrize}
                  onChange={(e) => setEditPrize(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Data Início</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Data Término</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingTournament(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER (FISHERMAN) MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Edit3 className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Editar Cadastro do Pescador</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase">CPF</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={editCpf}
                      onChange={(e) => setEditCpf(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Apelido de Pesca</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Endereço / Cidade e Estado</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">Status do Cadastro</label>
                <select
                  value={editUserStatusVal}
                  onChange={(e: any) => setEditUserStatusVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="active">Ativo (🟢 Liberado para login e submissões)</option>
                  <option value="blocked">Bloqueado (🛑 Suspenso de participar)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-extrabold transition cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Dados do Pescador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PHOTO ZOOM / AUDITOR LIGHTBOX */}
      {previewImageModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ZoomIn className="h-4 w-4 text-sky-400" />
                <span>Auditoria Fotográfica da Medição & Chave Antifraude</span>
              </div>
              <button
                onClick={() => setPreviewImageModalUrl(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
              <img
                src={previewImageModalUrl}
                alt="Auditoria de Medição"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-xl border border-slate-800"
              />
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
              Verifique alinhamento da boca na marca zero da régua, cauda aberta/fechada e visibilidade da chave antifraude.
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPROVAR / DESCLASSIFICAR COM MOTIVO DE REGULAMENTO */}
      {rejectingCatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <XCircle className="h-5 w-5 text-rose-400" />
                <span>Reprovação / Desclassificação de Captura</span>
              </div>
              <button
                onClick={() => setRejectingCatch(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-500 uppercase font-mono block text-[10px]">Captura Selecionada:</span>
                <strong className="text-white text-sm">{rejectingCatch.species} ({rejectingCatch.length} cm)</strong>
                <span className="text-slate-400 font-mono block mt-0.5">Pescador: {rejectingCatch.userName || rejectingCatch.userEmail}</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Motivo de Infração ao Regulamento:
                </label>
                <select
                  value={selectedRejectReason}
                  onChange={(e) => setSelectedRejectReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {RULE_VIOLATION_PRESETS.map((preset, idx) => (
                    <option key={idx} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Instruções Adicionais ao Pescador (Opcional):
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Foto muito escura no foco da régua. Por favor envie novo exemplar com régua iluminada..."
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectingCatch(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejectCatch}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-950/40"
                >
                  Confirmar Reprovação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ATRIBUIR CÓDIGO INDIVIDUAL A PESCADOR (ANTIFRAUDE) */}
      {assigningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Gerar Código Antifraude</h3>
                  <p className="text-xs text-slate-400">Vinculado exclusivamente a este competidor</p>
                </div>
              </div>
              <button
                onClick={() => setAssigningUser(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Fisherman Summary Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/30">
                  {assigningUser.displayName?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{assigningUser.fullName || assigningUser.displayName}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>CPF: <strong className="text-slate-200">{assigningUser.cpf || 'Não informado'}</strong></span>
                    <span>•</span>
                    <span className="truncate">{assigningUser.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleGenerateAssignedCode} className="space-y-4">
              {/* Select Tournament */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">
                  Campeonato de Destino
                </label>
                <select
                  value={assignTourneyId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setAssignTourneyId(tId);
                    const selectedT = tournaments.find(t => t.id === tId);
                    if (selectedT) {
                      const isPaid = selectedT.entryFeeType === 'pago';
                      setAssignPaymentStatus(isPaid ? 'paid' : 'free');
                      setAssignPaymentAmount(selectedT.entryFeeAmount ? String(selectedT.entryFeeAmount) : '0');
                    }
                  }}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.entryFeeType === 'pago' ? `Taxa: R$ ${t.entryFeeAmount || 0}` : 'Inscrição Gratuita'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase">
                    Status do Pagamento
                  </label>
                  <select
                    value={assignPaymentStatus}
                    onChange={(e: any) => setAssignPaymentStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="paid">🟢 Pago / Confirmado</option>
                    <option value="pending">🟡 Pendente / Aguardando</option>
                    <option value="free">🆓 Grátis / Isento</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase">
                    Valor Pago (R$)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="number"
                      value={assignPaymentAmount}
                      onChange={(e) => setAssignPaymentAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase">
                  Observações do Pagamento / Comprovante
                </label>
                <input
                  type="text"
                  placeholder="Ex: PIX recebido em 21/08 - Comprovante autenticado"
                  value={assignPaymentNotes}
                  onChange={(e) => setAssignPaymentNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Suggested / Custom Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 font-mono uppercase">
                    Código Gerado para o Usuário
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const cpfDigits = assigningUser.cpf ? assigningUser.cpf.replace(/\D/g, '').slice(-4) : 'USR';
                      setAssignCustomCode(generateUniqueTournamentCode(`TRN-${cpfDigits}`));
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Recalcular</span>
                  </button>
                </div>

                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-amber-400" />
                  <input
                    type="text"
                    value={assignCustomCode}
                    onChange={(e) => setAssignCustomCode(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono font-extrabold tracking-wider rounded-xl pl-9 pr-4 py-2 text-sm uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  🔒 Este código só poderá ser ativado por este pescador cadastrado.
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAssigningUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAssignedCode}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-amber-950/40 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isGeneratingAssignedCode ? (
                    <span>Emitindo Código...</span>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      <span>Emitir & Vincular ao Pescador</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUCESSO - CÓDIGO GERADO COM LINK DO WHATSAPP */}
      {generatedCodeSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-scale-up">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Código Emitido com Sucesso!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Atribuído exclusivamente a <strong className="text-white">{generatedCodeSuccess.userName}</strong>
              </p>
            </div>

            {/* Code Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Código de Inscrição:</span>
              <span className="font-mono font-extrabold text-2xl text-amber-400 tracking-wider block selection:bg-amber-500 selection:text-slate-950">
                {generatedCodeSuccess.code}
              </span>
              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
                <span>{generatedCodeSuccess.tournamentTitle}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{generatedCodeSuccess.paymentStatus}</span>
              </div>
            </div>

            {/* Actions: WhatsApp Direct Send & Copy */}
            <div className="space-y-2.5">
              <a
                href={generatedCodeSuccess.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Enviar Código via WhatsApp para o Pescador</span>
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCodeSuccess.code);
                  showFlashMessage('📋 Código copiado para a área de transferência!', 'success');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="h-4 w-4 text-sky-400" />
                <span>Copiar Código</span>
              </button>

              <button
                onClick={() => setGeneratedCodeSuccess(null)}
                className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-mono transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJEITAR / REPROVAR EQUIPE */}
      {rejectingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reprovar Equipe</h3>
                  <p className="text-xs text-slate-400">"{rejectingTeam.name}" ({rejectingTeam.code})</p>
                </div>
              </div>
              <button
                onClick={() => setRejectingTeam(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase block">
                Motivo da Reprovação (visível para o capitão da equipe):
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Nome da equipe inadequado, logotipo com baixa qualidade ou infração às diretrizes."
                value={teamRejectReason}
                onChange={(e) => setTeamRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setRejectingTeam(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectTeam}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-950/40"
              >
                Confirmar Reprovação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmDialog && (
        <ConfirmationModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          cancelLabel={confirmDialog.cancelLabel}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
