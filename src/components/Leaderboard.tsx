import React, { useState } from 'react';
import { Award, Trophy, Scale, Ruler, Search, ChevronDown, Fish } from 'lucide-react';
import { Tournament, Catch } from '../types';

interface LeaderboardProps {
  tournaments: Tournament[];
  catches: Catch[];
}

interface RankedEntry {
  userId: string;
  userName: string;
  userEmail: string;
  teamId?: string;
  teamName?: string;
  teamLogo?: string;
  bestCatch: Catch;
  allApprovedCatches: Catch[];
}

export default function Leaderboard({ tournaments, catches }: LeaderboardProps) {
  // Select first active tournament by default
  const activeTournaments = tournaments.filter(t => t.status === 'active' || t.status === 'completed');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    activeTournaments[0]?.id || tournaments[0]?.id || ''
  );
  
  const currentTournament = tournaments.find(t => t.id === selectedTournamentId);

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

    // For each user, find their single BEST catch according to tournament metric
    const rankings: RankedEntry[] = [];
    
    Object.keys(userGroups).forEach((userId) => {
      const userCatches = userGroups[userId];
      
      // Sort to find the absolute best catch
      const sorted = [...userCatches].sort((a, b) => {
        if (!currentTournament) return 0;
        const metric = currentTournament.metric;
        if (metric === 'length') {
          return b.length - a.length;
        } else if (metric === 'weight') {
          return (b.weight || 0) - (a.weight || 0);
        } else {
          // If both, count length as primary, weight as tiebreaker
          const doubleDiff = b.length - a.length;
          if (doubleDiff !== 0) return doubleDiff;
          return (b.weight || 0) - (a.weight || 0);
        }
      });

      rankings.push({
        userId,
        userName: sorted[0].userName,
        userEmail: sorted[0].userEmail,
        teamId: sorted[0].teamId,
        teamName: sorted[0].teamName,
        teamLogo: sorted[0].teamLogo,
        bestCatch: sorted[0],
        allApprovedCatches: userCatches
      });
    });

    // Sort contestants by best catch
    return rankings.sort((a, b) => {
      if (!currentTournament) return 0;
      const metric = currentTournament.metric;
      if (metric === 'length') {
        return b.bestCatch.length - a.bestCatch.length;
      } else if (metric === 'weight') {
        return (b.bestCatch.weight || 0) - (a.bestCatch.weight || 0);
      } else {
        const doubleDiff = b.bestCatch.length - a.bestCatch.length;
        if (doubleDiff !== 0) return doubleDiff;
        return (b.bestCatch.weight || 0) - (a.bestCatch.weight || 0);
      }
    });
  };

  const rankings = getRankings();

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
            Acompanhe o desempenho em tempo real
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
                {t.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Ranking Table Card matching rank torneios.png */}
      <div className="bg-[#121316] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-500 text-[11px] font-mono uppercase font-bold tracking-wider">
                <th className="py-4 px-6 text-left w-20">POS</th>
                <th className="py-4 px-6 text-left">EQUIPE / PESCADOR</th>
                <th className="py-4 px-6 text-center">CAPTURAS</th>
                <th className="py-4 px-6 text-center">DESTAQUE</th>
                <th className="py-4 px-6 text-right">MAIOR PEIXE</th>
              </tr>
            </thead>
            <tbody>
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 px-6 text-center text-slate-500 font-medium text-sm">
                    Nenhuma captura validada para este torneio.
                  </td>
                </tr>
              ) : (
                rankings.map((entry, index) => {
                  const position = index + 1;
                  const isGold = position === 1;
                  const isSilver = position === 2;
                  const isBronze = position === 3;

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
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm' 
                              : isSilver 
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40' 
                              : isBronze 
                              ? 'bg-amber-700/20 text-amber-500 border border-amber-600/40' 
                              : 'text-slate-400 font-semibold'
                          }`}>
                            {position}º
                          </span>
                          {isGold && <span className="text-amber-400 text-sm">👑</span>}
                        </div>
                      </td>

                      {/* EQUIPE / PESCADOR Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3.5">
                          <div className="h-10 w-10 rounded-full bg-slate-800/90 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-200 shrink-0">
                            {entry.teamLogo ? (
                              <img 
                                src={entry.teamLogo} 
                                alt={entry.teamName || 'Equipe'} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{entry.userName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-[#00e676] transition-colors flex items-center gap-2">
                              <span>{entry.userName}</span>
                            </div>
                            {entry.teamName && (
                              <p className="text-xs text-[#00e676] font-semibold font-mono flex items-center gap-1 mt-0.5">
                                <span>👥 {entry.teamName}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CAPTURAS Column */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-300">
                          {entry.allApprovedCatches.length} {entry.allApprovedCatches.length === 1 ? 'captura' : 'capturas'}
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

                      {/* MAIOR PEIXE Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="font-mono">
                          <span className="text-base sm:text-lg font-black text-[#00e676]">
                            {entry.bestCatch.length} cm
                          </span>
                          {entry.bestCatch.weight !== undefined && (
                            <span className="block text-[11px] text-slate-400 font-medium">
                              {entry.bestCatch.weight} kg
                            </span>
                          )}
                        </div>
                      </td>
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
