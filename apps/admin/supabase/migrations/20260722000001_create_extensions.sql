CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";
ALTER ROLE authenticator SET search_path TO public, extensions;
ALTER ROLE postgres SET search_path TO public, extensions;
