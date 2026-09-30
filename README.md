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

The page introduces the offer, an explicitly labelled conceptual research map, four services, a compact approach and a project contact form. Light is the initial appearance; the toggle provides a complete dark theme. Existing `#method` and `#about` URLs land at Approach.

No research showcase is published in this release: the website repository contains no matching public research source and working article destination for the candidate Superteam UK, lending utilisation or wallet behaviour work. Add only verified, public, non-confidential material with useful destinations; independent work must retain its independent status.

## Contact

`components/Site.tsx` retains the existing email, X and LinkedIn destinations. The four-field form validates required entries and opens an encoded email brief. The visitor reviews and sends it in their email app. Clipboard success is shown only after a successful write; a selectable brief is available when copying fails. No message is sent or stored by the website.

## Release

Use the existing private `olamilekanalaga/IFAGRITHM-Website` repository and `main` branch. Never force-push. The existing Vercel project is `ifagrithm-website`, project ID `prj_jroQgUuUH4LtyKpqjbmaqWg9CQZW`, under `olamilekans-projects-6812339f`.

Production: https://ifagrithm-website.vercel.app

The project uses the Next.js framework preset. When automatic Git integration is not configured, deploy the clean website checkout using the existing CLI authentication:

```sh
npx vercel deploy --prod --yes --project ifagrithm-website --scope olamilekans-projects-6812339f
```

Open the public production URL and verify the actual release before describing it as live. Preserve domain bindings and project access. The adjacent research terminal is outside this repository and release.

Local browser verification scripts and screenshots are ignored under `verification/`. See `VERIFICATION.md` for the acceptance record.
