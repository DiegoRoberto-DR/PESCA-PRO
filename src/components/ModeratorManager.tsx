import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Check, 
  X, 
  Trash2, 
  Lock, 
  Mail, 
  User, 
  Key, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  CheckCircle2, 
  Shield, 
  Users, 
  Trophy, 
  Clock, 
  Edit3,
  UserCheck,
  UserX
} from 'lucide-react';
import { UserProfile, UserPermissions } from '../types';
import { registerModerator, deleteUser, updateUserStatus, updateUser } from '../utils/dbHelpers';
import ConfirmationModal from './ConfirmationModal';

interface ModeratorManagerProps {
  currentUser: UserProfile | null;
  registeredUsers: UserProfile[];
  onFlashMessage: (msg: string, type: 'success' | 'error') => void;
}

export default function ModeratorManager({
  currentUser,
  registeredUsers,
  onFlashMessage
}: ModeratorManagerProps) {
  // New Moderator Form State
  const [modName, setModName] = useState('');
  const [modEmail, setModEmail] = useState('');
  const [modPassword, setModPassword] = useState('');
  const [canModerateCatches, setCanModerateCatches] = useState(true);
  const [canManageTournaments, setCanManageTournaments] = useState(true);
  const [canManageFishermen, setCanManageFishermen] = useState(true);
  const [canManageAntifraud, setCanManageAntifraud] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit Permissions Modal State
  const [editingMod, setEditingMod] = useState<UserProfile | null>(null);
  const [editPermModerate, setEditPermModerate] = useState(true);
  const [editPermTournaments, setEditPermTournaments] = useState(true);
  const [editPermFishermen, setEditPermFishermen] = useState(true);
  const [editPermAntifraud, setEditPermAntifraud] = useState(true);
  const [isSavingPerms, setIsSavingPerms] = useState(false);

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

  // Filter moderators from registered users
  const moderatorsList = registeredUsers.filter(u => u.role === 'moderator');

  const handleSelectAll = (select: boolean) => {
    setCanModerateCatches(select);
    setCanManageTournaments(select);
    setCanManageFishermen(select);
    setCanManageAntifraud(select);
  };

  const handleCreateModeratorClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!modName.trim()) {
      setFormError('Por favor, informe o nome do moderador.');
      return;
    }
    if (!modEmail.trim()) {
      setFormError('Por favor, informe o e-mail ou login de acesso.');
      return;
    }
    if (!modPassword.trim() || modPassword.length < 4) {
      setFormError('A senha de acesso deve conter pelo menos 4 caracteres.');
      return;
    }

    const selectedCount = [canModerateCatches, canManageTournaments, canManageFishermen, canManageAntifraud].filter(Boolean).length;
    if (selectedCount === 0) {
      setFormError('Selecione ao menos 1 função permitida para este moderador.');
      return;
    }

    // Trigger safety confirmation dialog
    setConfirmDialog({
      isOpen: true,
      title: 'Cadastrar Novo Moderador',
      message: `Tem certeza que deseja cadastrar o moderador "${modName.trim()}" (${modEmail.trim()}) com as ${selectedCount} permissões selecionadas?`,
      confirmLabel: 'Sim, Cadastrar Moderador',
      variant: 'primary',
      onConfirm: executeCreateModerator
    });
  };

  const executeCreateModerator = async () => {
    setConfirmDialog(null);
    try {
      setIsSubmitting(true);
      setFormError('');

      await registerModerator({
        displayName: modName.trim(),
        email: modEmail.trim(),
        password: modPassword.trim(),
        permissions: {
          canModerateCatches,
          canManageTournaments,
          canManageFishermen,
          canManageAntifraud
        }
      });

      setFormSuccess(`Moderador "${modName.trim()}" cadastrado com sucesso!`);
      onFlashMessage(`✅ Moderador "${modName.trim()}" cadastrado com sucesso!`, 'success');

      // Reset form
      setModName('');
      setModEmail('');
      setModPassword('');
      setCanModerateCatches(true);
      setCanManageTournaments(true);
      setCanManageFishermen(true);
      setCanManageAntifraud(true);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao cadastrar moderador.');
      onFlashMessage(`Erro: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (mod: UserProfile) => {
    if (mod.uid === 'admin_master_root') {
      onFlashMessage('Acesso Negado: O Administrador Geral não pode ser bloqueado.', 'error');
      return;
    }

    const nextStatus = mod.status === 'blocked' ? 'active' : 'blocked';
    const actionText = nextStatus === 'active' ? 'reativar o acesso' : 'suspender/bloquear o acesso';

    setConfirmDialog({
      isOpen: true,
      title: nextStatus === 'active' ? 'Reativar Moderador' : 'Bloquear Moderador',
      message: `Tem certeza que deseja ${actionText} do moderador "${mod.displayName}"?`,
      confirmLabel: nextStatus === 'active' ? 'Sim, Reativar' : 'Sim, Bloquear',
      variant: nextStatus === 'active' ? 'success' : 'warning',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await updateUserStatus(mod.uid, nextStatus);
          onFlashMessage(`Status de "${mod.displayName}" alterado para ${nextStatus === 'active' ? 'Ativo' : 'Bloqueado'}!`, 'success');
        } catch (e: any) {
          onFlashMessage('Erro ao alterar status: ' + e.message, 'error');
        }
      }
    });
  };

  const handleDeleteModerator = (mod: UserProfile) => {
    if (mod.uid === 'admin_master_root') {
      onFlashMessage('Acesso Negado: O Administrador Geral é a conta mestre e não pode ser excluído.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Moderador',
      message: `Tem certeza que deseja EXCLUIR DEFINITIVAMENTE o acesso do moderador "${mod.displayName}" (${mod.email})? Ele perderá todo o acesso administrativo.`,
      confirmLabel: 'Sim, Excluir Definitivamente',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteUser(mod.uid);
          onFlashMessage(`🗑️ Moderador "${mod.displayName}" excluído com sucesso.`, 'success');
        } catch (e: any) {
          onFlashMessage('Erro ao excluir moderador: ' + e.message, 'error');
        }
      }
    });
  };

  const handleOpenEditPermissions = (mod: UserProfile) => {
    if (mod.uid === 'admin_master_root') {
      onFlashMessage('O Administrador Geral já possui todas as permissões do sistema permanentemente.', 'error');
      return;
    }

    setEditingMod(mod);
    setEditPermModerate(Boolean(mod.permissions?.canModerateCatches));
    setEditPermTournaments(Boolean(mod.permissions?.canManageTournaments));
    setEditPermFishermen(Boolean(mod.permissions?.canManageFishermen));
    setEditPermAntifraud(Boolean(mod.permissions?.canManageAntifraud));
  };

  const handleSaveEditedPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMod) return;

    try {
      setIsSavingPerms(true);
      await updateUser(editingMod.uid, {
        permissions: {
          canModerateCatches: editPermModerate,
          canManageTournaments: editPermTournaments,
          canManageFishermen: editPermFishermen,
          canManageAntifraud: editPermAntifraud
        }
      });

      onFlashMessage(`✅ Permissões de "${editingMod.displayName}" atualizadas com sucesso!`, 'success');
      setEditingMod(null);
    } catch (e: any) {
      onFlashMessage('Erro ao atualizar permissões: ' + e.message, 'error');
    } finally {
      setIsSavingPerms(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Gestão de Acessos & Permissões Granulares</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">Equipe de Moderadores & Árbitros</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre novos moderadores definindo exatamente quais funções cada membro terá acesso.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Create New Moderator Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Adicionar Novo Moderador</h4>
              <p className="text-[11px] text-slate-400 font-mono">Defina o login e selecione as permissões</p>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateModeratorClick} className="space-y-4">
            {/* Moderator Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                Nome do Moderador / Árbitro *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Ex: Roberto Coordenador de Prova"
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Email / Login */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                E-mail ou Login de Acesso *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Ex: juiz.roberto@gmail.com"
                  value={modEmail}
                  onChange={(e) => setModEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                Senha de Acesso *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Defina uma senha (ex: 123456)"
                  value={modPassword}
                  onChange={(e) => setModPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Permissions Checkbox Selection */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Funções e Acessos Permitidos:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(true)}
                    className="text-[10px] text-sky-400 hover:underline font-mono font-bold cursor-pointer"
                  >
                    Marcar Todas
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    className="text-[10px] text-slate-400 hover:underline font-mono cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                {/* 1. Homologação */}
                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={canModerateCatches}
                    onChange={(e) => setCanModerateCatches(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>Homologação e Moderação de Capturas</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Aprovar, rejeitar com justificativa de regulamento e auditar fotos/chaves de medição.
                    </p>
                  </div>
                </label>

                {/* 2. Gerenciamento de Campeonatos */}
                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={canManageTournaments}
                    onChange={(e) => setCanManageTournaments(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Trophy className="h-3.5 w-3.5 text-sky-400" />
                      <span>Gerenciamento de Campeonatos</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Cadastrar novos torneios, editar regulamentos, mudar status (Ativo/Encerrado/Em Breve) ou excluir.
                    </p>
                  </div>
                </label>

                {/* 3. Gestão de Pescadores */}
                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={canManageFishermen}
                    onChange={(e) => setCanManageFishermen(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Users className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Gestão de Pescadores e Cadastros</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Consultar lista de inscritos, editar dados do pescador e bloquear/reativar acessos.
                    </p>
                  </div>
                </label>

                {/* 4. Chaves Antifraude */}
                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={canManageAntifraud}
                    onChange={(e) => setCanManageAntifraud(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Key className="h-3.5 w-3.5 text-orange-400" />
                      <span>Gestão de Chaves Antifraude</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Gerar e atualizar as palavras-chave de segurança das fases dos torneios.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/40 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isSubmitting ? 'Cadastrando...' : 'Cadastrar Moderador'}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: List of Moderators & Master Admin */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              <span>Membros com Acesso Administrativo ({moderatorsList.length + 1})</span>
            </h4>
          </div>

          {/* Master Admin Card (Always on Top & Protected) */}
          <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-amber-500/30">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-base font-extrabold text-white">Administrador Geral</h5>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-mono font-bold uppercase">
                      Proprietário Master
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-300">admin@pescaesporte.com (ou login Admin)</p>
                  <p className="text-[11px] text-amber-400/90 mt-1 font-medium">
                    🛡️ Conta mestre protegida: possui autoridade total sobre todas as funções e não pode ser excluída.
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end gap-1.5 text-right">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  🟢 Acesso Irrestrito
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Imutável</span>
              </div>
            </div>
          </div>

          {/* List of Created Moderators */}
          {moderatorsList.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-2">
              <UserPlus className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                Nenhum moderador adicional cadastrado ainda.
              </p>
              <p className="text-[11px] text-slate-500">
                Utilize o formulário ao lado para adicionar membros à comissão de arbitragem.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {moderatorsList.map((mod) => (
                <div 
                  key={mod.uid}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-2xl p-4.5 shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                        {mod.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{mod.displayName}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            mod.status === 'blocked'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}>
                            {mod.status === 'blocked' ? 'Bloqueado' : 'Moderador Ativo'}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400 block">{mod.email}</span>
                      </div>
                    </div>

                    {/* Permissions Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-10">
                      {mod.permissions?.canModerateCatches && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md font-mono flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> Moderação
                        </span>
                      )}
                      {mod.permissions?.canManageTournaments && (
                        <span className="text-[10px] px-2 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-md font-mono flex items-center gap-1">
                          <Trophy className="h-2.5 w-2.5" /> Campeonatos
                        </span>
                      )}
                      {mod.permissions?.canManageFishermen && (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md font-mono flex items-center gap-1">
                          <Users className="h-2.5 w-2.5" /> Pescadores
                        </span>
                      )}
                      {mod.permissions?.canManageAntifraud && (
                        <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-300 border border-orange-500/20 rounded-md font-mono flex items-center gap-1">
                          <Key className="h-2.5 w-2.5" /> Antifraude
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPermissions(mod)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Editar Permissões"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-sky-400" />
                      <span>Funções</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(mod)}
                      className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        mod.status === 'blocked'
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                      }`}
                      title={mod.status === 'blocked' ? 'Reativar Moderador' : 'Bloquear Moderador'}
                    >
                      {mod.status === 'blocked' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteModerator(mod)}
                      className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                      title="Excluir Moderador Permanentemente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: EDIT MODERATOR PERMISSIONS */}
      {editingMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <span>Editar Funções do Moderador</span>
              </div>
              <button
                onClick={() => setEditingMod(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-500 uppercase font-mono block text-[10px]">Moderador:</span>
              <strong className="text-white text-sm">{editingMod.displayName}</strong>
              <span className="text-slate-400 font-mono block mt-0.5">{editingMod.email}</span>
            </div>

            <form onSubmit={handleSaveEditedPermissions} className="space-y-4">
              <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermModerate}
                    onChange={(e) => setEditPermModerate(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Homologação de Capturas</span>
                    <span className="text-[10px] text-slate-400">Aprovar e desclassificar fotos enviadas</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermTournaments}
                    onChange={(e) => setEditPermTournaments(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Gerenciamento de Campeonatos</span>
                    <span className="text-[10px] text-slate-400">Criar, editar, encerrar ou excluir torneios</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermFishermen}
                    onChange={(e) => setEditPermFishermen(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Gestão de Pescadores</span>
                    <span className="text-[10px] text-slate-400">Editar e bloquear cadastros</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermAntifraud}
                    onChange={(e) => setEditPermAntifraud(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Chaves Antifraude</span>
                    <span className="text-[10px] text-slate-400">Gerar e atualizar chaves das fases</span>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingMod(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPerms}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer"
                >
                  {isSavingPerms ? 'Salvando...' : 'Salvar Permissões'}
                </button>
              </div>
            </form>
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
