"use client";

// IFAGRITHM Network Card Studio.
// An approved member arrives via their claim link (/network?t=...) and the
// card comes pre-filled from their application — name, role, desk, clearance
// tier and their X profile photo. They can still fetch a different X photo,
// and everything exports client-side as a 1080x1350 PNG. Serial numbers
// live only in the admin console, never on the card.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { BrandMark } from "./Brand";
import { useTheme } from "./ThemeProvider";
import "./network.css";
import "./network-studio.css";

const ROLES = ["RESEARCH SCOUT", "PARTNERSHIP", "RESEARCH ANALYST"] as const;
const TIERS = ["BRONZE", "SILVER", "GOLD"] as const;
const DESK_LABELS = ["CONSUMER APPS", "DEFI", "RWA", "INFRASTRUCTURE", "MARKET INTEL"] as const;

type Role = (typeof ROLES)[number];
type Tier = (typeof TIERS)[number];
type Desk = "CONSUMER APPS" | "DEFI" | "RWA" | "INFRASTRUCTURE" | "MARKET INTEL";

type CardData = {
  name: string;
  role: Role;
  tier: Tier;
  desk: Desk;
  tagline: string;
  bio: string;
};

const SAMPLE: CardData = {
  name: "Tariq A.",
  role: "RESEARCH SCOUT",
  tier: "BRONZE",
  desk: "DEFI",
  tagline: "Mapping liquidity flows across African markets",
  bio: "Traces wallet cohorts and liquidity migration across L2s, turning raw onchain noise into signal.",
};

// Examples belong in placeholders and the preview, never in visitor input.
const EMPTY_CARD: CardData = { ...SAMPLE, name: "", tagline: "", bio: "" };

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IF";
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function readFileAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function StudioIcon({ name }: { name: "arrow" | "download" | "check" | "lock" | "edit" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "arrow" ? <path d="M5 12h14m-6-6 6 6-6 6" /> : null}
    {name === "download" ? <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M4 16v4h16v-4" /></> : null}
    {name === "check" ? <path d="m5 12 4 4 10-10" /> : null}
    {name === "lock" ? <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></> : null}
    {name === "edit" ? <><path d="m15 4 5 5M4 20l5-1L20 8a2.1 2.1 0 0 0-4-4L5 15l-1 5Z" /><path d="M13 20h7" /></> : null}
  </svg>;
}

function displayLabel(value: string): string {
  if (value === "DEFI") return "DeFi";
  if (value === "RWA") return value;
  return value.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}

export default function CardStudio() {
  const { theme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const claimToken = searchParams.get("t");
  const [data, setData] = useState<CardData>(EMPTY_CARD);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [claim, setClaim] = useState<{ name: string; serial: string; token: string } | null>(null);
  const [claimState, setClaimState] = useState<"idle" | "loading" | "ok" | "invalid" | "unavailable">("idle");
  const [claimRetry, setClaimRetry] = useState(0);
  const verified = claimState === "ok" && claim?.token === claimToken;
  const preview = verified ? data : {
    ...data,
    name: data.name || SAMPLE.name,
    tagline: data.tagline || SAMPLE.tagline,
    bio: data.bio || SAMPLE.bio,
  };
  const [xHandle, setXHandle] = useState("");
  const [xStatus, setXStatus] = useState<"idle" | "loading" | "miss" | "error">("idle");
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [fontsTick, setFontsTick] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const avatarAbort = useRef<AbortController | null>(null);

  const set = <K extends keyof CardData>(key: K, value: CardData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  // boot animation once mounted (direct set — rAF can be throttled to
  // oblivion in background/headless tabs and the entrance would never run)
  useEffect(() => {
    setLive(true);
  }, []);

  // webfonts land after first paint — re-fit once they do
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => { if (alive) setFontsTick((t) => t + 1); });
    return () => { alive = false; };
  }, []);

  const fetchAvatar = useCallback(async (handle: string) => {
    avatarAbort.current?.abort();
    const clean = handle.trim().replace(/^@/, "");
    if (!/^[A-Za-z0-9_]{1,15}$/.test(clean)) {
      setXStatus("error");
      return false;
    }
    setXStatus("loading");
    const controller = new AbortController();
    avatarAbort.current = controller;
    try {
      const res = await fetch(`/api/avatar?handle=${encodeURIComponent(clean)}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
      if (!res.ok) throw new Error(res.status === 404 ? "miss" : "error");
      const image = await readFileAsDataURL(await res.blob());
      if (controller.signal.aborted) return false;
      setAvatar(image);
      setXStatus("idle");
      return true;
    } catch (err) {
      if (controller.signal.aborted) return false;
      setXStatus(err instanceof Error && err.message === "miss" ? "miss" : "error");
      return false;
    }
  }, []);
  useEffect(() => () => { avatarAbort.current?.abort(); }, []);

  // an approved member arrives via a claim link: /network?t=<token>
  useEffect(() => {
    avatarAbort.current?.abort();
    setClaim(null); setAvatar(null); setData(EMPTY_CARD); setXHandle(""); setXStatus("idle");
    setClaimState(claimToken ? "loading" : "idle");
    if (!/^[a-f0-9]{48}$/.test(claimToken ?? "")) {
      if (claimToken) setClaimState("invalid");
      return;
    }
    let alive = true;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/claim?t=${claimToken}`, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]) });
        if (!res.ok) {
          if (alive) setClaimState(res.status === 400 || res.status === 404 ? "invalid" : "unavailable");
          return;
        }
        const info = await res.json();
        if (!alive) return;
        const desk = DESK_LABELS.find(d => d === String(info.desk ?? "").toUpperCase());
        const tier = TIERS.find(t => t === String(info.tier ?? "").toUpperCase());
        if (typeof info.name !== "string" || typeof info.serial !== "string" || !desk || !tier || !(ROLES as readonly string[]).includes(info.role)) throw new Error("Invalid claim response.");
        setData(d => ({
          ...d,
          name: info.name || d.name,
          role: (ROLES as readonly string[]).includes(info.role) ? info.role as Role : d.role,
          desk: desk ?? d.desk,
          tier: tier ?? d.tier,
          tagline: "", bio: "",
        }));
        setXHandle(info.x_handle ?? "");
        setAvatar(null); // their card, their photo — fetched next line
        setClaim({ name: info.name, serial: info.serial, token: claimToken! });
        setClaimState("ok");
        if (info.x_handle) void fetchAvatar(String(info.x_handle));
      } catch {
        if (alive) setClaimState("unavailable");
      }
    })();
    return () => { alive = false; controller.abort(); avatarAbort.current?.abort(); };
  }, [claimToken, claimRetry, fetchAvatar]);

  // long names/taglines shrink to fit the card instead of overflowing
  useLayoutEffect(() => {
    const fit = (el: HTMLElement | null, maxWidth: number, start: number, min: number) => {
      if (!el) return;
      el.style.fontSize = `${start}px`;
      let size = start;
      while (size > min && el.scrollWidth > maxWidth) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }
    };
    fit(nameRef.current, 860, 118, 62);
    fit(taglineRef.current, 800, 26, 17);
  }, [preview.name, preview.tagline, fontsTick]);

  // scale the fixed 1080x1350 canvas into whatever space the shell has
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const ro = new ResizeObserver(() => {
      const scale = shell.clientWidth / 1080;
      shell.style.setProperty("--card-scale", String(scale));
    });
    ro.observe(shell);
    return () => ro.disconnect();
  }, []);

  // subtle tilt while hovering the preview (desktop, motion-safe only)
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (event: PointerEvent) => {
      const rect = shell.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      shell.style.setProperty("--tx", `${(-py * 3).toFixed(2)}deg`);
      shell.style.setProperty("--ty", `${(px * 3).toFixed(2)}deg`);
    };
    const onLeave = () => {
      shell.style.setProperty("--tx", "0deg");
      shell.style.setProperty("--ty", "0deg");
    };
    shell.addEventListener("pointermove", onMove);
    shell.addEventListener("pointerleave", onLeave);
    return () => {
      shell.removeEventListener("pointermove", onMove);
      shell.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const download = useCallback(async () => {
    const node = cardRef.current;
    if (!node || exporting || !verified) return;
    setExporting(true);
    setExportNote(null);
    node.classList.add("is-export");
    const options = {
      width: 1080,
      height: 1350,
      pixelRatio: 1,
      backgroundColor: "#060607",
      // the preview scales the card into its shell via transform on the
      // node itself — the clone must render at natural size
      style: { transform: "none", transformOrigin: "top left" as const },
    };
    try {
      await document.fonts.ready;
      // render twice: the first pass primes image/font inlining, which
      // Safari and some mobile browsers otherwise miss (blank exports)
      await toPng(node, options);
      const url = await toPng(node, options);
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `IFAGRITHM-${data.name.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-").slice(0, 80) || "card"}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data: { files?: File[] }) => boolean };
      // iOS Safari ignores the download attribute — hand it to the share
      // sheet (Save Image), falling back to opening it in a new tab
      let shared = false;
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        try { await nav.share({ files: [file], title: "IFAGRITHM network card" }); shared = true; }
        catch (error) { if (error instanceof DOMException && error.name === "AbortError") throw error; }
      }
      if (!shared) {
        const link = document.createElement("a");
        link.download = file.name;
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
      }
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      if (!aborted) setExportNote("Export failed — try again.");
    } finally {
      node.classList.remove("is-export");
      setExporting(false);
    }
  }, [data.name, exporting, verified]);

  const xNote =
    xStatus === "loading" ? "Loading your photo…" :
    xStatus === "miss" ? "No profile photo found. You can keep your initials." :
    xStatus === "error" ? "Could not load this photo. Check the handle and try again." : null;

  return (
    <div className="ifg-studio">
      <header className="ifg-head">
        <div className="studio-header-inner">
          <Link className="studio-brand" href="/" aria-label="IFAGRITHM home"><BrandMark /><span>IFAGRITHM</span></Link>
          <span className="studio-header-label">Card Studio</span>
          <div className="studio-header-actions">
            <Link className="ifg-back" href="/"><StudioIcon name="arrow" /><span>Back to site</span></Link>
            <button className="studio-theme-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-pressed={theme === "dark"} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M12 5a7 7 0 0 1 0 14Z" fill="currentColor" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="studio-main">
        <div className="studio-intro">
          <div className="studio-intro-copy">
            <p className="studio-eyebrow">RESEARCH NETWORK / MEMBER CARD</p>
            <h1>Make it yours<span>.</span></h1>
            <p>Your place in the network, ready to share. Add your photo and a few words about what you do.</p>
          </div>
          <ol className="studio-steps" aria-label="Create your member card">
            <li data-complete={verified}><span>{verified ? <StudioIcon name="check" /> : "01"}</span><div><small>YOUR APPLICATION</small><strong>{verified ? "Approved" : "Approval"}</strong></div></li>
            <li aria-current="step"><span>02</span><div><small>YOUR PERSPECTIVE</small><strong>Personalize</strong></div></li>
            <li><span>03</span><div><small>YOUR NETWORK</small><strong>Download</strong></div></li>
          </ol>
        </div>

      <div className="ifg-grid">
        {/* ------- controls ------- */}
        <section className="ifg-panel" aria-label="Card details">
          <div className="studio-panel-heading"><span className="studio-heading-icon"><StudioIcon name="edit" /></span><div><h2>Personalize your card</h2><p>Your changes appear in the preview.</p></div></div>

          <div className="ifg-fieldset">
            <h3 className="ifg-legend"><span>01</span> Your profile</h3>
            <label className="ifg-field">
              <span className="studio-field-label">Full name {verified ? <span className="studio-fixed-label"><StudioIcon name="lock" /> Approved</span> : null}</span>
              <input value={data.name} placeholder={SAMPLE.name} autoComplete="off" maxLength={120} readOnly={verified} disabled={exporting} onChange={(e) => set("name", e.target.value)} />
            </label>
            <div className="studio-photo-heading">
              <span className="studio-avatar-preview">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Your profile photo" />
                ) : initialsOf(data.name)}
              </span>
              <div><strong>Profile photo</strong><p>Use your photo from X, or keep your initials.</p></div>
            </div>
            <div className="ifg-field">
              <label className="studio-field-label" htmlFor="studio-x-handle">X handle</label>
              <div className="ifg-inline">
                <input
                  id="studio-x-handle"
                  value={xHandle}
                  placeholder="@handle"
                  maxLength={16}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={exporting}
                  onChange={(e) => { avatarAbort.current?.abort(); setXHandle(e.target.value); setXStatus("idle"); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !exporting) void fetchAvatar(xHandle); }}
                />
                <button type="button" className="ifg-btn" onClick={() => void fetchAvatar(xHandle)} disabled={xStatus === "loading" || exporting || !xHandle.trim()}>
                  {xStatus === "loading" ? "Loading…" : "Use photo"}
                </button>
              </div>
              {xNote ? <p className="ifg-note" role="status">{xNote}</p> : null}
            </div>
          </div>

          <div className="ifg-fieldset">
            <h3 className="ifg-legend"><span>02</span> Your perspective</h3>
            <label className="ifg-field">
              <span className="studio-field-label">Tagline <span className="studio-counter" aria-hidden="true">{data.tagline.length}/58</span></span>
              <input
                value={data.tagline}
                placeholder={SAMPLE.tagline}
                autoComplete="off"
                maxLength={58}
                disabled={exporting}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </label>
            <label className="ifg-field">
              <span className="studio-field-label">Bio <span className="studio-counter" aria-hidden="true">{data.bio.length}/132</span></span>
              <textarea
                value={data.bio}
                placeholder={SAMPLE.bio}
                autoComplete="off"
                maxLength={132}
                disabled={exporting}
                rows={4}
                onChange={(e) => set("bio", e.target.value)}
              />
            </label>
            <p className="studio-field-help">Keep it short. Your bio has space for three lines on the card.</p>
          </div>

          <div className="ifg-fieldset studio-member-details">
            <h3 className="ifg-legend"><span>03</span> Your membership {verified ? <StudioIcon name="lock" /> : null}</h3>
            {verified ? (
              <dl className="studio-membership-grid">
                <div><dt>Role</dt><dd>{displayLabel(data.role)}</dd></div>
                <div><dt>Clearance</dt><dd><i className="studio-tier-dot" data-tier={data.tier.toLowerCase()} aria-hidden="true" />{displayLabel(data.tier)}</dd></div>
                <div className="studio-desk"><dt>Research desk</dt><dd>{displayLabel(data.desk)}</dd></div>
              </dl>
            ) : (
              <>
                <span className="studio-field-label" id="studio-role-label">Role</span>
                <div className="ifg-seg" role="radiogroup" aria-labelledby="studio-role-label">
                  {ROLES.map(role => <button key={role} type="button" role="radio" aria-checked={data.role === role} className={data.role === role ? "on" : ""} disabled={exporting} onClick={() => set("role", role)}>{displayLabel(role)}</button>)}
                </div>
                <span className="studio-field-label" id="studio-tier-label">Clearance tier</span>
                <div className="ifg-seg" role="radiogroup" aria-labelledby="studio-tier-label">
                  {TIERS.map(tier => <button key={tier} type="button" role="radio" aria-checked={data.tier === tier} data-tier={tier.toLowerCase()} className={data.tier === tier ? "on" : ""} disabled={exporting} onClick={() => set("tier", tier)}><i aria-hidden="true" />{displayLabel(tier)}</button>)}
                </div>
              </>
            )}
            <p className="ifg-panel-foot">{verified ? "Your name, role and clearance come from your approved application." : "This is a sample card. Open your approval link to load your member details."}</p>
          </div>
          {!verified ? <button type="button" className="ifg-btn ifg-btn-quiet" disabled={exporting} onClick={() => { avatarAbort.current?.abort(); setXStatus("idle"); setData(EMPTY_CARD); setAvatar(null); setXHandle(""); }}>Clear fields</button> : null}
        </section>

        {/* ------- preview ------- */}
        <section className="ifg-stage" aria-label="Card preview">
          <div className="studio-preview-heading"><div><span className="studio-eyebrow">THE FINISHED LOOK</span><h2>Live preview</h2></div><span className="studio-format">1080 × 1350</span></div>
          {verified && claim ? (
            <div className="ifg-claim-banner" role="status">
              <StudioIcon name="check" /><span>VERIFIED · {claim.serial}</span><span className="studio-verified-note">Your details are loaded.</span>
            </div>
          ) : null}
          {claimState === "invalid" ? (
            <div className="ifg-claim-banner bad" role="alert">
              This claim link isn&apos;t valid. Open the link from your approval email.
            </div>
          ) : null}
          {claimState === "loading" ? <p className="ifg-claim-banner" role="status">Loading your member details…</p> : null}
          {claimState === "unavailable" ? <div className="ifg-claim-banner bad" role="alert">We could not load your member details. Check your connection and try again. <button type="button" className="ifg-btn" onClick={() => setClaimRetry(value => value + 1)}>Try again</button></div> : null}
          {!claimToken ? <div className="ifg-claim-banner studio-preview-notice" role="status"><span>Preview mode. Members arrive here after approval.</span><Link href="/application">Join the network <StudioIcon name="arrow" /></Link></div> : null}
          <div className="studio-preview-mat">
          <div className="ifg-card-shell" ref={shellRef}>
            <div
              ref={cardRef}
              className={`ifg-card${live ? " is-live" : ""}`}
              data-tier={data.tier.toLowerCase()}
            >
              <div className="ifg-card-bg" aria-hidden="true" />
              <div className="ifg-frame" aria-hidden="true" />
              <span className="ifg-corner c-tl" aria-hidden="true" />
              <span className="ifg-corner c-tr" aria-hidden="true" />
              <span className="ifg-corner c-bl" aria-hidden="true" />
              <span className="ifg-corner c-br" aria-hidden="true" />
              <span className="ifg-rail rail-l" aria-hidden="true" />
              <span className="ifg-rail rail-r" aria-hidden="true" />

              <header className="ifg-badge" data-boot>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="ifg-badge-logo"><img src="/assets/brand-symbol-transparent.png" alt="" /></span>
                <span className="ifg-badge-name">IFAGRITHM</span>
                <span className="ifg-badge-sub">RESEARCH&nbsp;NETWORK</span>{verified && claim && <span className="ifg-card-serial">{claim.serial}</span>}
              </header>

              <figure className="ifg-photo" data-boot>
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ifg-avatar" src={avatar} alt="" />
                ) : (
                  <div className="ifg-monogram">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/brand-symbol-transparent.png" alt="" aria-hidden="true" />
                    <span>{initialsOf(preview.name)}</span>
                  </div>
                )}
                <span className="ifg-photo-chip">{data.desk}</span>
                <span className="ifg-photo-sheen" aria-hidden="true" />
              </figure>

              <div className="ifg-role" data-boot><span>{data.role}</span></div>

              <h2 className="ifg-name" ref={nameRef} data-boot>{preview.name}</h2>
              <p className="ifg-tagline" ref={taglineRef} data-boot>{preview.tagline.toUpperCase()}</p>

              <div className="ifg-tier" data-boot>
                <i className="ifg-tier-gem" aria-hidden="true" />
                <span>{data.tier}</span>
              </div>

              <p className="ifg-bio" data-boot>{preview.bio.toUpperCase()}</p>

              <footer className="ifg-foot" data-boot>
                <span className="ifg-foot-line" aria-hidden="true" />
                <span className="ifg-foot-plate">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/brand-symbol-transparent.png" alt="" />
                </span>
                <span className="ifg-foot-line" aria-hidden="true" />
              </footer>
            </div>
          </div>
          </div>

          <div className="ifg-stage-bar">
            <button
              type="button"
              className="ifg-btn ifg-btn-gold"
              onClick={download}
              disabled={exporting || !verified || xStatus === "loading"}
            >
              <StudioIcon name="download" />
              {exporting ? "Rendering…" : "Download card · PNG"}
            </button>
            <p className="ifg-stage-hint" role="status">{exportNote || (verified ? "A high resolution PNG, ready to share." : "Use your approval link to download your member card.")}</p>
          </div>
        </section>
      </div>
      <footer className="studio-footer"><span>IFAGRITHM Research Network</span><Link href="/">Back to IFAGRITHM <StudioIcon name="arrow" /></Link></footer>
      </main>
    </div>
  );
}
