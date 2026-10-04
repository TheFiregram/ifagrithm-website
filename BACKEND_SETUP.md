# Research network integration

The homepage, application form, admin console and approved card studio share the current site design.

## Connect Vercel
Set these server environment variables in the Ifagrithm project:
- IFG_STORE_URL: HTTPS address of the network store
- IFG_STORE_SECRET: matching remote STORE_SECRET
- IFG_CA_CERT: private CA PEM, if that store uses the supplied private CA
- ADMIN_PASSWORD: a unique long password, never committed

## Existing Contabo installation
Have the server owner review and deploy remote/service.js, install remote/package.json dependencies and restart the existing service. Run remote/migration.sql with the database owner connection before restarting. This adds the missing tier column and the enquiries table without deleting records. Do not rerun db-setup.sh on an existing installation.

Set CLAIM_BASE=https://ifagrithm-seven.vercel.app on the remote store. Verify the sending domain in Resend, set RESEND_FROM to an address on that domain, and configure RESEND_KEY. Set ENQUIRY_NOTIFY_EMAIL=Ifagrithm@gmail.com for project enquiry notifications. Submitted enquiries remain saved if notification delivery fails.

Use remote/db-setup.sh only for a fresh server/database. Scripts have not been executed against the owner's server.

## Before opening recruitment
Basic per process limits are included. Add persistent rate limiting at nginx or an API gateway for applications and admin login. The shared admin password grants all administrative actions; use individual accounts if multiple reviewers join. Claim links are reusable bearer links: keep them private. The card is a downloadable image, not a cryptographic credential. Card identity and tier controls are fixed after approval; the PNG is not independent proof of membership.

## Validation
Local tests use a disposable mock store, not the production database, and do not send real email. Configure the live backend, then check a controlled application, admin decision, email delivery and card download before opening recruitment. Application and enquiry forms show an honest failure state with email/copy fallback when storage is unavailable.
