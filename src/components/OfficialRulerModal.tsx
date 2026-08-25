import React, { useState } from 'react';
import { 
  X, 
  Ruler, 
  CheckCircle2, 
  MessageCircle, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Maximize2, 
  ZoomIn, 
  Info, 
  AlertCircle,
  HelpCircle,
  Package,
  Award
} from 'lucide-react';
import OfficialRulerGraphic from './OfficialRulerGraphic';

interface OfficialRulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OfficialRulerModal({ isOpen, onClose }: OfficialRulerModalProps) {
  const [copiedPix, setCopiedPix] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'rules'>('overview');
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen) return null;

  const rulerPrice = '70,00';
  const organizerWhatsApp = '5519987626991';
  const pixKey = '19987626991'; // WhatsApp / PIX Key

  const whatsappBuyUrl = `https://wa.me/${organizerWhatsApp}?text=${encodeURIComponent(
    'Olá! Gostaria de comprar a Régua Oficial FISGADA PRO (100cm) no valor de R$ 70,00. Por favor, me envie a chave PIX e os dados para cálculo do frete / entrega!'
  )}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-[#0f1218] border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-[#111622] to-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#00c853]/15 border border-[#00c853]/30 flex items-center justify-center text-[#00c853] shadow-md">
              <Ruler className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                  Régua Oficial <span className="text-[#00c853]">Fisgada Pro</span>
                </h2>
                <span className="px-2.5 py-0.5 bg-[#00c853]/20 border border-[#00c853]/40 text-[#00c853] text-[10px] font-mono font-black uppercase rounded-full tracking-wider hidden sm:inline-block">
                  HOMOLOGADA
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                Dispositivo obrigatório para medição e homologação nos torneios oficiais
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TOP PRICE & CTA HERO BAR */}
          <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-[#121820] border-2 border-[#00c853]/40 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            
            {/* Price Badge */}
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[11px] font-mono uppercase font-bold text-emerald-400 tracking-wider block">
                PREÇO OFICIAL EXCLUSIVO
              </span>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-sm sm:text-base font-bold text-slate-300">R$</span>
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {rulerPrice}
                </span>
                <span className="text-xs text-slate-400 font-medium ml-1">
                  / unidade
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center justify-center md:justify-start gap-1.5 pt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00c853]" />
                <span>Válida para todos os campeonatos da plataforma Fisgada Pro</span>
              </p>
            </div>

            {/* Direct Buy Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <a
                href={whatsappBuyUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Comprar no WhatsApp (R$ 70)</span>
              </a>

              <button
                type="button"
                onClick={handleCopyPix}
                className="w-full sm:w-auto px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedPix ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-mono">PIX Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-400" />
                    <span>Copiar Chave PIX</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* VISUAL SHOWCASE OF THE RULER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">
                  Visualização do Modelo Oficial (1 Metro)
                </span>
              </div>
              <span className="text-[11px] text-[#00c853] font-bold">
                ✓ Padrão 100cm Homologado
              </span>
            </div>

            {/* Detailed Visual Ruler Graphic Component */}
            <OfficialRulerGraphic onOpenZoom={() => setIsZoomed(!isZoomed)} />
          </div>

          {/* SPECIFICATIONS & FEATURES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Spec 1: Dimensões & Encosto */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Ruler className="h-4 w-4" />
                <span>Comprimento & Encosto</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>100 cm (1 Metro)</strong> de medição útil com <strong>encosto rígido de 90°</strong> no marco zero para fixação precisa da boca do peixe.
              </p>
            </div>

            {/* Spec 2: Tecnologia Anti-Reflexo */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Material Náutico Premium</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Superfície <strong>anti-reflexo</strong> e com proteção UV especial para fotografia sob sol intenso ou uso de flash sem estouro de luz.
              </p>
            </div>

            {/* Spec 3: QR Code & Antifraude */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <QrCode className="h-4 w-4" />
                <span>QR Code Antifraude</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                QR Code de homologação oficial escaneável pelo aplicativo para validação automática da autenticidade da régua.
              </p>
            </div>

          </div>

          {/* WHY IT IS MANDATORY */}
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Info className="h-4 w-4 text-[#00c853]" />
              <span>Por que a Régua Oficial é Obrigatória?</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para assegurar a <strong>isonomia, lisura e justiça absoluta</strong> em todas as disputas de pesca esportiva, a organização e o sistema de validação automatizada só aceitam capturas posicionadas sobre a régua oficial Fisgada Pro. Trenas de metal, fitas de tecido ou réguas caseiras são <strong>automaticamente reprovadas</strong>.
            </p>
          </div>

          {/* SHIPPING & ORDER DETAILS */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl border border-slate-800">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Envio para Todo o Brasil</span>
                <span className="text-[11px] text-slate-400">Correios (SEDEX / PAC) ou Transportadora com código de rastreio</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] font-mono text-slate-400 block">Dúvidas ou Pedidos em Atacado:</span>
              <a 
                href={whatsappBuyUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-[#00c853] hover:underline"
              >
                WhatsApp (19) 98762-6991
              </a>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Fechar
          </button>

          <a
            href={whatsappBuyUrl}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Garantir Minha Régua (R$ 70)</span>
          </a>
        </div>

      </div>
    </div>
  );
}
