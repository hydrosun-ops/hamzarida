-- Create storage bucket for slide backgrounds
INSERT INTO storage.buckets (id, name, public)
VALUES ('slide-backgrounds', 'slide-backgrounds', true);

-- Allow admins to upload slide backgrounds
CREATE POLICY "Admins can upload slide backgrounds"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'slide-backgrounds' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE role = 'admin'
  )
);

-- Allow everyone to view slide backgrounds (public bucket)
CREATE POLICY "Anyone can view slide backgrounds"
ON storage.objects
FOR SELECT
USING (bucket_id = 'slide-backgrounds');

-- Allow admins to delete slide backgrounds
CREATE POLICY "Admins can delete slide backgrounds"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'slide-backgrounds' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE role = 'admin'
  )
);