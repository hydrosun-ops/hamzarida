-- Create guests table
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RSVPs table
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
  attending BOOLEAN NOT NULL,
  including_trek BOOLEAN DEFAULT false,
  dietary_requirements TEXT,
  plus_one BOOLEAN DEFAULT false,
  plus_one_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Guests policies
CREATE POLICY "Guests can view their own data"
  ON public.guests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Guests can update their own data"
  ON public.guests FOR UPDATE
  USING (auth.uid() = user_id);

-- RSVPs policies
CREATE POLICY "Guests can view their own RSVP"
  ON public.rsvps FOR SELECT
  USING (guest_id IN (SELECT id FROM public.guests WHERE user_id = auth.uid()));

CREATE POLICY "Guests can create their own RSVP"
  ON public.rsvps FOR INSERT
  WITH CHECK (guest_id IN (SELECT id FROM public.guests WHERE user_id = auth.uid()));

CREATE POLICY "Guests can update their own RSVP"
  ON public.rsvps FOR UPDATE
  USING (guest_id IN (SELECT id FROM public.guests WHERE user_id = auth.uid()));

-- Function to update RSVP timestamp
CREATE OR REPLACE FUNCTION public.update_rsvp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for RSVP updates
CREATE TRIGGER update_rsvps_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rsvp_updated_at();