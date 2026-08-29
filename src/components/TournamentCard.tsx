import React from 'react';
import { Trophy, Calendar, Users, Award, Target, DollarSign, Key, Radio, Clock, Lock, CheckCircle2 } from 'lucide-react';
import { Tournament } from '../types';
import { getTournamentLiveStatus } from '../utils/dbHelpers';

interface TournamentCardProps {
  key?: string;
  tournament: Tournament;
  onParticipate: (tournament: Tournament) => void;
  isLoggedIn: boolean;
}

export default function TournamentCard({ tournament, onParticipate, isLoggedIn }: TournamentCardProps) {
  const liveInfo = getTournamentLiveStatus(tournament);

  const getStatusBadge = (status: Tournament['status']) => {
    if (liveInfo.isLive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg shadow-rose-600/40 border border-rose-400 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-white mr-1.5 animate-ping"></span>
          🔴 AO VIVO - PROVA ABERTA
        </span>
      );
    }

    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Em Andamento
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Falta Pouco
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Finalizado
          </span>
        );
    }
  };

  const getMetricName = (metric: Tournament['metric']) => {
    if (metric === 'points' || tournament.pointsConfig?.enabled) {
      return '⭐ Sistema de Pontuação (Pts)';
    }
    switch (metric) {
      case 'length':
        return 'Maior Comprimento (cm)';
      case 'weight':
        return 'Maior Peso (kg)';
      case 'both':
        return 'Comprimento (cm) e Peso (kg)';
      default:
        return 'Maior Comprimento (cm)';
    }
  };

  // Format date range nicely
  const formatDateStr = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col group h-full relative">
      {/* Target Image & Cover (Exact 16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-950">
        <img 
          src={tournament.imageUrl} 
          alt={tournament.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        
        {/* Status Badge overlay */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
          {getStatusBadge(tournament.status)}
          {tournament.status !== 'completed' && tournament.allowRegistration === false && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/90 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-md">
              <Lock className="h-3 w-3 mr-1 text-rose-400" />
              Inscrições Fechadas
            </span>
          )}
        </div>

        {/* Live Banner Overlay inside image if live */}
        {liveInfo.isLive && liveInfo.activeWindow && (
          <div className="absolute top-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-rose-500/40 px-2.5 py-1 rounded-xl flex items-center space-x-2 text-[11px] font-bold text-rose-400 shadow-xl">
            <Radio className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
            <span>Janela: <strong>{liveInfo.activeWindow.name || 'Etapa Hoje'}</strong></span>
            {liveInfo.timeRemainingStr && (
              <span className="text-white font-mono text-[10px] bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-700">
                Faltam {liveInfo.timeRemainingStr}
              </span>
            )}
          </div>
        )}

        {/* Metric indicator badge overlay */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 text-xs">
          <Target className="h-3.5 w-3.5 text-sky-400" />
          <span>Métrica: <strong>{getMetricName(tournament.metric)}</strong></span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-sky-400 transition-colors">
              {tournament.title}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 line-clamp-3 leading-relaxed">
              {tournament.description}
            </p>
          </div>

          {/* Targeted species list */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">Espécies Válidas</span>
            <div className="flex flex-wrap gap-1.5">
              {tournament.targetSpecies.map((species, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
                >
                  🐟 {species}
                </span>
              ))}
            </div>
          </div>

          {/* Tournament Specifications */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-800/40 pt-3">
            <div className="flex items-center space-x-1.5 text-slate-400 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/40">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Taxa: <strong className={tournament.entryFeeType === 'pago' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {tournament.entryFeeType === 'pago' ? `R$ ${tournament.entryFeeAmount || 0}` : 'Grátis'}
              </strong></span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-slate-400 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/40">
              <Users className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span>Formato: <strong className="text-slate-200 capitalize font-bold">
                {tournament.teamFormat === 'solo' && 'Solo (1 Pessoa)'}
                {tournament.teamFormat === 'dupla' && 'Dupla (2 Pessoas)'}
                {tournament.teamFormat === 'trio' && 'Trio (3 Pessoas)'}
                {tournament.teamFormat === 'quarteto' && 'Quarteto (4 Pessoas)'}
                {tournament.teamFormat === 'quinteto' && 'Quinteto (5 Pessoas)'}
                {!tournament.teamFormat && 'Solo'}
              </strong></span>
            </div>
          </div>

          {/* Points rules tag if enabled */}
          {(tournament.pointsConfig?.enabled || tournament.metric === 'points') && (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-[11px] font-mono text-amber-400">
              <span className="font-bold flex items-center gap-1.5">
                ⭐ Pontuação por Peixe / Faixas
              </span>
              <span className="text-[10px] text-amber-300/80">
                {tournament.pointsConfig?.pointRules?.length || tournament.pointsConfig?.rules?.length || 0} faixas ativas
              </span>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 border-y border-slate-800 py-3.5 text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              <Calendar className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 uppercase">Período</span>
                <span className="font-semibold text-slate-300">
                  {formatDateStr(tournament.startDate)} a {formatDateStr(tournament.endDate)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-400">
              <Users className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 uppercase">Pescadores</span>
                <span className="font-semibold text-slate-300">
                  {Array.isArray(tournament.participantCount) ? tournament.participantCount.length : (tournament.participantCount || 0)} inscritos
                </span>
              </div>
            </div>
          </div>

          {/* Prize Section */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-start space-x-2">
              <Award className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-amber-400/80 tracking-wider uppercase block">Premiação</span>
                <div className="text-xs text-amber-200 mt-0.5 leading-relaxed font-medium whitespace-pre-line">
                  {tournament.prize}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-2">
          {tournament.status === 'completed' ? (
            <div className="w-full bg-slate-800/60 text-slate-500 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-800 text-center">
              Campeonato Encerrado
            </div>
          ) : tournament.allowRegistration === false ? (
            <button
              onClick={() => onParticipate(tournament)}
              className="w-full bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-2 shadow-md"
            >
              <Lock className="h-4 w-4 text-rose-400" />
              <span>Inscrições Bloqueadas</span>
            </button>
          ) : (
            <button
              onClick={() => onParticipate(tournament)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/60 transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Trophy className="h-4 w-4" />
              <span>Participar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
