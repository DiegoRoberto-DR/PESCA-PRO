import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Compass, 
  Award, 
  ShieldAlert, 
  PlusCircle, 
  Anchor, 
  Users, 
  Camera, 
  CheckCircle2, 
  Sparkles, 
  Ruler, 
  Scale, 
  HelpCircle,
  AlertTriangle,
  Home,
  Crown,
  User,
  ArrowRight,
  LogIn
} from 'lucide-react';
import NavBar from './components/NavBar';
import TournamentCard from './components/TournamentCard';
import Leaderboard from './components/Leaderboard';
import CatchFeed from './components/CatchFeed';
import ChampionsView from './components/ChampionsView';
import ProfileView from './components/ProfileView';
import SubmitCatchForm from './components/SubmitCatchForm';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import ParticipateModal from './components/ParticipateModal';
import { Tournament, Catch, UserProfile } from './types';
import { seedTournamentsIfNeeded, subscribeTournaments, subscribeCatches } from './utils/dbHelpers';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [tournamentFilter, setTournamentFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  
  // Active user profile state, persisted in local browser storage for smoothness
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('pesca_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSubmitCatchOpen, setIsSubmitCatchOpen] = useState<boolean>(false);
  const [isParticipateModalOpen, setIsParticipateModalOpen] = useState<boolean>(false);
  const [participateTournament, setParticipateTournament] = useState<Tournament | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Seed and subscribe to collections on boot
  useEffect(() => {
    // 1. Initial Seeding of Tournaments
    seedTournamentsIfNeeded().then((list) => {
      if (list && list.length > 0) {
        setTournaments(list);
      }
    });

    // 2. Real-time Tournaments Subscription
    const unsubTournaments = subscribeTournaments((list) => {
      const sorted = [...list].sort((a, b) => {
        const order = { active: 0, upcoming: 1, completed: 2 };
        return order[a.status] - order[b.status];
      });
      setTournaments(sorted);
    });

    // 3. Real-time Catches Subscription
    const unsubCatches = subscribeCatches((list) => {
      setCatches(list);
    });

    return () => {
      unsubTournaments();
      unsubCatches();
    };
  }, []);

  const handleLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem('pesca_user', JSON.stringify(profile));
    if (profile.role === 'admin' || profile.role === 'moderator') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('profile');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pesca_user');
    setCurrentTab('home');
  };

  const handleParticipate = (tournament: Tournament) => {
    setParticipateTournament(tournament);
    setIsParticipateModalOpen(true);
  };

  // Calculate high-level stats from Firestore
  const getAppStats = () => {
    const totalTournaments = tournaments.length;
    const totalCatches = catches.filter(c => c.status === 'approved').length;
    
    // Unique user ids who submitted a catch
    const uniqueFishermen = new Set(catches.map(c => c.userId));
    const totalFishermen = uniqueFishermen.size;

    // Largest specimen in length
    const largestFish = catches
      .filter(c => c.status === 'approved')
      .reduce((max, c) => (c.length > max ? c.length : max), 0);

    return { totalTournaments, totalCatches, totalFishermen, largestFish };
  };

  const stats = getAppStats();
  const activeTournaments = tournaments.filter(t => t.status === 'active');
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  const filteredTournaments = tournaments.filter(t => {
    if (tournamentFilter === 'all') return true;
    return t.status === tournamentFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <NavBar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        user={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Form to submit catch */}
        {isSubmitCatchOpen && currentUser ? (
          <SubmitCatchForm 
            tournaments={tournaments}
            currentUser={currentUser}
            initialTournament={selectedTournament}
            onSuccess={() => {
              setIsSubmitCatchOpen(false);
              setCurrentTab('profile'); // redirect to profile to see the new catch
            }}
            onCancel={() => {
              setIsSubmitCatchOpen(false);
            }}
          />
        ) : (
          <div>
            {/* 1. ABA INÍCIO (DESIGN MINIMALISTA E CINEMATOGRÁFICO CONFORME A IMAGEM) */}
            {currentTab === 'home' && (
              <div className="animate-fade-in flex flex-col justify-center items-center py-6 sm:py-10">
                {/* Hero Box with Aerial Coastal Waves Background */}
                <div className="relative w-full min-h-[68vh] sm:min-h-[75vh] rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 text-center shadow-2xl border border-slate-800/60">
                  {/* Aerial Drone Ocean Waves Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85')`
                    }}
                  />
                  {/* Cinematic Dark Vignette & Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black/90 z-0" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90 z-0 pointer-events-none" />

                  {/* Centered Hero Content */}
                  <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
                    {/* Badge: TEMPORADA 2026 ABERTA */}
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#072417]/90 border border-[#00e676]/40 text-[#00e676] text-[11px] sm:text-xs font-black tracking-widest uppercase font-mono shadow-md">
                      TEMPORADA 2026 ABERTA
                    </div>

                    {/* Main Title: ONDE OS GIGANTES SE ENCONTRAM */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight uppercase leading-[0.95] text-center drop-shadow-2xl">
                      ONDE OS <span className="text-[#00e676]">GIGANTES</span><br />
                      SE ENCONTRAM
                    </h1>

                    {/* Subtitle */}
                    <p className="text-slate-200/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto text-center leading-relaxed font-medium drop-shadow-md">
                      A primeira plataforma de campeonatos de pesca 100% online do Brasil. Sua pescaria de fim de semana agora vale troféus.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full sm:w-auto">
                      <button
                        onClick={() => setCurrentTab('tournaments')}
                        className="w-full sm:w-auto px-8 py-4 bg-[#00c853] hover:bg-[#00e676] active:bg-[#00b048] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-2xl shadow-emerald-950/60 transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
                      >
                        EXPLORAR TORNEIOS
                      </button>

                      <button
                        onClick={() => setCurrentTab('ranking')}
                        className="w-full sm:w-auto px-8 py-4 bg-[#12141a]/80 hover:bg-[#1a1d26] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl border border-slate-700/80 backdrop-blur-md transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
                      >
                        VER RANKING
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ABA TORNEIOS */}
            {currentTab === 'tournaments' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">Torneios de Pesca Esportiva</h2>
                    <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                      Confira os campeonatos que estão acontecendo, os próximos que vão acontecer e o histórico dos encerrados.
                    </p>
                  </div>

                  {/* Filter Pills for Status */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTournamentFilter('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        tournamentFilter === 'all'
                          ? 'bg-slate-100 text-slate-900 shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>Todos</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300">
                        {tournaments.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setTournamentFilter('active')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        tournamentFilter === 'active'
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Acontecendo Agora</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-emerald-300">
                        {activeTournaments.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setTournamentFilter('upcoming')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        tournamentFilter === 'upcoming'
                          ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                      <span>Vão Acontecer</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-sky-300">
                        {upcomingTournaments.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setTournamentFilter('completed')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        tournamentFilter === 'completed'
                          ? 'bg-slate-700 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>Encerrados</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300">
                        {completedTournaments.length}
                      </span>
                    </button>
                  </div>
                </div>

                {tournaments.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                    Buscando torneios cadastrados no Firestore...
                  </div>
                ) : filteredTournaments.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                    <p className="text-sm text-slate-400">Nenhum torneio encontrado com o filtro selecionado.</p>
                    <button
                      onClick={() => setTournamentFilter('all')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Ver Todos os Torneios
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredTournaments.map((t) => (
                      <TournamentCard 
                        key={t.id} 
                        tournament={t} 
                        onParticipate={handleParticipate}
                        isLoggedIn={currentUser !== null}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. ABA RANKING */}
            {currentTab === 'ranking' && (
              <div className="animate-fade-in">
                <Leaderboard 
                  tournaments={tournaments}
                  catches={catches}
                />
              </div>
            )}

            {/* 4. ABA CAMPEÕES */}
            {currentTab === 'champions' && (
              <div className="animate-fade-in">
                <ChampionsView 
                  tournaments={tournaments}
                  catches={catches}
                  onSelectTournament={(t) => {
                    setSelectedTournament(t);
                    setCurrentTab('ranking');
                  }}
                />
              </div>
            )}

            {/* 5. ABA MEU PERFIL (Apenas para Pescadores Participantes; Admins vão para AdminPanel) */}
            {currentTab === 'profile' && currentUser && (
              currentUser.role === 'admin' || currentUser.role === 'moderator' ? (
                <AdminPanel 
                  catches={catches} 
                  tournaments={tournaments}
                  currentUser={currentUser}
                />
              ) : (
                <div className="animate-fade-in">
                  <ProfileView 
                    currentUser={currentUser}
                    catches={catches}
                    tournaments={tournaments}
                    selectedTournament={selectedTournament}
                    onNavigateToTournaments={() => setCurrentTab('tournaments')}
                    onOpenSubmitCatch={() => {
                      setSelectedTournament(null);
                      setIsSubmitCatchOpen(true);
                    }}
                    onLogout={handleLogout}
                  />
                </div>
              )
            )}

            {/* ABA ADMIN (Exclusiva para Administradores e Moderadores) */}
            {currentTab === 'admin' && (
              (currentUser?.role === 'admin' || currentUser?.role === 'moderator') ? (
                <AdminPanel 
                  catches={catches} 
                  tournaments={tournaments}
                  currentUser={currentUser}
                />
              ) : (
                <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
                  <div className="inline-flex p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Acesso à Central de Administração</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Esta área é restrita para o Administrador Geral e Moderadores credenciados.
                    </p>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const pwd = (form.elements.namedItem('adminPassword') as HTMLInputElement)?.value;
                      if (pwd === '121713#3') {
                        const adminUser: UserProfile = {
                          uid: 'admin_master_root',
                          displayName: 'Administrador Geral',
                          fullName: 'Coordenador Geral da Pesca',
                          email: 'admin@pescaesporte.com',
                          role: 'admin',
                          permissions: {
                            canModerateCatches: true,
                            canManageTournaments: true,
                            canManageFishermen: true,
                            canManageAntifraud: true
                          },
                          status: 'active',
                          createdAt: new Date().toISOString()
                        };
                        handleLogin(adminUser);
                      } else {
                        alert('Senha incorreta! Utilize a senha de coordenador 121713#3');
                      }
                    }}
                    className="space-y-4 text-left"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Senha de Acesso do Administrador</label>
                      <input
                        type="password"
                        name="adminPassword"
                        placeholder="Digite a senha (121713#3)"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none"
                        autoFocus
                      />
                      <span className="text-[9px] text-slate-500 font-mono">Usuário: <strong className="text-amber-400">Admin</strong> | Senha: <strong className="text-amber-400">121713#3</strong></span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
                    >
                      Acessar Painel de Controle Completo
                    </button>
                  </form>
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0b0c0e] border-t border-slate-900/90 py-6 text-xs text-slate-500 font-mono mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#00c853] rounded-lg text-slate-950">
              <Anchor className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black tracking-tight text-white block">FISGADA PRO</span>
              <span className="text-[9px] text-[#00c853] font-bold block">UMA EMPRESA DO GRUPO DR</span>
            </div>
          </div>
          
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 text-center md:text-right">
            © 2026 FISGADA PRO - TODOS OS DIREITOS RESERVADOS
          </p>
        </div>
      </footer>

      {/* Auth Creator Dialog */}
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      )}

      {/* Participate in Tournament Dialog */}
      <ParticipateModal
        isOpen={isParticipateModalOpen}
        onClose={() => setIsParticipateModalOpen(false)}
        tournament={participateTournament}
        currentUser={currentUser}
        onRequireAuth={() => {
          setIsParticipateModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onSuccessEnroll={(t) => {
          if (currentUser) {
            const currentList = currentUser.enrolledTournaments || [];
            if (!currentList.includes(t.id)) {
              const updatedUser: UserProfile = {
                ...currentUser,
                enrolledTournaments: [...currentList, t.id]
              };
              setCurrentUser(updatedUser);
              localStorage.setItem('pesca_user', JSON.stringify(updatedUser));
            }
          }
          setSelectedTournament(t);
          setCurrentTab('profile');
        }}
      />
    </div>
  );
}
