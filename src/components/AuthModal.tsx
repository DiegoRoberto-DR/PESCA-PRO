import React, { useState } from 'react';
import { User, Mail, MapPin, Check, Shield, Anchor, X, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

export default function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [role, setRole] = useState<'participant' | 'admin'>('participant');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Por favor, informe seu nome ou apelido de pesca.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Informe um e-mail válido.');
      return;
    }
    if (role === 'participant' && !city.trim()) {
      setFormError('Informe sua cidade e estado para registro no mapa nacional.');
      return;
    }
    if (role === 'admin') {
      if (password.trim() !== '121713#3') {
        setFormError('Acesso recusado: Senha administrativa de Coordenador incorreta.');
        return;
      }
    }

    const mockProfileId = 'usr_' + Math.random().toString(36).substr(2, 9);
    const mockProfile: UserProfile = {
      uid: mockProfileId,
      displayName: name.trim(),
      email: email.trim().toLowerCase(),
      role: role,
      photoURL: "",
      createdAt: new Date().toISOString()
    };

    onLogin(mockProfile);
    onClose();
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 bg-slate-950/60 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-2 text-center">
          <div className="inline-flex p-3 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-2xl text-white shadow-lg shadow-sky-500/10 mb-4">
            <Anchor className="h-6 w-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Criar Perfil de Pesca</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Configure seu perfil agora para participar dos rankings e submeter suas capturas.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Role selection toggle */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wider block">Estilo de Acesso</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Participant */}
              <button
                type="button"
                onClick={() => {
                  setRole('participant');
                  if (name === 'Coordenador Master') setName('');
                }}
                className={`py-3 px-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'participant'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-bold shadow-md shadow-sky-500/5'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <User className="h-4.5 w-4.5" />
                <span className="text-xs">Pescador Esportivo</span>
              </button>

              {/* Coordinator (Admin) */}
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setName('Coordenador Master');
                  setCity('Sede Nacional');
                }}
                className={`py-3 px-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'admin'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold shadow-md shadow-amber-500/5'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <Shield className="h-4.5 w-4.5" />
                <span className="text-xs">Coordenador (Modera)</span>
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wider block">Nome do Participante</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Ex: Pedro de Alcântara"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs sm:text-sm text-slate-200"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wider block">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
              <input
                type="email"
                placeholder="Ex: pedro@pesca.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs sm:text-sm text-slate-200"
              />
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Usado para identificar de forma única suas capturas.</span>
          </div>

          {/* Location details (show dynamic context for standard competitors) */}
          {role === 'participant' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wider block">Cidade e Estado</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Ex: Piracicaba - SP"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-sky-500 text-xs sm:text-sm text-slate-200"
                />
              </div>
              <span className="text-[9px] text-slate-500 font-mono">Qualquer local de partida.</span>
            </div>
          )}

          {/* Password field for admin moderator access */}
          {role === 'admin' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-amber-500 font-mono uppercase tracking-wider block">Senha de Acesso Coordenador</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-3 text-amber-500 h-4 w-4" />
                <input
                  type="password"
                  placeholder="Digite a senha (121713#3)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/30 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 text-xs sm:text-sm text-slate-200 font-mono"
                />
              </div>
              <span className="text-[9px] text-slate-500 font-mono">Senha requerida: <strong className="text-amber-400">121713#3</strong></span>
            </div>
          )}

          {/* Guidelines info */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed font-mono">
            💡 <strong>Dica de Teste:</strong> Escolha <strong>Coordenador</strong> se quiser simular a aprovação técnica das fotos enviadas por outros usuários. Escolha <strong>Pescador</strong> para enviar capturas e figurar no placar de líderes nacionais.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-440 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-500/10 active:scale-[0.99] transition cursor-pointer text-center"
          >
            Começar a Participar
          </button>
        </form>
      </div>
    </div>
  );
}
