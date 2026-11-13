import Link from "next/link";
import { ArrowRight, Bot, ChartNoAxesCombined, Clock3, MessageCircleMore, Radar, ShieldCheck, Sparkles, Zap } from "lucide-react";

const features = [
  { icon: Radar, title: "Feeds autorizados", text: "Monitore feeds e APIs dos seus programas de afiliados sem copiar grupos concorrentes." },
  { icon: Sparkles, title: "Post pronto", text: "Título, imagem, preço e link afiliado organizados em um formato consistente." },
  { icon: Clock3, title: "Fila automática", text: "Deduplicação, agendamento, tentativas controladas e histórico por destino." },
  { icon: MessageCircleMore, title: "Distribuição oficial", text: "Telegram automático e WhatsApp Business com opt-in e templates aprovados." },
  { icon: ChartNoAxesCombined, title: "Operação visível", text: "Acompanhe ofertas capturadas, envios, erros e desempenho sem planilhas." },
  { icon: ShieldCheck, title: "Sem sessão clandestina", text: "Tokens no servidor, allowlist de feeds e nenhuma automação frágil do WhatsApp Web." }
];

export default function Home() {
  return <main>
    <header className="topbar"><Link href="/" className="brand"><span className="brand-mark"><Zap size={19}/></span><span>Acelera <b>Garagem</b></span></Link><nav><a href="#recursos">Recursos</a><a href="#fluxo">Como funciona</a><Link className="nav-cta" href="/painel">Abrir painel</Link></nav></header>
    <section className="hero"><div className="hero-grid"/><div className="hero-copy"><div className="pill"><span/>Automação responsável para afiliados</div><h1>A oferta aparece.<br/><em>Seu fluxo acelera.</em></h1><p>Capture ofertas de fontes autorizadas, transforme em posts consistentes e distribua para seus canais com fila, regras e rastreio.</p><div className="hero-actions"><Link href="/painel" className="button primary">Configurar operação <ArrowRight size={18}/></Link><a href="#fluxo" className="button secondary">Ver arquitetura</a></div><div className="trust"><span><ShieldCheck size={16}/>Tokens só no servidor</span><span><Bot size={16}/>Execução por cron</span><span><Radar size={16}/>Feeds em allowlist</span></div></div><div className="hero-console"><div className="console-head"><span><i/>Operação ao vivo</span><b>24/7</b></div><div className="console-flow"><article><small>FONTE</small><strong>Feed Shopee Parceiros</strong><p>17 ofertas verificadas</p></article><div className="flow-line"><span>dedup</span></div><article className="accent-card"><small>PROCESSAMENTO</small><strong>Oferta formatada</strong><p>Imagem · preço · afiliado</p></article><div className="flow-line"><span>fila</span></div><div className="destinations"><article><span className="dot telegram"/><div><strong>Telegram</strong><p>Enviado para o canal</p></div><b>✓</b></article><article><span className="dot whatsapp"/><div><strong>WhatsApp oficial</strong><p>Template para opt-ins</p></div><b>✓</b></article></div></div></div></section>
    <section id="recursos" className="section"><div className="section-head"><span>CONTROLE DE PONTA A PONTA</span><h2>Menos tarefa repetitiva.<br/>Mais curadoria.</h2></div><div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="fluxo" className="flow-section"><div><span className="eyebrow">FLUXO OPERACIONAL</span><h2>Da fonte ao canal em quatro etapas.</h2><p>O projeto separa captura, normalização, fila e entrega. Isso permite trocar um provedor sem derrubar o restante da operação.</p></div><ol><li><b>01</b><span><strong>Conecte fontes</strong><small>Feeds JSON e APIs autorizadas.</small></span></li><li><b>02</b><span><strong>Revise regras</strong><small>Allowlist, deduplicação e limites.</small></span></li><li><b>03</b><span><strong>Monte a fila</strong><small>Oferta pronta para cada destino.</small></span></li><li><b>04</b><span><strong>Distribua</strong><small>Telegram e WhatsApp Business.</small></span></li></ol></section>
    <footer><span>Acelera Garagem</span><p>Software independente. Respeite as políticas dos marketplaces, programas de afiliados e canais.</p><Link href="/painel">Painel <ArrowRight size={15}/></Link></footer>
  </main>;
}
