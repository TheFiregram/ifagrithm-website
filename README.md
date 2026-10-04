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

The static website is exported to `out/`. Vercel uses the included configuration. The main branch is the production source.

The page follows the layout and motion of https://striker.alphaai.markets/ using Ifagrithm's branding and research content.

It includes a 1 second brand entrance, 1 second hold, and 1.5 second circular exit; a rotating headline and animated dot field; five pinned feature panels with upright orbit labels, evidence flows, moving research cards, an animated ruler, and a connected signal field; a three-stage research process; rolling counters; an accessible FAQ; a moving closing card wall; and an animated character footer.

Feature panels support wheel gestures, touch swipes, and keyboard navigation. Short screens and reduced motion use direct panel controls. Canvas effects and moving card columns pause off screen. Dark and light themes are saved locally. Geist is served locally with its font license.

The counters describe the four research areas, three stages, and one decision being studied. Research cards illustrate possible outputs; they are not customer results or testimonials.

The enquiry form opens the visitor's email app for review and sending to Ifagrithm@gmail.com. No enquiry is sent automatically.
