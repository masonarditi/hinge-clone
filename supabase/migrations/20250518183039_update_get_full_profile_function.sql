BEGIN;

-- Add new function to get profile skills as an array
CREATE OR REPLACE FUNCTION public.get_profile_skills(p_profile_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  skills_array TEXT[];
BEGIN
  SELECT 
    ARRAY_AGG(s.name ORDER BY s.name)
  INTO skills_array
  FROM profile_skills ps
  JOIN skills s ON ps.skill_id = s.id
  WHERE ps.profile_id = p_profile_id;
  
  RETURN COALESCE(skills_array, ARRAY[]::TEXT[]);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_profile_skills(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_skills(UUID) TO anon;

-- Drop the old function first
DROP FUNCTION IF EXISTS public.get_full_profile(profile_id UUID);

CREATE OR REPLACE FUNCTION public.get_full_profile(p_profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
  profile_main_data JSONB;
  skills_data JSONB;
  work_experience_data JSONB;
  projects_data JSONB;
  result_json JSONB;
BEGIN
  -- Get the profile record
  SELECT * INTO profile_record
  FROM profiles p
  WHERE p.id = p_profile_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  -- Base profile data (common fields + role specific)
  profile_main_data := jsonb_build_object(
    'id', profile_record.id,
    'user_id', profile_record.user_id,
    'created_at', profile_record.created_at,
    'updated_at', profile_record.updated_at,
    'first_name', profile_record.first_name, -- Can be person's name or startup's name
    'last_name', profile_record.last_name,   -- Typically for candidates
    'phone', profile_record.phone,
    'one_line_description', profile_record.one_line_description, -- Used by both
    'user_role', profile_record.user_role,
    'profile_photos', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', pp.id,
        'photo_url', pp.photo_url,
        'photo_order', pp.photo_order,
        'is_active', pp.is_active
      ) ORDER BY pp.photo_order), '[]'::jsonb)
      FROM profile_photos pp
      WHERE pp.profile_id = profile_record.id AND pp.is_active = true
    )
  );

  -- Add startup-specific fields if user_role is 'startup'
  IF profile_record.user_role = 'startup' THEN
    profile_main_data := profile_main_data || jsonb_build_object(
      'funding_stage', profile_record.funding_stage,
      'looking_for_roles', profile_record.looking_for_roles,
      'offer_details', profile_record.offer_details,
      'why_us_platform', profile_record.why_us_platform
    );
    -- For startups, skills, work_experience, projects might be less relevant or structured differently.
    -- For now, we'll only populate them for candidates.
    skills_data := '[]'::jsonb;
    work_experience_data := '[]'::jsonb;
    projects_data := '[]'::jsonb;
  ELSIF profile_record.user_role = 'candidate' THEN
    -- Get skills data for candidates
    SELECT
      COALESCE(jsonb_agg(s.name ORDER BY s.name), '[]'::jsonb)
    INTO skills_data
    FROM profile_skills ps
    JOIN skills s ON ps.skill_id = s.id
    WHERE ps.profile_id = profile_record.id;

    -- Get work experience data for candidates
    SELECT
      COALESCE(jsonb_agg(jsonb_build_object(
        'id', we.id,
        'company_name', we.company_name,
        'role', we.role,
        'start_date', we.start_date,
        'end_date', we.end_date,
        'is_current', we.is_current,
        'industry', we.industry,
        'campaign_name', we.campaign_name -- For creatives
      ) ORDER BY
        we.is_current DESC,
        we.end_date DESC NULLS FIRST,
        we.start_date DESC
      ), '[]'::jsonb)
    INTO work_experience_data
    FROM work_experiences we
    WHERE we.profile_id = profile_record.id;

    -- Get projects with their media for candidates
    SELECT
      COALESCE(jsonb_agg(jsonb_build_object(
        'id', proj.id,
        'title', proj.title,
        'description', proj.description,
        'project_order', proj.project_order,
        'media', (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', pm.id,
            'media_type', pm.media_type,
            'storage_path', pm.storage_path,
            'url', pm.url,
            'media_order', pm.media_order
          ) ORDER BY pm.media_order), '[]'::jsonb)
          FROM project_media pm
          WHERE pm.project_id = proj.id
        )
      ) ORDER BY proj.project_order), '[]'::jsonb)
    INTO projects_data
    FROM projects proj
    WHERE proj.profile_id = profile_record.id;

    -- We're keeping some of the relevant fields from the original profile
    -- Removing dating-specific fields (children, family_plan, covid, zodiac, sexuality)
    profile_main_data := profile_main_data || jsonb_build_object(
        'dob', profile_record.dob,
        'height_cm', profile_record.height_cm,
        'neighborhood', profile_record.neighborhood,
        'latitude', profile_record.latitude,
        'longitude', profile_record.longitude,
        'max_distance_km', profile_record.max_distance_km
    );
  ELSE
    -- Handle other roles or default if necessary
    skills_data := '[]'::jsonb;
    work_experience_data := '[]'::jsonb;
    projects_data := '[]'::jsonb;
  END IF;

  -- Combine all data
  result_json := jsonb_build_object(
    'profile', profile_main_data,
    'skills', skills_data, -- relevant for candidates
    'work_experiences', work_experience_data, -- relevant for candidates
    'projects', projects_data -- relevant for candidates
  );

  RETURN result_json;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_full_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_full_profile(UUID) TO anon; -- Or just authenticated if profiles shouldn't be public

COMMIT;
