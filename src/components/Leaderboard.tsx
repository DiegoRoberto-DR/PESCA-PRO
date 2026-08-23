import React, { useState, useEffect } from 'react';
import { Award, Trophy, Scale, Ruler, Search, ChevronDown, Fish, Weight, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { Tournament, Catch, UserProfile } from '../types';
import { subscribeAllUsers } from '../utils/dbHelpers';

interface LeaderboardProps {
  tournaments: Tournament[];
  catches: Catch[];
}

interface RankedEntry {
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  nickname?: string;
  teamId?: string;
  teamName?: string;
  teamLogo?: string;
  bestCatch: Catch;
  allApprovedCatches: Catch[];
  totalWeight: number; // Soma de quilos de todas as capturas aprovadas do competidor
  totalLength: number; // Soma de comprimentos
}

export default function Leaderboard({ tournaments, catches }: LeaderboardProps) {
  // Realtime users map for profile photos
  const [usersMap, setUsersMap] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    const unsubscribe = subscribeAllUsers((users) => {
      const map: Record<string, UserProfile> = {};
      users.forEach((u) => {
        if (u.uid) map[u.uid] = u;
      });
      setUsersMap(map);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Select first active tournament by default
  const activeTournaments = tournaments.filter(t => t.status === 'active' || t.status === 'completed');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    activeTournaments[0]?.id || tournaments[0]?.id || ''
  );
  
  const currentTournament = tournaments.find(t => t.id === selectedTournamentId);
  const isWeightTournament = currentTournament?.metric === 'weight';
  const isBothMetric = currentTournament?.metric === 'both';

  // Compute rankings based on approved catches for current tournament
  const getRankings = (): RankedEntry[] => {
    if (!selectedTournamentId) return [];
    
    // Filter approved catches for the current tournament
    const tournamentCatches = catches.filter(
      (c) => c.tournamentId === selectedTournamentId && c.status === 'approved'
    );

    // Group by userId
    const userGroups: Record<string, Catch[]> = {};
    tournamentCatches.forEach((c) => {
      if (!userGroups[c.userId]) {
        userGroups[c.userId] = [];
      }
      userGroups[c.userId].push(c);
    });

    // For each user, compute totals and find their single BEST catch according to tournament metric
    const rankings: RankedEntry[] = [];
    
    Object.keys(userGroups).forEach((userId) => {
      const userCatches = userGroups[userId];
      
      // Calculate total weight and length
      const totalWeight = userCatches.reduce((sum, c) => sum + (typeof c.weight === 'number' ? c.weight : 0), 0);
      const totalLength = userCatches.reduce((sum, c) => sum + (typeof c.length === 'number' ? c.length : 0), 0);

      // Sort to find the absolute best catch
      const sorted = [...userCatches].sort((a, b) => {
        if (!currentTournament) return 0;
        const metric = currentTournament.metric;
        if (metric === 'weight') {
          return (b.weight || 0) - (a.weight || 0);
        } else if (metric === 'length') {
          return b.length - a.length;
        } else {
          // If both, count length as primary, weight as tiebreaker
          const doubleDiff = b.length - a.length;
          if (doubleDiff !== 0) return doubleDiff;
          return (b.weight || 0) - (a.weight || 0);
        }
      });

      const userProfile = usersMap[userId];

      rankings.push({
        userId,
        userName: userProfile?.fullName || userProfile?.displayName || sorted[0].userName,
        userEmail: sorted[0].userEmail,
        userPhoto: userProfile?.photoURL,
        nickname: userProfile?.nickname,
        teamId: sorted[0].teamId,
        teamName: sorted[0].teamName,
        teamLogo: sorted[0].teamLogo,
        bestCatch: sorted[0],
        allApprovedCatches: userCatches,
        totalWeight,
        totalLength
      });
    });

    // Sort contestants by tournament criteria
    return rankings.sort((a, b) => {
      if (!currentTournament) return 0;
      const metric = currentTournament.metric;
      if (metric === 'weight') {
        // First by best catch weight, then by total accumulated weight
        const diffBest = (b.bestCatch.weight || 0) - (a.bestCatch.weight || 0);
        if (diffBest !== 0) return diffBest;
        return b.totalWeight - a.totalWeight;
      } else if (metric === 'length') {
        return b.bestCatch.length - a.bestCatch.length;
      } else {
        const doubleDiff = b.bestCatch.length - a.bestCatch.length;
        if (doubleDiff !== 0) return doubleDiff;
        return (b.bestCatch.weight || 0) - (a.bestCatch.weight || 0);
      }
    });
  };

  const rankings = getRankings();

  // Calculate tournament aggregate statistics
  const totalTournamentWeight = catches
    .filter(c => c.tournamentId === selectedTournamentId && c.status === 'approved')
    .reduce((sum, c) => sum + (typeof c.weight === 'number' ? c.weight : 0), 0);

  const totalTournamentCatches = catches
    .filter(c => c.tournamentId === selectedTournamentId && c.status === 'approved')
    .length;

  const heaviestCatch = catches
    .filter(c => c.tournamentId === selectedTournamentId && c.status === 'approved' && typeof c.weight === 'number')
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];

  const longestCatch = catches
    .filter(c => c.tournamentId === selectedTournamentId && c.status === 'approved')
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header matching rank torneios.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase flex items-center gap-2">
            <span className="text-white">RANKING DO</span>
            <span className="text-[#00e676]">TORNEIO</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Acompanhe o desempenho, pesagem oficial e posições em tempo real
          </p>
        </div>

        {/* Custom Tournament Dropdown Selector matching rank torneios.png */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <select
            id="tournament-leaderboard-select"
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="w-full bg-[#121316] hover:bg-[#181a1f] border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold rounded-2xl px-4 py-3 appearance-none focus:outline-none focus:border-[#00e676] cursor-pointer transition shadow-lg pr-10"
          >
            {tournaments.length === 0 && (
              <option value="" disabled>Nenhum campeonato disponível</option>
            )}
            {tournaments.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#121316] text-white">
                {t.title} {t.status === 'completed' ? '🏁 (Finalizado)' : ''}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Stats Ribbon for Kilo / Metric Tournaments */}
      {currentTournament && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#121316] border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Critério Oficial</span>
            <span className="text-sm font-black text-emerald-400 uppercase mt-0.5 flex items-center gap-1.5">
              {isWeightTournament ? (
                <>
                  <Scale className="h-4 w-4" />
                  <span>Por Peso (Quilos / Kg)</span>
                </>
              ) : isBothMetric ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Comprimento & Peso</span>
                </>
              ) : (
                <>
                  <Ruler className="h-4 w-4" />
                  <span>Por Comprimento (cm)</span>
                </>
              )}
            </span>
          </div>

          <div className="bg-[#121316] border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Capturas Validadas</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">
              {totalTournamentCatches} {totalTournamentCatches === 1 ? 'peixe' : 'peixes'}
            </span>
          </div>

          {(isWeightTournament || isBothMetric || totalTournamentWeight > 0) && (
            <div className="bg-[#121316] border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-2xl">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block flex items-center gap-1">
                <Scale className="h-3.5 w-3.5" />
                <span>Total de Kg no Torneio</span>
              </span>
              <span className="text-base sm:text-lg font-black text-[#00e676] font-mono mt-0.5 block">
                {totalTournamentWeight.toFixed(2)} kg
              </span>
            </div>
          )}

          <div className="bg-[#121316] border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Maior Exemplar</span>
            <span className="text-sm font-black text-amber-400 font-mono mt-0.5 block">
              {isWeightTournament && heaviestCatch?.weight
                ? `${heaviestCatch.weight.toFixed(2)} kg (${heaviestCatch.species})`
                : longestCatch
                ? `${longestCatch.length} cm (${longestCatch.species})`
                : 'Aguardando'}
            </span>
          </div>
        </div>
      )}

      {/* Main Ranking Table Card matching rank torneios.png */}
      <div className="bg-[#121316] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-500 text-[11px] font-mono uppercase font-bold tracking-wider">
                <th className="py-4 px-6 text-left w-20">POS</th>
                <th className="py-4 px-6 text-left">PESCADOR / EQUIPE</th>
                <th className="py-4 px-6 text-center">CAPTURAS</th>
                <th className="py-4 px-6 text-center">DESTAQUE</th>
                {isWeightTournament ? (
                  <>
                    <th className="py-4 px-6 text-center">MAIOR CAPTURA (KG)</th>
                    <th className="py-4 px-6 text-right">TOTAL ACUMULADO</th>
                  </>
                ) : isBothMetric ? (
                  <>
                    <th className="py-4 px-6 text-center">COMPRIMENTO / PESO</th>
                    <th className="py-4 px-6 text-right">TOTAL EM KG</th>
                  </>
                ) : (
                  <th className="py-4 px-6 text-right">MAIOR PEIXE</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 px-6 text-center text-slate-500 font-medium text-sm">
                    Nenhuma captura validada para este torneio.
                  </td>
                </tr>
              ) : (
                rankings.map((entry, index) => {
                  const position = index + 1;
                  const isGold = position === 1;
                  const isSilver = position === 2;
                  const isBronze = position === 3;

                  // Photo to display: User Profile Photo > Team Logo > Letter Avatar
                  const displayPhoto = entry.userPhoto || entry.teamLogo;

                  return (
                    <tr 
                      key={entry.userId}
                      className="border-b border-slate-800/50 hover:bg-slate-900/60 transition group text-sm"
                    >
                      {/* POS Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center font-mono font-bold text-xs sm:text-sm px-2.5 py-1 rounded-xl ${
                            isGold 
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm font-extrabold' 
                              : isSilver 
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40 font-extrabold' 
                              : isBronze 
                              ? 'bg-amber-700/20 text-amber-500 border border-amber-600/40 font-extrabold' 
                              : 'text-slate-400 font-semibold'
                          }`}>
                            {position}º
                          </span>
                          {isGold && <span className="text-amber-400 text-sm">👑</span>}
                        </div>
                      </td>

                      {/* EQUIPE / PESCADOR Column (With Profile Photo) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3.5">
                          <div className="h-11 w-11 rounded-2xl bg-slate-800/90 border border-emerald-500/30 overflow-hidden flex items-center justify-center font-bold text-slate-200 shrink-0 shadow-md">
                            {displayPhoto ? (
                              <img 
                                src={displayPhoto} 
                                alt={entry.userName} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-base text-emerald-400 font-black">
                                {entry.userName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-[#00e676] transition-colors flex items-center gap-2">
                              <span>{entry.userName}</span>
                              {entry.nickname && (
                                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                  @{entry.nickname}
                                </span>
                              )}
                            </div>
                            {entry.teamName && (
                              <p className="text-xs text-[#00e676] font-semibold font-mono flex items-center gap-1 mt-0.5">
                                <span>👥 Equipe: {entry.teamName}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CAPTURAS Column */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-300">
                          {entry.allApprovedCatches.length} {entry.allApprovedCatches.length === 1 ? 'peixe' : 'peixes'}
                        </span>
                      </td>

                      {/* DESTAQUE Column */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-2.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
                          {entry.bestCatch.photoUrl ? (
                            <img 
                              src={entry.bestCatch.photoUrl} 
                              alt={entry.bestCatch.species}
                              referrerPolicy="no-referrer"
                              className="h-8 w-8 rounded-lg object-cover border border-slate-800 shrink-0"
                            />
                          ) : (
                            <Fish className="h-4 w-4 text-sky-400" />
                          )}
                          <span className="text-xs font-medium text-slate-300 truncate max-w-[120px]">
                            {entry.bestCatch.species}
                          </span>
                        </div>
                      </td>

                      {/* MAIOR PEIXE / KILOS Columns */}
                      {isWeightTournament ? (
                        <>
                          <td className="py-4 px-6 text-center">
                            <div className="font-mono">
                              <span className="text-base sm:text-lg font-black text-[#00e676]">
                                {entry.bestCatch.weight !== undefined ? `${entry.bestCatch.weight.toFixed(2)} kg` : '--'}
                              </span>
                              {entry.bestCatch.length && (
                                <span className="block text-[11px] text-slate-400">
                                  {entry.bestCatch.length} cm
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="font-mono">
                              <span className="text-base font-black text-amber-400">
                                {entry.totalWeight.toFixed(2)} kg
                              </span>
                              <span className="block text-[10px] text-slate-500 uppercase">
                                Total Pego
                              </span>
                            </div>
                          </td>
                        </>
                      ) : isBothMetric ? (
                        <>
                          <td className="py-4 px-6 text-center">
                            <div className="font-mono">
                              <span className="text-base font-black text-[#00e676]">
                                {entry.bestCatch.length} cm
                              </span>
                              {entry.bestCatch.weight !== undefined && (
                                <span className="block text-xs text-amber-400 font-bold">
                                  {entry.bestCatch.weight.toFixed(2)} kg
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="font-mono">
                              <span className="text-base font-black text-amber-400">
                                {entry.totalWeight > 0 ? `${entry.totalWeight.toFixed(2)} kg` : '--'}
                              </span>
                              <span className="block text-[10px] text-slate-500 uppercase">
                                Total acumulado
                              </span>
                            </div>
                          </td>
                        </>
                      ) : (
                        <td className="py-4 px-6 text-right">
                          <div className="font-mono">
                            <span className="text-base sm:text-lg font-black text-[#00e676]">
                              {entry.bestCatch.length} cm
                            </span>
                            {entry.bestCatch.weight !== undefined && entry.bestCatch.weight > 0 && (
                              <span className="block text-[11px] text-slate-400 font-medium">
                                {entry.bestCatch.weight.toFixed(2)} kg
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
