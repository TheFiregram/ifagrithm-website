"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { Arrow, BrandMark } from "./Brand";
import { useTheme } from "./ThemeProvider";
import "./application.css";

const EMAIL = "Ifagrithm@gmail.com";
const ROLES = [
  { id: "scout", title: "Research Scout", line: "Spot communities, apps and behaviour shifts worth investigating." },
  { id: "partnership", title: "Partnership", line: "Bring IFAGRITHM in as a research partner for your team or project." },
  { id: "analyst", title: "Research Analyst", line: "Turn onchain evidence and structured investigations into findings." },
] as const;
const DESKS = ["Consumer apps", "DeFi", "RWA", "Infrastructure", "Market intel"];
const NEXT_STEPS = [
  { title: "Apply", text: "Tell us about yourself and your work." },
  { title: "We review", text: "We read every application." },
  { title: "Hear from us", text: "If it is a fit, you receive an approval email." },
  { title: "Get your card", text: "Add your photo and download your member card." },
];

type Application = {
  fullName: string; x: string; telegram: string; email: string; country: string;
  role: string; desks: string[]; links: string; context: string; why: string;
};
type TextField = Exclude<keyof Application, "role" | "desks">;
type TextQuestion = {
  kind: "text" | "email" | "textarea"; field: TextField; id: string; label: string;
  title: string; description: string; placeholder: string; maxLength: number;
  autoComplete?: string; optional?: boolean;
};
type ChoiceQuestion = { label: string; title: string; description: string };
type Question = TextQuestion
  | (ChoiceQuestion & { kind: "role"; field: "role" })
  | (ChoiceQuestion & { kind: "desks"; field: "desks" });
const QUESTIONS: Question[] = [
  { kind: "text", field: "fullName", id: "ap-name", label: "Full name", title: "First, what is your name?", description: "Tell us what you would like us to call you.", placeholder: "Your full name", autoComplete: "name", maxLength: 120 },
  { kind: "email", field: "email", id: "ap-email", label: "Email", title: "What is your email address?", description: "We will use this to contact you about your application.", placeholder: "you@example.com", autoComplete: "email", maxLength: 254 },
  { kind: "text", field: "x", id: "ap-x", label: "X handle", title: "Where can we find you on X?", description: "Share your X handle so we can see your work and interests.", placeholder: "@handle", maxLength: 16 },
  { kind: "text", field: "telegram", id: "ap-telegram", label: "Telegram", title: "What is your Telegram handle?", description: "A way to reach you for research conversations.", placeholder: "@handle", maxLength: 32 },
  { kind: "text", field: "country", id: "ap-country", label: "Country", title: "Where are you based?", description: "Your country helps us place your market context.", placeholder: "Your country", autoComplete: "country-name", maxLength: 80 },
  { kind: "role", field: "role", label: "Role", title: "How would you like to contribute?", description: "Choose the role that fits the work you want to do." },
  { kind: "desks", field: "desks", label: "Research desks", title: "Which research desks interest you?", description: "Choose one or more. You do not have to pick just one." },
  { kind: "textarea", field: "links", id: "ap-links", label: "Proof of work", title: "Show us something you have worked on.", description: "Research, X threads, dashboards, GitHub, articles or a project. Add one link per line.", placeholder: "Paste links to your work here…", maxLength: 4000 },
  { kind: "textarea", field: "context", id: "ap-context", label: "Extra context", title: "Anything we should know about that work?", description: "Add context about your role, the question you explored or what you learned. You can skip this.", placeholder: "A little context, if you would like…", maxLength: 2000, optional: true },
  { kind: "textarea", field: "why", id: "ap-why", label: "Why you", title: "What makes you a fit for IFAGRITHM?", description: "Tell us what you bring and what you want to investigate. A couple of sentences is a good start.", placeholder: "I would like to join the network to…", maxLength: 4000 },
];
const EMPTY: Application = { fullName: "", x: "", telegram: "", email: "", country: "", role: "", desks: [], links: "", context: "", why: "" };

function roleLabel(role: string) {
  return ROLES.find(item => item.id === role)?.title ?? "";
}

function validate(question: Question, form: Application): string | null {
  if (question.field === "role") return form.role ? null : "Choose a role to continue.";
  if (question.field === "desks") return form.desks.length ? null : "Choose at least one research desk.";
  const value = form[question.field].trim();
  if ("optional" in question && question.optional) return null;
  if (!value) return `Please add your ${question.label.toLowerCase()} to continue.`;
  if (question.field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address, such as you@example.com.";
  if (question.field === "why" && value.length < 40) return "Write at least 40 characters so we can learn a little more about you.";
  return null;
}

export default function ApplicationForm() {
  const [form, setForm] = useState<Application>(EMPTY);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copyFallback, setCopyFallback] = useState("");
  const { theme, toggleTheme } = useTheme();
  const stageRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const editingSnapshot = useRef<Application | null>(null);
  const review = step === QUESTIONS.length;
  const question = QUESTIONS[step];
  const progress = Math.round(step / QUESTIONS.length * 100);

  useEffect(() => {
    const viewport = window.visualViewport;
    const stage = stageRef.current;
    if (!stage) return;
    let frame = 0;
    let settle = 0;

    function keepAnswerVisible() {
      frame = 0;
      if (!stage) return;
      const active = document.activeElement;
      const typing = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
      const height = viewport?.height ?? window.innerHeight;
      const top = viewport?.offsetTop ?? 0;
      const inset = Math.max(0, window.innerHeight - height - top);
      const keyboard = typing && stage.contains(active) && inset > 120 && (viewport?.scale ?? 1) === 1;
      stage.style.setProperty("--keyboard-inset", keyboard ? `${inset}px` : "0px");
      stage.style.setProperty("--answer-viewport-height", `${height}px`);
      stage.toggleAttribute("data-keyboard-open", keyboard);
      if (!typing || !stage.contains(active)) return;

      const bounds = active.getBoundingClientRect();
      const headerBottom = document.querySelector(".apply-header")?.getBoundingClientRect().bottom ?? 0;
      const visibleTop = Math.max(top + 16, headerBottom + 16);
      const visibleBottom = top + height - 24;
      const delta = bounds.bottom > visibleBottom
        ? Math.min(bounds.bottom - visibleBottom, bounds.top - visibleTop)
        : bounds.top < visibleTop ? bounds.top - visibleTop : 0;
      if (Math.abs(delta) > 2) window.scrollBy({ top: delta, behavior: "instant" });
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(keepAnswerVisible);
    }
    function onFocus() {
      schedule();
      window.clearTimeout(settle);
      settle = window.setTimeout(schedule, 400);
    }
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", schedule);
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", schedule);
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      stage.style.removeProperty("--keyboard-inset");
      stage.style.removeProperty("--answer-viewport-height");
      stage.removeAttribute("data-keyboard-open");
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    stageRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    const target = panelRef.current?.querySelector<HTMLElement>("[data-answer-focus]") ?? panelRef.current?.querySelector<HTMLElement>("h1");
    target?.focus({ preventScroll: true });
  }, [step, started, submitted]);

  const set = <K extends keyof Application>(key: K, value: Application[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    setError("");
    setNotice("");
  };

  function moveTo(next: number) {
    setDirection(next < step ? "back" : "forward");
    setStep(next);
    setError("");
    setNotice("");
    setCopyFallback("");
  }

  function start() {
    setStarted(true);
    stageRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  function advance() {
    const message = validate(question, form);
    if (message) { setError(message); return; }
    moveTo(editing ? QUESTIONS.length : step + 1);
    setEditing(false);
    editingSnapshot.current = null;
  }

  function editAnswer(index: number) {
    editingSnapshot.current = form;
    setEditing(true);
    moveTo(index);
  }

  function goBack() {
    if (editing) {
      if (editingSnapshot.current) setForm(editingSnapshot.current);
      editingSnapshot.current = null;
      setEditing(false);
      moveTo(QUESTIONS.length);
    } else moveTo(step - 1);
  }

  function firstMissing() {
    const missing = QUESTIONS.findIndex(item => validate(item, form));
    if (missing === -1) return false;
    moveTo(missing);
    setError(validate(QUESTIONS[missing], form) ?? "");
    return true;
  }

  function applicationText() {
    return [
      "IFAGRITHM RESEARCH NETWORK APPLICATION", "",
      `Name: ${form.fullName.trim()}`, `X: ${form.x.trim()}`, `Telegram: ${form.telegram.trim()}`,
      `Email: ${form.email.trim()}`, `Country: ${form.country.trim()}`, `Role: ${roleLabel(form.role)}`,
      `Desks: ${form.desks.join(", ")}`, "", "Proof of work:", form.links.trim(), "",
      `Context: ${form.context.trim() || "None added"}`, "", "Why IFAGRITHM:", form.why.trim(),
    ].join("\n");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || submitted) return;
    if (!review) { advance(); return; }
    if (firstMissing()) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/apply", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName.trim(), x_handle: form.x.trim(), telegram: form.telegram.trim(),
          email: form.email.trim(), country: form.country.trim(), role: form.role, desks: form.desks,
          links: form.links.trim(), context: form.context.trim(), why: form.why.trim(),
        }),
      });
      if (response.status === 201) { setSubmitted(true); return; }
      const data = await response.json().catch(() => null);
      setError(response.status >= 500
        ? `We could not receive your application just now. Your answers are still here. Copy them and email ${EMAIL}, or try again.`
        : typeof data?.error === "string" ? data.error : "Check your details and try again.");
    } catch {
      setError(`The connection failed. Your answers are still here. Try again, or copy them and email ${EMAIL}.`);
    } finally { setSending(false); }
  }

  async function copyApplication() {
    if (firstMissing()) return;
    const text = applicationText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyFallback("");
      setNotice(`Application copied. Paste it into an email to ${EMAIL}.`);
    } catch {
      setCopyFallback(text);
      setNotice("Select and copy your application below, then email it to us.");
    }
  }

  function handleKeys(event: KeyboardEvent<HTMLFormElement>) {
    if (sending || submitted || event.nativeEvent.isComposing) return;
    const target = event.target as HTMLElement;
    const textEntry = target.matches("textarea,input:not([type=radio]):not([type=checkbox])");
    if (event.key === "Enter" && !target.closest("button,a")) {
      if (target.tagName === "TEXTAREA" && !event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      event.currentTarget.requestSubmit();
      return;
    }
    if (review || textEntry || event.ctrlKey || event.metaKey || event.altKey) return;
    const index = event.key.toUpperCase().charCodeAt(0) - 65;
    if (event.key.length !== 1 || index < 0) return;
    if (question.kind === "role" && index < ROLES.length) {
      event.preventDefault(); set("role", ROLES[index].id);
    } else if (question.kind === "desks" && index < DESKS.length) {
      event.preventDefault(); toggleDesk(DESKS[index]);
    }
  }

  function toggleDesk(desk: string) {
    set("desks", form.desks.includes(desk) ? form.desks.filter(item => item !== desk) : [...form.desks, desk]);
  }

  function answerText(item: Question) {
    if (item.field === "role") return roleLabel(form.role);
    if (item.field === "desks") return form.desks.join(", ");
    return form[item.field].trim() || "Not added";
  }

  return <div className={`apply${started ? " has-started" : ""}`}>
    <a className="skip-link" href="#apply-main">Skip to content</a>
    <header className="apply-header"><div className="shell apply-header-inner">
      <Link className="apply-back" href="/" aria-label="Back to IFAGRITHM"><BrandMark priority/><span>IFAGRITHM</span></Link>
      <div className="apply-header-actions"><span className="apply-tag">RESEARCH NETWORK</span><button className="theme-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M12 5a7 7 0 0 1 0 14Z" fill="currentColor"/></svg></button></div>
    </div></header>

    <main id="apply-main">
      <section className="apply-next shell" aria-labelledby="apply-next-title">
        <div className="apply-next-heading"><h2 id="apply-next-title">What happens next</h2><span>From application to member card</span></div>
        <ol className="apply-steps">{NEXT_STEPS.map((item, index) => <li key={item.title}><span className="apply-step-number">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol>
      </section>

      <section className="apply-stage shell" ref={stageRef} aria-label="Network application">
        {!started ? <div className="apply-welcome">
          <div className="apply-welcome-copy"><p className="eyebrow">JOIN THE NETWORK</p><h1>From curiosity<br/>to evidence.<br/><span>With us.</span></h1><p className="apply-intro">Join the people turning Web3 behaviour into research. Tell us about yourself, your work, and the questions you want to investigate.</p><div className="apply-start-actions"><button type="button" className="button demo-cta" onClick={start}>Start application <Arrow/></button><span>5 to 10 minutes · 10 questions</span></div><p className="apply-welcome-note">Research Scouts, Analysts and Partners.</p></div>
          <div className="apply-welcome-art" aria-hidden="true"><div className="apply-art-orbit"/><BrandMark/><span>FROM BEHAVIOUR<br/>TO DECISIONS</span></div>
        </div> : submitted ? <div className="apply-success" ref={panelRef}>
          <span className="apply-success-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="m8 16 5 5 11-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><p className="eyebrow">THANK YOU FOR APPLYING</p><h1 tabIndex={-1}>Application received.</h1><p>Your application is saved for review. Approved applicants receive an email with a link to their member card.</p><Link className="button demo-cta" href="/">Back to the site <Arrow/></Link>
        </div> : <form className="apply-form" onSubmit={submit} onKeyDown={handleKeys} noValidate aria-labelledby="apply-question-title">
          <div className="apply-progress-heading"><span>{review ? "READY FOR REVIEW" : "YOUR APPLICATION"}</span><span>{review ? "All questions complete" : `Question ${step + 1} of ${QUESTIONS.length}`}</span></div>
          <div className="apply-progress" role="progressbar" aria-label="Application progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }}/></div>
          <div key={step} className={`apply-panel question-${direction}`} ref={panelRef}>
            {review ? <>
              <p className="eyebrow">ONE LAST LOOK</p><h1 className="apply-question-title" id="apply-question-title" tabIndex={-1}>Ready to send, {form.fullName.trim().split(/\s+/)[0]}?</h1><p className="apply-question-description">Review your answers. You can edit any of them before sending.</p>
              <dl className="apply-review">{QUESTIONS.map((item, index) => <div key={item.field}><div className="apply-review-answer"><dt>{item.label}</dt><dd>{answerText(item)}</dd></div><button className="apply-edit" type="button" disabled={sending} aria-label={`Edit ${item.label.toLowerCase()}`} onClick={() => editAnswer(index)}>Edit <Arrow/></button></div>)}</dl>
            </> : <>
              <div className="apply-question-heading"><span className="apply-question-number" aria-hidden="true">{String(step + 1).padStart(2, "0")} <Arrow/></span><h1 className="apply-question-title" id="apply-question-title" tabIndex={-1}>{question.title}</h1></div>
              <p className="apply-question-description" id="apply-question-description">{question.description}</p>
              {(question.kind === "role" || question.kind === "desks") ? <fieldset className={`apply-choices ${question.kind === "desks" ? "apply-desk-choices" : ""}`} aria-describedby={`apply-question-description${error ? " apply-error" : ""}`}><legend className="apply-sr-only">{question.label}</legend>
                {question.kind === "role" ? ROLES.map((role, index) => <label className={`apply-choice${form.role === role.id ? " is-selected" : ""}`} key={role.id}><input type="radio" name="role" value={role.id} checked={form.role === role.id} onChange={() => set("role", role.id)} required/><span className="apply-choice-key" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span className="apply-choice-text"><strong>{role.title}</strong><span>{role.line}</span></span><span className="apply-choice-check" aria-hidden="true">{form.role === role.id ? "✓" : ""}</span></label>) : DESKS.map((desk, index) => <label className={`apply-choice${form.desks.includes(desk) ? " is-selected" : ""}`} key={desk}><input type="checkbox" name="desks" value={desk} checked={form.desks.includes(desk)} onChange={() => toggleDesk(desk)}/><span className="apply-choice-key" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span className="apply-choice-text"><strong>{desk}</strong></span><span className="apply-choice-check" aria-hidden="true">{form.desks.includes(desk) ? "✓" : ""}</span></label>)}
              </fieldset> : <div className="apply-answer">
                <label className="apply-sr-only" htmlFor={question.id}>{question.label}</label>
                {question.kind === "textarea" ? <textarea id={question.id} name={question.field} data-answer-focus rows={4} required={!question.optional} maxLength={question.maxLength} value={form[question.field]} placeholder={question.placeholder} onChange={event => set(question.field, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={`apply-question-description apply-answer-hint${error ? " apply-error" : ""}`}/> : <input id={question.id} name={question.field} data-answer-focus type={question.kind === "email" ? "email" : "text"} inputMode={question.kind === "email" ? "email" : "text"} autoComplete={question.autoComplete ?? "off"} autoCapitalize={question.kind === "email" || question.field === "x" || question.field === "telegram" ? "none" : "words"} spellCheck={question.field === "fullName" || question.field === "country"} required maxLength={question.maxLength} value={form[question.field]} placeholder={question.placeholder} onChange={event => set(question.field, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={`apply-question-description${error ? " apply-error" : ""}`}/>}
                {question.kind === "textarea" ? <p className="apply-answer-hint" id="apply-answer-hint">{question.field === "why" ? `${form.why.trim().length} characters · minimum 40` : question.optional ? "Optional. Skip if you have nothing to add." : "One link per line."}</p> : null}
              </div>}
            </>}
            <p id="apply-error" className="apply-error" role="alert">{error}</p>
            <div className="apply-actions"><button className="button demo-cta" type="submit" disabled={sending}>{sending ? "Sending…" : review ? "Submit application" : editing ? "Save answer" : "optional" in question && question.optional && !form.context.trim() ? "Skip" : step === QUESTIONS.length - 1 ? "Review application" : "Continue"} <Arrow/></button><span className="apply-keyboard-hint">{review ? "" : question.kind === "textarea" ? <>press <kbd>Ctrl / ⌘ + Enter</kbd></> : <>press <kbd>Enter ↵</kbd></>}</span>{step > 0 || editing ? <button className="apply-previous" type="button" onClick={goBack} disabled={sending}><Arrow/> {editing ? "Back to review" : "Back"}</button> : null}</div>
            {review ? <div className="apply-review-footer"><p>Your application goes to our research network review inbox.</p><button className="apply-copy" type="button" onClick={copyApplication} disabled={sending}>Copy application <Arrow/></button><p className="apply-notice" role="status">{notice}</p>{copyFallback ? <label className="apply-fallback" htmlFor="ap-fallback">Your application to copy<textarea id="ap-fallback" readOnly value={copyFallback} rows={10} onFocus={event => event.currentTarget.select()}/></label> : null}</div> : null}
          </div>
        </form>}
      </section>
    </main>

    <footer className="apply-footer"><div className="shell apply-footer-inner"><small>© {new Date().getFullYear()} IFAGRITHM</small><Link href="/">Back to the site <Arrow/></Link></div></footer>
  </div>;
}
