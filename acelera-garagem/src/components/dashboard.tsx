"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Bot, CheckCircle2, Database, KeyRound, LoaderCircle, MessageCircleMore, Plus, Radio, RefreshCw, Send, Settings2, ShieldCheck, Zap } from "lucide-react";

type State = {
  offers: Array<{ id: string; title: string; store: string; price: number | null; image_url: string; created_at: string }>;
  sources: Array<{ id: string; name: string; store: string; feed_url: string; active: boolean; last_checked_at: string | null }>;
  destinations: Array<{ id: string; name: string; channel: string; external_id: string; active: boolean; opt_in_confirmed: boolean }>;
  deliveries: Array<{ id: number; status: string; attempts: number; last_error: string | null; created_at: string }>;
};

const empty: State = { offers: [], sources: [], destinations: [], deliveries: [] };

export function Dashboard() {
  const [token, setToken] = useState("");
  const [draftToken, setDraftToken] = useState("");
  const [state, setState] = useState<State>(empty);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const response = await fetch(path, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init?.headers || {}) } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha na operacao");
    return data;
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { setState(await request("/api/state")); setMessage(""); }
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

  async function submit(path: string, form: HTMLFormElement) {
    setLoading(true); setMessage("");
    try {
      const values = Object.fromEntries(new FormData(form));
      if ("optInConfirmed" in values) values.optInConfirmed = values.optInConfirmed === "on" ? "true" : "false";
      const body = { ...values, optInConfirmed: values.optInConfirmed === "true" };
      await request(path, { method: "POST", body: JSON.stringify(body) });
      form.reset(); setMessage("Salvo e adicionado ao fluxo."); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao salvar"); }
    finally { setLoading(false); }
  }

  const pending = state.deliveries.filter((item) => item.status === "pending").length;
  const sent = state.deliveries.filter((item) => item.status === "sent").length;

  if (!token) return <main className="unlock"><Link href="/" className="back"><ArrowLeft size={16}/>Voltar</Link><form onSubmit={unlock} className="unlock-card"><span className="unlock-icon"><KeyRound/></span><small>ÁREA OPERACIONAL</small><h1>Desbloquear painel</h1><p>Use o mesmo valor configurado em <code>AUTOMATION_ADMIN_TOKEN</code> na Vercel.</p><input type="password" value={draftToken} onChange={(event) => setDraftToken(event.target.value)} minLength={24} required placeholder="Token administrativo"/><button className="button primary">Entrar com segurança</button></form></main>;

  return <main className="dashboard"><aside><Link href="/" className="brand"><span className="brand-mark"><Zap size={19}/></span><span>Acelera <b>Garagem</b></span></Link><nav><a href="#visao"><Activity/>Visão geral</a><a href="#oferta"><Plus/>Nova oferta</a><a href="#fontes"><Radio/>Fontes</a><a href="#destinos"><Send/>Destinos</a><a href="#fila"><Database/>Fila</a></nav><div className="aside-note"><ShieldCheck/><p>WhatsApp somente pela Cloud API oficial, com opt-in.</p></div></aside><section className="dashboard-main"><header><div><small>OPERAÇÃO</small><h1>Central de automação</h1></div><button onClick={refresh} disabled={loading} className="icon-btn" aria-label="Atualizar">{loading ? <LoaderCircle className="spin"/> : <RefreshCw/>}</button></header>{message && <div className="notice">{message}</div>}<div id="visao" className="stats"><article><span><Bot/></span><div><small>OFERTAS</small><strong>{state.offers.length}</strong></div></article><article><span><Radio/></span><div><small>FONTES ATIVAS</small><strong>{state.sources.filter((item) => item.active).length}</strong></div></article><article><span><Send/></span><div><small>NA FILA</small><strong>{pending}</strong></div></article><article><span><CheckCircle2/></span><div><small>ENVIADAS</small><strong>{sent}</strong></div></article></div>
    <div className="panel-grid"><form id="oferta" className="panel form-panel" onSubmit={(event) => { event.preventDefault(); void submit("/api/offers", event.currentTarget); }}><div className="panel-title"><span><Plus/></span><div><small>CURADORIA EXPRESSA</small><h2>Adicionar oferta</h2></div></div><div className="fields two"><label>Título<input name="title" required maxLength={180}/></label><label>Loja<select name="store"><option>Shopee</option><option>Mercado Livre</option><option>TikTok Shop</option><option>Amazon</option><option>Outra</option></select></label></div><label>Imagem de qualquer fonte<input name="imageUrl" type="url" required placeholder="https://..."/><small>A plataforma da oferta não precisa ser a mesma hospedagem da imagem.</small></label><label>Link afiliado<input name="affiliateUrl" type="url" required placeholder="https://..."/></label><div className="fields two"><label>Preço<input name="price" type="number" min="0" step="0.01"/></label><label>Preço anterior<input name="oldPrice" type="number" min="0" step="0.01"/></label></div><label>Descrição<textarea name="description" rows={3}/></label><button disabled={loading} className="button primary"><Plus size={17}/>Adicionar e enfileirar</button></form>
      <div className="panel activity-panel"><div className="panel-title"><span><Activity/></span><div><small>ÚLTIMAS CAPTURAS</small><h2>Ofertas recentes</h2></div></div><div className="offer-list">{state.offers.length ? state.offers.slice(0, 6).map((offer) => <article key={offer.id}><img src={offer.image_url} alt="" referrerPolicy="no-referrer"/><div><strong>{offer.title}</strong><small>{offer.store} · {offer.price === null ? "sem preço" : `R$ ${Number(offer.price).toFixed(2)}`}</small></div></article>) : <p className="empty-state">Nenhuma oferta capturada ainda.</p>}</div></div></div>
    <div className="panel-grid lower"><form id="fontes" className="panel form-panel" onSubmit={(event) => { event.preventDefault(); void submit("/api/sources", event.currentTarget); }}><div className="panel-title"><span><Radio/></span><div><small>BUSCA AUTOMÁTICA</small><h2>Adicionar feed autorizado</h2></div></div><label>Nome<input name="name" required placeholder="Feed do programa parceiro"/></label><div className="fields two"><label>Loja<input name="store" required placeholder="Shopee"/></label><label>URL JSON<input name="feedUrl" type="url" required placeholder="https://parceiro.com/ofertas.json"/></label></div><p className="help">O domínio precisa estar em <code>OFFER_FEED_ALLOWED_HOSTS</code>. Formato esperado: array ou <code>{`{ offers: [...] }`}</code>.</p><button disabled={loading} className="button secondary-dark"><Radio size={17}/>Conectar fonte</button></form>
      <form id="destinos" className="panel form-panel" onSubmit={(event) => { event.preventDefault(); void submit("/api/destinations", event.currentTarget); }}><div className="panel-title"><span><MessageCircleMore/></span><div><small>DISTRIBUIÇÃO</small><h2>Adicionar destino</h2></div></div><div className="fields two"><label>Nome<input name="name" required placeholder="Canal principal"/></label><label>Canal<select name="channel"><option value="telegram">Telegram</option><option value="whatsapp">WhatsApp oficial</option></select></label></div><label>Chat ID ou telefone<input name="externalId" required placeholder="-100... ou 5511..."/></label><label>Template WhatsApp aprovado<input name="templateName" placeholder="oferta_afiliado"/></label><label className="check"><input type="checkbox" name="optInConfirmed"/><span>Confirmo que o destinatário do WhatsApp deu opt-in.</span></label><button disabled={loading} className="button secondary-dark"><Send size={17}/>Salvar destino</button></form></div>
    <section id="fila" className="panel queue"><div className="panel-title"><span><Settings2/></span><div><small>ENTREGAS</small><h2>Fila recente</h2></div></div><div className="queue-table"><div className="queue-head"><span>Status</span><span>Tentativas</span><span>Detalhe</span></div>{state.deliveries.slice(0, 12).map((item) => <div key={item.id}><span className={`status ${item.status}`}>{item.status}</span><span>{item.attempts}/3</span><span>{item.last_error || "Processamento normal"}</span></div>)}{!state.deliveries.length && <p className="empty-state">A fila está vazia.</p>}</div></section>
  </section></main>;
}
