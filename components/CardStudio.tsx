"use client";

// IFAGRITHM Network Card Studio.
// An approved member's details become a shareable portrait card, rendered
// at exactly 1080x1350 and exported client-side as PNG. This screen is the
// design surface; the production flow will inject an approved applicant's
// record instead of the editable sample.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import "./network.css";

const ROLES = ["RESEARCH SCOUT", "RESEARCH ANALYST"] as const;
const TIERS = ["BRONZE", "SILVER", "GOLD"] as const;
const DESKS = ["CONSUMER APPS", "DEFI", "RWA", "INFRASTRUCTURE", "MARKET INTEL"] as const;

type Role = (typeof ROLES)[number];
type Tier = (typeof TIERS)[number];
type Desk = (typeof DESKS)[number];

type CardData = {
  name: string;
  role: Role;
  tier: Tier;
  desk: Desk;
  tagline: string;
  bio: string;
  serial: string;
};

const SAMPLE: CardData = {
  name: "Tariq A.",
  role: "RESEARCH SCOUT",
  tier: "BRONZE",
  desk: "DEFI",
  tagline: "Mapping liquidity flows across African markets",
  bio: "Traces wallet cohorts and liquidity migration across L2s, turning raw onchain noise into signal.",
  serial: "IFG-2026-001",
};

// demo photo lives in /public; production swaps this for the member's upload
const SAMPLE_AVATAR = "/sample-dp.jpg";

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

export default function CardStudio() {
  const [data, setData] = useState<CardData>(SAMPLE);
  const [avatar, setAvatar] = useState<string | null>(SAMPLE_AVATAR);
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
  const fileRef = useRef<HTMLInputElement>(null);

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
  }, [data.name, data.tagline, fontsTick]);

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

  const fetchAvatarFromX = useCallback(async () => {
    const handle = xHandle.trim().replace(/^@/, "");
    if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
      setXStatus("error");
      return;
    }
    setXStatus("loading");
    try {
      const res = await fetch(`/api/avatar?handle=${encodeURIComponent(handle)}`);
      if (!res.ok) throw new Error(res.status === 404 ? "miss" : "error");
      setAvatar(await readFileAsDataURL(await res.blob()));
      setXStatus("idle");
    } catch (err) {
      setXStatus(err instanceof Error && err.message === "miss" ? "miss" : "error");
    }
  }, [xHandle]);

  const onUpload = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setExportNote("Photo is over 6 MB — pick a smaller one.");
      return;
    }
    setExportNote(null);
    setAvatar(await readFileAsDataURL(file));
  }, []);

  const download = useCallback(async () => {
    const node = cardRef.current;
    if (!node || exporting) return;
    setExporting(true);
    setExportNote(null);
    node.classList.add("is-export");
    try {
      await document.fonts.ready;
      const url = await toPng(node, {
        width: 1080,
        height: 1350,
        pixelRatio: 1,
        backgroundColor: "#060607",
        // the preview scales the card into its shell via transform on the
        // node itself — the clone must render at natural size
        style: { transform: "none", transformOrigin: "top left" },
      });
      const link = document.createElement("a");
      link.download = `IFAGRITHM-${data.serial.replace(/[^A-Za-z0-9-]/g, "") || "card"}.png`;
      link.href = url;
      link.click();
    } catch {
      setExportNote("Export failed — try again.");
    } finally {
      node.classList.remove("is-export");
      setExporting(false);
    }
  }, [data.serial, exporting]);

  const xNote =
    xStatus === "loading" ? "Resolving avatar…" :
    xStatus === "miss" ? "No avatar on that handle — upload a photo instead." :
    xStatus === "error" ? "That handle doesn't look right." : null;

  return (
    <div className="ifg-studio">
      <header className="ifg-head">
        <Link className="ifg-back" href="/">← ifagrithm.site</Link>
        <div className="ifg-head-title">
          <h1>Card Studio</h1>
          <span className="ifg-head-chip">NETWORK · INTERNAL PREVIEW</span>
        </div>
      </header>

      <div className="ifg-grid">
        {/* ------- controls ------- */}
        <section className="ifg-panel" aria-label="Card details">
          <div className="ifg-fieldset">
            <span className="ifg-legend">Identity</span>
            <label className="ifg-field">
              <span>Full name</span>
              <input value={data.name} maxLength={28} onChange={(e) => set("name", e.target.value)} />
            </label>
            <div className="ifg-field">
              <span>Pull photo from X</span>
              <div className="ifg-inline">
                <input
                  value={xHandle}
                  placeholder="@handle"
                  maxLength={16}
                  onChange={(e) => { setXHandle(e.target.value); setXStatus("idle"); }}
                  onKeyDown={(e) => { if (e.key === "Enter") fetchAvatarFromX(); }}
                />
                <button type="button" className="ifg-btn" onClick={fetchAvatarFromX} disabled={xStatus === "loading"}>
                  Fetch
                </button>
              </div>
              {xNote ? <em className="ifg-note">{xNote}</em> : null}
            </div>
            <div className="ifg-field">
              <span>…or upload a photo</span>
              <div className="ifg-inline">
                <button type="button" className="ifg-btn" onClick={() => fileRef.current?.click()}>Choose image</button>
                {avatar ? (
                  <button type="button" className="ifg-btn ifg-btn-quiet" onClick={() => setAvatar(null)}>Remove</button>
                ) : null}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => { onUpload(e.target.files?.[0]); e.target.value = ""; }}
              />
            </div>
          </div>

          <div className="ifg-fieldset">
            <span className="ifg-legend">Role</span>
            <div className="ifg-seg" role="radiogroup" aria-label="Role">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  role="radio"
                  aria-checked={data.role === role}
                  className={data.role === role ? "on" : ""}
                  onClick={() => set("role", role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="ifg-fieldset">
            <span className="ifg-legend">Clearance</span>
            <div className="ifg-seg" role="radiogroup" aria-label="Clearance tier">
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  role="radio"
                  aria-checked={data.tier === tier}
                  data-tier={tier.toLowerCase()}
                  className={data.tier === tier ? "on" : ""}
                  onClick={() => set("tier", tier)}
                >
                  <i aria-hidden /> {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="ifg-fieldset">
            <span className="ifg-legend">Desk</span>
            <div className="ifg-chips" role="radiogroup" aria-label="Research desk">
              {DESKS.map((desk) => (
                <button
                  key={desk}
                  type="button"
                  role="radio"
                  aria-checked={data.desk === desk}
                  className={data.desk === desk ? "on" : ""}
                  onClick={() => set("desk", desk)}
                >
                  {desk}
                </button>
              ))}
            </div>
          </div>

          <div className="ifg-fieldset">
            <span className="ifg-legend">Presentation</span>
            <label className="ifg-field">
              <span>Tagline</span>
              <input
                value={data.tagline}
                maxLength={58}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </label>
            <label className="ifg-field">
              <span>Bio <em>· {data.bio.length}/132 — three lines on the card</em></span>
              <textarea
                value={data.bio}
                maxLength={132}
                rows={4}
                onChange={(e) => set("bio", e.target.value)}
              />
            </label>
            <label className="ifg-field">
              <span>Serial</span>
              <input
                value={data.serial}
                maxLength={16}
                onChange={(e) => set("serial", e.target.value.toUpperCase())}
              />
            </label>
          </div>

          <button type="button" className="ifg-btn ifg-btn-quiet" onClick={() => setData(SAMPLE)}>
            Reset to sample
          </button>
          <p className="ifg-panel-foot">
            Sample data. In production this screen opens from an approval mail and
            arrives pre-filled with the member&apos;s verified details.
          </p>
        </section>

        {/* ------- preview ------- */}
        <section className="ifg-stage" aria-label="Card preview">
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
                <span className="ifg-badge-logo"><img src="/ifagrithm-logo.png" alt="" /></span>
                <span className="ifg-badge-name">IFAGRITHM</span>
                <span className="ifg-badge-sub">RESEARCH&nbsp;NETWORK</span>
              </header>

              <figure className="ifg-photo" data-boot>
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ifg-avatar" src={avatar} alt="" />
                ) : (
                  <div className="ifg-monogram">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ifagrithm-logo.png" alt="" aria-hidden="true" />
                    <span>{initialsOf(data.name)}</span>
                  </div>
                )}
                <span className="ifg-photo-chip">{data.desk}</span>
                <span className="ifg-photo-serial">{data.serial}</span>
                <span className="ifg-photo-sheen" aria-hidden="true" />
              </figure>

              <div className="ifg-role" data-boot><span>{data.role}</span></div>

              <h2 className="ifg-name" ref={nameRef} data-boot>{data.name.toUpperCase()}</h2>
              <p className="ifg-tagline" ref={taglineRef} data-boot>{data.tagline.toUpperCase()}</p>

              <div className="ifg-tier" data-boot>
                <i className="ifg-tier-gem" aria-hidden="true" />
                <span>{data.tier}</span>
              </div>

              <p className="ifg-bio" data-boot>{data.bio.toUpperCase()}</p>

              <footer className="ifg-foot" data-boot>
                <span className="ifg-foot-side left">{data.serial}</span>
                <span className="ifg-foot-plate">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ifagrithm-logo.png" alt="" />
                </span>
                <span className="ifg-foot-side right">WEB3 RESEARCH &amp; INTELLIGENCE</span>
              </footer>
            </div>
          </div>

          <div className="ifg-stage-bar">
            <button
              type="button"
              className="ifg-btn ifg-btn-gold"
              onClick={download}
              disabled={exporting}
            >
              {exporting ? "Rendering…" : "Download card · PNG"}
            </button>
            <span className="ifg-stage-hint">
              {exportNote ? <em className="ifg-note">{exportNote}</em> : <>Exports at 1080 × 1350 — sized for X posts.</>}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
