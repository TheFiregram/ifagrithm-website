# IFAGRITHM Website

Public website for **IFAGRITHM — Web3 Research & Intelligence**. The existing Next.js app and supplied logo are retained.

## Local development

```sh
npm ci
npm run dev
```

## Quality checks

```sh
npm run lint
npm run typecheck
npm run build
```

## Homepage

The page is a single scroll: a full-viewport landing hero (the logo rebuilt as a lit three.js gold object that loads assembled, holds, then spins, over an original GLSL backdrop — fog, ground tide and all background styles are painted by one shader, so no layer clashes), a deliverables ticker, four services as full-width rows with ghost numbers and a unique animated motif each (segment donut, candles, constellation, decision fork), an evidence trio with animated motifs, the conceptual research map rendered as a live flow, an approach statement over a gold-tinted texture, a sectors strip, a short FAQ and a project contact form. Buttons carry a shine-sweep hover, cards lift with a gold edge, sections fade up on scroll, and the footer closes on a giant ghost IFAGRITHM wordmark. The site is dark-only by choice; the light theme tokens remain in `globals.css` but no toggle is exposed. Existing `#method` and `#about` URLs land at Approach.

The hero background is locked to the Horizon style (fog only, no tide — removed as visually clashing). three.js ships in the main bundle so the mark mounts as soon as the page hydrates: it sits perfectly still on load, then spins up. The environment map is a canvas-painted gradient rather than a generated room, and the pixel ratio is capped at 1.75. The gold fluid texture from the approach section is repeated at lower opacity in the evidence and contact sections.

Three.js is the only runtime dependency added; the hero is a static pose when `prefers-reduced-motion` is set and pauses off-screen. The approach band texture is an Unsplash-licensed image recoloured to the brand gold in CSS (`public/band-bg.jpg`).

Content that needs sign-off before a public release (all drafted from claims already on the page, no new facts): the FAQ answers, the sectors strip list, and the evidence-card descriptions. The ticker only reuses the published service outputs.

No research showcase is published in this release: the website repository contains no matching public research source and working article destination for the candidate Superteam UK, lending utilisation or wallet behaviour work. Add only verified, public, non-confidential material with useful destinations; independent work must retain its independent status.

## Contact

`components/Site.tsx` retains the existing email, X and LinkedIn destinations. The four-field form validates required entries and opens an encoded email brief. The visitor reviews and sends it in their email app. Clipboard success is shown only after a successful write; a selectable brief is available when copying fails. No message is sent or stored by the website.

## Research network pages

Two additional routes support the research network:

- **`/application`** — the join-the-network application (replaces the external Tally form). Sectioned form: identity (name, X, Telegram, email, country), role selection (Research Scout / Research Analyst) with desk chips, proof-of-work links, and motivation. Submission composes a structured email to IFAGRITHM — nothing is stored server-side, matching the brief form. The homepage nav and footer link here. Section copy beyond the identity fields is drafted for sign-off.
- **`/network`** — internal card studio (noindex). Renders a member's network card at exactly 1080×1350 and exports it as a PNG in-browser via `html-to-image` (the only dependency added by these routes; three.js remains the other). Photo comes from an upload or an X handle resolved through `/api/avatar` (same-origin proxy over unavatar.io; monogram fallback). Tier colors are the one semantic exception to the single-accent rule.

The production approval flow (application review → approval mail → pre-filled card link) is not built yet; the studio currently runs on editable sample data.

## Release

Use the existing private `olamilekanalaga/IFAGRITHM-Website` repository and `main` branch. Never force-push. The existing Vercel project is `ifagrithm-website`, project ID `prj_jroQgUuUH4LtyKpqjbmaqWg9CQZW`, under `olamilekans-projects-6812339f`.

Production: https://ifagrithm-website.vercel.app

The project uses the Next.js framework preset. When automatic Git integration is not configured, deploy the clean website checkout using the existing CLI authentication:

```sh
npx vercel deploy --prod --yes --project ifagrithm-website --scope olamilekans-projects-6812339f
```

Open the public production URL and verify the actual release before describing it as live. Preserve domain bindings and project access. The adjacent research terminal is outside this repository and release.

Local browser verification scripts and screenshots are ignored under `verification/`. See `VERIFICATION.md` for the acceptance record.
