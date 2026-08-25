import React, { useState } from 'react';
import { 
  Ruler, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Camera, 
  HelpCircle, 
  ArrowRight, 
  Phone, 
  Sparkles, 
  FileText, 
  Check, 
  X, 
  Trophy, 
  Award,
  CalendarCheck,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ExternalLink,
  Maximize2
} from 'lucide-react';
import OfficialRulerGraphic from './OfficialRulerGraphic';
import OfficialRulerModal from './OfficialRulerModal';

interface HowToParticipateViewProps {
  onNavigateToTournaments?: () => void;
  onOpenAuthModal?: () => void;
  onOpenRulerModal?: () => void;
  isLoggedIn?: boolean;
}

export default function HowToParticipateView({
  onNavigateToTournaments,
  onOpenAuthModal,
  onOpenRulerModal,
  isLoggedIn = false
}: HowToParticipateViewProps) {
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isLocalRulerModalOpen, setIsLocalRulerModalOpen] = useState(false);

  const handleOpenRuler = () => {
    if (onOpenRulerModal) {
      onOpenRulerModal();
    } else {
      setIsLocalRulerModalOpen(true);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const organizerWhatsApp = '5519987626991';
  const rulerPrice = '70,00';
  const whatsappReguaUrl = `https://wa.me/${organizerWhatsApp}?text=${encodeURIComponent(
    'Olá! Gostaria de adquirir a Régua Oficial FISGADA PRO (100cm) no valor de R$ 70,00 para participar dos torneios oficiais de pesca esportiva.'
  )}`;
  const whatsappInscricaoUrl = `https://wa.me/${organizerWhatsApp}?text=${encodeURIComponent(
    'Olá! Gostaria de tirar dúvidas sobre a taxa de inscrição e receber meu código de participação no torneio.'
  )}`;

  const faqs = [
    {
      q: 'Posso usar uma fita métrica, trena ou régua de outro torneio?',
      a: 'NÃO. As regras oficiais da FISGADA PRO são rigorosas: somente medições efetuadas sobre a Régua Oficial Homologada FISGADA PRO são validadas pela arbitragem e pelo sistema de conferência por Inteligência Artificial. Medições em quaisquer outras réguas, fitas ou trenas serão automaticamente reprovadas e desclassificadas.'
    },
    {
      q: 'Por que todo campeonato possui taxa de inscrição e quando ela deve ser paga?',
      a: 'A taxa de inscrição é obrigatória e deve ser quitada no ato da inscrição. Essa taxa garante a integridade da premiação dos vencedores, a cobertura dos custos de arbitragem técnica, emissão de troféus, homologação antifraude e suporte em tempo real aos competidores.'
    },
    {
      q: 'Como funciona o pagamento para torneios em equipe (Dupla, Trio, Quarteto, Quinteto)?',
      a: 'Nos torneios em equipe, o pagamento da taxa de inscrição é ÚNICO por equipe e realizado pelo capitão/titular responsável. Ao comprovar o pagamento, o titular recebe um Código de Participação exclusivo que habilita todos os integrantes previamente aprovados na equipe no sistema.'
    },
    {
      q: 'O que é a Palavra-Chave ou Código Antifraude da Janela de Captura?',
      a: 'Para garantir que a foto do peixe foi capturada exatamente dentro da data e horário estipulados no regulamento, a organização libera uma Palavra-Chave / Código Antifraude no momento da abertura da janela de pesca. Essa palavra-chave deve ser escrita de forma legível em um papel e posicionada junto à régua oficial na foto da captura.'
    },
    {
      q: 'Qual é o critério obrigatório para o enquadramento da foto do peixe?',
      a: 'O peixe deve estar deitado sobre a régua oficial da FISGADA PRO, com o bico/boca encostado firmemente na guia zero (encosto de 90°), o corpo reto em decúbito lateral e a ponta da cauda totalmente visível sobre a numeração. A palavra-chave da fase deve estar visível no mesmo enquadramento sem obstruir a visão do peixe.'
    },
    {
      q: 'É obrigatória a prática do Pesque e Solte (Catch & Release)?',
      a: 'Sim! Todos os torneios promovidos pela FISGADA PRO têm como compromisso inegociável a preservação da fauna aquática e o fomento da pesca esportiva sustentável. Todos os exemplares devem ser manuseados com respeito, fotografados rapidamente e devolvidos vivos à água.'
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-16">
      
      {/* 1. HERO BANNER: COMO PARTICIPAR */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a111a] to-slate-950 border border-slate-800 p-8 sm:p-12 md:p-16 shadow-2xl">
        {/* Background Texture / Gradient Glow */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00c853]/15 border border-[#00c853]/30 text-[#00c853] text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Regulamento & Diretrizes Oficiais • FISGADA PRO</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-tight">
            Como Participar dos <span className="text-[#00c853]">Torneios</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
            Participe dos maiores campeonatos de pesca esportiva do país com total transparência, segurança antifraude e arbitragem profissional. Conheça as normas fundamentais, a exigência da <strong>Régua Oficial</strong> e o procedimento de <strong>inscrição</strong>.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {onNavigateToTournaments && (
              <button
                onClick={onNavigateToTournaments}
                className="px-6 py-3.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="h-4 w-4" />
                <span>Ver Campeonatos Abertos</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <a
              href={whatsappReguaUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition flex items-center gap-2"
            >
              <Ruler className="h-4 w-4 text-[#00c853]" />
              <span>Adquirir Régua Oficial</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. OS DOIS PILARES OBRIGATÓRIOS (DESTAQUE ABSOLUTO) */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Requisitos Obrigatórios para Validação</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Dois Pilares Inegociáveis da Competição
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Para garantir a isonomia, imparcialidade e validade jurídica das premiações, todos os participantes devem cumprir rigorosamente estas duas exigências:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* PILAR 1: RÉGUA OFICIAL FISGADA PRO */}
          <div className="bg-gradient-to-br from-[#12161f] to-slate-900 border-2 border-[#00c853]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Ruler className="h-32 w-32 text-[#00c853]" />
            </div>

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-[#00c853]/15 border border-[#00c853]/30 flex items-center justify-center text-[#00c853]">
                  <Ruler className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-black rounded-full tracking-wider">
                    VALOR: R$ {rulerPrice}
                  </span>
                  <span className="px-2.5 py-1 bg-[#00c853]/20 border border-[#00c853]/40 text-[#00c853] text-[10px] font-mono font-black uppercase rounded-full tracking-wider hidden sm:inline-block">
                    OBRIGATÓRIA
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  1. Régua Oficial FISGADA PRO
                </h3>
                <span className="text-xs font-mono text-[#00c853] font-bold">
                  Padrão 100 cm • Escala Neon UV • QR Antifraude
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  Para que qualquer captura seja homologada pela comissão técnica e pelos algoritmos de visão computacional, o peixe deve ser obrigatoriamente medido sobre a <strong>Régua Oficial Homologada da FISGADA PRO</strong> (100 cm).
                </p>

                {/* Compact Visual Ruler Preview inside Pilar 1 */}
                <div className="pt-1">
                  <OfficialRulerGraphic compact onOpenZoom={handleOpenRuler} />
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#00c853]" />
                    Por que somente ela é válida?
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                    <li><strong className="text-slate-200">Encosto de Bico a 90°:</strong> Garante o posicionamento perfeito da boca do peixe no marco zero absoluto.</li>
                    <li><strong className="text-slate-200">Escala de Alta Precisão (1 Metro):</strong> Numeração com contraste milimétrico calibrado que impede fraudes de perspectiva.</li>
                    <li><strong className="text-slate-200">Marcação Holográfica e QR Antifraude:</strong> Verificação instantânea de autenticidade no sistema.</li>
                    <li><strong className="text-rose-400">Atenção:</strong> Réguas caseiras, fitas métricas ou trenas de terceiros <strong>não são aceitas sob nenhuma hipótese</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-baseline gap-1 text-slate-300">
                <span className="text-xs">Valor:</span>
                <strong className="text-lg font-black text-white">R$ {rulerPrice}</strong>
                <span className="text-[10px] text-slate-400 font-mono">/ unidade</span>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleOpenRuler}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-[#00c853]" />
                  <span>Ver Detalhes</span>
                </button>

                <a
                  href={whatsappReguaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950/30"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Comprar (R$ 70)</span>
                </a>
              </div>
            </div>
          </div>

          {/* PILAR 2: TAXA DE INSCRIÇÃO OBRIGATÓRIA */}
          <div className="bg-gradient-to-br from-[#18151f] to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <CreditCard className="h-32 w-32 text-amber-400" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <CreditCard className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-black uppercase rounded-full tracking-wider">
                  PAGAMENTO NO ATO
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white">
                2. Taxa de Inscrição Obrigatória
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  Todo torneio possui uma <strong>taxa de inscrição estipulada no regulamento</strong> da etapa. Essa taxa deve ser quitada no momento da inscrição para que a vaga seja garantida e homologada.
                </p>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    Como funciona a inscrição e validação:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                    <li><strong className="text-slate-200">Categorias Individuais (Solo):</strong> Inscrição individual por atleta participante.</li>
                    <li><strong className="text-slate-200">Categorias em Equipe (Dupla/Trio/Quarteto):</strong> Pagamento <strong>único</strong> por equipe, efetuado pelo capitão titular.</li>
                    <li><strong className="text-slate-200">Código Exclusivo de Participação:</strong> Após a confirmação do pagamento com a organização, é gerado um código oficial exclusivo (ex: <span className="font-mono text-amber-300">TRN-XXXX-XXXX</span>) para habilitar o envio de capturas.</li>
                    <li><strong className="text-amber-300">Destinação:</strong> Fundo de premiação em dinheiro/troféus, custos de arbitragem e manutenção tecnológica.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Dúvidas sobre pagamento?
              </span>
              <a
                href={whatsappInscricaoUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-amber-950/30"
              >
                <Phone className="h-4 w-4" />
                <span>Atendimento de Inscrições</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* 3. GUIA PASSO A PASSO (DO CADASTRO À HOMOLOGAÇÃO) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 md:p-12 space-y-8 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-bold uppercase">
            <Zap className="h-3.5 w-3.5" />
            <span>Jornada do Competidor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Passo a Passo Para Competir
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-3xl">
            Siga este fluxo simplificado para participar com êxito de qualquer etapa promovida pela FISGADA PRO.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* PASSO 1 */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 space-y-3 relative hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-sm flex items-center justify-center">
                01
              </span>
              <Users className="h-5 w-5 text-slate-500" />
            </div>
            <h3 className="text-base font-bold text-white">Criar seu Cadastro</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crie sua conta na plataforma informando nome completo, e-mail, telefone WhatsApp, CPF e foto de perfil. Mantenha os dados sempre atualizados para fins de homologação.
            </p>
          </div>

          {/* PASSO 2 */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-6 space-y-3 relative hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-[#00c853]/20 border border-[#00c853]/40 text-[#00c853] font-mono font-black text-sm flex items-center justify-center">
                02
              </span>
              <Ruler className="h-5 w-5 text-[#00c853]" />
            </div>
            <h3 className="text-base font-bold text-white">Adquirir a Régua Oficial</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solicite a Régua Oficial FISGADA PRO com a organização antes da abertura da janela de captura. Somente fotos realizadas sobre este dispositivo são aceitas.
            </p>
          </div>

          {/* PASSO 3 */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 space-y-3 relative hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-mono font-black text-sm flex items-center justify-center">
                03
              </span>
              <Users className="h-5 w-5 text-sky-400" />
            </div>
            <h3 className="text-base font-bold text-white">Formar sua Equipe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Se o torneio for em equipe (Dupla, Trio, Quarteto ou Quinteto), crie a equipe na aba <strong>Meu Perfil</strong> e convide os integrantes com a capacidade exata exigida pela etapa.
            </p>
          </div>

          {/* PASSO 4 */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-6 space-y-3 relative hover:border-amber-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-black text-sm flex items-center justify-center">
                04
              </span>
              <CreditCard className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white">Pagar a Taxa de Inscrição</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Escolha o torneio desejado e efetue o pagamento da taxa de inscrição no ato. O comprovante é enviado à organização para liberação do seu código exclusivo.
            </p>
          </div>

          {/* PASSO 5 */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 space-y-3 relative hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 font-mono font-black text-sm flex items-center justify-center">
                05
              </span>
              <CalendarCheck className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-white">Janela & Chave Antifraude</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acompanhe a abertura da janela oficial de pesca. No horário marcado, a organização libera a <strong>Palavra-Chave da Fase</strong> que deve constar em todas as fotos enviadas.
            </p>
          </div>

          {/* PASSO 6 */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 space-y-3 relative hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono font-black text-sm flex items-center justify-center">
                06
              </span>
              <Camera className="h-5 w-5 text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-white">Foto e Envio da Captura</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Posicione o peixe na régua com a boca no marco zero, coloque a palavra-chave visível, fotografe com nitidez e envie pelo formulário na aba Meu Perfil.
            </p>
          </div>

        </div>
      </div>

      {/* 4. PADRÃO TÉCNICO DE FOTOGRAFIA & CRITÉRIOS DE APROVAÇÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* CHECKLIST: O QUE É OBRIGATÓRIO (APROVADO) */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Critérios de Aprovação da Captura
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  CHECKLIST OBRIGATÓRIO DA FOTO
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block">Régua Oficial FISGADA PRO Visível:</strong> Toda a extensão da régua homologada deve estar nítida e sem obstruções.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block">Boca do Peixe no Marco Zero:</strong> A boca do exemplar deve encostar firmemente no anteparo rígido de 90°.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block">Palavra-Chave da Janela Legível:</strong> O código ou palavra-chave oficial da fase deve estar posicionado ao lado do peixe.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block">Espécime Inteiro e Cauda Alinhada:</strong> O peixe deve estar deitado lateralmente, com a cauda esticada sobre a graduação.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block">Peixe Vivo e Saudável:</strong> O exemplar deve ser solto com vida imediatamente após o registro fotográfico.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHECKLIST: O QUE RESULTA EM REPROVAÇÃO OU DESCLASSIFICAÇÃO */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/15 text-rose-400 rounded-xl">
                <X className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Motivos de Reprovação Imediata
                </h3>
                <span className="text-xs text-rose-400 font-mono font-bold">
                  INFRAÇÕES AO REGULAMENTO
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <X className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-rose-300 block">Uso de Régua Não Homologada:</strong> Trenas, fitas, réguas de madeira ou réguas de outros eventos causam <strong>reprovação sumária</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <X className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-rose-300 block">Ausência da Palavra-Chave:</strong> Fotos sem a palavra-chave da fase válida ou com código incorreto não são computadas.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <X className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-rose-300 block">Mãos Ocultando a Boca ou Cauda:</strong> Dedos dentro das guelras, mãos tampando a ponta da boca ou cobrindo os números milimétricos.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <X className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-rose-300 block">Foto Fora da Janela de Horário:</strong> Registros enviados fora do período estipulado de abertura e fechamento da etapa.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <X className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-rose-300 block">Indícios de Manipulação Digital:</strong> Edições no tamanho do peixe, sobreposições ou fotos geradas por inteligência artificial acarretam banimento permanente.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. PERGUNTAS FREQUENTES (FAQ) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 md:p-12 space-y-6 shadow-2xl">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Perguntas Frequentes dos Pescadores
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Confira as principais respostas sobre o regulamento oficial e o funcionamento das etapas.
          </p>
        </div>

        <div className="space-y-3 pt-4 max-w-4xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-xs sm:text-sm hover:text-emerald-400 transition cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-center text-xs font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-900">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. CALL TO ACTION / CENTRAL DE ATENDIMENTO */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="inline-flex p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-[#00c853]">
          <Trophy className="h-8 w-8" />
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Pronto Para Entrar na Disputa?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Garanta sua Régua Oficial, monte sua equipe, efetue a inscrição e venha disputar os maiores troféus e premiações da pesca esportiva brasileira.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {onNavigateToTournaments && (
            <button
              onClick={onNavigateToTournaments}
              className="px-7 py-3.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="h-4 w-4" />
              <span>Ver Campeonatos Abertos</span>
            </button>
          )}

          <a
            href={whatsappReguaUrl}
            target="_blank"
            rel="noreferrer"
            className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4 text-[#00c853]" />
            <span>Falar com a Organização</span>
          </a>

          {!isLoggedIn && onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Users className="h-4 w-4 text-sky-400" />
              <span>Criar Minha Conta</span>
            </button>
          )}
        </div>
      </div>

      {/* RULER DETAIL MODAL */}
      <OfficialRulerModal
        isOpen={isLocalRulerModalOpen}
        onClose={() => setIsLocalRulerModalOpen(false)}
      />

    </div>
  );
}
