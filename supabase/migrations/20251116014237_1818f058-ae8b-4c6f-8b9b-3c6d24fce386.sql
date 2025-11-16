-- Create enum for event types
CREATE TYPE public.event_type AS ENUM ('welcome', 'mehndi', 'haldi', 'nikah', 'reception', 'trek');

-- Create event invitations table
CREATE TABLE public.event_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  invited BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(guest_id, event_type)
);

-- Enable RLS
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view invitations
CREATE POLICY "Anyone can view event invitations"
ON public.event_invitations
FOR SELECT
USING (true);

-- Allow admins to manage invitations
CREATE POLICY "Admins can manage event invitations"
ON public.event_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE role = 'admin'::app_role
  )
);