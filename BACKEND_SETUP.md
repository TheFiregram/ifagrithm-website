# Research network integration

The homepage, application form, admin console and approved card studio share the current site design. The homepage enquiry form prepares an email draft for visitors to send from their email app or Gmail; it requires no server email configuration and does not call the enquiry storage API. The network application and admin workflows still use the backend described here.

## Connect Vercel
Set these server environment variables in the Ifagrithm project:
- IFG_STORE_URL: HTTPS address of the network store
- IFG_STORE_SECRET: matching remote STORE_SECRET
- IFG_CA_CERT: private CA PEM, if that store uses the supplied private CA
- ADMIN_PASSWORD: a unique password of at least 16 characters, never committed

## Existing Contabo installation
Have the server owner review and deploy remote/service.js, remote/http.js and remote/validation.js, plus remote/package.json and remote/package-lock.json. Run npm ci in the service directory and restart the existing service. All three runtime JavaScript files are required. Run remote/migration.sql with the database owner connection before restarting. This adds the missing tier column and the enquiries table without deleting records. Do not rerun db-setup.sh on an existing installation.

Set CLAIM_BASE=https://ifagrithm-seven.vercel.app on the remote store. Verify the sending domain in Resend, set RESEND_FROM to an address on that domain, and configure RESEND_KEY. Set ENQUIRY_NOTIFY_EMAIL=Ifagrithm@gmail.com for project enquiry notifications. Submitted enquiries remain saved if notification delivery fails.

Use remote/db-setup.sh only for a fresh server/database. Scripts have not been executed against the owner's server. Fresh setup keeps the database owner credential in /root/ifg-network-owner.env, separate from the runtime environment. Code and configuration belong to root; the service can read them and cannot write its install directory. For an existing install, move any MIGRATION_URL out of the service environment into a root-only file, set root ownership on the runtime files, allow the ifg-network group to read .env (0640), and apply the updated systemd unit. Do not run fresh setup to change permissions.

## Before opening recruitment
Bounded per process limits are included. The Vercel API forwards the visitor IP in x-ifg-client-ip only on authenticated store calls; the store uses that header after checking the shared secret, avoiding a single loopback allowance for all visitors. These counters reset on restart and are separate across Vercel instances. Add persistent rate limiting at nginx or an API gateway for applications and admin login. The shared admin password grants all administrative actions; use individual accounts if multiple reviewers join. Only pending applications can be approved or declined. Concurrent decisions return one success and one conflict; refresh the queue after a conflict. Claim links are reusable bearer links: keep them private. The card page sends no referrer and claim responses cannot be cached. The card is a downloadable image, not a cryptographic credential. Card identity and tier controls are fixed after approval; the PNG is not independent proof of membership.

## Validation
Local tests use a disposable SQL-backed store, not the production database, and do not send real email. Configure the live backend, then check a controlled application, admin decision, email delivery and card download before opening recruitment. The application form shows an honest failure state with an email/copy fallback when storage is unavailable. The homepage enquiry form keeps entered fields after preparing a draft and states that visitors must press Send in their email app.

Copy the existing server STORE_SECRET into Vercel as IFG_STORE_SECRET. This is the same value, not a new or rotated credential. Save it for Production, then redeploy the website. The server URL and CA alone cannot authenticate submissions. Remote code changes require a separate server deployment; GitHub/Vercel publication does not update Contabo.
