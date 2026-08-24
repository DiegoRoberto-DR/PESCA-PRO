import React from 'react';
import { 
  Anchor, 
  ShieldCheck, 
  Trophy, 
  Users, 
  Sparkles, 
  Target, 
  Award, 
  Fish, 
  CheckCircle2, 
  HeartHandshake, 
  Globe, 
  Building2,
  Phone,
  Mail,
  MapPin,
  ArrowRight
} from 'lucide-react';

interface AboutUsViewProps {
  onNavigateToTournaments?: () => void;
}

export default function AboutUsView({ onNavigateToTournaments }: AboutUsViewProps) {
  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-16">
      
      {/* Hero Banner: Quem Somos */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-[#0d131a] to-slate-950 border border-slate-800 p-8 sm:p-12 md:p-16 shadow-2xl">
        {/* Background Image / Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00c853]/15 border border-[#00c853]/30 text-[#00c853] text-xs font-mono font-bold uppercase tracking-wider">
            <Anchor className="h-4 w-4" />
            <span>Fisgada Pro • Uma empresa do GRUPO DR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-tight">
            A Revolução da Pesca Esportiva no <span className="text-[#00c853]">Brasil</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
            A <strong>Fisgada Pro</strong> nasceu com o propósito de transformar a pescaria de fim de semana em competições oficiais de alto nível. Unindo tecnologia de ponta, inteligência antifraude e o verdadeiro espírito da pesca esportiva de pesque e solte.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {onNavigateToTournaments && (
              <button
                onClick={onNavigateToTournaments}
                className="px-6 py-3.5 bg-[#00c853] hover:bg-[#00e676] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Ver Campeonatos Abertos</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sobre o GRUPO DR & Fisgada Pro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#00c853]/10 rounded-2xl text-[#00c853] border border-[#00c853]/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#00c853] tracking-widest block">
                  CORPORATIVO
                </span>
                <h3 className="text-xl font-black text-white uppercase">O GRUPO DR</h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              O <strong>GRUPO DR</strong> é um conglomerado empresarial focado em inovação, soluções digitais de alto impacto e empreendimentos voltados para o esporte, lazer e entretenimento profissional. 
            </p>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Com sede no Brasil e atuação nacional, o grupo investe continuamente no desenvolvimento de plataformas tecnológicas seguras, garantindo transparência, integridade e a melhor experiência para os seus milhares de usuários e parceiros.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-[#181a1e] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Origem</span>
              <span className="font-bold text-white">Brasil 🇧🇷</span>
            </div>
            <div className="bg-[#181a1e] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Segmento</span>
              <span className="font-bold text-[#00c853]">Tecnologia & Esporte</span>
            </div>
          </div>
        </div>

        <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
                <Fish className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-widest block">
                  NOSSO PROPÓSITO
                </span>
                <h3 className="text-xl font-black text-white uppercase">A Plataforma Fisgada Pro</h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Criada por apaixonados pela pesca esportiva, a <strong>Fisgada Pro</strong> é a primeira plataforma brasileira de torneios de pesca 100% online com validação em tempo real e auditoria rigorosa de cada exemplar capturado.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Pescadores de qualquer região do país podem competir de qualquer rio, represa ou pesqueiro, filmando a medição na régua oficial, dizendo a palavra-chave da etapa e soltando o peixe com respeito à natureza.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-[#181a1e] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Modalidade</span>
              <span className="font-bold text-white">100% Pesque & Solte</span>
            </div>
            <div className="bg-[#181a1e] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Auditoria</span>
              <span className="font-bold text-amber-400">IA + Árbitros Oficiais</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nossos Pilares e Valores */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-[#00c853] uppercase tracking-widest">
            COMO TRABALHAMOS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
            Nossos Pilares Fundamentais
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pilar 1 */}
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 w-fit">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-white uppercase">Segurança Antifraude Inegociável</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Janelas de captura com horários restritos, códigos únicos vinculados a CPF e palavras secretas geradas ao vivo que devem ser pronunciadas no vídeo da captura.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20 w-fit">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-white uppercase">Preservação & Respeito</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Defesa ativa da fauna aquática e da soltura correta dos peixes. Não toleramos maus-tratos ou peixes abatidos em nossos rankings.
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="bg-[#121316] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 w-fit">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-white uppercase">Premiação & Reconhecimento</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premiações reais em dinheiro e troféus oficiais para os melhores pescadores do ranking individual e por equipes em todo o território nacional.
            </p>
          </div>
        </div>
      </div>

      {/* Canais de Contato Oficial */}
      <div className="bg-[#121316] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-white uppercase">Canais de Atendimento & Suporte</h3>
            <p className="text-xs text-slate-400 mt-0.5">Fale diretamente com nossa diretoria e equipe de arbitragem</p>
          </div>
          <span className="text-xs font-mono text-[#00c853] bg-[#00c853]/10 px-3 py-1 rounded-full border border-[#00c853]/20 font-bold self-start sm:self-auto">
            Atendimento Segunda a Sábado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-[#181a1e] p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Phone className="h-4 w-4" />
              <span>WhatsApp Oficial</span>
            </div>
            <p className="text-white font-bold text-sm">+55 (19) 98762-6991</p>
            <p className="text-[10px] text-slate-400">Atendimento rápido a pescadores e capitães</p>
          </div>

          <div className="bg-[#181a1e] p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Mail className="h-4 w-4" />
              <span>E-mail Corporativo</span>
            </div>
            <p className="text-white font-bold text-sm">suporte@grupodr.com.br</p>
            <p className="text-[10px] text-slate-400">Dúvidas, parcerias e patrocínios</p>
          </div>

          <div className="bg-[#181a1e] p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Building2 className="h-4 w-4" />
              <span>Grupo Empresarial</span>
            </div>
            <p className="text-white font-bold text-sm">GRUPO DR - BRASIL</p>
            <p className="text-[10px] text-slate-400">Tecnologia, Pesca Esportiva & Gestão</p>
          </div>
        </div>
      </div>

    </div>
  );
}
