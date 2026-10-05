# IFAGRITHM

Web3 research and intelligence website built with Next.js and React.

## Development

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
```

Vercel runs the Next.js application using the included configuration. The main branch is the production source.

It includes a 1 second brand entrance, 1 second hold, and 1.5 second circular exit; a rotating headline and animated dot field; five pinned feature panels with upright orbit labels, evidence flows, moving research cards, an animated ruler, and a connected signal field; a three-stage research process; rolling counters; an accessible FAQ; a moving closing card wall; and an animated character footer.

Feature panels support wheel gestures, touch swipes, and keyboard navigation. Short screens and reduced motion use direct panel controls. Canvas effects and moving card columns pause off screen. New visitors start in light mode, independent of their device theme. A chosen dark or light theme is saved locally, applied before the first paint, and synced between tabs. The fixed glass header keeps the demo link and theme switch accessible during scrolling. Geist is served locally with its font license.

The counters describe the four research areas, three stages, and one decision being studied. Research cards illustrate possible outputs; they are not customer results or testimonials.

The enquiry form validates the required fields and opens the visitor's email app with a complete draft addressed to Ifagrithm@gmail.com. Visitors review and send the draft in their email app. The form keeps their answers and offers links to reopen the draft or compose it in Gmail. It does not claim delivery or depend on the network store. No enquiry is sent automatically.

The member card studio at `/network` opens from an approved application's claim link. Approved names, roles, research desks and clearance tiers stay fixed; members can add their X photo, tagline and bio. The editor starts in light mode for new visitors and shares the site's saved theme preference. The glass header keeps its theme switch accessible. The responsive editor styles are separate from the card artwork, which keeps the same 1080 × 1350 PNG design in both themes. The public sample cannot be downloaded as an approved card.

## Verification

Use Node 22.18 or newer (CI uses Node 24). Install both dependency sets before running the regression suite:

```sh
npm ci
npm ci --prefix remote
npm test
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
npm audit --prefix remote
```

The suite uses disposable local PostgreSQL data via PGlite. It sends no real email and does not touch production records. GitHub runs these checks on pull requests and changes to main. The application and enquiry APIs validate JSON types, field lengths and request sizes; private API responses cannot be cached. Avatar downloads accept verified raster image types from approved hosts and reject SVG, unsafe redirects and oversized responses. The admin password must contain at least 16 characters. See SECURITY_REVIEW.md for findings, evidence and deployment limits.
