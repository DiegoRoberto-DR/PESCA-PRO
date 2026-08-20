import React, { useState } from 'react';
import { Award, Trophy, Scale, Ruler, Search, ArrowUpRight, TrendingUp, Filter } from 'lucide-react';
import { Tournament, Catch } from '../types';

interface LeaderboardProps {
  tournaments: Tournament[];
  catches: Catch[];
}

interface RankedEntry {
  userId: string;
  userName: string;
  userEmail: string;
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
        bestCatch: sorted[0],
        allApprovedCatches: userCatches
      });
    });

    // Now sort overall contestants
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
  const podium = rankings.slice(0, 3);
  const remainingList = rankings.slice(3);

  // Position color styles for Podium
  const getPodiumStyles = (idx: number) => {
    switch (idx) {
      case 0: // 1st
        return {
          cardBg: 'to-amber-500/15 border-amber-500/30',
          badgeBg: 'bg-amber-400 text-amber-950',
          textColor: 'text-amber-400',
          trophyColor: 'text-amber-400',
          label: 'Campeão'
        };
      case 1: // 2nd
        return {
          cardBg: 'to-slate-400/15 border-slate-400/30',
          badgeBg: 'bg-slate-300 text-slate-900',
          textColor: 'text-slate-300',
          trophyColor: 'text-slate-300',
          label: 'Vice-Campeão'
        };
      case 2: // 3rd
        return {
          cardBg: 'to-amber-700/15 border-amber-800/30',
          badgeBg: 'bg-amber-600 text-amber-950',
          textColor: 'text-amber-600',
          trophyColor: 'text-amber-600',
          label: '3ª Colocação'
        };
      default:
        return {
          cardBg: 'to-slate-800/10 border-slate-800',
          badgeBg: 'bg-slate-800 text-slate-300',
          textColor: 'text-slate-400',
          trophyColor: 'text-slate-500',
          label: ''
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Selection Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <span>Classificação em Tempo Real</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Placar oficial atualizado dinamicamente com base em capturas validadas pelos moderadores e IA.
          </p>
        </div>

        {/* Dropdown Filter */}
        <div className="flex items-center space-x-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0">
          <Filter className="h-4 w-4 text-sky-400" />
          <select
            id="tournament-leaderboard-select"
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="bg-transparent text-slate-200 text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer pr-3 max-w-[250px]"
          >
            <option value="" disabled className="bg-slate-950">Selecione o Campeonato</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-950">
                {t.title} ({t.status === 'active' ? 'Ativo' : t.status === 'completed' ? 'Encerrado' : 'Breve'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!currentTournament ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400">Nenhum campeonato encontrado.</p>
        </div>
      ) : rankings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-slate-200 font-bold">O Placar está Vazio</h3>
            <p className="text-slate-400 text-sm mt-1">
              Ainda não existem capturas validadas e aprovadas para este campeonato. Envie sua captura para ser o primeiro!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Podium Layout */}
          {podium.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {podium.map((entry, index) => {
                const style = getPodiumStyles(index);
                const showLength = currentTournament.metric === 'length' || currentTournament.metric === 'both';
                const showWeight = currentTournament.metric === 'weight' || currentTournament.metric === 'both';

                return (
                  <div 
                    key={entry.userId}
                    className={`bg-gradient-to-br from-slate-900 ${style.cardBg} border ${style.cardBg} rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group`}
                  >
                    {/* Position Badge */}
                    <div className="absolute top-4 right-4 flex items-center space-x-1.5">
                      <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${style.badgeBg}`}>
                        {index + 1}º
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Avatar / Crown */}
                      <div className="flex items-center space-x-3">
                        <div className={`h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg text-white border-2 border-slate-800`}>
                          {entry.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-500">{style.label}</p>
                          <h4 className="text-base font-bold text-white leading-tight group-hover:text-sky-400 transition-colors">
                            {entry.userName}
                          </h4>
                        </div>
                      </div>

                      {/* Best Catch Card Detail */}
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-slate-500 font-mono">MAIOR EXEMPLAR</span>
                            <p className="text-sm font-bold text-slate-200">🐟 {entry.bestCatch.species}</p>
                          </div>
                          {entry.bestCatch.photoUrl && (
                            <img 
                              src={entry.bestCatch.photoUrl} 
                              alt="Peixe"
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 object-cover rounded-lg border border-slate-800"
                            />
                          )}
                        </div>

                        {/* Specs */}
                        <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-300">
                          {showLength && (
                            <div className="flex items-center space-x-1">
                              <Ruler className="h-3.5 w-3.5 text-sky-400" />
                              <span><strong>{entry.bestCatch.length}</strong> cm</span>
                            </div>
                          )}
                          {showWeight && entry.bestCatch.weight !== undefined && (
                            <div className="flex items-center space-x-1">
                              <Scale className="h-3.5 w-3.5 text-amber-500" />
                              <span><strong>{entry.bestCatch.weight}</strong> kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats footer details */}
                    <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-400">
                      <span>Total de Capturas Homologadas</span>
                      <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                        {entry.allApprovedCatches.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Remaining List Table */}
          {remainingList.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-5 py-4 bg-slate-950 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">Mais Competidores</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase font-mono">
                      <th className="py-3 px-5 text-center">Pos</th>
                      <th className="py-3 px-5">Pescador</th>
                      <th className="py-3 px-5">Maior Espécime</th>
                      <th className="py-3 px-5">Tamanho (cm)</th>
                      <th className="py-3 px-5">Peso (kg)</th>
                      <th className="py-3 px-5 text-right">Aprovações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remainingList.map((entry, idx) => {
                      const position = idx + 4;
                      return (
                        <tr 
                          key={entry.userId}
                          className="hover:bg-slate-800/40 border-b border-slate-800 transition text-sm text-slate-300"
                        >
                          <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-400">
                            {position}º
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-white">
                            {entry.userName}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-sky-400">
                            🐟 {entry.bestCatch.species}
                          </td>
                          <td className="py-3.5 px-5 font-mono">
                            {entry.bestCatch.length} cm
                          </td>
                          <td className="py-3.5 px-5 font-mono text-slate-400">
                            {entry.bestCatch.weight !== undefined ? `${entry.bestCatch.weight} kg` : '-'}
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono text-emerald-400 font-semibold">
                            {entry.allApprovedCatches.length}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
