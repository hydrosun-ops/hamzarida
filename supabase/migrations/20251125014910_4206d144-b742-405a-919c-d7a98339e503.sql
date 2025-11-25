-- Add user_id to user_roles table to avoid infinite recursion
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Populate user_id for existing roles by joining with guests table
UPDATE public.user_roles ur
SET user_id = g.user_id
FROM public.guests g
WHERE ur.guest_id = g.id AND ur.user_id IS NULL;

-- Create trigger function to auto-populate user_id when roles are inserted
CREATE OR REPLACE FUNCTION public.populate_user_role_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get user_id from guests table
  SELECT user_id INTO NEW.user_id
  FROM public.guests
  WHERE id = NEW.guest_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-populate user_id
DROP TRIGGER IF EXISTS populate_user_id_on_role_insert ON public.user_roles;
CREATE TRIGGER populate_user_id_on_role_insert
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_user_role_user_id();

-- Recreate is_current_user_admin to query only user_roles table
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
  )
$$;