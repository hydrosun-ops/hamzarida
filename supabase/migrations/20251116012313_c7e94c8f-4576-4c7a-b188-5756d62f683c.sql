-- Add INSERT policy for guests table to allow admins to add new guests
CREATE POLICY "Admins can insert guests" 
ON public.guests 
FOR INSERT 
WITH CHECK (true);