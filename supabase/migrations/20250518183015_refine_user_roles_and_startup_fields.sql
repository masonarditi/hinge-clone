BEGIN;

-- Drop existing check constraint if it uses different values or if it was named differently
ALTER TABLE "public"."profiles" DROP CONSTRAINT IF EXISTS check_user_role;

-- Update existing user_role values before changing the constraint
UPDATE "public"."profiles" SET user_role = 'startup' WHERE user_role = 'founder';
UPDATE "public"."profiles" SET user_role = 'candidate' WHERE user_role IN ('swe', 'creative', 'user', 'employee'); -- maybe add startup

-- Add the new check constraint with 'startup' and 'candidate'
ALTER TABLE "public"."profiles" ADD CONSTRAINT check_user_role CHECK (user_role IN ('startup', 'candidate', 'user'));

-- Ensure skills table exists
CREATE TABLE IF NOT EXISTS "public"."skills" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure profile_skills junction table exists
CREATE TABLE IF NOT EXISTS "public"."profile_skills" (
  "profile_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "skill_id" UUID NOT NULL REFERENCES "public"."skills"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("profile_id", "skill_id")
);

-- Add startup-specific fields to the profiles table
ALTER TABLE "public"."profiles"
  ADD COLUMN IF NOT EXISTS "funding_stage" text,
  ADD COLUMN IF NOT EXISTS "looking_for_roles" text[], -- Array of roles startup is looking for
  ADD COLUMN IF NOT EXISTS "offer_details" jsonb,    -- What startup offers: equity, money range etc.
  ADD COLUMN IF NOT EXISTS "why_us_platform" text;   -- Why choose this platform/startup

-- Make the default 'candidate' as that might be more common for new individual signups
ALTER TABLE "public"."profiles" ALTER COLUMN "user_role" SET DEFAULT 'candidate';

-- Remove dating-specific columns that are no longer needed
-- We'll comment these out for now, and can execute if needed after testing
-- ALTER TABLE "public"."profiles" DROP COLUMN "children_id";
-- ALTER TABLE "public"."profiles" DROP COLUMN "family_plan_id";
-- ALTER TABLE "public"."profiles" DROP COLUMN "covid_vaccine_id";
-- ALTER TABLE "public"."profiles" DROP COLUMN "zodiac_sign_id";
-- ALTER TABLE "public"."profiles" DROP COLUMN "sexuality_id";
-- ALTER TABLE "public"."profiles" DROP COLUMN "gender_id";

COMMIT;
