-- Add category column to guests table
ALTER TABLE public.guests 
ADD COLUMN category text;