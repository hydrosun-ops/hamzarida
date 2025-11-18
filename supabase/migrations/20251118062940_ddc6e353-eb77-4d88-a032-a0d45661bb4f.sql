-- Add RLS policy to allow admins to delete slides
CREATE POLICY "Admins can delete slides"
ON public.wedding_slides
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.role = 'admin'::app_role
  )
);