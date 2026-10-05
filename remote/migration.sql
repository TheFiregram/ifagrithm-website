BEGIN;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN ('bronze','silver','gold'));
CREATE TABLE IF NOT EXISTS enquiries (id serial PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(),name text NOT NULL,email text NOT NULL,company text NOT NULL DEFAULT '',question text NOT NULL);
GRANT SELECT,INSERT,UPDATE ON enquiries TO ifagrithm_app;
GRANT USAGE,SELECT ON SEQUENCE enquiries_id_seq TO ifagrithm_app;
COMMIT;
