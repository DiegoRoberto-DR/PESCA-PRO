import React from 'react';
import { AlertTriangle, HelpCircle, Trash2, CheckCircle2, X } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Sim, Confirmar',
  cancelLabel = 'Não, Cancelar',
  variant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="h-6 w-6 text-rose-400" />,
          iconBg: 'bg-rose-500/10 border-rose-500/30',
          confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50',
          titleColor: 'text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-400" />,
          iconBg: 'bg-amber-500/10 border-amber-500/30',
          confirmBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/50 font-black',
          titleColor: 'text-white'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-400" />,
          iconBg: 'bg-emerald-500/10 border-emerald-500/30',
          confirmBtn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/50 font-black',
          titleColor: 'text-white'
        };
      case 'primary':
      default:
        return {
          icon: <HelpCircle className="h-6 w-6 text-sky-400" />,
          iconBg: 'bg-sky-500/10 border-sky-500/30',
          confirmBtn: 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-950/50 font-black',
          titleColor: 'text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl border ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div>
              <h4 className={`text-base sm:text-lg font-bold ${styles.titleColor}`}>
                {title}
              </h4>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Confirmação de Segurança
              </span>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          {message}
        </p>

        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${styles.confirmBtn}`}
          >
            {isLoading ? 'Processando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
