import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  CheckCircle2,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getProducts } from "@/lib/data";
import { platforms } from "@/lib/platforms";
import { isSafeCommunityUrl, siteConfig } from "@/lib/site-config";
import styles from "./home.module.css";

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const featured = products.filter((product) => product.featured).slice(0, 8);
  const catalog = featured.length ? featured : products.slice(0, 8);
  const whatsapp = isSafeCommunityUrl(siteConfig.community.whatsapp, "whatsapp");
  const telegram = isSafeCommunityUrl(siteConfig.community.telegram, "telegram");

  const primaryChannels = [
    {
      label: "Grupo principal no WhatsApp",
      description: "Cupons e ofertas direto no celular",
      eyebrow: "Mais rápido",
      href: whatsapp ? siteConfig.community.whatsapp : "/comunidade",
      external: whatsapp,
      icon: MessageCircle,
      tone: "whatsapp",
    },
    {
      label: "Canal de ofertas no Telegram",
      description: "Acompanhe sem lotar suas conversas",
      eyebrow: "Canal gratuito",
      href: telegram ? siteConfig.community.telegram : "/comunidade",
      external: telegram,
      icon: Send,
      tone: "telegram",
    },
    {
      label: "Ver todos os achadinhos",
      description: "Compare as ofertas publicadas no site",
      eyebrow: "Catálogo completo",
      href: "/ofertas",
      external: false,
      icon: BadgePercent,
      tone: "orange",
    },
    {
      label: "Buscar um produto",
      description: "Encontre por nome, categoria ou loja",
      eyebrow: "Busca rápida",
      href: "/buscar",
      external: false,
      icon: Search,
      tone: "neutral",
    },
  ] as const;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={`${styles.heroInner} container-site`}>
          <div className={styles.brandStage} data-reveal>
            <div className={styles.logoOrbit}>
              <span className={styles.orbitRing} aria-hidden="true" />
              <Image
                src="/brand/logo-neon.png"
                alt="Garagem das Ofertas"
                width={168}
                height={168}
                priority
                className={styles.heroLogo}
              />
              <span className={styles.liveBadge}><span />OFERTAS NO AR</span>
            </div>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}><Sparkles size={15} /> Sua central de economia</p>
              <h1>Achadinhos bons<br /><span>não ficam parados.</span></h1>
              <p>Entre nos grupos, explore as vitrines e encontre produtos mais baratos no Mercado Livre, na Shopee e no TikTok Shop.</p>
              <div className={styles.trustRow}>
                <span><CheckCircle2 size={16} /> Grátis</span>
                <span><ShieldCheck size={16} /> Links verificados</span>
                <span><Zap size={16} /> Atualizações rápidas</span>
              </div>
            </div>
          </div>

          <div className={styles.quickPanel} data-reveal>
            <div className={styles.panelHeading}>
              <div>
                <p>Comece por aqui</p>
                <h2>Onde você quer economizar?</h2>
              </div>
              <span className={styles.panelNumber}>01</span>
            </div>
            <div className={styles.compactActions}>
              <a
                href={whatsapp ? siteConfig.community.whatsapp : "/comunidade"}
                target={whatsapp ? "_blank" : undefined}
                rel={whatsapp ? "noopener noreferrer" : undefined}
                className={`${styles.compactAction} ${styles.whatsappAction}`}
              >
                <MessageCircle size={22} />
                <span><strong>Entrar no WhatsApp</strong><small>Receber ofertas primeiro</small></span>
                <ArrowUpRight size={19} />
              </a>
              <Link href="/ofertas" className={styles.compactAction}>
                <Store size={22} />
                <span><strong>Explorar ofertas</strong><small>Ver o catálogo completo</small></span>
                <ArrowRight size={19} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.hubSection} container-site`} data-reveal>
        <div className={styles.sectionIntro}>
          <span className={styles.step}>02</span>
          <div>
            <p className={styles.eyebrow}>Escolha seu canal</p>
            <h2>Ofertas do seu jeito</h2>
            <p>Um toque e você já está dentro. Sem cadastro, sem mensalidade.</p>
          </div>
        </div>

        <div className={styles.channelGrid}>
          {primaryChannels.map((channel) => {
            const Icon = channel.icon;
            const content = (
              <>
                <span className={`${styles.channelIcon} ${styles[channel.tone]}`}><Icon size={25} /></span>
                <span className={styles.channelText}>
                  <small>{channel.eyebrow}</small>
                  <strong>{channel.label}</strong>
                  <span>{channel.description}</span>
                </span>
                <span className={styles.channelArrow}><ArrowUpRight size={21} /></span>
              </>
            );

            return channel.external ? (
              <a key={channel.label} href={channel.href} target="_blank" rel="noopener noreferrer" className={styles.channelCard}>{content}</a>
            ) : (
              <Link key={channel.label} href={channel.href} className={styles.channelCard}>{content}</Link>
            );
          })}
        </div>
      </section>

      <section className={`${styles.categorySection} container-site`} data-reveal>
        <div className={styles.sectionIntro}>
          <span className={styles.step}>03</span>
          <div>
            <p className={styles.eyebrow}>Navegue por categoria</p>
            <h2>Encontre o que você gosta</h2>
            <p>Atalhos grandes, rápidos e fáceis de usar no celular.</p>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <Link key={category.id} href={`/categoria/${category.slug}`} className={styles.categoryCard}>
              <span className={styles.categoryIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.categoryIcon}><CategoryIcon name={category.icon} size={26} /></span>
              <span className={styles.categoryCopy}>
                <strong>{category.name}</strong>
                <small>{category.description}</small>
              </span>
              <ArrowRight className={styles.categoryArrow} size={21} />
            </Link>
          ))}
          <Link href="/ofertas" className={`${styles.categoryCard} ${styles.allCategories}`}>
            <span className={styles.categoryIndex}>+</span>
            <span className={styles.categoryIcon}><BadgePercent size={26} /></span>
            <span className={styles.categoryCopy}><strong>Todas as ofertas</strong><small>Veja a seleção completa da garagem.</small></span>
            <ArrowRight className={styles.categoryArrow} size={21} />
          </Link>
        </div>
      </section>

      <section className={`${styles.storeSection} container-site`} data-reveal>
        <div className={styles.sectionIntro}>
          <span className={styles.step}>04</span>
          <div>
            <p className={styles.eyebrow}>Escolha a plataforma</p>
            <h2>Três vitrines, uma curadoria</h2>
            <p>Acesse diretamente os achadinhos de cada marketplace.</p>
          </div>
        </div>
        <div className={styles.storeGrid}>
          {platforms.map((platform, index) => (
            <Link key={platform.slug} href={`/loja/${platform.slug}`} className={styles.storeCard} style={{ "--store-color": platform.color } as CSSProperties}>
              <span className={styles.storeTop}><span>VITRINE {String(index + 1).padStart(2, "0")}</span><ArrowUpRight size={20} /></span>
              <strong>Achadinhos {platform.preposition}<br />{platform.label}</strong>
              <small>{platform.description}</small>
              <span className={styles.storeBar} />
            </Link>
          ))}
        </div>
      </section>

      <section className={`${styles.productsSection} container-site`} id="ofertas" data-reveal>
        <div className={styles.productsHeading}>
          <div>
            <p className={styles.eyebrow}>Seleção da garagem</p>
            <h2>Achadinhos em destaque</h2>
          </div>
          <Link href="/ofertas">Ver catálogo <ArrowRight size={17} /></Link>
        </div>
        <ProductGrid products={catalog} />
      </section>

      <section className={`${styles.finalCta} container-site`} data-reveal>
        <div>
          <p><Sparkles size={15} /> Não perca a próxima queda de preço</p>
          <h2>A oferta certa pode durar poucos minutos.</h2>
          <span>Entre gratuitamente e receba os melhores achadinhos no WhatsApp.</span>
        </div>
        <a
          href={whatsapp ? siteConfig.community.whatsapp : "/comunidade"}
          target={whatsapp ? "_blank" : undefined}
          rel={whatsapp ? "noopener noreferrer" : undefined}
          className={styles.finalButton}
        >
          <MessageCircle size={21} /> Entrar no grupo <ArrowUpRight size={18} />
        </a>
      </section>
    </div>
  );
}
