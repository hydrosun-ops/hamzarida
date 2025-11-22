-- Create settings table for global site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to update settings
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE role = 'admin'::app_role
  )
);

-- Insert default watercolor background
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('watercolor_background', '/src/assets/karachi-skyline.webp')
ON CONFLICT (setting_key) DO NOTHING;