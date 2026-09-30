# IFAGRITHM Website

Public business website for **IFAGRITHM — Web3 Data & Research**. This repository is intentionally separate from the private IFAGRITHM research terminal.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Structure

- `app/` — Next.js App Router pages, metadata and global styles
- `components/Site.tsx` — landing page UI and project-brief interaction
- `public/ifagrithm-logo.png` — current supplied logo asset

## Update links

The X, LinkedIn and email constants are near the top of `components/Site.tsx`.

## Add research

The current Research section is deliberately a truthful placeholder. Replace it with verified research cards/articles only after publication. A future iteration can add MDX or a CMS without changing the landing-page architecture.

## Contact form

v1 stores nothing. It validates required fields and opens the visitor's email client with a prepared brief addressed to `Ifagrithm@gmail.com`. Connect a backend (for example a server action plus an email provider) only when needed and update the privacy copy.

## Deploy to Vercel

1. Push this folder to a new GitHub repository such as `IFAGRITHM-Website`.
2. In Vercel choose **Add New → Project** and import that repository.
3. Framework should be detected as Next.js. Deploy with defaults.
4. Test the generated `*.vercel.app` preview on mobile before adding a custom domain.

## Custom domain later

After you own the intended domain: Vercel → Project → Settings → Domains → Add. Apply the DNS records Vercel provides. Do not point a domain until the preview is approved.

## Brand notes

Working palette: near-black `#0B0B0B`, warm white `#FAF9F6`, amber `#FFBF00`. The site deliberately avoids fake clients, metrics, testimonials, case studies and data.

## Local project placement

This website lives beside `IFAGRITHM-Terminal` inside the local `IFAgrthm` folder. It has its own Git repository; terminal data is not included.

Use `npm ci` for reproducible installation. Dependencies include security patch updates and a patched PostCSS override.
