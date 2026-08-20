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
  AlertTriangle
} from 'lucide-react';
import NavBar from './components/NavBar';
import TournamentCard from './components/TournamentCard';
import Leaderboard from './components/Leaderboard';
import CatchFeed from './components/CatchFeed';
import SubmitCatchForm from './components/SubmitCatchForm';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import { Tournament, Catch, UserProfile } from './types';
import { seedTournamentsIfNeeded, subscribeTournaments, subscribeCatches } from './utils/dbHelpers';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('tournaments');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  
  // Active user profile state, persisted in local browser storage for smoothness
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('pesca_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSubmitCatchOpen, setIsSubmitCatchOpen] = useState<boolean>(false);
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
      // Sort tournaments: active first, then upcoming, then completed
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
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pesca_user');
    setCurrentTab('tournaments');
  };

  const handleParticipate = (tournament: Tournament) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedTournament(tournament);
    setIsSubmitCatchOpen(true);
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
        {/* Hero Section */}
        {currentTab === 'tournaments' && !isSubmitCatchOpen && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800/80 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

            <div className="space-y-6 z-10 max-w-2xl">
              <span className="inline-flex items-center space-x-1.5 py-1 px-3 bg-sky-500/10 text-sky-400 rounded-full text-xs font-semibold uppercase tracking-wider font-mono border border-sky-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Arbitragem Automatizada com Inteligência Artificial</span>
              </span>
              
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
                Campeonatos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Pesca Esportiva</span> Online
              </h1>
              
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Participe de qualquer represas, rio ou costa marítima do Brasil! Capture seu exemplar preferido, meça sobre uma régua rígida ao lado de um dispositivo móvel e envie a foto. Nossa IA Gemini e moderadores homologam os dados em tempo real no mural geral.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setIsAuthModalOpen(true);
                    } else {
                      setSelectedTournament(null);
                      setIsSubmitCatchOpen(true);
                    }
                  }}
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-450 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <PlusCircle className="h-4.5 w-4.5" />
                  <span>Enviar Nova Captura</span>
                </button>
                <a
                  href="#how-it-works"
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl border border-slate-800 transition"
                >
                  Como Funciona?
                </a>
              </div>
            </div>

            {/* Quick Stats Grid Overlay */}
            <div className="grid grid-cols-2 gap-4 lg:w-96 z-10">
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850/80">
                <Trophy className="h-5 w-5 text-amber-500 mb-2" />
                <span className="text-[10px] uppercase font-mono text-slate-500">Torneios Ativos</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{stats.totalTournaments}</p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850/80">
                <Users className="h-5 w-5 text-sky-400 mb-2" />
                <span className="text-[10px] uppercase font-mono text-slate-500">Pescadores Ativos</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{stats.totalFishermen > 0 ? stats.totalFishermen : 36}</p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850/80">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                <span className="text-[10px] uppercase font-mono text-slate-500">Peixes Homologados</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">{stats.totalCatches > 0 ? stats.totalCatches : 112}</p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850/80">
                <Ruler className="h-5 w-5 text-indigo-400 mb-2" />
                <span className="text-[10px] uppercase font-mono text-slate-500">Maior Exemplar</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {stats.largestFish > 0 ? `${stats.largestFish} cm` : '82.5 cm'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Components Rendering */}
        {isSubmitCatchOpen && currentUser ? (
          <SubmitCatchForm 
            tournaments={tournaments}
            currentUser={currentUser}
            initialTournament={selectedTournament}
            onSuccess={() => {
              setIsSubmitCatchOpen(false);
              setCurrentTab('feed'); // redirect to view uploads
            }}
            onCancel={() => {
              setIsSubmitCatchOpen(false);
            }}
          />
        ) : (
          <div>
            {currentTab === 'tournaments' && (
              <div className="space-y-8 animate-fade-in">
                {/* Intro subtitle */}
                <div className="pb-4 border-b border-slate-800">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">Campeonatos de Pesca Ativos</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Participe diretamente enviando seus registros fotográficos.</p>
                </div>

                {/* Tournaments Grid */}
                {tournaments.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    Buscando campeonatos no banco de dados Firestore...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {tournaments.map((t) => (
                      <TournamentCard 
                        key={t.id} 
                        tournament={t} 
                        onParticipate={handleParticipate}
                        isLoggedIn={currentUser !== null}
                      />
                    ))}
                  </div>
                )}

                {/* Rules Section (How it works index) */}
                <section id="how-it-works" className="bg-slate-900/40 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6">
                  <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800/80">
                    <HelpCircle className="h-6 w-6 text-sky-400" />
                    <h3 className="text-lg font-bold text-white">Como Funciona a Pesca Esportiva Online?</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-350">
                    <div className="space-y-2">
                      <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 font-bold flex items-center justify-center font-mono">1</div>
                      <h4 className="font-bold text-white">Escolha um Campeonato</h4>
                      <p className="leading-relaxed text-xs">
                        Veja as espécies válidas e regras de medição de cada arena disponível. Cada torneio possui regras rígidas de manuseio e premiações ecológicas fantásticas.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 font-bold flex items-center justify-center font-mono">2</div>
                      <h4 className="font-bold text-white">Capture e Meça no Local</h4>
                      <p className="leading-relaxed text-xs">
                        Coloque o peixe deitado sobre uma fita ou régua métrica rígida homologada. Tire uma foto nítida mostrando a régua visível de ponta a ponta e o focinho no ponto zero.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 font-bold flex items-center justify-center font-mono">3</div>
                      <h4 className="font-bold text-white">Envie a Foto e Aguarde</h4>
                      <p className="leading-relaxed text-xs">
                        Envie os dados. Nossa IA Gemini fará uma análise anatômica de espécie e escala para validar o peixe antes dos moderadores aprovarem o cálculo no painel oficial do ranking.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 flex items-start space-x-2 text-amber-400 text-xs font-mono">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <span><strong>Nota sobre Preservação:</strong> Incentivamos exclusivamente o pesque-e-solte. Peixes exibindo de forma clara maus tratos ou retidos mortos serão desqualificados no feedback de moderação técnica.</span>
                  </div>
                </section>
              </div>
            )}

            {currentTab === 'feed' && (
              <CatchFeed 
                catches={catches}
                currentUser={currentUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}

            {currentTab === 'leaderboard' && (
              <Leaderboard 
                tournaments={tournaments}
                catches={catches}
              />
            )}

            {currentTab === 'admin' && currentUser?.role === 'admin' && (
              <AdminPanel catches={catches} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-mono mt-12 bg-opacity-70">
        <div className="max-w-7xl mx-auto px-4 space-y-2.5">
          <p>© 2026 PescaEsporte Arena. Todos os direitos reservados para conservação e pesca esportiva esportiva nacional.</p>
          <div className="flex justify-center space-x-4">
            <span className="text-slate-600">Serviço de IA Gemini Ativo</span>
            <span>•</span>
            <span className="text-slate-600">Nuvem Firestore ID Integrada</span>
          </div>
        </div>
      </footer>

      {/* Auth Creator Dialog */}
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
