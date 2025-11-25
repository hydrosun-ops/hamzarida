-- Drop the unique constraint on email since email is now optional
-- Multiple guests can have NULL or empty email
ALTER TABLE public.guests
DROP CONSTRAINT IF EXISTS guests_email_key;