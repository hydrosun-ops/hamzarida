-- Add visa_needed column to rsvps table
ALTER TABLE public.rsvps 
ADD COLUMN visa_needed boolean DEFAULT false;