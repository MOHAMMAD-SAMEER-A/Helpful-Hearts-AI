-- Fix search_path mutable on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated/public.
-- has_role is invoked from RLS policies (runs as definer regardless of grants).
-- handle_new_user and update_updated_at_column are trigger functions (no direct execute needed).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Remove GraphQL/anon exposure: no policy grants anon access to these tables.
REVOKE SELECT ON public.help_requests FROM anon;
REVOKE SELECT ON public.volunteer_applications FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;