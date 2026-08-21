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
  CheckSquare
} from 'lucide-react';
import { Catch, Tournament, UserProfile } from '../types';
import { 
  updateCatchStatus, 
  createTournament, 
  updateTournament, 
  deleteTournament, 
  deleteCatch, 
  subscribeUsers, 
  updateUserStatus, 
  deleteUser, 
  updateUser 
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
  const getInitialSection = (): 'moderation' | 'tournaments' | 'create_tournament' | 'fishermen' | 'antifraud' | 'moderators' => {
    if (canModerate) return 'moderation';
    if (canTournaments) return 'tournaments';
    if (canFishermen) return 'fishermen';
    if (canAntifraud) return 'antifraud';
    if (canManageModerators) return 'moderators';
    return 'moderation';
  };

  const [activeSection, setActiveSection] = useState<'moderation' | 'tournaments' | 'create_tournament' | 'fishermen' | 'antifraud' | 'moderators'>(getInitialSection());
  
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

  // Tournament creation states
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
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editUserStatusVal, setEditUserStatusVal] = useState<'active' | 'blocked'>('active');

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

  const showFlashMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => {
      setActionMessage(null);
    }, 4500);
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
          await createTournament({
            title: title.trim(),
            description: description.trim(),
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
            imageUrl: imageUrl
          });

          setFormSuccess('Campeonato criado com sucesso no Firestore!');
          showFlashMessage('Novo campeonato publicado com sucesso!', 'success');
          
          // Reset form
          setTitle('');
          setDescription('');
          setRulesText('');
          setPrize('');
          setPrizeValue('');
          setKeyword('');
          setEntryFeeAmount('');
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
            <button
              onClick={() => setActiveSection('fishermen')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeSection === 'fishermen'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Pescadores ({allFishermenList.length})</span>
            </button>
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

      {/* SECTION 3: CREATE TOURNAMENT FORM */}
      {activeSection === 'create_tournament' && canTournaments && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cadastrar Novo Campeonato</h3>
              <p className="text-slate-400 text-xs">Crie novas arenas nacionais integradas com validadores antifraude.</p>
            </div>
          </div>

          <form onSubmit={handleCreateTournamentClick} className="space-y-6">
            {formError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2.5">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                  Nome do Torneio *
                </label>
                <input
                  type="text"
                  placeholder="Ex: II Torneio Nacional do Tucunaré Azul"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                  Descrição do Campeonato *
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o propósito, as bacias hidrográficas válidas e regras gerais..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Status Selection Flag */}
            <div className="p-4 sm:p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-amber-400" />
                <span>Status Inicial do Torneio</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('upcoming')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                    status === 'upcoming'
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⏳ Em Breve (Futuro)</span>
                  {status === 'upcoming' && <Check className="h-4 w-4 text-sky-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                    status === 'active'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🟢 Ativo (Em Andamento)</span>
                  {status === 'active' && <Check className="h-4 w-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                    status === 'completed'
                      ? 'bg-slate-700/40 border-slate-600 text-slate-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🏁 Encerrado (Histórico)</span>
                  {status === 'completed' && <Check className="h-4 w-4 text-slate-300" />}
                </button>
              </div>
            </div>

            {/* SETTINGS: Format, Fee, and Prize */}
            <div className="p-4 sm:p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                Configurações do Torneio (Formato, Valor Inscrição e Prêmios)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-sky-400" />
                    <span>Formato de Pescadores</span>
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

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Tipo de Inscrição</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setEntryFeeType('gratis');
                        setEntryFeeAmount('');
                      }}
                      className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition cursor-pointer ${
                        entryFeeType === 'gratis'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      Pago
                    </button>
                  </div>
                </div>

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
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 text-xs disabled:opacity-30 disabled:cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* VALUE & DESCRIPTION OF THE PRIZE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-900 pt-3.5">
                <div className="space-y-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    <span>Valor em Prêmios (R$)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 25000"
                    value={prizeValue}
                    onChange={(e) => setPrizeValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider block flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span>Descrição Completa da Premiação</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1º: Barco Alumínio 6m + Motor 15HP, 2º: Motor Elétrico, 3º: Kit Carretilha"
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
                  Para evitar fotos antigas ou adulteradas, crie um **Código ou Palavra-Chave específico**. O competidor deverá fotografar o peixe com uma plaquinha contendo este código legível.
                </p>
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase block">Palavra-Chave Ativa</label>
                <input
                  type="text"
                  placeholder="Ex: TUCUNA2026"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/30 text-amber-400 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 text-xs sm:text-sm text-center uppercase font-mono font-extrabold tracking-wider"
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
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-mono"
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
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Species Target */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                Espécies Alvo (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Tucunaré Azul, Tucunaré Amarelo, Tucunaré Paca"
                value={targetSpeciesInput}
                onChange={(e) => setTargetSpeciesInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-mono"
              />
            </div>

            {/* Cover Image Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                Foto de Capa do Campeonato
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {IMAGE_PRESETS.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setImageUrl(p.url)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                      imageUrl === p.url ? 'border-amber-500 scale-[1.02]' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.name} referrerPolicy="no-referrer" className="h-20 w-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/40 p-1 flex items-end">
                      <span className="text-[10px] font-bold text-white truncate">{p.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Salvando no Firestore...</span>
                ) : (
                  <>
                    <PlusCircle className="h-5 w-5" />
                    <span>Publicar Campeonato Oficial</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 4: CADASTROS & PESCADORES REGISTRADOS */}
      {activeSection === 'fishermen' && canFishermen && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2">
            <div>
              <h3 className="text-xl font-bold text-white">Cadastros & Pescadores Esportivos ({allFishermenList.length})</h3>
              <p className="text-xs text-slate-400 mt-0.5">Gerenciamento completo: ative, bloqueie, edite ou exclua perfis cadastrados no sistema.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por Nome, CPF, E-mail ou Apelido..."
                value={searchFisherman}
                onChange={(e) => setSearchFisherman(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500"
              />
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
                      <th className="py-4 px-4">CPF</th>
                      <th className="py-4 px-4">E-mail</th>
                      <th className="py-4 px-4">Endereço</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Ações de Controle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFishermenList.map((f) => (
                      <tr key={f.uid} className="border-b border-slate-800/80 text-slate-300 hover:bg-slate-800/30 transition">
                        {/* Name & Nickname */}
                        <td className="py-3.5 px-6 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {f.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="block">{f.fullName || f.displayName}</span>
                              {f.nickname && (
                                <span className="text-[10px] text-sky-400 font-mono font-normal">
                                  Apelido: @{f.nickname}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* CPF */}
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          {f.cpf ? f.cpf : <span className="text-slate-600 italic">Não informado</span>}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                          {f.email}
                        </td>

                        {/* Address */}
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {f.address ? f.address : <span className="text-slate-600 italic">Não informado</span>}
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

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right">
                          {f.uid === 'admin_master_root' ? (
                            <span className="text-[10px] text-amber-400 font-mono font-bold">👑 Mestre Protegido</span>
                          ) : (
                            <div className="flex items-center justify-end space-x-2">
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
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
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
                    ))}
                  </tbody>
                </table>
              </div>
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
