-- -- 1. Update profiles table with the new fields
-- ALTER TABLE "public"."profiles"
--   ADD COLUMN IF NOT EXISTS "one_line_description" text,
--   ADD COLUMN IF NOT EXISTS "user_role" text NOT NULL DEFAULT 'startup';

-- -- Add check constraint separately
-- ALTER TABLE "public"."profiles"
--   ADD CONSTRAINT check_user_role CHECK (user_role IN ('startup', 'user'));

-- 2. Create a skills table for programming languages/tools
CREATE TABLE "public"."skills" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(name)
);

-- 3. Create a join table for profile skills (both for SWE and Creative professionals)
CREATE TABLE "public"."profile_skills" (
  "profile_id" uuid NOT NULL REFERENCES "public"."profiles"(id) ON DELETE CASCADE,
  "skill_id" uuid NOT NULL REFERENCES "public"."skills"(id) ON DELETE CASCADE,
  PRIMARY KEY ("profile_id", "skill_id")
);

-- 4. Create work experience table for past companies
CREATE TABLE "public"."work_experiences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL REFERENCES "public"."profiles"(id) ON DELETE CASCADE,
  "company_name" text NOT NULL,
  "role" text NOT NULL,
  "start_date" date,
  "end_date" date,
  "is_current" boolean DEFAULT false,
  "industry" text,
  "campaign_name" text, -- For creatives
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. Create a projects table for portfolio projects
CREATE TABLE "public"."projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL REFERENCES "public"."profiles"(id) ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "project_order" integer NOT NULL DEFAULT 0
);

-- 6. Create a project_media table for multimedia content linked to projects
CREATE TABLE "public"."project_media" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "public"."projects"(id) ON DELETE CASCADE,
  "media_type" text NOT NULL, -- 'image', 'video', 'demo_link', 'github_link', etc.
  "storage_path" text,
  "url" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "media_order" integer NOT NULL DEFAULT 0,
  CHECK (storage_path IS NOT NULL OR url IS NOT NULL)
);

-- 7. Enable Row Level Security on new tables
ALTER TABLE "public"."skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profile_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."work_experiences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."project_media" ENABLE ROW LEVEL SECURITY;

-- 8. Set up RLS policies for skills (viewable by anyone)
CREATE POLICY "skills_select_policy" 
ON "public"."skills" 
FOR SELECT 
TO public 
USING (true);

-- 9. Set up RLS policies for profile_skills (viewable by anyone, but only owner can modify)
CREATE POLICY "profile_skills_select_policy" 
ON "public"."profile_skills" 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "profile_skills_insert_policy" 
ON "public"."profile_skills" 
FOR INSERT 
TO authenticated 
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "profile_skills_delete_policy" 
ON "public"."profile_skills" 
FOR DELETE 
TO authenticated 
USING (profile_id = auth.uid());

-- 10. RLS policies for work experiences
CREATE POLICY "work_experiences_select_policy" 
ON "public"."work_experiences" 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "work_experiences_insert_policy" 
ON "public"."work_experiences" 
FOR INSERT 
TO authenticated 
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "work_experiences_update_policy" 
ON "public"."work_experiences" 
FOR UPDATE 
TO authenticated 
USING (profile_id = auth.uid());

CREATE POLICY "work_experiences_delete_policy" 
ON "public"."work_experiences" 
FOR DELETE 
TO authenticated 
USING (profile_id = auth.uid());

-- 11. RLS policies for projects
CREATE POLICY "projects_select_policy" 
ON "public"."projects" 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "projects_insert_policy" 
ON "public"."projects" 
FOR INSERT 
TO authenticated 
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "projects_update_policy" 
ON "public"."projects" 
FOR UPDATE 
TO authenticated 
USING (profile_id = auth.uid());

CREATE POLICY "projects_delete_policy" 
ON "public"."projects" 
FOR DELETE 
TO authenticated 
USING (profile_id = auth.uid());

-- 12. RLS policies for project media
CREATE POLICY "project_media_select_policy" 
ON "public"."project_media" 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "project_media_insert_policy" 
ON "public"."project_media" 
FOR INSERT 
TO authenticated 
WITH CHECK (project_id IN (
  SELECT id FROM public.projects WHERE profile_id = auth.uid()
));

CREATE POLICY "project_media_update_policy" 
ON "public"."project_media" 
FOR UPDATE 
TO authenticated 
USING (project_id IN (
  SELECT id FROM public.projects WHERE profile_id = auth.uid()
));

CREATE POLICY "project_media_delete_policy" 
ON "public"."project_media" 
FOR DELETE 
TO authenticated 
USING (project_id IN (
  SELECT id FROM public.projects WHERE profile_id = auth.uid()
));

-- 13. Add some initial skills for demo purposes
INSERT INTO "public"."skills" (name) VALUES 
('JavaScript'), ('TypeScript'), ('React'), ('Angular'), ('Vue.js'), ('Node.js'), ('Python'), 
('Java'), ('C#'), ('PHP'), ('Ruby'), ('Swift'), ('Kotlin'), ('Go'), ('Rust'), ('C++'),
('HTML'), ('CSS'), ('SQL'), ('GraphQL'), ('MongoDB'), ('PostgreSQL'), ('MySQL'), ('AWS'),
('Docker'), ('Kubernetes'), ('Firebase'), ('Supabase'), 
('Photoshop'), ('Illustrator'), ('Figma'), ('Sketch'), ('InDesign'), ('After Effects'),
('UI Design'), ('UX Design'), ('Brand Strategy'), ('Digital Marketing'), ('SEO'),
('Content Writing'), ('Copywriting'), ('Social Media Management');

-- 14. Create storage bucket for project media
INSERT INTO storage.buckets (id, name, public) VALUES ('project-media', 'project-media', true);

-- Set up storage policy to allow authenticated users to upload to their own folder
CREATE POLICY "Allow users to upload their own media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update and delete their own media
CREATE POLICY "Allow users to update their own media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to project media files
CREATE POLICY "Allow public access to project media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-media');

-- 15. Grant appropriate permissions on new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."skills" TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."profile_skills" TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."work_experiences" TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."projects" TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."project_media" TO authenticated, service_role;

GRANT SELECT ON TABLE "public"."skills" TO anon;
GRANT SELECT ON TABLE "public"."profile_skills" TO anon;
GRANT SELECT ON TABLE "public"."work_experiences" TO anon;
GRANT SELECT ON TABLE "public"."projects" TO anon;
GRANT SELECT ON TABLE "public"."project_media" TO anon; 