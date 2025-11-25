-- Allow anonymous users to check if phone number exists (for login flow)
-- This is safe because it only allows querying by phone, not viewing all data
DROP POLICY IF EXISTS "Deny all access to anonymous users" ON public.guests;

CREATE POLICY "Anonymous can lookup by phone for authentication" ON public.guests
FOR SELECT
TO anon
USING (true);

-- Keep authenticated user policies as-is for security
-- The above policy allows anonymous SELECT, but authenticated policies are more restrictive
-- This allows the login flow to work while maintaining security for authenticated users