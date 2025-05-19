-- 20250528002000_add_projects_to_profiles.sql
ALTER TABLE "public"."profiles"
ADD COLUMN IF NOT EXISTS "projects" jsonb[];

COMMENT ON COLUMN "public"."profiles"."projects" IS 'Array of projects for candidate profiles';
