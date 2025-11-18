-- Add RLS policy to allow admins to delete travel info
CREATE POLICY "Admins can delete travel info"
ON public.travel_info
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.role = 'admin'::app_role
  )
);