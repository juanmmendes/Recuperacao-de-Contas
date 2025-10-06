// src/App.tsx

import { useMemo, useEffect, useState, useCallback, useRef } from "react";

import {
  ShieldCheck,
  FileWarning,
  Lock,
  KeyRound,
  Store,
  ShoppingBag,
  Search,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  ChevronRight,
  CheckCircle2,
  Info,
} from "lucide-react";

import heroImage from "./assets/institucional.png";
import contactImage from "./assets/escritorio.jpg";
import logoImg from "./assets/LogoBranca.png";
import googleImage from "./assets/business.png";
import evidenceImage from "./assets/provas.png";
import marketplaceImage from "./assets/marketplace.png";
import securityImage from "./assets/seguranca.png";

/**

 * LP — Recuperação de Contas (Google / Marketplaces)

 * Paleta: Slate muito escuro + acentos Cyan/Emerald (tech + confiança).

 * Alterações: formulário com card escuro (borda ciano/emerald), texto institucional reforçado,

 *             contador de caracteres, auto-resize e feedback de envio.

 * JS leve: smooth scroll, scrollspy, reveal e auto-resize de textarea.

 */

const NAV_LINKS = [
  { href: "#cenarios", label: "Cenários" },

  { href: "#por-que", label: "Por que jurídico?" },

  { href: "#atuacao", label: "Como atuamos" },

  { href: "#checklist", label: "Checklist" },

  { href: "#conteudo", label: "Conteúdo" },

  { href: "#locais", label: "Locais" },

  { href: "#faq", label: "FAQ" },

  { href: "#contato", label: "Contato" },
];

const PLATFORM_OPTIONS = [
  "Google Ads",
  "Google Merchant Center",
  "Google Business Profile",
  "Mercado Livre",
  "Amazon",
  "Shopee",
  "Outros",
] as const;

const BLOCK_OPTIONS = [
  "Verifica\u00e7\u00e3o/Suspens\u00e3o por pol\u00edticas",
  "Acesso comprometido (poss\u00edvel invas\u00e3o)",
  "Contesta\u00e7\u00f5es de propriedade",
  "Performance/qualidade (marketplaces)",
  "Outro",
] as const;

export function getJsonLd() {
  return {
    "@context": "https://schema.org",

    "@type": "LegalService",

    name: "Marinho Mendes Sociedade de Advogados",

    url: "https://marinhomendes.adv.br/",

    areaServed: "Brasil",

    serviceType: [
      "Recuperação de Conta — Google (Ads, Merchant Center, Business Profile)",

      "Recuperação de Conta — Marketplaces (Mercado Livre, Amazon, Shopee)",

      "Preservação de Provas e Recursos Administrativos",
    ],

    sameAs: [
      "https://www.facebook.com/marinhomendesadv",

      "https://www.instagram.com/marinhomendes.adv",

      "https://www.linkedin.com/company/14030512/",
    ],

    openingHours: "Mo-Fr 08:00-18:00",
  };
}

type FormState = {
  nome: string;

  email: string;

  telefone: string;

  plataforma: string;

  bloqueio: string;

  mensagem: string;

  consent: boolean;
};

export default function RecuperacaoContasPage() {
  const year = useMemo(() => new Date().getFullYear(), []);

  const [activeId, setActiveId] = useState<string>("#cenarios");

  const jsonLd = useMemo(() => JSON.stringify(getJsonLd()), []);

  const formRef = useRef<HTMLFormElement | null>(null);

  // ===== JS: checks/reveal/scroll =====

  useEffect(() => {
    const isBrowser =
      typeof window !== "undefined" && typeof document !== "undefined";

    if (!isBrowser) return;

    const hrefs = NAV_LINKS.map((n) => n.href);

    console.assert(
      new Set(hrefs).size === hrefs.length,
      "[NAV] hrefs devem ser únicos",
    );

    requestAnimationFrame(() => {
      const missing = NAV_LINKS.map((n) => n.href).filter(
        (h) => !document.querySelector(h),
      );

      if (missing.length) console.warn("[NAV] Seções ausentes:", missing);
    });
  }, []);

  const smoothScroll = useCallback((hash: string) => {
    const el = document.querySelector(hash) as HTMLElement | null;

    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - 84;

    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (entry) =>
            entry.isIntersecting &&
            setActiveId(`#${(entry.target as HTMLElement).id}`),
        ),

      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    NAV_LINKS.forEach((l) => {
      const el = document.querySelector(l.href);

      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("opacity-0", "translate-y-4");

            e.target.classList.add("opacity-100", "translate-y-0");

            obs.unobserve(e.target);
          }
        });
      },

      { threshold: 0.2 },
    );

    els.forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  // ===== Form State / UX =====

  const [form, setForm] = useState<FormState>({
    nome: "",

    email: "",

    telefone: "",

    plataforma: "",

    bloqueio: "",

    mensagem: "",

    consent: false,
  });

  const [chars, setChars] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const [sent, setSent] = useState(false);

  // Auto-resize do textarea

  const msgRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!msgRef.current) return;

    const el = msgRef.current;

    const handler = () => {
      el.style.height = "0px";

      el.style.height = Math.min(400, el.scrollHeight) + "px";
    };

    handler();

    el.addEventListener("input", handler);

    return () => el.removeEventListener("input", handler);
  }, []);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { id, type } = e.target;

    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setForm((f) => ({ ...f, [id]: value }));

    if (id === "mensagem")
      setChars((e.target as HTMLTextAreaElement).value.length);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current?.reportValidity()) {
      // leve vibração visual no botão (CSS only)

      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);

      setSent(true);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#0a0f14] text-slate-100 antialiased">
      {/* JSON-LD para SEO */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0f14]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0a0f14]/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl bg-cyan-500/15 ring-1 ring-cyan-400/30 flex items-center justify-center"
                aria-label="Espaço para logo"
              >
                <img
                  src={logoImg}
                  alt="Marinho Mendes Sociedade de Advogados"
                  className="h-6 w-auto"
                />
              </div>

              <div className="leading-tight">
                <p className="text-base font-semibold tracking-tight">
                  Marinho Mendes Sociedade de Advogados
                </p>

                <p className="text-xs sm:text-sm text-slate-400">
                  Recuperação de Contas • Google / Marketplaces
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 text-sm">
              <a
                href="tel:+551932090417"
                className="inline-flex items-center gap-2 hover:opacity-80"
              >
                <Phone className="h-4 w-4" />
                Campinas: (19) 3209-0417
              </a>

              <a
                href="tel:+551938454946"
                className="inline-flex items-center gap-2 hover:opacity-80"
              >
                <Phone className="h-4 w-4" />
                Hortolândia: (19) 3845-4946
              </a>

              <a
                href="https://wa.me/5519974100605"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/5"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO (mantido) */}

      <section className="relative overflow-hidden" data-testid="hero">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 right-[-20%] h-[44rem] w-[44rem] rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="absolute -bottom-24 left-[-10%] h-[40rem] w-[40rem] rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_70%_-10%,rgba(34,211,238,0.10),transparent),radial-gradient(70rem_40rem_at_-20%_-30%,rgba(16,185,129,0.10),transparent)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Copy */}

            <div>
              <p className="text-xs font-semibold tracking-widest text-cyan-300 uppercase">
                Contas bloqueadas — Google & Marketplaces
              </p>

              <h1 className="mt-2 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight [text-wrap:balance]">
                Resposta jurídica para{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  restabelecer o acesso
                </span>{" "}
                e proteger
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  {" "}
                  operações comerciais
                </span>
              </h1>

              <p className="mt-4 text-lg text-slate-300/90 max-w-2xl">
                Orientação e execução de recursos administrativos, preservação
                de provas digitais e medidas judiciais quando cabíveis — para
                reduzir impacto operacional e acelerar a retomada das contas.
              </p>

              {/* Provas/autoridade */}

              <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl">
                {[
                  {
                    icon: Search,
                    t: "Google",
                    d: "Ads, Merchant Center, Business Profile (suspensões e verificações).",
                  },

                  {
                    icon: Store,
                    t: "Marketplaces",
                    d: "Mercado Livre, Amazon, Shopee — performance e políticas.",
                  },

                  {
                    icon: Lock,
                    t: "Acesso comprometido",
                    d: "Suspeita de invasão, mudanças de e-mail/telefone.",
                  },

                  {
                    icon: ShieldCheck,
                    t: "Provas válidas",
                    d: "Prints, e-mails, logs e NF-e com cadeia de custódia.",
                  },
                ].map((i, idx) => {
                  const Icon = i.icon as any;

                  return (
                    <li
                      key={idx}
                      className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-xl border border-white/10 bg-white/5 p-4"
                      data-reveal
                      style={{ transitionDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 text-cyan-200">
                          <Icon className="h-5 w-5" />
                        </span>

                        <div>
                          <p className="font-medium text-slate-100">{i.t}</p>

                          <p className="text-sm text-slate-300/90">{i.d}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* CTAs */}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => smoothScroll("#contato")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-medium text-[#0a0f14] bg-gradient-to-r from-cyan-300 to-emerald-300 shadow-sm hover:opacity-90"
                >
                  Conversa técnica imediata <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => smoothScroll("#checklist")}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-base font-medium border border-white/15 hover:bg-white/5"
                >
                  Checklist para iniciar
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-400 max-w-xl">
                Conteúdo informativo (Provimento CFOAB nº 205/2021). O contato
                não cria relação advogado–cliente, nem garantia de resultado.
              </p>
            </div>

            {/* Imagem hero */}

            <figure
              className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border border-white/10 bg-white/5 ring-1 ring-white/10 overflow-hidden aspect-[4/5] lg:aspect-[16/12]"
              data-reveal
            >
              <picture>
                <img
                  src={heroImage}
                  alt="Imagem institucional do escritório Marinho Mendes"
                  loading="lazy"
                  decoding="async"
                  width="1280"
                  height="960"
                  className="h-full w-full object-cover"
                />
              </picture>

              <figcaption className="p-3 text-xs text-slate-300/90">
                Substitua por imagem institucional do escritório ou ilustração
                do fluxo de recuperação.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* SUBNAV STICKY (sem barra no mobile) */}

      <div className="sticky top-0 z-40 backdrop-blur bg-[#0a0f14]/80 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto md:overflow-visible py-2 text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => smoothScroll(l.href)}
                className={[
                  "inline-flex items-center rounded-full border px-3 py-1.5 transition-colors",

                  activeId === l.href
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-white/15 hover:bg-white/5 text-slate-200",
                ].join(" ")}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* CENÁRIOS */}

      <section id="cenarios" className="py-16 bg-[#0a0f14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Cenários comuns de bloqueio
            </h2>

            <p className="mt-2 text-slate-300/90">
              Situações que exigem resposta rápida e documentação organizada.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Google — verificações e políticas",
                desc: "Suspensão de Ads/Merchant/Business Profile; requisitos de prova.",
              },

              {
                icon: Store,
                title: "Marketplaces — performance/políticas",
                desc: "Atraso de envios, reclamações, chargebacks e KYC.",
              },

              {
                icon: ShoppingBag,
                title: "Contestação de propriedade",
                desc: "Titularidade da conta/loja e comprovação de uso legítimo.",
              },

              {
                icon: FileWarning,
                title: "Notificações e prazos curtos",
                desc: "Janela de resposta; necessidade de protocolo e rastreabilidade.",
              },

              {
                icon: Lock,
                title: "Acesso comprometido",
                desc: "Mudanças de credenciais, logins suspeitos e integrações.",
              },

              {
                icon: KeyRound,
                title: "Recuperação escalonada",
                desc: "Etapas sucessivas até restabelecer acesso pleno.",
              },
            ].map((c, i) => {
              const Icon = c.icon as any;

              return (
                <div
                  key={i}
                  className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border border-white/10 bg-white/5 p-6"
                  data-reveal
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </span>

                    <h3 className="font-semibold text-slate-100">{c.title}</h3>
                  </div>

                  <p className="mt-2 text-sm text-slate-300/90">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* POR QUE SUPORTE JURÍDICO */}

      <section id="por-que" className="py-10 bg-[#0a0f14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Prazos e prioridade
                </p>

                <p className="mt-1 text-sm text-slate-300/90">
                  Plataformas e marketplaces operam por janelas curtas. A
                  orientação correta evita perda de prazos e organiza recursos
                  por prioridade.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Provas válidas
                </p>

                <p className="mt-1 text-sm text-slate-300/90">
                  Coleta e preservação de evidências (prints, e-mails, logs,
                  NF-e) com cadeia de custódia, fortalecendo a argumentação.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Risco operacional
                </p>

                <p className="mt-1 text-sm text-slate-300/90">
                  Mitigação de danos em vendas, SAC, anúncios e contratos em
                  execução, com comunicação técnica a stakeholders.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Conteúdo informativo, sem garantia de resultado (CFOAB 205/2021).
            </p>
          </div>
        </div>
      </section>

      {/* COMO ATUAMOS */}

      <section id="atuacao" className="py-16 bg-[#0a0f14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Como conduzimos o caso
            </h2>

            <p className="mt-2 text-slate-300/90">
              Integração entre vias administrativas e judiciais, com
              responsáveis, prazos e canais oficiais definidos.
            </p>
          </div>

          <ol className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                t: "Diagnóstico",
                d: "Contexto do bloqueio, titularidade, integrações, dispositivos e equipes.",
              },

              {
                t: "Plano de ação",
                d: "Sequência de passos, prazos e canais oficiais por plataforma/marketplace.",
              },

              {
                t: "Recursos e provas",
                d: "Protocolos formais, prints, e-mails, NF-e, contratos e cadeia de custódia.",
              },

              {
                t: "Medidas judiciais",
                d: "Quando cabível, tutela para resguardar operação e mitigar danos.",
              },

              {
                t: "Monitoramento",
                d: "Acompanhamento de tickets e comunicação objetiva de status.",
              },

              {
                t: "Governança digital",
                d: "2FA, perfis de acesso, revisão de políticas internas e prevenção.",
              },
            ].map((s, i) => (
              <li
                key={i}
                className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border border-white/10 bg-white/5 p-5 flex gap-4 items-start"
                data-reveal
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 text-[#0a0f14] text-sm font-semibold">
                  {i + 1}
                </span>

                <div>
                  <p className="font-medium text-slate-100">{s.t}</p>

                  <p className="text-sm text-slate-300/90">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CHECKLIST */}

      <section id="checklist" className="py-16 bg-[#0a0f14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Checklist para iniciar
            </h2>

            <p className="mt-2 text-slate-300/90">
              Documentos e evidências que aceleram a análise.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div
              className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border border-white/10 bg-white/5 p-6"
              data-reveal
            >
              <p className="font-semibold text-slate-100 mb-2">
                Conta e notificações
              </p>

              <ul className="text-sm text-slate-300/90 space-y-1 list-disc list-inside">
                <li>Prints e e-mails das plataformas/marketplaces.</li>

                <li>Mensagens automáticas e IDs de ticket.</li>

                <li>Histórico de logins/dispositivos.</li>
              </ul>
            </div>

            <div
              className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border border-white/10 bg-white/5 p-6"
              data-reveal
            >
              <p className="font-semibold text-slate-100 mb-2">
                Titularidade e uso
              </p>

              <ul className="text-sm text-slate-300/90 space-y-1 list-disc list-inside">
                <li>CNPJ/contrato social e comprovação de marca.</li>

                <li>NF-e/contratos que evidenciem uso empresarial.</li>

                <li>Administradores e permissões concedidas.</li>
              </ul>
            </div>

            <div
              className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border border-white/10 bg-white/5 p-6"
              data-reveal
            >
              <p className="font-semibold text-slate-100 mb-2">
                Segurança e integrações
              </p>

              <ul className="text-sm text-slate-300/90 space-y-1 list-disc list-inside">
                <li>2FA habilitado e rotação de senhas recente.</li>

                <li>Integrações (ERP/CRM/bots/anúncios) e logs.</li>

                <li>Incidentes prévios e tentativas de phishing.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}

      <section id="conteudo" className="py-16 bg-[#0a0f14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Conteúdo educativo
          </h2>

          <p className="mt-2 text-slate-300/90 max-w-3xl">
            Materiais para orientar equipes de marketing, operações e jurídico.
          </p>

          <div className="mt-8 grid md:grid-cols-4 gap-6">
            {[
              {
                title: "Fluxos oficiais de recurso (Google)",
                desc: "Canais e requisitos de Ads/Merchant/Business Profile.",
                image: googleImage,
                alt: "Profissional revisando politicas do Google Ads",
              },

              {
                title: "Provas e cadeia de custódia",
                desc: "Como preservar evidências válidas sem perder rastreabilidade.",
                image: evidenceImage,
                alt: "Advogada organizando provas digitais",
              },

              {
                title: "Política e performance (Marketplace)",
                desc: "Indicadores, SLAs e prevenção de suspensões.",
                image: marketplaceImage,
                alt: "Dashboard de performance em marketplace",
              },

              {
                title: "Segurança e acessos",
                desc: "2FA, perfis, integrações e prevenção de comprometimento.",
                image: securityImage,
                alt: "Equipe ajustando controles de seguranca",
              },
            ].map((art, i) => (
              <article
                key={i}
                className="reveal opacity-0 translate-y-4 transition-all duration-700 group rounded-2xl border border-white/10 overflow-hidden bg-white/5"
                data-reveal
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <figure className="aspect-[4/3] bg-white/5 border-b border-white/10 overflow-hidden">
                  <img
                    src={art.image}
                    alt={art.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </figure>

                <div className="p-5">
                  <h3 className="font-semibold text-slate-100 group-hover:text-white">
                    {art.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-300/90">{art.desc}</p>

                  <a
                    href="#contato"
                    className="mt-3 inline-flex items-center gap-1 text-sm hover:opacity-80 text-cyan-300"
                  >
                    Solicitar material <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAIS */}

      <section id="locais" className="py-16 bg-[#0a0f14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Locais de atuação
          </h2>

          <p className="mt-2 text-slate-300/90">
            Atuação nacional, com bases no interior de São Paulo.
          </p>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div
              className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border border-white/10 p-6 bg-white/5"
              data-reveal
            >
              <h3 className="font-semibold text-slate-100">Campinas/SP</h3>

              <p className="text-sm text-slate-300/90 mt-1">
                Av. José Rocha Bonfim, 214, Bloco J – Sala 228 – Ed. Milão,
                Praça Capital, Loteamento Center Santa Genebra, CEP 13080-650.
              </p>

              <p className="text-sm mt-2 inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />{" "}
                <a
                  href="tel:+551932090417"
                  className="hover:opacity-80 text-cyan-200"
                >
                  (19) 3209-0417
                </a>
              </p>
            </div>

            <div
              className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border border-white/10 p-6 bg-white/5"
              data-reveal
            >
              <h3 className="font-semibold text-slate-100">Hortolândia/SP</h3>

              <p className="text-sm text-slate-300/90 mt-1">
                Rua Antônio Nelson Barbosa, 93 – Jardim do Bosque, CEP
                13186-231.
              </p>

              <p className="text-sm mt-2 inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />{" "}
                <a
                  href="tel:+551938454946"
                  className="hover:opacity-80 text-cyan-200"
                >
                  (19) 3845-4946
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — COMO O ESCRITÓRIO TRATA O TEMA */}

      <section id="faq" className="py-16 bg-[#0a0f14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Perguntas frequentes
          </h2>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Como priorizam as primeiras 24–48h?",
                a: "Nas primeiras horas validamos titularidade (contratos, perfis administrativos) e preservamos provas com data e hora. Em seguida abrimos chamados com a documentação mínima e orientamos ações emergenciais para manter vendas e comunicação ativa.",
              },
              {
                q: "Quando vão pela via judicial?",
                a: "Depois de esgotar as vias administrativas com protocolos registrados. Só recomendamos ação judicial quando há risco concreto às operações, provas alinhadas e viabilidade de tutela de urgência para restabelecer o acesso.",
              },
              {
                q: "Como evitam reincidência de bloqueios?",
                a: "Encerramos cada caso com plano preventivo: revisão de acessos e 2FA, inventário de integrações, adequação às políticas aplicáveis e rotinas de monitoramento para alertar inconsistências antes que virem suspensões.",
              },
              {
                q: "Quais documentos pedem inicialmente?",
                a: "Solicitamos comprovação jurídica (contrato social/estatuto, CNPJ), vínculos com as contas, notas fiscais recentes, prints das notificações e contatos dos responsáveis técnicos. Quanto mais organizado o pacote, mais rápido o protocolo é analisado.",
              },
              {
                q: "Atendem diferentes marketplaces?",
                a: "Sim. Estruturamos recursos específicos para Google, Mercado Livre, Amazon, Shopee e similares, ajustando linguagem, checklists e comprovações exigidas por cada plataforma sem perder consistência probatória.",
              },
              {
                q: "Como reportam o andamento?",
                a: "Combinamos um ritmo de atualização (geralmente duas vezes por semana) com status, protocolos, próximos passos e riscos. Demandas urgentes são sinalizadas fora de agenda por WhatsApp ou ligação antes do registro formal.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-xl border border-white/10 p-4 bg-white/5"
                data-reveal
              >
                <summary className="cursor-pointer font-medium text-slate-100">
                  {item.q}
                </summary>

                <p className="mt-2 text-sm text-slate-300/90">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTATO — com texto institucional reforçado + card do formulário com nova paleta */}

      <section id="contato" className="py-16 bg-[#0a0f14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Texto institucional para credibilidade */}

            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Conversa técnica sobre Recuperação de Contas
              </h2>

              <p className="mt-3 text-slate-300/90 max-w-2xl">
                O <strong>Marinho Mendes Sociedade de Advogados</strong> atua
                com enfoque técnico em plataformas digitais e operações
                comerciais online. Nosso trabalho integra{" "}
                <strong>recursos administrativos</strong>,{" "}
                <strong>preservação de provas</strong> e, quando cabível,
                <strong> medidas judiciais</strong>, sempre com{" "}
                <strong>sobriedade ética</strong> (CED/Provimento 205/2021) e
                comunicação objetiva de status.
              </p>

              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {[
                  "Equipe com prática em fluxos oficiais (Google/marketplaces).",

                  "Checklist de evidências e cadeia de custódia.",

                  "Governança de acessos (2FA, perfis, integrações).",

                  "Relatórios claros de prazos, protocolos e próximos passos.",
                ].map((it, i) => (
                  <li
                    key={i}
                    className="inline-flex items-start gap-2 text-sm text-slate-300/90"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />

                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              {/* Contatos diretos */}

              <ul className="mt-6 space-y-2 text-sm text-slate-300/90">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />

                  <a
                    className="hover:opacity-80 text-cyan-200"
                    href="mailto:adm@marinhomendes.adv.br"
                  >
                    adm@marinhomendes.adv.br
                  </a>
                </li>

                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />

                  <a
                    className="hover:opacity-80 text-cyan-200"
                    href="https://wa.me/5519974100605"
                  >
                    +55 (19) 97410-0605
                  </a>
                </li>
              </ul>

              {/* Espaço para imagem do escritório */}

              <figure className="mt-8 w-full aspect-[16/9] rounded-2xl border border-white/10 bg-white/5 ring-1 ring-white/10 overflow-hidden">
                <picture>
                  <img
                    src={contactImage}
                    alt="Foto do escritorio Marinho Mendes"
                    loading="lazy"
                    decoding="async"
                    width="1280"
                    height="720"
                    className="h-full w-full object-cover"
                  />
                </picture>
              </figure>
            </div>

            {/* Formulário — NOVO ESTILO + efeitos JS sutis */}

            <form
              ref={formRef}
              className="rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,35,44,0.9),rgba(6,19,24,0.92))] p-6 ring-1 ring-emerald-300/10 shadow-[0_0_0_1px_rgba(94,234,212,0.06)]"
              onSubmit={onSubmit}
            >
              {sent ? (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />

                  <div>
                    <p className="font-medium">Mensagem enviada.</p>

                    <p className="opacity-90">
                      Retornaremos no horário de atendimento (seg–sex, 8h–18h).
                      Conteúdo informativo, sem promessa de resultado.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium" htmlFor="nome">
                        Nome completo
                      </label>

                      <input
                        id="nome"
                        required
                        value={form.nome}
                        onChange={onChange}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Seu nome"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium" htmlFor="email">
                          E-mail
                        </label>

                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={onChange}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="voce@empresa.com"
                        />
                      </div>

                      <div>
                        <label
                          className="text-sm font-medium"
                          htmlFor="telefone"
                        >
                          Telefone/WhatsApp
                        </label>

                        <input
                          id="telefone"
                          required
                          value={form.telefone}
                          onChange={onChange}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="(19) 9xxxx-xxxx"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="text-sm font-medium"
                          htmlFor="plataforma"
                        >
                          Plataforma
                        </label>

                        <select
                          id="plataforma"
                          value={form.plataforma}
                          onChange={onChange}
                          required
                          className="mt-1 w-full rounded-xl border border-white/15 bg-[#10202b] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="" disabled>
                            Selecione a plataforma
                          </option>
                          {PLATFORM_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          className="text-sm font-medium"
                          htmlFor="bloqueio"
                        >
                          Natureza do bloqueio
                        </label>

                        <select
                          id="bloqueio"
                          value={form.bloqueio}
                          onChange={onChange}
                          required
                          className="mt-1 w-full rounded-xl border border-white/15 bg-[#10202b] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="" disabled>
                            Classifique o bloqueio
                          </option>
                          {BLOCK_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          className="text-sm font-medium"
                          htmlFor="mensagem"
                        >
                          Contexto do caso
                        </label>

                        <span className="text-xs text-slate-400">
                          {chars} caracteres
                        </span>
                      </div>

                      <textarea
                        id="mensagem"
                        ref={msgRef}
                        rows={5}
                        required
                        value={form.mensagem}
                        onChange={onChange}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Resuma notificações recebidas, IDs de conta/loja, datas e impacto nas operações."
                      />
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300/90">
                      <Info className="h-4 w-4 text-cyan-300" />

                      <p>
                        O envio não cria relação advogado–cliente nem garante
                        resultado. Não compartilhe dados sensíveis antes de
                        orientações específicas.
                      </p>
                    </div>

                    <label className="flex items-start gap-3 text-sm">
                      <input
                        id="consent"
                        type="checkbox"
                        required
                        checked={form.consent}
                        onChange={onChange}
                        className="mt-1"
                      />

                      <span>
                        Li e concordo com a{" "}
                        <a
                          className="underline-offset-4 hover:underline"
                          href="#"
                        >
                          Política de Privacidade
                        </a>{" "}
                        e autorizo o contato para fins de atendimento.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={[
                        "mt-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-medium text-[#0a0f14]",

                        "bg-gradient-to-r from-cyan-300 to-emerald-300",

                        submitting
                          ? "opacity-80 cursor-not-allowed"
                          : "hover:opacity-90",

                        "transition-transform active:scale-[0.99]",
                      ].join(" ")}
                    >
                      {submitting ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#0a0f14] border-t-transparent" />
                          Enviando…
                        </>
                      ) : (
                        <>
                          Enviar mensagem <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* CTA MOBILE FIXO */}

      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-[#0a0f14]/90 border-t border-white/10 backdrop-blur supports-[backdrop-filter]:bg-[#0a0f14]/70">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between gap-2">
          <button
            onClick={() =>
              (window.location.href = "https://wa.me/5519974100605")
            }
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[#0a0f14] bg-gradient-to-r from-cyan-300 to-emerald-300"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>

          <a
            href="tel:+551932090417"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border border-white/15 hover:bg-white/5 text-slate-100"
          >
            <Phone className="h-4 w-4" /> Ligar
          </a>
        </div>
      </div>

      {/* RODAPÉ */}

      <footer className="border-t border-white/10 bg-[#0a0f14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-6 gap-8 text-sm">
          <div className="md:col-span-3">
            <p className="font-semibold text-base flex items-center gap-2 text-slate-100">
              <MapPin className="h-4 w-4" /> Unidades
            </p>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                <p className="font-medium text-slate-100">Campinas/SP</p>

                <p className="text-slate-300/90 mt-1">
                  Av. José Rocha Bonfim, 214, Bloco J – Sala 228 – Ed. Milão,
                  Praça Capital, Loteamento Center Santa Genebra, CEP 13080-650.
                </p>

                <p className="mt-2 inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />{" "}
                  <a
                    href="tel:+551932090417"
                    className="hover:opacity-80 text-cyan-200"
                  >
                    (19) 3209-0417
                  </a>
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                <p className="font-medium text-slate-100">Hortolândia/SP</p>

                <p className="text-slate-300/90 mt-1">
                  Rua Antônio Nelson Barbosa, 93 – Jardim do Bosque, CEP
                  13186-231.
                </p>

                <p className="mt-2 inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />{" "}
                  <a
                    href="tel:+551938454946"
                    className="hover:opacity-80 text-cyan-200"
                  >
                    (19) 3845-4946
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="font-semibold text-slate-100">
              Marinho Mendes Sociedade de Advogados
            </p>

            <p className="mt-1 text-slate-300/90 max-w-lg">
              Conteúdo meramente informativo, sem promessa de resultado.
              Publicidade em conformidade com o Código de Ética e Disciplina da
              OAB e Provimento CFOAB nº 205/2021.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <a
                aria-label="Facebook"
                href="https://www.facebook.com/marinhomendesadv"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 hover:bg-white/5"
              >
                <Facebook className="h-4 w-4" />
              </a>

              <a
                aria-label="Instagram"
                href="https://www.instagram.com/marinhomendes.adv"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 hover:bg-white/5"
              >
                <Instagram className="h-4 w-4" />
              </a>

              <a
                aria-label="LinkedIn"
                href="https://www.linkedin.com/company/14030512/"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 hover:bg-white/5"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-1">
            <p className="font-semibold text-slate-100">Links</p>

            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="https://marinhomendes.adv.br/"
                  className="hover:opacity-80 text-cyan-200"
                >
                  Site
                </a>
              </li>

              <li>
                <a
                  href="https://marinhomendes.adv.br/blog"
                  className="hover:opacity-80 text-cyan-200"
                >
                  Blog
                </a>
              </li>

              <li>
                <a href="#" className="hover:opacity-80 text-cyan-200">
                  Política de Privacidade
                </a>
              </li>

              <li>
                <a href="#" className="hover:opacity-80 text-cyan-200">
                  Aviso de Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-xs text-slate-400">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p>
              © {year} Marinho Mendes Sociedade de Advogados. Atendimento:
              seg–sex, 8h–18h. Conteúdo informativo.
            </p>

            <p>
              Página otimizada para SEO/Performance (CWV) e ética
              (CED/Provimento 205/2021). Sem promessa de resultado.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
