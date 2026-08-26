import React from 'react';
import { Ruler, CheckCircle2, ShieldCheck, QrCode, Sparkles } from 'lucide-react';

export default function OfficialRulerGraphic() {
  return (
    <div className="w-full rounded-2xl bg-slate-950/90 border border-slate-800 p-3 sm:p-4 shadow-xl select-none">
      
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#00c853]/15 text-[#00c853] rounded-lg">
            <Ruler className="h-4 w-4" />
          </span>
          <div>
            <span className="text-xs font-black text-white uppercase tracking-wider block">
              Régua Oficial Fisgada Pro (100 cm)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Ilustração do modelo homologado • Encosto 90° • Escala Neon
            </span>
          </div>
        </div>

        <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-black rounded-lg">
          R$ 70,00
        </span>
      </div>

      {/* COMPACT & FULLY VISIBLE ILLUSTRATIVE RULER (NO HORIZONTAL OVERFLOW) */}
      <div className="w-full bg-[#0a0c10] p-2.5 sm:p-3.5 rounded-xl border border-slate-800/90 flex flex-col items-center">
        
        {/* 1. TOP 90° HEADBOARD (Encosto rígido com Logo e QR Code) */}
        <div className="w-full bg-[#0d0e11] border-2 border-slate-700 rounded-t-xl p-2 sm:p-3 relative shadow-md flex items-center justify-between overflow-hidden">
          {/* Corner Rivets */}
          <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-950" />
          </div>
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-950" />
          </div>

          {/* Logo & Fish Icon */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#00c853]/25 to-emerald-950 border border-[#00c853]/50 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#00c853]" fill="currentColor">
                <path d="M 85,35 C 75,20 50,18 35,28 C 25,35 18,48 10,50 C 18,52 25,48 30,55 C 35,62 45,68 60,65 C 75,62 88,48 85,35 Z" fill="#00c853" />
                <path d="M 85,35 C 92,28 98,30 95,42 C 90,40 85,38 85,35 Z" fill="#00e676" />
                <path d="M 10,50 C 5,42 2,35 0,32 C 3,45 4,55 0,68 C 6,62 10,55 10,50 Z" fill="#2e7d32" />
                <circle cx="75" cy="35" r="3" fill="#000" />
                <path d="M 50,30 Q 60,35 65,45" stroke="#fff" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-0.5 font-black italic tracking-tighter text-sm sm:text-base leading-none">
                <span className="text-white">FISGADA</span>
                <span className="text-[#00c853]">PRO</span>
              </div>
              <div className="text-[8px] font-mono tracking-wider text-emerald-400 font-bold uppercase">
                HOMOLOGADA 100CM
              </div>
            </div>
          </div>

          {/* QR Code Graphic */}
          <div className="flex items-center gap-1 pr-2 sm:pr-3">
            <div className="flex flex-col items-center bg-black p-1 rounded border border-[#00c853]">
              <div className="w-5 h-5 bg-white p-0.5 grid grid-cols-4 gap-0.5 rounded-sm">
                <div className="bg-black col-span-2 row-span-2" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-black" />
              </div>
              <span className="text-[5px] font-mono font-black text-[#00c853] mt-0.5">
                QR CODE
              </span>
            </div>
          </div>
        </div>

        {/* 2. MAIN MEASURING BODY (Graduated 0 to 100 cm) */}
        <div className="w-full bg-white text-slate-950 font-mono flex border-x-2 border-slate-700 shadow-inner relative overflow-hidden text-[10px] sm:text-xs">
          
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
            <svg viewBox="0 0 500 150" className="w-[90%] h-auto text-black" fill="currentColor">
              <path d="M 450,75 C 400,30 280,25 180,50 C 130,62 80,55 30,75 C 80,95 130,88 180,100 C 280,125 400,120 450,75 Z" />
            </svg>
          </div>

          {/* LEFT NEON GREEN SCALE */}
          <div className="w-12 sm:w-16 bg-[#00c853] border-r border-black/80 py-1.5 px-1 flex flex-col justify-between select-none z-10">
            <div className="text-[8px] sm:text-[9px] font-black text-black text-center border-b border-black/20 pb-0.5 leading-none">
              CM
            </div>
            <div className="space-y-1.5 sm:space-y-2 text-center">
              {[0, 10, 20, 30, 40, 50, 65, 80, 90, 100].map((cm) => (
                <div key={cm} className="font-black text-[9px] sm:text-[11px] leading-tight text-black flex items-center justify-between px-0.5">
                  <span>{cm}</span>
                  <span className="w-1.5 h-0.5 bg-black" />
                </div>
              ))}
            </div>
          </div>

          {/* CENTER GRADUATED BODY WITH RED HIGHLIGHT MARKS */}
          <div className="flex-1 py-1.5 px-2 z-10 flex flex-col justify-between space-y-1.5 sm:space-y-2">
            {/* 0cm */}
            <div className="flex items-center justify-between border-b border-black pb-0.5">
              <span className="font-black text-[9px] sm:text-[10px] text-black">0 cm (Marco Zero)</span>
              <div className="flex-1 mx-1.5 h-px bg-black" />
              <span className="text-[8px] text-slate-600 font-mono">Encosto</span>
            </div>

            {/* 10cm */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 text-[9px] sm:text-[10px]">
              <span className="font-bold text-slate-800">10 cm</span>
              <div className="flex-1 mx-1.5 h-px bg-slate-300" />
              <span className="text-[8px] text-slate-500">100 mm</span>
            </div>

            {/* 20cm (Red Highlight) */}
            <div className="flex items-center justify-between border-b border-rose-400 bg-rose-50/70 px-1 py-0.5 rounded text-[9px] sm:text-[10px]">
              <span className="font-black text-rose-600">● 20 cm</span>
              <div className="flex-1 mx-1.5 h-px bg-rose-400" />
              <span className="text-[8px] font-bold text-rose-600">200 mm</span>
            </div>

            {/* 35cm (Red Highlight) */}
            <div className="flex items-center justify-between border-b border-rose-400 bg-rose-50/70 px-1 py-0.5 rounded text-[9px] sm:text-[10px]">
              <span className="font-black text-rose-600">● 35 cm</span>
              <div className="flex-1 mx-1.5 h-px bg-rose-400" />
              <span className="text-[8px] font-bold text-rose-600">350 mm</span>
            </div>

            {/* 50cm - TROFÉU */}
            <div className="flex items-center justify-between border border-rose-500 bg-rose-100/90 px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] shadow-xs">
              <span className="font-black text-rose-700">★ 50 cm</span>
              <div className="flex-1 mx-1.5 h-0.5 bg-rose-600" />
              <span className="font-black text-rose-700 text-[8px] sm:text-[9px]">TROFÉU (500 mm)</span>
            </div>

            {/* 65cm */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 text-[9px] sm:text-[10px]">
              <span className="font-bold text-slate-800">65 cm</span>
              <div className="flex-1 mx-1.5 h-px bg-slate-300" />
              <span className="text-[8px] text-slate-500">650 mm</span>
            </div>

            {/* 80cm (Red Highlight) */}
            <div className="flex items-center justify-between border-b border-rose-400 bg-rose-50/70 px-1 py-0.5 rounded text-[9px] sm:text-[10px]">
              <span className="font-black text-rose-600">● 80 cm</span>
              <div className="flex-1 mx-1.5 h-px bg-rose-400" />
              <span className="text-[8px] font-bold text-rose-600">800 mm</span>
            </div>

            {/* 90cm */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 text-[9px] sm:text-[10px]">
              <span className="font-bold text-slate-800">90 cm</span>
              <div className="flex-1 mx-1.5 h-px bg-slate-300" />
              <span className="text-[8px] text-slate-500">900 mm</span>
            </div>
          </div>

          {/* RIGHT CONTRAST SCALE */}
          <div className="w-10 sm:w-14 bg-black text-white py-1.5 px-1 border-l border-black flex flex-col justify-between z-10 select-none">
            <div className="text-[7px] sm:text-[8px] font-mono text-emerald-400 text-center border-b border-slate-800 pb-0.5 leading-none">
              BLOCO
            </div>
            <div className="space-y-1.5 sm:space-y-2 text-center">
              {[5, 15, 30, 50, 75, 90].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 rounded font-black text-[8px] sm:text-[10px] text-slate-200 py-0.5">
                  {n}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. BOTTOM 100CM END CAP */}
        <div className="w-full bg-[#0a0c10] border-2 border-t-0 border-slate-700 rounded-b-xl py-1.5 px-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-1 font-black italic text-sm sm:text-base text-white">
            <span>100</span>
            <span className="text-[9px] font-mono font-normal text-slate-400 not-italic">CM</span>
          </div>
          <div className="flex items-center gap-1 text-[#00c853] font-black text-xs sm:text-sm">
            <span>&lt;&lt;&lt;</span>
            <span className="text-[8px] font-mono text-slate-300 font-bold uppercase tracking-wider">
              FIM DA ESCALA
            </span>
          </div>
        </div>

      </div>

      {/* Quick Specs Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2.5 text-[10px]">
        <div className="p-1.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300">
          <CheckCircle2 className="h-3 w-3 text-[#00c853] shrink-0" />
          <span>Encosto 90° Fixo</span>
        </div>
        <div className="p-1.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300">
          <CheckCircle2 className="h-3 w-3 text-[#00c853] shrink-0" />
          <span>Material UV Anti-Reflexo</span>
        </div>
        <div className="p-1.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300">
          <CheckCircle2 className="h-3 w-3 text-[#00c853] shrink-0" />
          <span>QR Code Antifraude</span>
        </div>
        <div className="p-1.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300">
          <CheckCircle2 className="h-3 w-3 text-[#00c853] shrink-0" />
          <span>100% Homologada</span>
        </div>
      </div>

    </div>
  );
}
