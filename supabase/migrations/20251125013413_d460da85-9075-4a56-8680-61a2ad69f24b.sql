-- Drop existing SELECT policies and recreate with explicit auth checks
DROP POLICY IF EXISTS "Admins can view all guests" ON public.guests;
DROP POLICY IF EXISTS "Users can view their own guest record" ON public.guests;

-- Recreate SELECT policies with explicit authentication checks
CREATE POLICY "Admins can view all guests" ON public.guests
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.guest_id = guests.id
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Users can view their own guest record" ON public.guests
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  auth.uid() = user_id
);

-- Add explicit DENY policy for anonymous users
CREATE POLICY "Deny all access to anonymous users" ON public.guests
FOR ALL
TO anon
USING (false);