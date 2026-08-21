import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Lock, 
  CreditCard, 
  Tag, 
  Anchor, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  LogIn, 
  UserPlus,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile } from '../types';
import { registerFisherman, authenticateUser } from '../utils/dbHelpers';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ onClose, onLogin, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States (strictly for fishermen)
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nickname, setNickname] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Format CPF helper (000.000.000-00)
  const handleCpfChange = (value: string) => {
    const numeric = value.replace(/\D/g, '').slice(0, 11);
    let formatted = numeric;
    if (numeric.length > 9) {
      formatted = `${numeric.slice(0, 3)}.${numeric.slice(3, 6)}.${numeric.slice(6, 9)}-${numeric.slice(9, 11)}`;
    } else if (numeric.length > 6) {
      formatted = `${numeric.slice(0, 3)}.${numeric.slice(3, 6)}.${numeric.slice(6)}`;
    } else if (numeric.length > 3) {
      formatted = `${numeric.slice(0, 3)}.${numeric.slice(3)}`;
    }
    setCpf(formatted);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Por favor, informe seu e-mail ou usuário de acesso.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage('Por favor, informe sua senha.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authenticateUser(loginIdentifier, loginPassword);
      if (result.success && result.user) {
        setSuccessMessage(`Bem-vindo, ${result.user.displayName}!`);
        setTimeout(() => {
          onLogin(result.user!);
          onClose();
        }, 500);
      } else {
        setErrorMessage(result.error || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit (Fisherman only)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validations
    if (!fullName.trim()) {
      setErrorMessage('Por favor, informe seu Nome Completo.');
      return;
    }
    if (!cpf.trim() || cpf.replace(/\D/g, '').length < 11) {
      setErrorMessage('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Por favor, informe seu endereço ou Cidade/UF.');
      return;
    }
    if (!nickname.trim()) {
      setErrorMessage('Por favor, informe um apelido de pesca (ex: Zé da Pesca, Pescador do Vale).');
      return;
    }
    if (!registerPassword.trim() || registerPassword.length < 4) {
      setErrorMessage('A senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await registerFisherman({
        fullName: fullName.trim(),
        cpf: cpf.trim(),
        email: email.trim(),
        address: address.trim(),
        nickname: nickname.trim(),
        password: registerPassword.trim()
      });

      setSuccessMessage('Cadastro realizado com sucesso! Conectando...');
      setTimeout(() => {
        onLogin(newUser);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 bg-slate-950/60 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer z-10"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 text-center border-b border-slate-800/80 bg-slate-950/40">
          <div className="inline-flex p-3 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-2xl text-white shadow-lg shadow-sky-500/10 mb-3">
            <Anchor className="h-6 w-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Acesso ao PescaEsporte' : 'Cadastro de Pescador Esportivo'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {mode === 'login' 
              ? 'Entre com seu e-mail e senha para enviar capturas e acompanhar seu perfil.' 
              : 'Preencha seus dados para concorrer nos torneios e figurar nos rankings oficiais.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Já sou cadastrado (Entrar)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Criar Perfil de Pesca</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Seu e-mail cadastrado"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                    Senha
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Sua senha cadastrada"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Conectando...</span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                >
                  Novo por aqui? Clique aqui para criar seu Perfil de Pesca
                </button>
              </div>
            </form>
          ) : (
            /* 2. REGISTRATION FORM (Strictly for Fishermen) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Nome Completo */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Grid: CPF & Apelido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CPF */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                    CPF *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-mono focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Apelido de Pesca */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                    Apelido de Pesca *
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Ex: Carlão Tucuna"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                  <input
                    type="email"
                    placeholder="seu.email@provedor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition"
                  />
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Você usará este e-mail para fazer login.</span>
              </div>

              {/* Endereço */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                  Endereço / Cidade e Estado *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Ex: Rua das Palmeiras, 120 - Piracicaba/SP"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Grid: Senha e Confirmar Senha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="Mínimo 4 dígitos"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 rounded-xl pl-10 pr-10 py-2 text-xs focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showRegisterPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider block">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-500 h-4 w-4" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="Repita sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Criando seu perfil...</span>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Concluir Cadastro de Pescador</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                >
                  Já possui uma conta? Faça login aqui
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
