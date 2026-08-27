import React from 'react';
import { Anchor, Trophy, Award, Home, Crown, User, LogIn, ShieldCheck, Building2, HelpCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface NavBarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export default function NavBar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onOpenAuthModal, 
  onLogout 
}: NavBarProps) {
  return (
    <header id="app-header" className="sticky top-0 z-40 w-full bg-[#0d0e11] border-b border-slate-800/80 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div 
              className="flex items-center space-x-2.5 cursor-pointer" 
              onClick={() => setCurrentTab('home')}
            >
              <div className="p-2 bg-[#00c853] rounded-xl text-slate-950 shadow-md">
                <Anchor className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                FISGADA <span className="text-[#00c853]">PRO</span>
              </span>
            </div>
          </div>

          {/* Main Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0" aria-label="Navegação principal">
            {/* 1. Início */}
            <button
              id="tab-home"
              onClick={() => setCurrentTab('home')}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 select-none cursor-pointer ${
                currentTab === 'home'
                  ? 'text-[#00c853]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">INÍCIO</span>
            </button>

            {/* 2. Torneios */}
            <button
              id="tab-tournaments"
              onClick={() => setCurrentTab('tournaments')}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 select-none cursor-pointer ${
                currentTab === 'tournaments'
                  ? 'text-[#00c853]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">TORNEIOS</span>
            </button>

            {/* 3. Como Participar */}
            <button
              id="tab-how-to-participate"
              onClick={() => setCurrentTab('how-to-participate')}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 select-none cursor-pointer ${
                currentTab === 'how-to-participate'
                  ? 'text-[#00c853]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">COMO PARTICIPAR</span>
            </button>

            {/* 4. Ranking */}
            <button
              id="tab-ranking"
              onClick={() => setCurrentTab('ranking')}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 select-none cursor-pointer ${
                currentTab === 'ranking'
                  ? 'text-[#00c853]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">RANKING</span>
            </button>

            {/* 5. Campeões */}
            <button
              id="tab-champions"
              onClick={() => setCurrentTab('champions')}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 select-none cursor-pointer ${
                currentTab === 'champions'
                  ? 'text-[#00c853]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">CAMPEÕES</span>
            </button>

            {/* 6. Quem Somos */}
            <button
              id="tab-about"
              onClick={() => setCurrentTab('about')}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 select-none cursor-pointer ${
                currentTab === 'about'
                  ? 'text-[#00c853]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">QUEM SOMOS</span>
            </button>

            {/* Admin tab */}
            {(user?.role === 'admin' || user?.role === 'moderator') && (
              <button
                id="tab-admin"
                onClick={() => setCurrentTab('admin')}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 select-none cursor-pointer ${
                  currentTab === 'admin'
                    ? 'text-amber-400 font-extrabold bg-amber-500/15 border border-amber-500/30'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">ADMIN</span>
              </button>
            )}

            {/* 6. Meu Perfil (Para Pescadores e Administradores) */}
            {user && (
              <button
                id="tab-profile"
                onClick={() => setCurrentTab('profile')}
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 select-none cursor-pointer ${
                  currentTab === 'profile'
                    ? 'text-[#00c853]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">MEU PERFIL</span>
              </button>
            )}
          </nav>

          {/* User Profile Summary / Login Button */}
          <div className="flex items-center space-x-3 shrink-0">
            {user ? (
              <div className="flex items-center space-x-3 shrink-0">
                <div 
                  className="flex items-center gap-2 cursor-pointer shrink-0"
                  onClick={() => {
                    setCurrentTab('profile');
                  }}
                  title="Ver e Editar Meu Perfil"
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0 ${
                    user.role === 'admin' 
                      ? 'border-amber-500/80 bg-amber-500/20 text-amber-300' 
                      : user.role === 'moderator'
                      ? 'border-sky-500/80 bg-sky-500/20 text-sky-300'
                      : 'border-emerald-500/50 bg-[#1a1c20]'
                  }`}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      (user.displayName || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col text-left shrink-0">
                    <span className="text-xs font-black uppercase tracking-wide text-white hover:text-[#00c853] transition truncate max-w-[120px] whitespace-nowrap">
                      {user.displayName}
                    </span>
                    {(user.role === 'admin' || user.role === 'moderator') ? (
                      <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider whitespace-nowrap">
                        ADMIN
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                        PESCADOR
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="text-xs font-bold text-slate-400 hover:text-rose-400 uppercase tracking-wider transition cursor-pointer px-1.5 py-1 rounded-lg hover:bg-slate-900 whitespace-nowrap shrink-0"
                >
                  SAIR
                </button>
              </div>
            ) : (
              <button
                id="btn-login"
                onClick={onOpenAuthModal}
                className="inline-flex items-center space-x-2 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition-all text-center cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">ENTRAR</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden border-t border-slate-800/80 py-2 justify-around overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[10px] font-bold uppercase transition shrink-0 ${
              currentTab === 'home' ? 'text-[#00c853]' : 'text-slate-400'
            }`}
          >
            <Home className="h-4 w-4 mb-0.5 shrink-0" />
            <span className="whitespace-nowrap">Início</span>
          </button>
          
          <button
            onClick={() => setCurrentTab('tournaments')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[10px] font-bold uppercase transition shrink-0 ${
              currentTab === 'tournaments' ? 'text-[#00c853]' : 'text-slate-400'
            }`}
          >
            <Trophy className="h-4 w-4 mb-0.5 shrink-0" />
            <span className="whitespace-nowrap">Torneios</span>
          </button>

          <button
            onClick={() => setCurrentTab('how-to-participate')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[10px] font-bold uppercase transition shrink-0 ${
              currentTab === 'how-to-participate' ? 'text-[#00c853]' : 'text-slate-400'
            }`}
          >
            <HelpCircle className="h-4 w-4 mb-0.5 shrink-0" />
            <span className="whitespace-nowrap">Participar</span>
          </button>

          <button
            onClick={() => setCurrentTab('ranking')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[10px] font-bold uppercase transition shrink-0 ${
              currentTab === 'ranking' ? 'text-[#00c853]' : 'text-slate-400'
            }`}
          >
            <Award className="h-4 w-4 mb-0.5 shrink-0" />
            <span className="whitespace-nowrap">Ranking</span>
          </button>

          <button
            onClick={() => setCurrentTab('champions')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[10px] font-bold uppercase transition shrink-0 ${
              currentTab === 'champions' ? 'text-[#00c853]' : 'text-slate-400'
            }`}
          >
            <Crown className="h-4 w-4 mb-0.5 shrink-0" />
            <span className="whitespace-nowrap">Campeões</span>
          </button>

          <button
            onClick={() => setCurrentTab('about')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[10px] font-bold uppercase transition shrink-0 ${
              currentTab === 'about' ? 'text-[#00c853]' : 'text-slate-400'
            }`}
          >
            <Building2 className="h-4 w-4 mb-0.5 shrink-0" />
            <span className="whitespace-nowrap">Sobre</span>
          </button>

          {user && (
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex flex-col items-center py-1 px-2 rounded text-[10px] font-bold uppercase transition shrink-0 ${
                currentTab === 'profile' ? 'text-[#00c853]' : 'text-slate-400'
              }`}
            >
              <User className="h-4 w-4 mb-0.5 shrink-0" />
              <span className="whitespace-nowrap">Perfil</span>
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'moderator') && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex flex-col items-center py-1 px-2 rounded text-[10px] font-bold uppercase transition shrink-0 ${
                currentTab === 'admin' ? 'text-amber-400 font-bold' : 'text-amber-400/70'
              }`}
            >
              <ShieldCheck className="h-4 w-4 mb-0.5 shrink-0" />
              <span className="whitespace-nowrap">ADMIN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
