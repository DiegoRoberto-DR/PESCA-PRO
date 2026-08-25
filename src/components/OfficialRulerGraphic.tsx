import React, { useState } from 'react';
import { 
  Ruler, 
  CheckCircle2, 
  Sparkles, 
  Maximize2, 
  ShieldCheck, 
  QrCode, 
  Truck, 
  CreditCard, 
  Copy, 
  Check, 
  MessageCircle, 
  Info,
  ZoomIn
} from 'lucide-react';

interface OfficialRulerGraphicProps {
  compact?: boolean;
  onOpenZoom?: () => void;
}

export default function OfficialRulerGraphic({ compact = false, onOpenZoom }: OfficialRulerGraphicProps) {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl p-3 sm:p-5 select-none">
      
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#00c853]/15 text-[#00c853] rounded-lg">
            <Ruler className="h-4 w-4" />
          </span>
          <div>
            <span className="text-xs font-black text-white uppercase tracking-wider block">
              Régua Homologada Fisgada Pro
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Comprimento: 100 cm • Largura: 20 cm • Encosto 90°
            </span>
          </div>
        </div>

        {onOpenZoom && (
          <button
            type="button"
            onClick={onOpenZoom}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Ampliar visualização"
          >
            <Maximize2 className="h-3.5 w-3.5 text-[#00c853]" />
            <span className="hidden sm:inline">Ampliar</span>
          </button>
        )}
      </div>

      {/* Realistic Fisgada Pro Ruler Visual Representation */}
      <div className="relative w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="min-w-[580px] max-w-full mx-auto bg-[#0a0c10] p-3 sm:p-4 rounded-xl border border-slate-800 flex flex-col items-center">
          
          {/* TOP 90° HEADBOARD WITH LOGO & QR CODE */}
          <div className="w-full bg-[#0d0e11] border-2 border-slate-700 rounded-t-xl p-3 sm:p-4 relative shadow-lg flex items-center justify-between overflow-hidden">
            {/* Corner Rivets */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-slate-950" />
            </div>
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-slate-950" />
            </div>

            {/* Fish Graphic + Logo */}
            <div className="flex items-center gap-3 pl-4">
              <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#00c853]/20 to-emerald-950/40 rounded-xl border border-[#00c853]/40">
                <svg viewBox="0 0 100 100" className="w-10 h-10 text-[#00c853]" fill="currentColor">
                  {/* Stylized Tucunaré Jumping Fish */}
                  <path d="M 85,35 C 75,20 50,18 35,28 C 25,35 18,48 10,50 C 18,52 25,48 30,55 C 35,62 45,68 60,65 C 75,62 88,48 85,35 Z" fill="#00c853" />
                  <path d="M 85,35 C 92,28 98,30 95,42 C 90,40 85,38 85,35 Z" fill="#00e676" />
                  <path d="M 10,50 C 5,42 2,35 0,32 C 3,45 4,55 0,68 C 6,62 10,55 10,50 Z" fill="#2e7d32" />
                  <circle cx="75" cy="35" r="3" fill="#000" />
                  <circle cx="76" cy="34" r="1" fill="#fff" />
                  <path d="M 50,30 Q 60,35 65,45" stroke="#fff" strokeWidth="2" fill="none" />
                </svg>
              </div>

              <div>
                <div className="flex items-baseline gap-1 font-black italic tracking-tighter text-lg sm:text-2xl">
                  <span className="text-white drop-shadow">FISGADA</span>
                  <span className="text-[#00c853] drop-shadow-[0_0_12px_rgba(0,200,83,0.6)]">PRO</span>
                </div>
                <div className="text-[9px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                  RÉGUA OFICIAL HOMOLOGADA 100CM
                </div>
              </div>
            </div>

            {/* QR Code Antifraude */}
            <div className="flex items-center gap-2 pr-4">
              <div className="flex flex-col items-center bg-black p-1.5 rounded-lg border-2 border-[#00c853]">
                {/* Visual QR Code Representation */}
                <div className="w-9 h-9 bg-white p-0.5 grid grid-cols-5 gap-0.5 rounded">
                  <div className="bg-black col-span-2 row-span-2" />
                  <div className="bg-black" />
                  <div className="bg-black col-span-2 row-span-2" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black col-span-2 row-span-2" />
                  <div className="bg-black" />
                  <div className="bg-black col-span-2 row-span-2" />
                </div>
                <span className="text-[7px] font-mono font-black text-[#00c853] tracking-tight mt-0.5">
                  ESCANEIE ME
                </span>
              </div>
            </div>
          </div>

          {/* MAIN 100CM MEASURING SCALE BODY */}
          <div className="w-full bg-white text-slate-950 font-mono flex border-x-2 border-b-2 border-slate-700 shadow-inner relative overflow-hidden">
            
            {/* Background Watermark Tucunaré Silhouette */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none">
              <svg viewBox="0 0 500 150" className="w-[85%] h-auto text-black" fill="currentColor">
                <path d="M 450,75 C 400,30 280,25 180,50 C 130,62 80,55 30,75 C 80,95 130,88 180,100 C 280,125 400,120 450,75 Z" />
                <path d="M 30,75 C 10,50 0,35 0,30 C 10,55 10,95 0,120 C 10,115 20,100 30,75 Z" />
              </svg>
            </div>

            {/* 1. LEFT NEON GREEN SCALE (0 to 100cm) */}
            <div className="w-24 sm:w-28 bg-[#00c853] border-r-2 border-black p-1 sm:p-2 flex flex-col justify-between select-none relative z-10">
              <div className="text-[10px] font-black text-black text-center border-b border-black/30 pb-0.5 mb-1 tracking-tighter">
                ESCALA NEON
              </div>
              
              {/* Scale Milestones */}
              <div className="space-y-3 sm:space-y-4">
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100].map((cm) => (
                  <div key={cm} className="flex items-center justify-between pr-1">
                    <span className="font-black text-xs sm:text-base leading-none text-black">
                      {cm}
                    </span>
                    <div className="w-3 sm:w-4 h-0.5 bg-black" />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. CENTER HIGH-CONTRAST GRADUATED SCALE WITH RED MILESTONES */}
            <div className="flex-1 p-2 sm:p-3 relative z-10 flex flex-col justify-between">
              
              {/* Highlight Lines */}
              <div className="space-y-3 sm:space-y-3.5">
                
                {/* 0cm Zero Base */}
                <div className="flex items-center gap-2 border-b-2 border-black pb-1">
                  <span className="text-xs font-black text-black">0 cm (MARCO ZERO - ENCOSTO)</span>
                  <div className="flex-1 h-0.5 bg-black" />
                </div>

                {/* 10cm */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-300 pb-0.5">
                  <span className="text-[11px]">10 cm</span>
                  <div className="flex-1 mx-2 h-px bg-slate-300" />
                  <span className="text-[10px] text-slate-500 font-mono">100 mm</span>
                </div>

                {/* 15cm */}
                <div className="flex items-center justify-between text-xs font-bold text-rose-600 border-b-2 border-rose-500 pb-0.5 bg-rose-50/50 px-1 rounded">
                  <span className="text-xs font-black text-rose-600">● 15 cm</span>
                  <div className="flex-1 mx-2 h-0.5 bg-rose-500" />
                  <span className="text-[11px] font-black text-rose-600">150 mm</span>
                </div>

                {/* 20cm */}
                <div className="flex items-center justify-between text-xs font-bold text-rose-600 border-b-2 border-rose-500 pb-0.5 bg-rose-50/50 px-1 rounded">
                  <span className="text-xs font-black text-rose-600">● 20 cm</span>
                  <div className="flex-1 mx-2 h-0.5 bg-rose-500" />
                  <span className="text-[11px] font-black text-rose-600">200 mm</span>
                </div>

                {/* 30cm */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-400 pb-0.5">
                  <span className="text-xs font-extrabold text-black">30 cm</span>
                  <div className="flex-1 mx-2 h-px bg-slate-400" />
                  <span className="text-[10px] text-slate-700">300 mm</span>
                </div>

                {/* 35cm */}
                <div className="flex items-center justify-between text-xs font-bold text-rose-600 border-b-2 border-rose-500 pb-0.5 bg-rose-50/50 px-1 rounded">
                  <span className="text-xs font-black text-rose-600">● 35 cm</span>
                  <div className="flex-1 mx-2 h-0.5 bg-rose-500" />
                  <span className="text-[11px] font-black text-rose-600">350 mm</span>
                </div>

                {/* 50cm - Grande Troféu */}
                <div className="flex items-center justify-between text-sm font-black text-rose-600 border-b-2 border-rose-600 pb-1 bg-rose-100/70 px-1.5 rounded shadow-sm">
                  <span className="text-sm font-black text-rose-700 flex items-center gap-1">
                    ★ 50 cm
                  </span>
                  <div className="flex-1 mx-2 h-1 bg-rose-600" />
                  <span className="text-xs font-black text-rose-700">500 mm (TROFÉU)</span>
                </div>

                {/* 65cm */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-400 pb-0.5">
                  <span className="text-xs font-extrabold text-black">65 cm</span>
                  <div className="flex-1 mx-2 h-px bg-slate-400" />
                  <span className="text-[10px] text-slate-700">650 mm</span>
                </div>

                {/* 80cm */}
                <div className="flex items-center justify-between text-xs font-bold text-rose-600 border-b-2 border-rose-500 pb-0.5 bg-rose-50/50 px-1 rounded">
                  <span className="text-xs font-black text-rose-600">● 80 cm</span>
                  <div className="flex-1 mx-2 h-0.5 bg-rose-500" />
                  <span className="text-[11px] font-black text-rose-600">800 mm</span>
                </div>

                {/* 90cm */}
                <div className="flex items-center justify-between text-xs font-bold text-rose-600 border-b-2 border-rose-500 pb-0.5 bg-rose-50/50 px-1 rounded">
                  <span className="text-xs font-black text-rose-600">● 90 cm</span>
                  <div className="flex-1 mx-2 h-0.5 bg-rose-500" />
                  <span className="text-[11px] font-black text-rose-600">900 mm</span>
                </div>

              </div>
            </div>

            {/* 3. RIGHT HIGH-CONTRAST BLACK INVERTED SCALE */}
            <div className="w-20 sm:w-24 bg-black text-white p-1 sm:p-2 border-l-2 border-black flex flex-col justify-between z-10">
              <div className="text-[9px] font-mono text-emerald-400 text-center border-b border-slate-800 pb-0.5 mb-1 font-bold">
                BLOCO
              </div>

              <div className="space-y-3 sm:space-y-4 text-center">
                {[5, 10, 15, 20, 30, 50, 80, 90].map((n) => (
                  <div key={n} className="py-0.5 bg-slate-900 border border-slate-800 rounded font-black text-xs sm:text-sm text-white flex items-center justify-center">
                    {n}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* BOTTOM 100CM END-CAP WITH CHEVRONS */}
          <div className="w-full bg-[#0a0c10] border-2 border-t-0 border-slate-700 rounded-b-xl py-2.5 px-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 font-black italic text-xl sm:text-2xl text-white">
              <span>100</span>
              <span className="text-xs font-mono font-normal text-slate-400 not-italic">CM</span>
            </div>

            <div className="flex items-center gap-1 text-[#00c853] font-black text-lg tracking-tighter">
              <span>&lt;&lt;&lt;</span>
              <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider ml-1">
                FIM DA ESCALA
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Feature Highlights beneath graphic */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[11px]">
        <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#00c853] shrink-0" />
          <span className="text-slate-300 font-medium">Encosto 90° Fixo</span>
        </div>
        <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#00c853] shrink-0" />
          <span className="text-slate-300 font-medium">Verde Neon Anti-Reflexo</span>
        </div>
        <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#00c853] shrink-0" />
          <span className="text-slate-300 font-medium">QR Code Antifraude</span>
        </div>
        <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#00c853] shrink-0" />
          <span className="text-slate-300 font-medium">100% Homologada</span>
        </div>
      </div>

    </div>
  );
}
