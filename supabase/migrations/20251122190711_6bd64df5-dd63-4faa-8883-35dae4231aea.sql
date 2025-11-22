-- Allow admins to insert slides
CREATE POLICY "Admins can insert slides"
ON public.wedding_slides
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE role = 'admin'::app_role
  )
);