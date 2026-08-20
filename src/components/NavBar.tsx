import React from 'react';
import { Anchor, Trophy, Award, Navigation, LogIn, LogOut, ShieldAlert, User, Compass } from 'lucide-react';
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
    <header id="app-header" className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 backdrop-blur-md bg-opacity-95 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('tournaments')}>
            <div className="p-2.5 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-xl text-white shadow-md shadow-sky-500/10">
              <Anchor className="h-6 w-6 stroke-[2.3]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white bg-clip-text">
                Pesca<span className="text-sky-400">Esporte</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Arena de Torneios</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1" aria-label="Negação principal">
            <button
              id="tab-tournaments"
              onClick={() => setCurrentTab('tournaments')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'tournaments'
                  ? 'bg-sky-500/10 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Campeonatos</span>
            </button>

            <button
              id="tab-feed"
              onClick={() => setCurrentTab('feed')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'feed'
                  ? 'bg-sky-500/10 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Mural de Capturas</span>
            </button>

            <button
              id="tab-leaderboard"
              onClick={() => setCurrentTab('leaderboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'leaderboard'
                  ? 'bg-sky-500/10 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Placar de Líderes</span>
            </button>

            {user?.role === 'admin' && (
              <button
                id="tab-admin"
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-dashed ${
                  currentTab === 'admin'
                    ? 'bg-amber-500/10 border-amber-500/45 text-amber-400 font-semibold'
                    : 'border-slate-800 text-amber-300/80 hover:text-amber-300 hover:bg-slate-800/50'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Moderação (Admin)</span>
              </button>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-800/60 py-1.5 pl-3 pr-2 rounded-full border border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{user.displayName}</span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                    {user.role === 'admin' ? 'Coordenador/IA' : 'Pescador'}
                  </span>
                </div>
                
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={onLogout}
                  title="Sair do perfil"
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-login"
                onClick={onOpenAuthModal}
                className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-lg shadow-sky-500/15 hover:shadow-sky-500/25 transition-all text-center"
              >
                <LogIn className="h-4 w-4" />
                <span>Entrar / Participar</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-slate-800/80 py-2 justify-around">
          <button
            onClick={() => setCurrentTab('tournaments')}
            className={`flex flex-col items-center py-1 px-3 rounded text-[10px] font-medium transition ${
              currentTab === 'tournaments' ? 'text-sky-400' : 'text-slate-400'
            }`}
          >
            <Trophy className="h-5 w-5 mb-0.5" />
            <span>Campeonatos</span>
          </button>
          
          <button
            onClick={() => setCurrentTab('feed')}
            className={`flex flex-col items-center py-1 px-3 rounded text-[10px] font-medium transition ${
              currentTab === 'feed' ? 'text-sky-400' : 'text-slate-400'
            }`}
          >
            <Compass className="h-5 w-5 mb-0.5" />
            <span>Capturas</span>
          </button>

          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`flex flex-col items-center py-1 px-3 rounded text-[10px] font-medium transition ${
              currentTab === 'leaderboard' ? 'text-sky-400' : 'text-slate-400'
            }`}
          >
            <Award className="h-5 w-5 mb-0.5" />
            <span>Líderes</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex flex-col items-center py-1 px-3 rounded text-[10px] font-medium transition ${
                currentTab === 'admin' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <ShieldAlert className="h-5 w-5 mb-0.5" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
