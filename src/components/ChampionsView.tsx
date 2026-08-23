import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Sparkles, 
  MapPin, 
  Ruler, 
  Users, 
  Flame, 
  CheckCircle2,
  Fish
} from 'lucide-react';
import { Tournament, Catch } from '../types';

interface ChampionsViewProps {
  tournaments: Tournament[];
  catches: Catch[];
  onSelectTournament?: (tournament: Tournament) => void;
}

type CategoryType = 'solo' | 'dupla' | 'trio' | 'equipe';

export default function ChampionsView({ tournaments, catches, onSelectTournament }: ChampionsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('solo');

  const approvedCatches = catches.filter(c => c.status === 'approved');

  // Filter tournaments by category format
  const getCategoryTournaments = (cat: CategoryType) => {
    return tournaments.filter(t => {
      if (cat === 'solo') return t.teamFormat === 'solo' || !t.teamFormat;
      if (cat === 'dupla') return t.teamFormat === 'dupla';
      if (cat === 'trio') return t.teamFormat === 'trio';
      if (cat === 'equipe') return t.teamFormat === 'quarteto' || (t.teamFormat as string) === 'equipe';
      return false;
    });
  };

  const categoryTournaments = getCategoryTournaments(selectedCategory);

  // Compute category champions
  const categoryWinners = categoryTournaments.map(tourney => {
    const tourneyCatches = approvedCatches.filter(c => c.tournamentId === tourney.id);
    
    // Group catches by user or team
    const userTotals = new Map<string, {
      userId: string;
      userName: string;
      userEmail?: string;
      teamName?: string;
      teamLogo?: string;
      totalLength: number;
      bestCatch: Catch;
      catchesCount: number;
    }>();

    tourneyCatches.forEach(c => {
      const groupKey = c.teamId || c.userId;
      const existing = userTotals.get(groupKey);
      if (!existing) {
        userTotals.set(groupKey, {
          userId: c.userId,
          userName: c.teamName ? `${c.teamName} (${c.userName})` : c.userName,
          userEmail: c.userEmail,
          teamName: c.teamName,
          teamLogo: c.teamLogo,
          totalLength: c.length,
          bestCatch: c,
          catchesCount: 1
        });
      } else {
        existing.totalLength += c.length;
        existing.catchesCount += 1;
        if (c.length > existing.bestCatch.length) {
          existing.bestCatch = c;
        }
      }
    });

    const ranking = Array.from(userTotals.values()).sort((a, b) => b.bestCatch.length - a.bestCatch.length);
    
    // Check if tournament has explicit official champion crowned
    let champion = ranking[0] || null;
    let runnerUp = ranking[1] || null;
    let thirdPlace = ranking[2] || null;

    if (tourney.championInfo) {
      champion = {
        userId: tourney.championInfo.userId || 'official-champ',
        userName: tourney.championInfo.userName,
        teamName: tourney.championInfo.teamName,
        totalLength: tourney.championInfo.catchSize || (ranking[0]?.bestCatch.length || 0),
        bestCatch: {
          id: 'champ-catch',
          userId: tourney.championInfo.userId || 'official-champ',
          userName: tourney.championInfo.userName,
          userEmail: tourney.championInfo.userEmail || '',
          tournamentId: tourney.id,
          tournamentTitle: tourney.title,
          species: tourney.championInfo.species || 'Tucunaré',
          length: tourney.championInfo.catchSize || (ranking[0]?.bestCatch.length || 0),
          photoUrl: tourney.championInfo.photoUrl || (ranking[0]?.bestCatch.photoUrl || ''),
          location: '',
          createdAt: new Date(),
          status: 'approved',
          verifiedByAI: false
        },
        catchesCount: ranking[0]?.catchesCount || 1
      };
    }

    if (tourney.runnerUpInfo) {
      runnerUp = {
        userId: tourney.runnerUpInfo.userId || 'official-runnerup',
        userName: tourney.runnerUpInfo.userName,
        teamName: tourney.runnerUpInfo.teamName,
        totalLength: tourney.runnerUpInfo.catchSize || (ranking[1]?.bestCatch.length || 0),
        bestCatch: {
          id: 'runnerup-catch',
          userId: tourney.runnerUpInfo.userId || 'official-runnerup',
          userName: tourney.runnerUpInfo.userName,
          userEmail: tourney.runnerUpInfo.userEmail || '',
          tournamentId: tourney.id,
          tournamentTitle: tourney.title,
          species: tourney.runnerUpInfo.species || 'Tucunaré',
          length: tourney.runnerUpInfo.catchSize || (ranking[1]?.bestCatch.length || 0),
          photoUrl: tourney.runnerUpInfo.photoUrl || '',
          location: '',
          createdAt: new Date(),
          status: 'approved',
          verifiedByAI: false
        },
        catchesCount: ranking[1]?.catchesCount || 1
      };
    }

    if (tourney.thirdPlaceInfo) {
      thirdPlace = {
        userId: tourney.thirdPlaceInfo.userId || 'official-third',
        userName: tourney.thirdPlaceInfo.userName,
        teamName: tourney.thirdPlaceInfo.teamName,
        totalLength: tourney.thirdPlaceInfo.catchSize || (ranking[2]?.bestCatch.length || 0),
        bestCatch: {
          id: 'third-catch',
          userId: tourney.thirdPlaceInfo.userId || 'official-third',
          userName: tourney.thirdPlaceInfo.userName,
          userEmail: tourney.thirdPlaceInfo.userEmail || '',
          tournamentId: tourney.id,
          tournamentTitle: tourney.title,
          species: tourney.thirdPlaceInfo.species || 'Tucunaré',
          length: tourney.thirdPlaceInfo.catchSize || (ranking[2]?.bestCatch.length || 0),
          photoUrl: tourney.thirdPlaceInfo.photoUrl || '',
          location: '',
          createdAt: new Date(),
          status: 'approved',
          verifiedByAI: false
        },
        catchesCount: ranking[2]?.catchesCount || 1
      };
    }

    return {
      tournament: tourney,
      champion,
      runnerUp,
      thirdPlace,
      totalParticipants: Math.max(ranking.length, tourney.championInfo ? 1 : 0),
      totalFishApproved: tourneyCatches.length
    };
  }).filter(item => item.champion !== null || item.tournament.championInfo !== undefined);

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto py-6 sm:py-8">
      {/* Top Section Header exactly as in the reference image */}
      <div className="text-center space-y-4">
        {/* Pill Badge: • RANKING GLOBAL ONLINE */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d1e15] border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#00e676] animate-pulse"></span>
          <span>RANKING GLOBAL ONLINE</span>
        </div>

        {/* Main Title: NOSSOS CAMPEÕES */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight leading-none">
          NOSSOS <span className="text-[#00e676]">CAMPEÕES</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
          Os maiores pescadores da história da Fisgada Pro. Lendas que dominaram as águas.
        </p>

        {/* Filter Category Pills: SOLO | DUPLA | TRIO | EQUIPE */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
          <button
            onClick={() => setSelectedCategory('solo')}
            className={`px-7 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              selectedCategory === 'solo'
                ? 'bg-[#00c853] hover:bg-[#00e676] text-slate-950 shadow-lg shadow-emerald-950/60'
                : 'bg-[#181a1e] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            SOLO
          </button>

          <button
            onClick={() => setSelectedCategory('dupla')}
            className={`px-7 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              selectedCategory === 'dupla'
                ? 'bg-[#00c853] hover:bg-[#00e676] text-slate-950 shadow-lg shadow-emerald-950/60'
                : 'bg-[#181a1e] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            DUPLA
          </button>

          <button
            onClick={() => setSelectedCategory('trio')}
            className={`px-7 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              selectedCategory === 'trio'
                ? 'bg-[#00c853] hover:bg-[#00e676] text-slate-950 shadow-lg shadow-emerald-950/60'
                : 'bg-[#181a1e] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            TRIO
          </button>

          <button
            onClick={() => setSelectedCategory('equipe')}
            className={`px-7 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              selectedCategory === 'equipe'
                ? 'bg-[#00c853] hover:bg-[#00e676] text-slate-950 shadow-lg shadow-emerald-950/60'
                : 'bg-[#181a1e] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            EQUIPE
          </button>
        </div>
      </div>

      {/* Main Container: Exact dark container from the screenshot */}
      <div className="bg-[#121316] border border-slate-800 rounded-3xl p-8 sm:p-14 shadow-2xl min-h-[380px] flex flex-col items-center justify-center">
        {categoryWinners.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <Trophy className="h-12 w-12 text-slate-600 stroke-[1.5]" />
            <p className="text-xs sm:text-sm font-black font-mono tracking-widest text-slate-400 uppercase">
              NENHUM CAMPEÃO REGISTRADO NESTA CATEGORIA AINDA.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-8">
            <div className="text-center pb-4 border-b border-slate-800/80">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
                ★ Campeonatos Homologados ({categoryWinners.length})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {categoryWinners.map(({ tournament, champion, runnerUp, thirdPlace, totalParticipants }) => (
                <div
                  key={tournament.id}
                  className="bg-[#181a1e] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 hover:border-emerald-500/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Tournament Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                          Formato: {tournament.teamFormat ? tournament.teamFormat.toUpperCase() : 'SOLO'}
                        </span>
                        <h3 className="text-base font-extrabold text-white mt-0.5">{tournament.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{tournament.prize}</p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
                        {totalParticipants} Competidores
                      </span>
                    </div>

                    {/* 1st Place Podium Card */}
                    {champion && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#00c853] text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                            1º
                          </div>

                          <div className="flex items-center gap-2.5">
                            {champion.teamLogo && (
                              <img 
                                src={champion.teamLogo} 
                                alt={champion.teamName || 'Equipe'} 
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-lg object-cover border border-emerald-500/40"
                              />
                            )}
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                                <span>{champion.userName}</span>
                                <Crown className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {champion.catchesCount} captura(s) homologada(s)
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-sm font-black text-[#00e676]">{champion.bestCatch.length} cm</span>
                          <span className="text-[9px] text-slate-400 block font-sans">Maior Peixe</span>
                        </div>
                      </div>
                    )}

                    {/* 2nd & 3rd Place */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {runnerUp ? (
                        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
                          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1">
                            <span>2º LUGAR</span>
                            <span className="text-slate-200 font-bold">{runnerUp.bestCatch.length} cm</span>
                          </div>
                          <p className="font-bold text-white truncate">{runnerUp.userName}</p>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60 text-xs text-slate-500 italic">
                          2º Lugar vago
                        </div>
                      )}

                      {thirdPlace ? (
                        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
                          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1">
                            <span>3º LUGAR</span>
                            <span className="text-amber-500 font-bold">{thirdPlace.bestCatch.length} cm</span>
                          </div>
                          <p className="font-bold text-white truncate">{thirdPlace.userName}</p>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60 text-xs text-slate-500 italic">
                          3º Lugar vago
                        </div>
                      )}
                    </div>
                  </div>

                  {onSelectTournament && (
                    <button
                      onClick={() => onSelectTournament(tournament)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-800 transition cursor-pointer"
                    >
                      Ver Ranking Completo
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
