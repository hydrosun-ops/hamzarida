-- Create a security definer function to check if current user is admin
-- This avoids infinite recursion by not querying the guests table during insert
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.guests g
    JOIN public.user_roles ur ON ur.guest_id = g.id
    WHERE g.user_id = auth.uid()
      AND ur.role = 'admin'::app_role
  )
$$;

-- Drop the problematic recursive INSERT policy
DROP POLICY IF EXISTS "Only admins can insert guests" ON public.guests;

-- Create new non-recursive INSERT policy using the security definer function
CREATE POLICY "Only admins can insert guests" ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (public.is_current_user_admin());