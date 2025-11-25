-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Anyone can create RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Anyone can update RSVPs" ON public.rsvps;

-- Create secure policies for rsvps table
-- Admins can view all RSVPs
CREATE POLICY "Admins can view all RSVPs" ON public.rsvps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.guests
    JOIN public.user_roles ON user_roles.guest_id = guests.id
    WHERE guests.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Authenticated users can view their own RSVPs
CREATE POLICY "Users can view their own RSVPs" ON public.rsvps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.guests
    WHERE guests.id = rsvps.guest_id
    AND guests.user_id = auth.uid()
  )
);

-- Authenticated users can create their own RSVPs
CREATE POLICY "Users can create their own RSVPs" ON public.rsvps
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.guests
    WHERE guests.id = guest_id
    AND guests.user_id = auth.uid()
  )
);

-- Authenticated users can update their own RSVPs
CREATE POLICY "Users can update their own RSVPs" ON public.rsvps
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.guests
    WHERE guests.id = rsvps.guest_id
    AND guests.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.guests
    WHERE guests.id = guest_id
    AND guests.user_id = auth.uid()
  )
);

-- Admins can update any RSVP
CREATE POLICY "Admins can update any RSVP" ON public.rsvps
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.guests
    JOIN public.user_roles ON user_roles.guest_id = guests.id
    WHERE guests.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);