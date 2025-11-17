-- Create travel_info table for editable travel page content
CREATE TABLE IF NOT EXISTS public.travel_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  title text NOT NULL,
  subtitle text,
  content text,
  icon_emoji text,
  display_order integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.travel_info ENABLE ROW LEVEL SECURITY;

-- Anyone can view travel info
CREATE POLICY "Anyone can view travel info"
ON public.travel_info
FOR SELECT
USING (true);

-- Only admins can update travel info
CREATE POLICY "Admins can update travel info"
ON public.travel_info
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE role = 'admin'::app_role
  )
);

-- Insert default travel information
INSERT INTO public.travel_info (section_type, title, subtitle, content, icon_emoji, display_order) VALUES
('airport', 'International Arrival', 'Islamabad International Airport (ISB)', 'All international guests should arrive into and depart from Islamabad International Airport (ISB). This is the main gateway for all wedding events.

Airport Code: ISB (Islamabad International Airport)
Location: Located approximately 30km from Islamabad city center', '✈️', 1),

('transportation', 'Local Transportation', 'Don''t worry about getting around - we''ve got you covered!', 'Airport Transfers: Transportation from Islamabad International Airport to your hotel will be provided.

Event Transportation: Internal transport between hotels and all wedding venues will be arranged for all guests.', '🚌', 2),

('important', 'Important Information', null, 'Visa Requirements: Please check visa requirements for Pakistan well in advance. Contact the Pakistani embassy in your country for the most up-to-date information.

Currency: The local currency is Pakistani Rupee (PKR). We recommend exchanging some currency at the airport upon arrival.

Weather: December weather in Pakistan is mild and pleasant, with daytime temperatures around 15-20°C (59-68°F).', 'ℹ️', 3),

('contact', 'Need Help?', null, 'For any travel-related questions or assistance, please reach out to:

Email: wedding@example.com
WhatsApp: +92 XXX XXXXXXX

We''re here to help make your journey smooth and comfortable!', '📞', 4);