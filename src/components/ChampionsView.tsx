import React from 'react';
import { Trophy, Medal, Crown, Award, Calendar, Sparkles, Fish, MapPin, Ruler, CheckCircle2, Flame, Users } from 'lucide-react';
import { Tournament, Catch } from '../types';

interface ChampionsViewProps {
  tournaments: Tournament[];
  catches: Catch[];
  onSelectTournament?: (tournament: Tournament) => void;
}

export default function ChampionsView({ tournaments, catches, onSelectTournament }: ChampionsViewProps) {
  const approvedCatches = catches.filter(c => c.status === 'approved');

  // Completed tournaments
  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  // Hall of Fame - All-time Top 3 biggest catches
  const allTimeBiggest = [...approvedCatches].sort((a, b) => b.length - a.length).slice(0, 3);

  // Group winners by tournament
  const tournamentWinners = tournaments.map(tourney => {
    const tourneyCatches = approvedCatches.filter(c => c.tournamentId === tourney.id);
    
    // Group catches by user and calculate total length or highest catch
    const userTotals = new Map<string, {
      userId: string;
      userName: string;
      totalLength: number;
      bestCatch: Catch;
      catchesCount: number;
    }>();

    tourneyCatches.forEach(c => {
      const existing = userTotals.get(c.userId);
      if (!existing) {
        userTotals.set(c.userId, {
          userId: c.userId,
          userName: c.userName,
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
    const champion = ranking[0] || null;
    const runnerUp = ranking[1] || null;
    const thirdPlace = ranking[2] || null;

    return {
      tournament: tourney,
      champion,
      runnerUp,
      thirdPlace,
      totalParticipants: ranking.length,
      totalFishApproved: tourneyCatches.length
    };
  });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>GALERIA DE HONRA & HALL DOS CAMPEÕES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Campeões & Recordes Nacionais
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Consagração dos grandes pescadores esportivos, maiores troféus homologados e vencedores das arenas oficiais.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Troféus Concedidos</span>
              <p className="text-xl font-bold text-white">{tournaments.length * 3} Pódios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 All-Time Record Catches (O Pódio dos Recordistas) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Recordes Absolutos de Comprimento (Hall da Fama)</h3>
        </div>

        {allTimeBiggest.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            Aguardando homologação dos primeiros grandes troféus para o Hall da Fama.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allTimeBiggest.map((record, index) => (
              <div 
                key={record.id}
                className={`relative bg-slate-900 border rounded-3xl p-5 overflow-hidden shadow-xl transition hover:border-amber-500/50 ${
                  index === 0 
                    ? 'border-amber-500/50 shadow-amber-500/10 bg-gradient-to-b from-amber-950/20 to-slate-900' 
                    : index === 1 
                    ? 'border-slate-700 bg-slate-900' 
                    : 'border-amber-700/40 bg-slate-900'
                }`}
              >
                {/* Ribbon badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Crown className="h-6 w-6 text-amber-400 fill-amber-400" />}
                    {index === 1 && <Medal className="h-6 w-6 text-slate-300" />}
                    {index === 2 && <Medal className="h-6 w-6 text-amber-700" />}
                    <span className="text-xs font-mono font-bold uppercase text-slate-300">
                      {index === 0 ? '🏆 1º Maior Troféu' : index === 1 ? '🥈 2º Maior Troféu' : '🥉 3º Maior Troféu'}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-400 text-xs font-mono font-bold border border-slate-800">
                    {record.length} cm
                  </span>
                </div>

                {/* Photo */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-4 border border-slate-800">
                  <img 
                    src={record.photoUrl} 
                    alt={record.species} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-xs text-white font-semibold">
                    <span>{record.species}</span>
                    <span className="font-mono text-[11px] text-sky-400">{record.location}</span>
                  </div>
                </div>

                {/* Fisher Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500">Pescador Consagrado</span>
                      <h4 className="text-sm font-bold text-white">{record.userName}</h4>
                    </div>
                    {record.weight && (
                      <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        ⚖️ {record.weight} kg
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-sky-400 truncate">
                    Torneio: {record.tournamentTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Podium per Tournament */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold text-white">Líderes e Campeões por Torneio</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Atualizado em tempo real
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournamentWinners.map(({ tournament, champion, runnerUp, thirdPlace, totalParticipants, totalFishApproved }) => (
            <div 
              key={tournament.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 hover:border-slate-700 transition"
            >
              {/* Tournament Title & Status */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    {tournament.status === 'completed' ? '🏁 Torneio Finalizado' : '🟢 Torneio em Andamento'}
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">{tournament.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">Prêmio: {tournament.prize}</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                  {totalParticipants} Competidores
                </span>
              </div>

              {/* Podium Breakdown */}
              <div className="space-y-3">
                {/* 1st Place */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-950 to-slate-950 border border-amber-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
                      1º
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{champion ? champion.userName : 'Aguardando líder'}</span>
                        {champion && <Crown className="h-3 w-3 text-amber-400" />}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {champion ? `${champion.catchesCount} capturas homologadas` : 'Sem capturas ainda'}
                      </p>
                    </div>
                  </div>
                  {champion && (
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-amber-400">{champion.bestCatch.length} cm</span>
                      <span className="text-[9px] text-slate-500 block">Maior Peixe</span>
                    </div>
                  )}
                </div>

                {/* 2nd Place */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/80 border border-slate-850">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs">
                      2º
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">
                        {runnerUp ? runnerUp.userName : 'Vago'}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {runnerUp ? `${runnerUp.catchesCount} capturas` : '-'}
                      </p>
                    </div>
                  </div>
                  {runnerUp && (
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-slate-300">{runnerUp.bestCatch.length} cm</span>
                    </div>
                  )}
                </div>

                {/* 3rd Place */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/80 border border-slate-850">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-900/40 text-amber-500 font-bold flex items-center justify-center text-xs border border-amber-900/60">
                      3º
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">
                        {thirdPlace ? thirdPlace.userName : 'Vago'}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {thirdPlace ? `${thirdPlace.catchesCount} capturas` : '-'}
                      </p>
                    </div>
                  </div>
                  {thirdPlace && (
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-amber-500">{thirdPlace.bestCatch.length} cm</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
