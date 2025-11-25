-- Drop all the recursive admin policies on guests table
DROP POLICY IF EXISTS "Admins can update any guest" ON public.guests;
DROP POLICY IF EXISTS "Admins can view all guests" ON public.guests;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all guests" ON public.guests
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  (auth.uid() = user_id OR is_current_user_admin())
);

CREATE POLICY "Admins can update any guest" ON public.guests
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR is_current_user_admin()
)
WITH CHECK (
  auth.uid() = user_id OR is_current_user_admin()
);