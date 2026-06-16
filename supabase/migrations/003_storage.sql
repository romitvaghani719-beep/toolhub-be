-- Storage bucket for tool images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-images', 'tool-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS tool_images_public_read ON storage.objects;
CREATE POLICY tool_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'tool-images');

DROP POLICY IF EXISTS tool_images_auth_upload ON storage.objects;
CREATE POLICY tool_images_auth_upload ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tool-images' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS tool_images_owner_update ON storage.objects;
CREATE POLICY tool_images_owner_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'tool-images' AND auth.uid()::text = (storage.foldername(name))[1]
  );
