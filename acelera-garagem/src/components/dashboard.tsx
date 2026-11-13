"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Bot, CheckCircle2, Database, KeyRound, LoaderCircle, LogOut, MessageCircleMore, Play, Plus, Radio, RefreshCw, Search, Send, Settings2, ShieldCheck, Zap } from "lucide-react";

type State = {
  offers: Array<{ id: string; title: string; store: string; price: number | null; image_url: string }>;
  sources: Array<{ id: string; name: string; store: string; feed_url: string; active: boolean }>;
  searches: Array<{ id: string; name: string; query: string; min_discount: number; result_limit: number; active: boolean; last_checked_at: string | null; last_error: string | null }>;
  destinations: Array<{ id: string; name: string; channel: string; external_id: string; active: boolean }>;
  deliveries: Array<{ id: number; status: string; attempts: number; last_error: string | null }>;
  searchSetupRequired: boolean;
};

const empty: State = { offers: [], sources: [], searches: [], destinations: [], deliveries: [], searchSetupRequired: false };

export function Dashboard() {
  const [token, setToken] = useState("");
  const [draftToken, setDraftToken] = useState("");
  const [state, setState] = useState<State>(empty);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const response = await fetch(path, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init?.headers || {}) } });
    const raw = await response.text();
    let data: Record<string, any> = {};
    try { data = raw ? JSON.parse(raw) : {}; }
    catch { throw new Error(`O servidor respondeu em formato invalido (${response.status}). Verifique o deploy e as variaveis da Vercel.`); }
    if (!response.ok) throw new Error(data.error || "Falha na operacao");
    return data;
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { setState(await request("/api/state") as State); setMessage(""); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao carregar"); }
    finally { setLoading(false); }
  }, [request, token]);

  useEffect(() => { const saved = sessionStorage.getItem("automation-admin-token") || ""; setToken(saved); setDraftToken(saved); }, []);
  useEffect(() => { if (token) void refresh(); }, [token, refresh]);

  function unlock(event: React.FormEvent) {
    event.preventDefault();
    sessionStorage.setItem("automation-admin-token", draftToken);
    setToken(draftToken);
  }

  function logout() {
    sessionStorage.removeItem("automation-admin-token");
    setToken(""); setDraftToken(""); setMessage(""); setState(empty);
  }

  async function submit(path: string, form: HTMLFormElement) {
    setLoading(true); setMessage("");
    try {
      const values = Object.fromEntries(new FormData(form));
      const body = { ...values, optInConfirmed: values.optInConfirmed === "on" };
      await request(path, { method: "POST", body: JSON.stringify(body) });
      form.reset(); setMessage("Configuracao salva."); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao salvar"); }
    finally { setLoading(false); }
  }

  async function runNow() {
    setLoading(true); setMessage("Buscando ofertas e processando a fila...");
    try {
      const result = await request("/api/run", { method: "POST", body: "{}" });
      setMessage(`Ciclo concluido: ${result.mercadoLivreOffers} ofertas novas do Mercado Livre e ${result.sent} envios.`);
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha na automacao"); }
    finally { setLoading(false); }
  }

  const pending = state.deliveries.filter((item) => item.status === "pending").length;
  const sent = state.deliveries.filter((item) => item.status === "sent").length;

  if (!token) return <main className="unlock"><Link href="/" className="back"><ArrowLeft size={16}/>Voltar</Link><form onSubmit={unlock} className="unlock-card"><span className="unlock-icon"><KeyRound/></span><small>ÁREA OPERACIONAL</small><h1>Desbloquear painel</h1><p>Cole o valor de <code>AUTOMATION_ADMIN_TOKEN</code>. O <code>CRON_SECRET</code> nao abre o painel.</p><input type="password" value={draftToken} onChange={(event) => setDraftToken(event.target.value)} minLength={24} required placeholder="Token administrativo"/><button className="button primary">Entrar no painel</button></form></main>;

  return <main className="dashboard">
    <aside><Link href="/" className="brand"><span className="brand-mark"><Zap size={19}/></span><span>Acelera <b>Garagem</b></span></Link><nav><a href="#visao"><Activity/>Visão geral</a><a href="#buscas"><Search/>Buscas</a><a href="#destinos"><Send/>Destinos</a><a href="#fila"><Database/>Fila</a></nav><div className="aside-note"><ShieldCheck/><p>Cadastre a busca e o destino uma vez. Depois o cron executa sozinho.</p></div></aside>
    <section className="dashboard-main">
      <header><div><small>OPERAÇÃO AUTOMÁTICA</small><h1>Central de ofertas</h1></div><div className="header-actions"><button onClick={runNow} disabled={loading} className="button primary">{loading ? <LoaderCircle className="spin"/> : <Play/>}Executar agora</button><button onClick={refresh} disabled={loading} className="icon-btn" aria-label="Atualizar"><RefreshCw/></button><button onClick={logout} className="icon-btn" aria-label="Trocar token"><LogOut/></button></div></header>
      {message && <div className="notice">{message}</div>}
      {state.searchSetupRequired && <div className="notice"><strong>Falta preparar o banco:</strong> execute <code>supabase/mercadolivre-search.sql</code> no SQL Editor.</div>}

      <div id="visao" className="stats"><article><span><Bot/></span><div><small>OFERTAS</small><strong>{state.offers.length}</strong></div></article><article><span><Search/></span><div><small>BUSCAS ATIVAS</small><strong>{state.searches.filter((item) => item.active).length}</strong></div></article><article><span><Send/></span><div><small>NA FILA</small><strong>{pending}</strong></div></article><article><span><CheckCircle2/></span><div><small>ENVIADAS</small><strong>{sent}</strong></div></article></div>

      <div className="panel-grid">
        <form id="buscas" className="panel form-panel" onSubmit={(event) => { event.preventDefault(); void submit("/api/searches", event.currentTarget); }}><div className="panel-title"><span><Search/></span><div><small>DESCOBERTA AUTOMÁTICA</small><h2>Buscar no Mercado Livre</h2></div></div><label>Nome da busca<input name="name" required placeholder="Ferramentas em oferta"/></label><label>Produto ou palavra-chave<input name="query" required placeholder="furadeira sem fio"/></label><div className="fields two"><label>Desconto mínimo (%)<input name="minDiscount" type="number" min="0" max="100" defaultValue="10"/></label><label>Limite por ciclo<input name="resultLimit" type="number" min="1" max="20" defaultValue="10"/></label></div><p className="help">A busca roda automaticamente a cada hora. Um produto no mesmo preço não será enviado novamente.</p><button disabled={loading || state.searchSetupRequired} className="button primary"><Search size={17}/>Salvar busca automática</button></form>
        <div className="panel activity-panel"><div className="panel-title"><span><Radio/></span><div><small>MONITORAMENTO</small><h2>Buscas configuradas</h2></div></div><div className="offer-list search-list">{state.searches.length ? state.searches.map((search) => <article key={search.id}><span className="search-badge"><Search/></span><div><strong>{search.name}</strong><small>“{search.query}” · mínimo {Number(search.min_discount)}% · {search.result_limit} itens</small>{search.last_error && <small className="error-text">{search.last_error}</small>}</div></article>) : <p className="empty-state">Cadastre sua primeira busca ao lado.</p>}</div></div>
      </div>

      <div className="panel-grid lower">
        <form id="destinos" className="panel form-panel" onSubmit={(event) => { event.preventDefault(); void submit("/api/destinations", event.currentTarget); }}><div className="panel-title"><span><MessageCircleMore/></span><div><small>PARA ONDE ENVIAR</small><h2>Adicionar destino</h2></div></div><div className="fields two"><label>Nome<input name="name" required placeholder="Canal principal"/></label><label>Canal<select name="channel"><option value="telegram">Telegram</option><option value="whatsapp">WhatsApp oficial</option></select></label></div><label>Chat ID ou telefone<input name="externalId" required placeholder="-100... ou 5571..."/></label><label>Template WhatsApp aprovado<input name="templateName" placeholder="oferta_afiliado"/></label><label className="check"><input type="checkbox" name="optInConfirmed"/><span>Confirmo que o destinatário do WhatsApp deu opt-in.</span></label><button disabled={loading} className="button secondary-dark"><Send size={17}/>Salvar destino</button></form>
        <div className="panel activity-panel"><div className="panel-title"><span><Activity/></span><div><small>ÚLTIMAS CAPTURAS</small><h2>Ofertas recentes</h2></div></div><div className="offer-list">{state.offers.length ? state.offers.slice(0, 8).map((offer) => <article key={offer.id}><img src={offer.image_url} alt="" referrerPolicy="no-referrer"/><div><strong>{offer.title}</strong><small>{offer.store} · {offer.price === null ? "sem preço" : `R$ ${Number(offer.price).toFixed(2)}`}</small></div></article>) : <p className="empty-state">As ofertas encontradas aparecerão aqui.</p>}</div></div>
      </div>

      <details className="panel advanced"><summary>Adicionar oferta ou feed manualmente</summary><div className="panel-grid lower"><form className="form-panel" onSubmit={(event) => { event.preventDefault(); void submit("/api/offers", event.currentTarget); }}><h2>Oferta manual</h2><label>Título<input name="title" required/></label><div className="fields two"><label>Loja<input name="store" defaultValue="Mercado Livre"/></label><label>Preço<input name="price" type="number" min="0" step="0.01"/></label></div><label>Imagem<input name="imageUrl" type="url" required/></label><label>Link afiliado<input name="affiliateUrl" type="url" required/></label><button className="button secondary-dark"><Plus/>Adicionar</button></form><form className="form-panel" onSubmit={(event) => { event.preventDefault(); void submit("/api/sources", event.currentTarget); }}><h2>Feed JSON</h2><label>Nome<input name="name" required/></label><label>Loja<input name="store" required/></label><label>URL JSON<input name="feedUrl" type="url" required/></label><button className="button secondary-dark"><Radio/>Conectar feed</button></form></div></details>

      <section id="fila" className="panel queue"><div className="panel-title"><span><Settings2/></span><div><small>ENTREGAS</small><h2>Fila recente</h2></div></div><div className="queue-table"><div className="queue-head"><span>Status</span><span>Tentativas</span><span>Detalhe</span></div>{state.deliveries.slice(0, 12).map((item) => <div key={item.id}><span className={`status ${item.status}`}>{item.status}</span><span>{item.attempts}/3</span><span>{item.last_error || "Processamento normal"}</span></div>)}{!state.deliveries.length && <p className="empty-state">A fila está vazia.</p>}</div></section>
    </section>
  </main>;
}
