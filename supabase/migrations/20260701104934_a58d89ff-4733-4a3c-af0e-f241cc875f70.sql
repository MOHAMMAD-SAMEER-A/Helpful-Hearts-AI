-- App uses PostgREST (Data API), not GraphQL. Hide tables from the auto-generated
-- GraphQL schema without breaking authenticated PostgREST/RLS access.
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql FROM anon, authenticated;