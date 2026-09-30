"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";

const X_URL = "https://x.com/ifagrithm?s=11";
const LINKEDIN_URL = "https://www.linkedin.com/company/ifagrithm/";
const EMAIL = "Ifagrithm@gmail.com";

const services = [
  {
    title: "User & Behaviour Research",
    description: "Understand how people use your product, what different user groups do, and how activity changes over time.",
    outputs: ["Behaviour segments", "User journey analysis", "Retention and activity research"],
  },
  {
    title: "Market & Competitor Intelligence",
    description: "Investigate competing products, market activity and the alternatives your users already choose.",
    outputs: ["Competitor studies", "Market briefs", "Product comparisons"],
  },
  {
    title: "Growth & Distribution Research",
    description: "Investigate where relevant audiences already are and assess channels, communities and partnerships worth testing.",
    outputs: ["Audience research", "Distribution maps", "Partnership assessments"],
  },
  {
    title: "Decision Research & Measurement",
    description: "Combine evidence around a business question, then measure what happens when a team acts on it.",
    outputs: ["Decision briefs", "Intervention analysis", "Custom analytical studies"],
  },
];

const approach = [
  ["Define the decision", "Agree on the question, the scope and what the research needs to inform."],
  ["Investigate the evidence", "Use on-chain activity, market information and qualitative research as the question requires."],
  ["Deliver the findings", "Explain the patterns, limitations and practical options in a clear research brief."],
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Brand() {
  return <a className="brand" href="#top" aria-label="IFAGRITHM home"><span className="logo-wrap"><Image src="/ifagrithm-logo.png" alt="" width={36} height={36} priority /></span><span>IFAGRITHM</span></a>;
}

function ResearchMap() {
  return <figure className="research-map" aria-labelledby="map-caption">
    <figcaption id="map-caption"><span className="map-title">Illustrative research map</span><span className="map-label">CONCEPTUAL ILLUSTRATION</span></figcaption>
    <div className="map-canvas">
      <svg className="map-connections" viewBox="0 0 480 390" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d="M240 100v30H110v28M211 200h58M368 254v36H240v18" stroke="currentColor" strokeWidth="1.4" />
        <path d="m106 150 4 8 4-8M261 196l8 4-8 4M236 300l4 8 4-8" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <div className="map-node node-activity"><span className="node-index">01 / OBSERVE</span><strong>Product activity</strong><span className="node-detail">How people use a product</span></div>
      <span className="mobile-connector" aria-hidden="true">↓</span>
      <div className="map-node node-segments"><span className="node-index">02 / UNDERSTAND</span><strong>User segments</strong></div>
      <span className="mobile-connector" aria-hidden="true">↓</span>
      <div className="map-node node-related"><span className="node-index">03 / INVESTIGATE</span><strong>Related products<br />and channels</strong></div>
      <span className="mobile-connector" aria-hidden="true">↓</span>
      <div className="map-node node-hypotheses"><span className="node-index">04 / EXPLORE</span><strong>Acquisition hypotheses</strong><span className="node-detail">Routes worth testing</span></div>
    </div>
  </figure>;
}

export default function Site() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menu, setMenu] = useState(false);
  const [status, setStatus] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const [brief, setBrief] = useState({ name: "", email: "", company: "", question: "" });
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenu(false); menuButton.current?.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menu]);

  function briefText() {
    return `IFAGRITHM PROJECT BRIEF\n\nName: ${brief.name.trim()}\nWork email: ${brief.email.trim()}\nCompany: ${brief.company.trim() || "Not provided"}\n\nWhat would you like us to investigate?\n${brief.question.trim()}`;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!brief.name.trim() || !brief.email.trim() || !brief.question.trim()) {
      setStatus("Please complete your name, work email and research question.");
      return;
    }
    const subject = `IFAGRITHM project brief${brief.company.trim() ? ` — ${brief.company.trim()}` : ""}`;
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefText())}`;
    setStatus("Review and send your brief in your email app. If it does not open, use Copy brief or the email link.");
    window.location.assign(mailto);
  }

  async function copyBrief() {
    const text = briefText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyFallback("");
      setStatus("Brief copied. Paste it into an email when you are ready.");
    } catch {
      setCopyFallback(text);
      setStatus("Automatic copying is unavailable. Select and copy your brief below, then email it to us.");
    }
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header" id="top">
      <div className="shell header-inner">
        <Brand />
        <nav id="primary-navigation" aria-label="Main navigation" className={`nav-links${menu ? " is-open" : ""}`}>
          <a href="#services" onClick={() => setMenu(false)}>Services</a>
          <a href="#approach" onClick={() => setMenu(false)}>Approach</a>
          <a className="nav-cta" href="#contact" onClick={() => setMenu(false)}>Discuss a project <Arrow diagonal /></a>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" type="button" onClick={() => setTheme(current => current === "light" ? "dark" : "light")} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
            {theme === "light" ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 14.2A8.5 8.5 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z" stroke="currentColor" strokeWidth="1.5" /></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" stroke="currentColor" strokeWidth="1.5" /></svg>}
          </button>
          <button ref={menuButton} className="icon-button menu-button" type="button" onClick={() => setMenu(current => !current)} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="primary-navigation"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={menu ? "m6 6 12 12M6 18 18 6" : "M4 8h16M4 16h16"} stroke="currentColor" strokeWidth="1.5" /></svg></button>
        </div>
      </div>
    </header>

    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="accent-mark" aria-hidden="true" />WEB3 RESEARCH &amp; INTELLIGENCE</p>
            <h1 id="hero-title">Understand your users.<br /><span>Find where growth can come from.</span></h1>
            <p className="hero-body">IFAGRITHM helps Web3 teams understand what their users do, identify meaningful behavioural segments, and investigate where similar users already are.</p>
            <p className="hero-secondary">User behaviour, market research and competitor intelligence for clearer business decisions.</p>
            <a className="primary" href="#contact">Discuss a project <Arrow diagonal /></a>
          </div>
          <ResearchMap />
        </div>
      </section>

      <section className="services section" id="services" aria-labelledby="services-title">
        <div className="shell">
          <div className="section-heading"><p className="eyebrow">WHAT WE DO</p><h2 id="services-title">Research built around<br />your next decision.</h2></div>
          <div className="service-grid">{services.map((service, index) => <article className="service" key={service.title}>
            <span className="service-number">0{index + 1}</span>
            <div className="service-content"><h3>{service.title}</h3><p>{service.description}</p><div className="service-outputs"><span>Typical outputs</span><ul>{service.outputs.map(output => <li key={output}>{output}</li>)}</ul></div></div>
          </article>)}</div>
        </div>
      </section>

      <section className="approach section" id="approach" aria-labelledby="approach-title">
        <span id="method" className="anchor-alias" aria-hidden="true" /><span id="about" className="anchor-alias" aria-hidden="true" />
        <div className="shell">
          <div className="approach-heading"><p className="eyebrow">HOW WE WORK</p><h2 id="approach-title">A clear question. Evidence you can inspect. A useful next step.</h2></div>
          <ol className="approach-steps">{approach.map(([title, description], index) => <li key={title}><span className="step-index">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
        </div>
      </section>

      <section className="contact section" id="contact" aria-labelledby="contact-title">
        <div className="shell contact-grid">
          <div className="contact-copy"><p className="eyebrow">START A PROJECT</p><h2 id="contact-title">What are you trying to understand?</h2><p>Tell us about your product and the decision you are working through.</p><a className="email-link" href={`mailto:${EMAIL}`}>{EMAIL} <Arrow diagonal /></a><div className="social-links"><a href={X_URL} target="_blank" rel="noopener noreferrer">X / @ifagrithm <Arrow diagonal /></a><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn <Arrow diagonal /></a></div></div>
          <form className="brief-form" onSubmit={submit}>
            <div className="form-row"><label htmlFor="brief-name">Name <span aria-hidden="true">*</span><input id="brief-name" name="name" required autoComplete="name" maxLength={200} value={brief.name} onChange={event => setBrief({ ...brief, name: event.target.value })} /></label><label htmlFor="brief-email">Work email <span aria-hidden="true">*</span><input id="brief-email" name="email" required type="email" autoComplete="email" maxLength={254} value={brief.email} onChange={event => setBrief({ ...brief, email: event.target.value })} /></label></div>
            <label htmlFor="brief-company">Company <span className="optional">(optional)</span><input id="brief-company" name="company" autoComplete="organization" maxLength={200} value={brief.company} onChange={event => setBrief({ ...brief, company: event.target.value })} /></label>
            <label htmlFor="brief-question">What would you like us to investigate? <span aria-hidden="true">*</span><textarea id="brief-question" name="question" required maxLength={4000} rows={5} value={brief.question} onChange={event => setBrief({ ...brief, question: event.target.value })} /></label>
            <div className="form-actions"><button className="primary" type="submit">Open email with your brief <Arrow diagonal /></button><button className="text-button" type="button" onClick={copyBrief}>Copy brief <Arrow /></button></div>
            <p className="form-helper">Opens your email app. Review and send your message there.</p>
            <p className="form-status" role="status">{status}</p>
            {copyFallback && <label className="copy-fallback" htmlFor="copy-fallback">Your brief to copy<textarea id="copy-fallback" readOnly value={copyFallback} rows={8} onFocus={event => event.currentTarget.select()} /></label>}
          </form>
        </div>
      </section>
    </main>

    <footer className="site-footer"><div className="shell footer-inner"><div><Brand /><p>Web3 research. Clearer decisions.</p></div><nav aria-label="Footer navigation"><a href="#services">Services</a><a href="#contact">Contact</a><a href={X_URL} target="_blank" rel="noopener noreferrer">X <Arrow diagonal /></a><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn <Arrow diagonal /></a></nav><small>© {new Date().getFullYear()} IFAGRITHM</small></div></footer>
  </>;
}
