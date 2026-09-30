# Website verification — 2026-09-30

Passed: ESLint, TypeScript, production build, npm audit (zero reported vulnerabilities).

Production site tested in installed Chrome at 1440×900 and 390×844:
- Title and supplied logo render; no horizontal overflow.
- Dark/light toggle works.
- Mobile menu opens and closes after section navigation.
- Required fields and invalid email rejected; complete brief accepted.
- Copy brief writes entered context to clipboard.
- Email button prepares the mailto handoff and displays feedback. No email was sent; opening a configured desktop email app was not verified.
- No application console errors or page errors.
- robots.txt responds successfully.

Contact has no server-side submission or storage. Public research remains a clearly labelled placeholder. Local verification screenshots and scripts are excluded from Git.
