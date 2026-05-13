-- Revoca l'accesso allo schema GraphQL per ruoli anon e authenticated.
-- Le tabelle restano accessibili via PostgREST/SDK, protette dalle RLS esistenti.
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql FROM anon, authenticated;