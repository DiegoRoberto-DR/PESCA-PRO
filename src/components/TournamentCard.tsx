import React from 'react';
import { Trophy, Calendar, Users, Award, Target, DollarSign, Key } from 'lucide-react';
import { Tournament } from '../types';

interface TournamentCardProps {
  key?: string;
  tournament: Tournament;
  onParticipate: (tournament: Tournament) => void;
  isLoggedIn: boolean;
}

export default function TournamentCard({ tournament, onParticipate, isLoggedIn }: TournamentCardProps) {
  const getStatusBadge = (status: Tournament['status']) => {
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
    switch (metric) {
      case 'length':
        return 'Maior Comprimento (cm)';
      case 'weight':
        return 'Maior Peso (kg)';
      case 'both':
        return 'Comprimento (cm) e Peso (kg)';
    }
  };

  // Format date range nicely
  const formatDateStr = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col group h-full">
      {/* Target Image & Cover */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
        <img 
          src={tournament.imageUrl} 
          alt={tournament.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        
        {/* Status Badge overlay */}
        <div className="absolute top-4 right-4 z-10">
          {getStatusBadge(tournament.status)}
        </div>

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
                {tournament.teamFormat === 'solo' && 'Solo'}
                {tournament.teamFormat === 'dupla' && 'Dupla'}
                {tournament.teamFormat === 'trio' && 'Equipe de 3'}
                {tournament.teamFormat === 'quarteto' && 'Equipe de 4'}
                {!tournament.teamFormat && 'Solo'}
              </strong></span>
            </div>
          </div>

          {/* Anti-fraud Verification Keyword */}
          <div className="flex items-center gap-1.5 text-[10px] bg-amber-500/5 px-2.5 py-1.5 rounded-xl border border-amber-500/10 font-mono">
            <Key className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-450 uppercase text-[9px]">Chave Antifraude:</span>
            <span className="font-extrabold text-amber-400 tracking-wider uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">
              {tournament.keyword || 'PESCA2026'}
            </span>
          </div>

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
              <div>
                <span className="text-[10px] font-mono text-amber-400/80 tracking-wider uppercase">Premiação</span>
                <p className="text-xs text-amber-200 mt-0.5 leading-relaxed font-medium">
                  {tournament.prize}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-2">
          {tournament.status === 'completed' ? (
            <button
              disabled
              className="w-full bg-slate-800 text-slate-500 font-semibold text-sm py-2.5 px-4 rounded-xl cursor-not-allowed border border-slate-700/50 text-center"
            >
              Campeonato Encerrado
            </button>
          ) : (
            <button
              onClick={() => onParticipate(tournament)}
              className="w-full bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-200 font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-slate-700 hover:border-sky-400 transition-all shadow-md active:scale-[0.98] cursor-pointer text-center"
            >
              {tournament.status === 'upcoming' ? 'Pré-Inscrição Disponível' : 'Enviar Captura do Peixe'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
