
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'HiloTik',
  ADD COLUMN IF NOT EXISTS old_price NUMERIC,
  ADD COLUMN IF NOT EXISTS sizes TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS colors TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT false;

-- Storage bucket for product images (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Admins manage product images
CREATE POLICY "Admins upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
