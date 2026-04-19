-- Public read access to menu-images
CREATE POLICY "Public read menu-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Authenticated users can upload
CREATE POLICY "Auth users upload menu-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

-- Authenticated users can update their uploads
CREATE POLICY "Auth users update menu-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images');

-- Authenticated users can delete
CREATE POLICY "Auth users delete menu-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');
