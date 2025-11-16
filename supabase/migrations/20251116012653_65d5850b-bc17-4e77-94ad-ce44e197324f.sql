-- Create wedding_slides table for managing slide content
CREATE TABLE public.wedding_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_number INT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon_emoji TEXT DEFAULT '💍',
  background_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wedding_slides ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read slides
CREATE POLICY "Anyone can view slides"
ON public.wedding_slides
FOR SELECT
USING (true);

-- Only admins can update slides (using guest_id from localStorage context)
CREATE POLICY "Admins can update slides"
ON public.wedding_slides
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE role = 'admin'
  )
);

-- Insert default slides
INSERT INTO public.wedding_slides (page_number, title, subtitle, description, icon_emoji) VALUES
(1, 'Welcome', 'You''re Invited', 'Join us for a celebration of love in the heart of Pakistan', '❤️'),
(2, 'Arrival Day', 'Dholki Night', 'Begin our celebration with a traditional Dholki evening filled with music, dance, and joy. This intimate gathering will set the perfect tone for the festivities ahead.', '🥁'),
(3, 'The Main Event', 'Barat Ceremony', 'The main wedding ceremony where families unite. Witness the beautiful traditions, vibrant colors, and heartfelt moments as we begin our journey together.', '💍'),
(4, 'Double Celebration', 'Village Reception & DJ Party', 'Experience authentic Pakistani village hospitality followed by a modern warehouse celebration.', '🎉'),
(5, 'Grand Finale', 'Formal Reception', 'Join us for an elegant evening of dinner, speeches, and celebration. Dress in your finest as we conclude our wedding festivities in style.', '✨'),
(6, 'Adventure Awaits', 'Week-Long Pakistan Trek', 'Extend your stay and explore the breathtaking landscapes of northern Pakistan. Trek through mountain valleys, visit ancient villages, and experience the natural beauty of the region.', '🏔️');

-- Trigger for updated_at
CREATE TRIGGER update_wedding_slides_updated_at
BEFORE UPDATE ON public.wedding_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_rsvp_updated_at();