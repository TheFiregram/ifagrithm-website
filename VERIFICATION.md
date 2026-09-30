# Homepage redesign verification — 2026-09-30

## Release scope

Rebuilt the existing homepage with the requested offer, labelled conceptual research map, four services, one three-step approach, simplified four-field contact and revised metadata. Initial appearance is light, following the owner's final instruction; the dark toggle remains complete. Original logo and contact destinations retained. Biography, name origin, internal framework lesson, defensive wording and developer-facing form notes removed. No unrelated working-tree changes were present at the start.

## Research decision

No public research pages, matching source material or authentic excerpts for the three candidates exist in this website repository or the supplied website package. Superteam UK startup analytics, lending utilisation and wallet behaviour cards are omitted, together with Research navigation and CTA. No independent work is claimed as a company client engagement; no confidential work was inspected or published.

## Browser acceptance

Production build tested in installed Chrome at 1440px desktop, 768px tablet, and 390/375px mobile, in both light and dark themes:

- No horizontal overflow or clipped headings; offer visible in the first mobile viewport; map labels remain readable.
- Default light appearance, original logo, four services, three-step approach and metadata verified.
- Visible text contrast checked against WCAG AA thresholds in both themes; mobile layouts visually inspected.
- Navigation anchors valid; menu closes on selection and Escape; Escape returns keyboard focus; legacy anchors retained at Approach.
- Required/invalid email and whitespace-only research question rejected.
- Actual mailto navigation captured through Chrome's protocol: recipient, subject, body, line breaks and encoded special characters checked. No message sent; OS email-app opening remains device-dependent.
- Real clipboard write/read succeeded; denied clipboard explicitly tested with selectable-text fallback and honest status.
- Direct email, X and LinkedIn destinations preserved.
- Reduced motion honored; no application console or page errors.
- Search of customer-facing app/component source found no prohibited legacy copy or fake research links.

Local browser artifacts: `verification/redesign-local-light-1440.png`, `verification/redesign-local-light-390.png`, and corresponding dark screenshots. These are deliberately excluded from Git. The final release also receives public-URL browser checks after deployment.

## Quality checks

ESLint, TypeScript and production build passed. See the release handoff for commit SHA, push result and verified public deployment status.
