import React, { useState } from 'react';
import { 
  Ruler, 
  Video, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  X, 
  Fish, 
  Camera, 
  Waves, 
  UploadCloud, 
  CheckSquare
} from 'lucide-react';

interface OfficialCaptureRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentTitle?: string;
}

export default function OfficialCaptureRulesModal({
  isOpen,
  onClose,
  tournamentTitle = 'FISGADA PRO'
}: OfficialCaptureRulesModalProps) {
  const [copiedSpeech, setCopiedSpeech] = useState(false);

  if (!isOpen) return null;

  const exampleSpeech = `"[Seu Nome / Nº Competidor], Captura 01, [Palavra-chave Oficial]"`;

  const handleCopySpeech = () => {
    navigator.clipboard.writeText(exampleSpeech);
    setCopiedSpeech(true);
    setTimeout(() => setCopiedSpeech(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-[#121418] border border-emerald-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-[#121418] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Regulamento Oficial
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {tournamentTitle}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                <span>REGRAS DE COMPROVAÇÃO DA CAPTURA</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm leading-relaxed">
          
          {/* Header Introduction Banner */}
          <div className="bg-gradient-to-r from-emerald-500/15 via-slate-900/90 to-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-2">
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              Para que uma captura seja válida, o participante deverá apresentar os registros abaixo. Todos os registros deverão ser feitos no momento da captura e não poderão ser editados de forma que comprometam a comprovação.
            </p>
          </div>

          {/* ITEM 1: VÍDEO INICIAL DA CAPTURA */}
          <div className="bg-[#181a1f] border border-emerald-500/30 rounded-2xl p-5 space-y-3.5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0 font-bold">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>1. 🎣 VÍDEO INICIAL DA CAPTURA</span>
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300">
              O participante deverá realizar um vídeo assim que realizar a captura, com o peixe ainda na água ou imediatamente após retirá-lo da água.
            </p>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                No vídeo, deverá:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Mostrar claramente o peixe capturado;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Mostrar que o peixe está vivo;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Informar seu nome ou número de competidor;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Informar o número da captura (ex.: <span className="text-emerald-300 font-mono font-bold">“Captura 01”</span>);</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Falar em voz alta a palavra-chave oficial do campeonato.</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-300/90 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                O objetivo deste vídeo é comprovar que a captura pertence ao participante e foi realizada durante o período oficial da competição.
              </span>
            </div>
          </div>

          {/* ITEM 2: FOTO DA MEDIÇÃO */}
          <div className="bg-[#181a1f] border border-amber-500/30 rounded-2xl p-5 space-y-3.5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0 font-bold">
                <Ruler className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>2. 📏 FOTO DA MEDIÇÃO</span>
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300">
              Após a captura, o participante deverá realizar uma foto nítida da medição do peixe.
            </p>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                A foto deverá mostrar claramente:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>A régua oficial utilizada na competição;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>A cabeça do peixe posicionada corretamente no ponto zero da régua;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>O comprimento total do peixe;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>A ponta da cauda;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>A escala da régua de forma nítida e legível.</span>
                </li>
              </ul>
            </div>

            <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-3.5 text-xs text-rose-300/90 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Fotos tremidas, desfocadas, cortadas ou que não permitam identificar claramente a medida poderão ser desclassificadas.
              </span>
            </div>
          </div>

          {/* ITEM 3: VÍDEO DA SOLTURA */}
          <div className="bg-[#181a1f] border border-sky-500/30 rounded-2xl p-5 space-y-3.5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/40 shrink-0 font-bold">
                <Waves className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>3. 🐟 VÍDEO DA SOLTURA</span>
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300">
              Após a medição, o participante deverá realizar um vídeo da soltura do peixe com vida.
            </p>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                O vídeo deverá mostrar claramente:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>O peixe sendo colocado novamente na água;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>O peixe vivo e em condições de retornar ao ambiente;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>O peixe nadando ou se afastando por conta própria.</span>
                </li>
              </ul>
            </div>

            <div className="bg-sky-950/30 border border-sky-500/20 rounded-xl p-3.5 text-xs text-sky-300/90 flex items-start gap-2.5">
              <Fish className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                A captura somente será considerada válida quando houver comprovação da soltura do peixe com vida, respeitando o sistema de Pesque e Solte.
              </span>
            </div>
          </div>

          {/* SEÇÃO IMPORTANTE */}
          <div className="bg-[#1c1618] border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-black text-amber-400 uppercase tracking-wider">
                ⚠️ IMPORTANTE
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <CheckSquare className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Os três registros — <strong>vídeo inicial da captura</strong>, <strong>foto da medição</strong> e <strong>vídeo da soltura</strong> — deverão corresponder ao mesmo peixe e à mesma captura.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <UploadCloud className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <p>
                  O participante deverá enviar os arquivos ou os respectivos links para a plataforma indicada pela organização, como Google Drive, YouTube ou outra plataforma equivalente, conforme orientação do campeonato.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <ShieldCheck className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <p>
                  A organização poderá solicitar os arquivos originais para conferência e poderá invalidar a captura caso os registros sejam insuficientes, ilegíveis, incompatíveis entre si ou não permitam comprovar a captura e a soltura do peixe com vida.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#16181d] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Regras válidas para todas as categorias e etapas oficiais.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-mono uppercase rounded-xl transition shadow-lg cursor-pointer text-center"
          >
            Entendido, Fechar Regras
          </button>
        </div>

      </div>
    </div>
  );
}

