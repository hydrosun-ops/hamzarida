-- Fix the update_rsvp_updated_at function to have secure search_path
CREATE OR REPLACE FUNCTION public.update_rsvp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;