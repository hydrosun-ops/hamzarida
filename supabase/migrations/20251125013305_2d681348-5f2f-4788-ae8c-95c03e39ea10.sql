-- Ensure RLS is enabled on guests table
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Anyone can view guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can update guests" ON public.guests;
DROP POLICY IF EXISTS "Admins can insert guests" ON public.guests;
DROP POLICY IF EXISTS "Admins can view all guests" ON public.guests;
DROP POLICY IF EXISTS "Users can view their own guest record" ON public.guests;
DROP POLICY IF EXISTS "Users can update their own guest record" ON public.guests;
DROP POLICY IF EXISTS "Admins can update any guest" ON public.guests;

-- SELECT policies: Only authenticated users can view
CREATE POLICY "Admins can view all guests" ON public.guests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.guest_id = guests.id
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Users can view their own guest record" ON public.guests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policies: Only actual admins can insert
CREATE POLICY "Only admins can insert guests" ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.guests g ON g.id = ur.guest_id
    WHERE g.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- UPDATE policies: Users can update their own, admins can update all
CREATE POLICY "Users can update their own guest record" ON public.guests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any guest" ON public.guests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.guests g ON g.id = ur.guest_id
    WHERE g.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);