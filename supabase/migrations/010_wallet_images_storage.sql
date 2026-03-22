-- Bucket public: PNG-uri hero pentru Google Wallet (URL HTTPS stabil pentru fetch Google)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wallet-images',
  'wallet-images',
  true,
  5242880,
  ARRAY['image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "wallet_images_public_read" ON storage.objects;
CREATE POLICY "wallet_images_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'wallet-images');
