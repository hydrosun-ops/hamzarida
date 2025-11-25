-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can update guests" ON public.guests;

-- Create secure policies for guests table
-- Admins can view all guests
CREATE POLICY "Admins can view all guests" ON public.guests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.guest_id = guests.id
    AND user_roles.role = 'admin'
  )
);

-- Authenticated users can view their own guest record
CREATE POLICY "Users can view their own guest record" ON public.guests
FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can update their own guest record (name, email only - not phone)
CREATE POLICY "Users can update their own guest record" ON public.guests
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can update any guest record
CREATE POLICY "Admins can update any guest" ON public.guests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.guest_id = guests.id
    AND user_roles.role = 'admin'
  )
);