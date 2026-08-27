import React, { useState } from 'react';
import { 
  Ruler, 
  Video, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Copy, 
  Check, 
  X, 
  ExternalLink,
  Fish,
  Clock,
  HardDrive,
  Eye,
  FileText,
  Sparkles,
  Volume2
} from 'lucide-react';

interface OfficialCaptureRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentTitle?: string;
}

export default function OfficialCaptureRulesModal({
  isOpen,
  onClose,
  tournamentTitle = 'Todos os Torneios FISGADA PRO'
}: OfficialCaptureRulesModalProps) {
  const [copiedSpeech, setCopiedSpeech] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'checklist' | 'examples'>('rules');

  if (!isOpen) return null;

  const exampleSpeech = `"${tournamentTitle || 'Rei da Traíra 2026'}, competidor [Seu Nome], captura número 01, [Medida] centímetros."`;

  const handleCopySpeech = () => {
    navigator.clipboard.writeText(exampleSpeech);
    setCopiedSpeech(true);
    setTimeout(() => setCopiedSpeech(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-[#121418] border border-emerald-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#121418] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg">
              <Ruler className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Regulamento Unificado
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  FISGADA PRO
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                <span>🎣 Regra Oficial de Comprovação de Captura</span>
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

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800 bg-[#16181d] shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Regulamento Completo (8 Itens)</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Checklist Rápido do Vídeo</span>
          </button>

          <button
            onClick={() => setActiveTab('examples')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'examples'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>O que Falar no Vídeo</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm leading-relaxed">
          
          {/* TAB 1: FULL OFFICIAL RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              
              {/* Highlight Intro Card */}
              <div className="bg-gradient-to-r from-emerald-500/15 via-slate-900 to-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                      Diretriz Suprema de Validação
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Para que uma captura seja considerada <strong>100% válida</strong> em qualquer campeonato da plataforma (como <strong>Rei da Traíra</strong>, <strong>Copa Tucunaré</strong> ou torneios sazonais), o participante deverá realizar o registro completo da captura por meio de <strong>um único vídeo contínuo, sem cortes, edições ou interrupções</strong>, seguindo obrigatoriamente todos os procedimentos oficiais abaixo.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Gravação da Captura */}
              <div className="bg-[#181a1f] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/20 font-mono font-black text-sm flex items-center justify-center border border-emerald-500/30">
                    1
                  </span>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">
                    Gravação da Captura (Vídeo Contínuo)
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  O vídeo deverá iniciar mostrando o <strong>peixe ainda vivo</strong> e deverá permanecer gravando de forma ininterrupta até a conclusão da soltura.
                </p>
                <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-white mb-2">Durante a gravação do vídeo, o participante deverá:</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li><strong className="text-emerald-300">Mostrar claramente o peixe</strong> ainda vivo e com vigor.</li>
                    <li><strong className="text-emerald-300">Mostrar a régua oficial</strong> utilizada para a medição (com escala nítida e legível).</li>
                    <li><strong className="text-emerald-300">Posicionar corretamente a cabeça</strong> do peixe (bico/boca encostada firmemente na guia zero de 90°).</li>
                    <li><strong className="text-emerald-300">Mostrar claramente o comprimento total</strong> do peixe, do focinho até a ponta da cauda.</li>
                    <li><strong className="text-emerald-300">Falar em voz alta</strong> a palavra-chave oficial do campeonato ou frase da etapa.</li>
                    <li><strong className="text-emerald-300">Informar seu nome</strong> ou número de competidor.</li>
                    <li><strong className="text-emerald-300">Informar o número da captura</strong> (ex: "Captura número 01").</li>
                    <li><strong className="text-emerald-300">Informar a medida registrada</strong> em centímetros.</li>
                    <li><strong className="text-emerald-300">Manter a gravação contínua</strong>, sem cortes, pausas ou edição de qualquer tipo.</li>
                    <li><strong className="text-emerald-300">Registrar a soltura ao vivo</strong>: ao final, realizar e registrar o peixe nadando com vida na água (Pesque e Solte).</li>
                  </ul>
                </div>
              </div>

              {/* 2. Palavra-Chave */}
              <div className="bg-[#181a1f] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <span className="w-7 h-7 rounded-xl bg-amber-500/20 font-mono font-black text-sm flex items-center justify-center border border-amber-500/30">
                    2
                  </span>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">
                    Palavra-Chave Oficial da Fase / Campeonato
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  A organização define uma <strong>palavra-chave oficial</strong> ou termo de validação para cada campeonato e janela de pesca. Essa palavra-chave deverá ser falada claramente pelo participante durante a gravação da captura.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                    🗣️ Exemplo Prático de Declaração no Vídeo:
                  </span>
                  <p className="text-xs sm:text-sm font-mono font-bold text-white italic">
                    {exampleSpeech}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    A palavra-chave é liberada pela organização para aumentar a segurança e impedir a utilização de vídeos ou capturas antigas.
                  </p>
                </div>
              </div>

              {/* 3. Hospedagem do Vídeo */}
              <div className="bg-[#181a1f] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-sky-400">
                  <span className="w-7 h-7 rounded-xl bg-sky-500/20 font-mono font-black text-sm flex items-center justify-center border border-sky-500/30">
                    3
                  </span>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">
                    Hospedagem do Vídeo
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Após realizar a gravação, o participante deverá hospedar o vídeo em uma plataforma em nuvem que permita seu acesso direto por meio de link.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                    <span className="text-white font-bold block">YouTube</span>
                    <span className="text-[10px] text-slate-400">Público / Não Listado</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                    <span className="text-white font-bold block">Google Drive</span>
                    <span className="text-[10px] text-slate-400">Link Liberado</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                    <span className="text-white font-bold block">OneDrive</span>
                    <span className="text-[10px] text-slate-400">Compartilhado</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                    <span className="text-white font-bold block">Dropbox</span>
                    <span className="text-[10px] text-slate-400">Link Aberto</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  O participante deverá <strong>inserir o link do vídeo na plataforma oficial</strong>, junto ao formulário de envio da captura.
                </p>
              </div>

              {/* 4. Acesso ao Vídeo */}
              <div className="bg-[#181a1f] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <span className="w-7 h-7 rounded-xl bg-indigo-500/20 font-mono font-black text-sm flex items-center justify-center border border-indigo-500/30">
                    4
                  </span>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">
                    Acesso ao Vídeo (Permissões Abertas)
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  O participante é o único responsável por garantir que o link enviado permita à arbitragem e à organização assistir ao vídeo sem barreiras.
                </p>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-200">
                  ⚠️ <strong>Atenção:</strong> Vídeos com acesso restrito, bloqueado, privado ou que exijam pedido de autorização terão a captura <strong>temporariamente não validada</strong> até que o competidor regularize o link.
                </div>
              </div>

              {/* 5. Prazo de Armazenamento */}
              <div className="bg-[#181a1f] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-purple-400">
                  <span className="w-7 h-7 rounded-xl bg-purple-500/20 font-mono font-black text-sm flex items-center justify-center border border-purple-500/30">
                    5
                  </span>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">
                    Prazo de Armazenamento (Mínimo 7 Dias)
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  O participante deverá manter o vídeo disponível e acessível por <strong>no mínimo 7 (sete) dias após o encerramento oficial do campeonato</strong>.
                </p>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="text-slate-400 block font-bold">Este prazo é utilizado para:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Auditoria minuciosa das capturas homologadas;</li>
                    <li>Conferência de pontuações e rankings finais;</li>
                    <li>Análise de denúncias e impugnações;</li>
                    <li>Solução de eventuais disputas ou divergências de medição.</li>
                  </ul>
                </div>
              </div>

              {/* 6. Captura Não Validada (Critérios de Reprovação) */}
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-rose-400">
                  <span className="w-7 h-7 rounded-xl bg-rose-500/20 font-mono font-black text-sm flex items-center justify-center border border-rose-500/30">
                    6
                  </span>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">
                    Critérios de Invalidação / Reprovação da Captura
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  A organização não validará a captura caso ocorra qualquer uma das situações abaixo:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Vídeo com cortes, edições ou pausas na gravação.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Ausência ou erro da palavra-chave/declaração verbal.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Régua ilegível, fita métrica frouxa ou medição duvidosa.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Competidor não identificado ou sem informar a captura.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Falta da filmagem da soltura do peixe vivo na água.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Link do vídeo quebrado, privado, indisponível ou excluído.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Indícios de peixe morto, maus-tratos ou reutilização de vídeo.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Descumprimento de qualquer requisito deste regulamento.</span>
                  </div>
                </div>
              </div>

              {/* 7. Responsabilidade do Participante */}
              <div className="bg-[#181a1f] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-teal-400">
                  <span className="w-7 h-7 rounded-xl bg-teal-500/20 font-mono font-black text-sm flex items-center justify-center border border-teal-500/30">
                    7
                  </span>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">
                    Responsabilidade Integral do Participante
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  O participante é integralmente responsável por:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <li>Gravar corretamente o vídeo sem cortes;</li>
                  <li>Hospedar o vídeo em plataforma segura;</li>
                  <li>Fornecer um link válido e com acesso público;</li>
                  <li>Garantir que a organização consiga visualizar o conteúdo;</li>
                  <li>Manter o vídeo online pelo prazo estabelecido (mínimo 7 dias).</li>
                </ul>
                <p className="text-[11px] text-amber-300/90 font-mono">
                  * O simples envio do link não garante a validação imediata. A captura só é computada após análise rigorosa e aprovação da arbitragem.
                </p>
              </div>

              {/* 8. Decisão da Organização */}
              <div className="bg-[#181a1f] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/20 font-mono font-black text-sm flex items-center justify-center border border-emerald-500/30">
                    8
                  </span>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">
                    Decisão Soberana da Organização
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  A organização poderá solicitar informações ou evidências adicionais quando houver qualquer dúvida sobre a autenticidade de uma captura.
                </p>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/20 text-xs text-slate-300">
                  Em caso de irregularidade ou tentativa de fraude comprovada, a captura será invalidada e, dependendo da gravidade, o participante poderá ser <strong>desclassificado e banido do campeonato</strong>. Todas as decisões da banca de arbitragem são soberanas.
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CHECKLIST RÁPIDO DO VÍDEO */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Passo a Passo Rápido Antes de Começar a Gravar</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Siga esta sequência sem pausar o celular para garantir nota 10 na homologação:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    step: "1. Pegue o celular e inicie a gravação contínua",
                    desc: "Nunca pause, corte ou divida a gravação em dois arquivos. O vídeo deve ser 100% contínuo."
                  },
                  {
                    step: "2. Enquadre o peixe com vida e posicione na régua",
                    desc: "Boca encostada firmemente no batente de 90° (marco zero) e corpo reto em decúbito lateral."
                  },
                  {
                    step: "3. Faça a declaração verbal em voz alta",
                    desc: "Fale seu nome, o nome do torneio, o número da captura (ex: captura 01) e o tamanho registrado."
                  },
                  {
                    step: "4. Aproxime a câmera da ponta da cauda na régua",
                    desc: "Mostre com total nitidez o número exato de centímetros atingido pelo peixe."
                  },
                  {
                    step: "5. Leve o peixe até a água e filme a soltura com vida",
                    desc: "Mostre o peixe se reoxigenando e nadando livremente na água com saúde."
                  },
                  {
                    step: "6. Finalize o vídeo, hospede no YouTube/Drive e envie o link",
                    desc: "Cole o link no formulário de envio da captura no seu perfil."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#181a1f] border border-slate-800 rounded-2xl p-4 flex items-start gap-3.5">
                    <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{item.step}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: O QUE FALAR NO VÍDEO */}
          {activeTab === 'examples' && (
            <div className="space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-amber-400" />
                    <span>Modelo Oficial de Declaração Verbal</span>
                  </h3>
                  <button
                    onClick={handleCopySpeech}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono font-bold rounded-xl border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition"
                  >
                    {copiedSpeech ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar Modelo</span>
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-slate-300">
                  Enquanto a câmera filma a régua e o peixe, fale claramente a seguinte frase:
                </p>

                <div className="bg-black/60 p-4 rounded-xl border border-amber-500/30 font-mono text-sm sm:text-base font-bold text-amber-300 leading-relaxed text-center">
                  {exampleSpeech}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#181a1f] p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
                    <CheckCircle2 className="h-4 w-4" /> Correto
                  </span>
                  <p className="text-xs text-slate-300">
                    "Rei da Traíra 2026, competidor Carlos Silva, captura número 02, 47 centímetros e meio. Soltura viva!"
                  </p>
                </div>

                <div className="bg-[#181a1f] p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase font-mono">
                    <XCircle className="h-4 w-4" /> Incorreto (Risco de Invalidação)
                  </span>
                  <p className="text-xs text-slate-300">
                    Vídeo em silêncio absoluto, apenas com música de fundo ou sem pronunciar o nome da etapa e os dados da captura.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#16181d] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Regras válidas para todas as categorias (Solo a 5 membros).</span>
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
