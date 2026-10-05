# Repository review — 4 October 2026

Reviewed the tracked application code, API routes, components, styles, backend service, SQL, setup scripts, configuration and dependency manifests. Binary assets were excluded from source review. The review combined manual inspection, dependency audits, regression tests and browser verification of the production build.

## Fixed findings

| Finding | Resulting behavior |
| --- | --- |
| Vulnerable `xlsx` dependency in the admin export | Replaced with `write-excel-file`; applicant content is explicitly written as text, including strings beginning with `=`. Headers, column widths, filters and the empty export are retained. |
| Malformed JSON, field coercion, unchecked lengths and oversized bodies | Website and store share strict validation. Objects, arrays and invalid scalar fields are rejected. JSON readers enforce content type, a 32 KiB body limit and deadlines, including streamed bodies without content length. |
| Inconsistent admin password/session checks | A configured password needs 16–1024 characters. Signed sessions reject tampering, malformed tokens, expired tokens and excessively extended expiry. Cookies are Secure, HttpOnly and SameSite Strict. Use a unique randomly generated password. |
| Cross-site mutations and cacheable private responses | API mutations check the browser origin and fetch-site header. The origin check preserves legitimate requests when Next normalizes loopback addresses or uses an internal hostname. Private JSON, claims and exports use `no-store`. |
| Avatar proxy accepted active or unsafe content | Only bounded PNG, JPEG, GIF and WebP responses with matching signatures are served. Redirects stay on approved HTTPS hosts. SVG, HTML, unsafe redirects and oversized responses are rejected. |
| Competing or repeated application decisions | Approval and rejection use conditional SQL updates for pending records. One competing request succeeds; the other receives a conflict. Repeated approvals cannot replace an existing claim token or send another approval email. |
| One store submission allowance shared by visitors behind the proxy | Authenticated website calls forward a validated visitor IP. Both services use bounded process-local limits; capacity exhaustion fails closed. |
| Admin could remain stuck after network failures or apply stale reads | Failed session loads return to sign-in with an explanation. Login throttling has a separate message. Competing decision controls are disabled; sign-out and decisions invalidate old reads. |
| Card studio retained verified state after a claim-token change | Token changes clear identity, avatar, serial and export eligibility. Temporary claim failures offer retry. Stale avatar requests are aborted. Failed share-sheet access falls back to a PNG download. |
| Unbounded store calls and leaked email provider details | Store calls enforce verified TLS, request deadlines and a response limit. Email markup escapes entered text. Errors and diagnostics omit raw private records and provider account details. |
| Setup scripts exposed owner credentials to the service or could overwrite existing setup | Fresh setup stops if configuration exists. Database-owner credentials go in a separate root-only file. Runtime configuration has restricted permissions; service files belong to root. TLS keys are mode 0600. Setup scripts were tested in disposable fixtures, not on Contabo. |
| Missing automatic checks | A GitHub workflow runs tests, lint, type checks, the production build and production dependency audits. Actions are pinned to commit SHAs, repository permissions are read-only and checkout credentials are not persisted. |

## Verification evidence

- **26 regression tests passed.** Coverage includes invalid requests, bounded readers, origin checks, sessions, rate-limit capacity, avatar content and redirects, Excel formula handling, real SQL persistence, restricted database privileges and concurrent decisions.
- **16 production API/browser checks passed.** A disposable SQL store behind pinned local TLS exercised the website API, the full application wizard, failure recovery, admin sign-in and approval, claim recovery and card export. The exported PNG was 1080 × 1350. No browser exceptions or CSP violations were observed.
- The homepage retained its light default, saved theme choice, glass header and demo email draft at widths from 320 to 1440 pixels.
- `npm run lint`, `npm run typecheck`, `npm run build`, shell/JavaScript syntax checks and `git diff --check` passed.
- `npm audit --omit=dev` and the complete remote-service audit reported **zero known vulnerabilities** at review time.
- A high-confidence credential-pattern scan of 62 historical text objects found no matching private keys or live credential patterns. This scan is not proof that no secret has ever appeared in history.

Tests used disposable data and no email sending credentials. They did not modify production records or send real email. Regression tests are reproducible using the commands in README.md.

## Remaining constraints

1. **Live backend configuration and deployment are incomplete.** Vercel has the store URL and CA, but still needs the existing server `STORE_SECRET` copied as `IFG_STORE_SECRET`. `ADMIN_PASSWORD` is not configured. The updated store files, migration and service permissions require deployment on Contabo; publishing this repository does not update that server. Server access was not available during the review. Follow BACKEND_SETUP.md, preserve existing records and do not rerun fresh setup on an existing installation.
2. **One development dependency advisory remains upstream.** The linter dependency chain includes `braces` 3.0.3, affected by [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). The advisory lists no patched release on 4 October 2026. Full `npm audit` reports five affected packages in this one dependency chain. This package is not a production dependency. Do not feed untrusted patterns to development tools; replace or update the chain when a compatible patched release is available. A forced audit downgrade would change the Next lint configuration to another framework major and was not applied.
3. **Process-local limits are a baseline.** They reset on restart and do not share state across website instances. Add persistent gateway limits for recruitment traffic and admin login before relying on these counters against sustained abuse.
4. **Shared admin access and bearer claim links retain their design limits.** A shared password has no individual reviewer identity or MFA. Claim links are reusable secrets; the card page suppresses referrers and responses are not cached. A downloaded PNG is not a cryptographic membership credential.
5. **Live email delivery was not verified.** Approval/decline mail needs a configured provider and verified sending domain. A mail failure does not undo a saved review decision. The admin can copy the claim link for an approved applicant. The homepage contact form prepares a draft for visitors to send; it does not automatically send mail.
6. **The static CSP allows inline scripts and styles required by this build.** It restricts sources, framing and active object content; it is not a complete defense against every possible script injection.

This review fixes the confirmed repository defects and records the remaining deployment and design limits. It does not certify the live host, database, provider account or application as free of all vulnerabilities.
