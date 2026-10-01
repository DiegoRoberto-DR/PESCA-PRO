import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Lock, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { Tournament, RegistrationCountdownInfo } from '../types';
import { getTournamentRegistrationCountdown } from '../utils/dbHelpers';

interface RegistrationCountdownProps {
  tournament: Tournament;
  mode?: 'card' | 'banner' | 'compact' | 'badge';
  className?: string;
  showTournamentDates?: boolean;
}

export default function RegistrationCountdown({
  tournament,
  mode = 'card',
  className = '',
  showTournamentDates = true
}: RegistrationCountdownProps) {
  const [countdown, setCountdown] = useState<RegistrationCountdownInfo>(() =>
    getTournamentRegistrationCountdown(tournament, new Date())
  );

  useEffect(() => {
    // Atualização imediata
    setCountdown(getTournamentRegistrationCountdown(tournament, new Date()));

    // Timer a cada 1 segundo para contagem fluida
    const interval = setInterval(() => {
      setCountdown(getTournamentRegistrationCountdown(tournament, new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, [tournament]);

  // Modo Badge Simples (para listas e tabelas)
  if (mode === 'badge') {
    if (countdown.status === 'completed') {
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 ${className}`}>
          🏁 Encerrado
        </span>
      );
    }
    if (countdown.status === 'manual_locked') {
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30 ${className}`}>
          <Lock className="h-3 w-3 mr-1 text-rose-400" />
          Inscrições Bloqueadas
        </span>
      );
    }
    if (countdown.status === 'closed') {
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-950/40 text-rose-400 border border-rose-600/30 ${className}`}>
          <Lock className="h-3 w-3 mr-1" />
          Inscrições Encerradas
        </span>
      );
    }
    if (countdown.status === 'not_started') {
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-950/60 text-sky-300 border border-sky-500/30 ${className}`}>
          <Clock className="h-3 w-3 mr-1 text-sky-400" />
          Abre em: {countdown.formattedCountdown}
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
        countdown.isUrgent 
          ? 'bg-amber-950/70 text-amber-300 border border-amber-500/50 animate-pulse'
          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
      } ${className}`}>
        <Clock className={`h-3 w-3 mr-1 ${countdown.isUrgent ? 'text-amber-400' : 'text-emerald-400'}`} />
        Inscrições: {countdown.formattedCountdown}
      </span>
    );
  }

  // Modo Compacto (linha única rica)
  if (mode === 'compact') {
    if (countdown.status === 'completed') {
      return (
        <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between ${className}`}>
          <span className="font-mono">Campeonato Finalizado</span>
        </div>
      );
    }
    if (countdown.status === 'manual_locked' || countdown.status === 'closed') {
      return (
        <div className={`p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between font-mono ${className}`}>
          <span className="flex items-center gap-1.5 font-bold">
            <Lock className="h-4 w-4 text-rose-400" />
            {countdown.label}
          </span>
          <span className="text-[10px] text-rose-400/80">
            Fim: {countdown.registrationEndDateFormatted}
          </span>
        </div>
      );
    }
    return (
      <div className={`p-2.5 rounded-xl ${
        countdown.isUrgent
          ? 'bg-amber-950/30 border border-amber-500/40 text-amber-200'
          : 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-200'
      } flex items-center justify-between text-xs font-mono ${className}`}>
        <div className="flex items-center gap-1.5">
          <Clock className={`h-4 w-4 ${countdown.isUrgent ? 'text-amber-400 animate-spin-slow' : 'text-emerald-400'}`} />
          <span className="font-bold">{countdown.label}:</span>
          <span className="font-extrabold text-white">{countdown.formattedCountdown}</span>
        </div>
        <span className="text-[10px] opacity-75">
          Até {countdown.registrationEndDateFormatted}
        </span>
      </div>
    );
  }

  // Modo Banner / Card Rico (com os 4 contadores digitais: Dias, Horas, Minutos, Segundos)
  return (
    <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
      countdown.status === 'completed'
        ? 'bg-slate-900/80 border border-slate-800 text-slate-400 p-3.5'
        : countdown.status === 'manual_locked'
        ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-rose-950/40 border border-rose-500/30 text-rose-200 p-3.5'
        : countdown.status === 'closed'
        ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-rose-950/40 border border-rose-500/30 text-rose-200 p-3.5'
        : countdown.status === 'not_started'
        ? 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-sky-950/40 border border-sky-500/30 text-sky-200 p-3.5'
        : countdown.isUrgent
        ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-rose-950/40 border border-amber-500/40 text-amber-200 p-3.5 shadow-lg shadow-amber-950/30'
        : 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-emerald-950/50 border border-emerald-500/30 text-emerald-200 p-3.5 shadow-lg shadow-emerald-950/20'
    } ${className}`}>
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-bold font-mono">
          {countdown.status === 'open' ? (
            <>
              <Clock className={`h-4 w-4 ${countdown.isUrgent ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
              <span className={countdown.isUrgent ? 'text-amber-300' : 'text-emerald-300'}>
                {countdown.label}
              </span>
            </>
          ) : countdown.status === 'not_started' ? (
            <>
              <Clock className="h-4 w-4 text-sky-400" />
              <span className="text-sky-300">{countdown.label}</span>
            </>
          ) : countdown.status === 'manual_locked' ? (
            <>
              <Lock className="h-4 w-4 text-rose-400" />
              <span className="text-rose-300">Inscrições Suspensas</span>
            </>
          ) : countdown.status === 'closed' ? (
            <>
              <Lock className="h-4 w-4 text-rose-400" />
              <span className="text-rose-300">Inscrições Encerradas</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">Campeonato Encerrado</span>
            </>
          )}
        </div>

        {countdown.status === 'open' && (
          countdown.isUrgent ? (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
              <span>⚡</span> Reta Final
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Inscrições Abertas
            </span>
          )
        )}

        {countdown.status === 'not_started' && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Em Breve
          </span>
        )}
      </div>

      {/* Counter Blocks Display (quando aberto ou antes de iniciar) */}
      {(countdown.status === 'open' || countdown.status === 'not_started') ? (
        <div className="grid grid-cols-4 gap-1.5 text-center font-mono my-1">
          {/* DIAS */}
          <div className="bg-slate-950/85 border border-slate-800 rounded-xl py-2 px-1 shadow-inner">
            <span className={`block text-base sm:text-lg font-black leading-none ${
              countdown.isUrgent ? 'text-amber-300' : countdown.status === 'not_started' ? 'text-sky-300' : 'text-emerald-300'
            }`}>
              {String(countdown.days).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block mt-1">
              Dias
            </span>
          </div>

          {/* HORAS */}
          <div className="bg-slate-950/85 border border-slate-800 rounded-xl py-2 px-1 shadow-inner">
            <span className={`block text-base sm:text-lg font-black leading-none ${
              countdown.isUrgent ? 'text-amber-300' : countdown.status === 'not_started' ? 'text-sky-300' : 'text-emerald-300'
            }`}>
              {String(countdown.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block mt-1">
              Horas
            </span>
          </div>

          {/* MINUTOS */}
          <div className="bg-slate-950/85 border border-slate-800 rounded-xl py-2 px-1 shadow-inner">
            <span className={`block text-base sm:text-lg font-black leading-none ${
              countdown.isUrgent ? 'text-amber-300' : countdown.status === 'not_started' ? 'text-sky-300' : 'text-emerald-300'
            }`}>
              {String(countdown.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block mt-1">
              Min
            </span>
          </div>

          {/* SEGUNDOS */}
          <div className={`bg-slate-950/85 border rounded-xl py-2 px-1 shadow-inner ${
            countdown.isUrgent ? 'border-amber-500/40 bg-amber-950/20' : 'border-slate-800'
          }`}>
            <span className={`block text-base sm:text-lg font-black leading-none animate-pulse ${
              countdown.isUrgent ? 'text-rose-400' : countdown.status === 'not_started' ? 'text-sky-400' : 'text-emerald-400'
            }`}>
              {String(countdown.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block mt-1">
              Seg
            </span>
          </div>
        </div>
      ) : (
        /* Status de Encerramento / Bloqueio */
        <div className="py-2.5 px-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-center my-1">
          <p className="text-xs font-semibold text-slate-300 font-mono">
            {countdown.status === 'closed'
              ? `O prazo oficial de inscrições se encerrou em ${countdown.registrationEndDateFormatted}.`
              : countdown.status === 'manual_locked'
              ? 'As inscrições para este campeonato estão momentaneamente suspensas.'
              : 'Este campeonato já foi concluído e consagrou seus campeões.'}
          </p>
        </div>
      )}

      {/* Footer Details: Exibição clara e separada do Período de Inscrição vs Período do Torneio */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/70 text-[10px] font-mono space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">📝 Inscrições:</span>
            <span>até <strong className="text-slate-200">{countdown.registrationEndDateFormatted}</strong></span>
          </span>
          {showTournamentDates && (
            <span className="flex items-center gap-1 text-slate-400">
              <span className="text-sky-400 font-bold">🎣 Prova:</span>
              <strong className="text-slate-200">{countdown.tournamentStartDateFormatted} a {countdown.tournamentEndDateFormatted}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
