#!/usr/bin/env bash
# DB + roles + service skeleton for the IFAGRITHM network store.
# Secrets are generated on the box and written straight into
# /opt/ifg-network/.env — nothing is echoed back to the client.
set -euo pipefail
umask 077
if [ -e /opt/ifg-network/.env ] || [ -e /root/ifg-network-owner.env ]; then
  echo "Existing configuration found. Use migration.sql; do not rerun fresh setup." >&2
  exit 1
fi

OWNER_PW=$(openssl rand -hex 24)
APP_PW=$(openssl rand -hex 24)
STORE_SECRET=$(openssl rand -hex 32)

# --- database + roles (owner/app split per box convention) ---
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
CREATE ROLE ifagrithm_owner LOGIN PASSWORD '${OWNER_PW}';
CREATE ROLE ifagrithm_app LOGIN PASSWORD '${APP_PW}';
CREATE DATABASE ifagrithm OWNER ifagrithm_owner;
SQL

sudo -u postgres psql -v ON_ERROR_STOP=1 --dbname=ifagrithm <<'SQL'
SET ROLE ifagrithm_owner;
CREATE TABLE applications (
  id          serial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  full_name   text NOT NULL,
  x_handle    text NOT NULL,
  telegram    text NOT NULL,
  email       text NOT NULL,
  country     text NOT NULL,
  role        text NOT NULL,
  desks       text[] NOT NULL DEFAULT '{}',
  links       text NOT NULL,
  context     text NOT NULL DEFAULT '',
  why         text NOT NULL,
  status      text NOT NULL DEFAULT 'pending',
  tier        text CHECK (tier IN ('bronze', 'silver', 'gold')),
  claim_token text,
  claimed_at  timestamptz
);
CREATE INDEX applications_status_idx ON applications (status, created_at DESC);
CREATE UNIQUE INDEX applications_claim_token_idx ON applications (claim_token);
CREATE TABLE enquiries (id serial PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(),name text NOT NULL,email text NOT NULL,company text NOT NULL DEFAULT '',question text NOT NULL);
GRANT SELECT,INSERT,UPDATE ON enquiries TO ifagrithm_app;
GRANT USAGE,SELECT ON SEQUENCE enquiries_id_seq TO ifagrithm_app;
GRANT USAGE ON SCHEMA public TO ifagrithm_app;
GRANT SELECT, INSERT, UPDATE ON applications TO ifagrithm_app;
GRANT USAGE, SELECT ON SEQUENCE applications_id_seq TO ifagrithm_app;
REVOKE DELETE, TRUNCATE ON applications FROM ifagrithm_app;
SQL

# --- service skeleton per box convention ---
id -u ifg-network >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin ifg-network
mkdir -p /opt/ifg-network
cat > /opt/ifg-network/.env <<ENV
DATABASE_URL=postgresql://ifagrithm_app:${APP_PW}@127.0.0.1:5432/ifagrithm
STORE_SECRET=${STORE_SECRET}
RESEND_KEY=
RESEND_FROM=onboarding@resend.dev
PORT=4100
CLAIM_BASE=https://ifagrithm-seven.vercel.app
ENV
cat > /root/ifg-network-owner.env <<ENV
MIGRATION_URL=postgresql://ifagrithm_owner:${OWNER_PW}@127.0.0.1:5432/ifagrithm
ENV
chown root:root /root/ifg-network-owner.env
chmod 600 /root/ifg-network-owner.env
chown root:ifg-network /opt/ifg-network /opt/ifg-network/.env
chmod 640 /opt/ifg-network/.env
chmod 750 /opt/ifg-network

echo "DB_ROLES_OK TABLE_OK ENV_OK"
