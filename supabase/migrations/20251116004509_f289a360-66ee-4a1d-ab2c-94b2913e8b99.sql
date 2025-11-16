-- Drop existing user_id foreign key constraint since we're not using auth
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_user_id_fkey;

-- Make phone required and unique since it's the access code
ALTER TABLE public.guests ALTER COLUMN phone SET NOT NULL;
ALTER TABLE public.guests ADD CONSTRAINT guests_phone_unique UNIQUE (phone);

-- Create family_members table for additional attendees
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dietary_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on family_members
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Allow public read access to family members for their own guest
CREATE POLICY "Anyone can view family members"
  ON public.family_members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert family members"
  ON public.family_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update family members"
  ON public.family_members FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete family members"
  ON public.family_members FOR DELETE
  USING (true);

-- Update guests policies to allow phone-based access
DROP POLICY IF EXISTS "Guests can view their own data" ON public.guests;
DROP POLICY IF EXISTS "Guests can update their own data" ON public.guests;

CREATE POLICY "Anyone can view guests"
  ON public.guests FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update guests"
  ON public.guests FOR UPDATE
  USING (true);

-- Update RSVP policies for public access
DROP POLICY IF EXISTS "Guests can view their own RSVP" ON public.rsvps;
DROP POLICY IF EXISTS "Guests can create their own RSVP" ON public.rsvps;
DROP POLICY IF EXISTS "Guests can update their own RSVP" ON public.rsvps;

CREATE POLICY "Anyone can view RSVPs"
  ON public.rsvps FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create RSVPs"
  ON public.rsvps FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update RSVPs"
  ON public.rsvps FOR UPDATE
  USING (true);