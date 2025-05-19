BEGIN;

-- 1. Add projects column to profiles table as a jsonb array
ALTER TABLE "public"."profiles" 
  ADD COLUMN IF NOT EXISTS "projects" jsonb DEFAULT '[]';

-- 2. Migrate data from projects and project_media tables to the new column
UPDATE "public"."profiles" p
SET projects = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', pr.id,
      'title', pr.title,
      'description', pr.description,
      'project_order', pr.project_order,
      'media', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', pm.id,
            'media_type', pm.media_type,
            'storage_path', pm.storage_path,
            'url', pm.url,
            'media_order', pm.media_order
          ) ORDER BY pm.media_order
        )
        FROM project_media pm
        WHERE pm.project_id = pr.id),
        '[]'::jsonb
      )
    ) ORDER BY pr.project_order
  )
  FROM projects pr
  WHERE pr.profile_id = p.id
);

-- 3. Update the get_full_profile function to use the new column
DROP FUNCTION IF EXISTS public.get_full_profile(UUID);

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
  result_json JSONB;
BEGIN
  -- Get the basic profile data
  SELECT * INTO profile_record
  FROM profiles
  WHERE id = p_profile_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  
  -- Build the basic profile data
  profile_main_data := jsonb_build_object(
    'id', profile_record.id,
    'first_name', profile_record.first_name,
    'last_name', profile_record.last_name,
    'one_line_description', profile_record.one_line_description,
    'user_role', profile_record.user_role,
    'profile_photos', (
      SELECT COALESCE(
        jsonb_agg(jsonb_build_object(
          'id', pp.id,
          'photo_url', pp.photo_url,
          'photo_order', pp.photo_order
        ) ORDER BY pp.photo_order),
        '[]'::jsonb
      )
      FROM profile_photos pp
      WHERE pp.profile_id = p_profile_id AND pp.is_active = true
    )
  );
  
  -- If this is a candidate profile, add candidate-specific information
  IF profile_record.user_role = 'candidate' THEN
    -- Get skills data (now directly from the profile)
    skills_data := COALESCE(
      to_jsonb(profile_record.skills),
      '[]'::jsonb
    );
    
    -- Get work experience data
    SELECT 
      COALESCE(
        jsonb_agg(jsonb_build_object(
          'id', we.id,
          'company_name', we.company_name,
          'role', we.role,
          'start_date', we.start_date,
          'end_date', we.end_date,
          'is_current', we.is_current,
          'industry', we.industry,
          'campaign_name', we.campaign_name
        ) ORDER BY 
          we.is_current DESC,
          we.end_date DESC NULLS FIRST,
          we.start_date DESC),
        '[]'::jsonb
      )
    INTO work_experience_data
    FROM work_experiences we
    WHERE we.profile_id = p_profile_id;
    
    -- Add candidate-specific fields to the main profile data
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
  END IF;

  -- Combine all data
  result_json := jsonb_build_object(
    'profile', profile_main_data,
    'skills', skills_data,
    'work_experiences', work_experience_data,
    'projects', COALESCE(profile_record.projects, '[]'::jsonb)
  );

  RETURN result_json;
END;
$$;

-- 4. Create a new function to add a project directly to the projects array
DROP FUNCTION IF EXISTS public.add_project(UUID, TEXT, TEXT, JSONB[]);

CREATE OR REPLACE FUNCTION public.add_project(
  profile_id UUID,
  title TEXT,
  description TEXT,
  media JSONB[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authorized BOOLEAN;
  project_id UUID;
  project_order INTEGER;
  new_project JSONB;
  media_array JSONB;
  current_projects JSONB;
BEGIN
  -- Check if the user is authorized to add a project to this profile
  authorized := (profile_id = auth.uid());
  
  IF NOT authorized THEN
    RAISE EXCEPTION 'Not authorized to add projects for this profile';
  END IF;
  
  -- Generate a new UUID for the project
  project_id := gen_random_uuid();
  
  -- Get current projects array
  SELECT projects INTO current_projects
  FROM profiles
  WHERE id = profile_id;
  
  -- Get the next project order
  project_order := 0;
  IF jsonb_array_length(COALESCE(current_projects, '[]'::jsonb)) > 0 THEN
    SELECT COALESCE(MAX(proj->>'project_order')::int + 1, 0)
    INTO project_order
    FROM jsonb_array_elements(current_projects) AS proj;
  END IF;
  
  -- Process media if provided
  IF media IS NOT NULL AND array_length(media, 1) > 0 THEN
    media_array := '[]'::jsonb;
    FOR i IN 1..array_length(media, 1) LOOP
      media_array := media_array || jsonb_build_object(
        'id', gen_random_uuid(),
        'media_type', media[i]->>'media_type',
        'storage_path', media[i]->>'storage_path',
        'url', media[i]->>'url',
        'media_order', i - 1  -- Zero-based ordering
      );
    END LOOP;
  ELSE
    media_array := '[]'::jsonb;
  END IF;
  
  -- Create the new project object
  new_project := jsonb_build_object(
    'id', project_id,
    'title', title,
    'description', description,
    'project_order', project_order,
    'media', media_array
  );
  
  -- Add the new project to the projects array
  UPDATE profiles
  SET projects = COALESCE(projects, '[]'::jsonb) || new_project
  WHERE id = profile_id;
  
  RETURN new_project;
END;
$$;

-- 5. Create a function to update a project
CREATE OR REPLACE FUNCTION public.update_project(
  profile_id UUID,
  project_id UUID,
  title TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  media JSONB[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authorized BOOLEAN;
  current_projects JSONB;
  updated_projects JSONB := '[]'::jsonb;
  project JSONB;
  updated_project JSONB;
  found BOOLEAN := false;
  media_array JSONB;
BEGIN
  -- Check if the user is authorized to update projects for this profile
  authorized := (profile_id = auth.uid());
  
  IF NOT authorized THEN
    RAISE EXCEPTION 'Not authorized to update projects for this profile';
  END IF;
  
  -- Get current projects
  SELECT projects INTO current_projects
  FROM profiles
  WHERE id = profile_id;
  
  IF current_projects IS NULL OR jsonb_array_length(current_projects) = 0 THEN
    RAISE EXCEPTION 'No projects found for this profile';
  END IF;
  
  -- Process media if provided
  IF media IS NOT NULL AND array_length(media, 1) > 0 THEN
    media_array := '[]'::jsonb;
    FOR i IN 1..array_length(media, 1) LOOP
      media_array := media_array || jsonb_build_object(
        'id', COALESCE(media[i]->>'id', gen_random_uuid()),
        'media_type', media[i]->>'media_type',
        'storage_path', media[i]->>'storage_path',
        'url', media[i]->>'url',
        'media_order', i - 1  -- Zero-based ordering
      );
    END LOOP;
  END IF;
  
  -- Update the specific project
  FOR i IN 0..jsonb_array_length(current_projects) - 1 LOOP
    project := current_projects->i;
    
    IF project->>'id' = project_id::text THEN
      found := true;
      
      -- Create updated project with non-null values
      updated_project := project;
      
      IF title IS NOT NULL THEN
        updated_project := jsonb_set(updated_project, '{title}', to_jsonb(title));
      END IF;
      
      IF description IS NOT NULL THEN
        updated_project := jsonb_set(updated_project, '{description}', to_jsonb(description));
      END IF;
      
      IF media IS NOT NULL THEN
        updated_project := jsonb_set(updated_project, '{media}', media_array);
      END IF;
      
      updated_projects := updated_projects || updated_project;
    ELSE
      updated_projects := updated_projects || project;
    END IF;
  END LOOP;
  
  IF NOT found THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Update the profile with the updated projects array
  UPDATE profiles
  SET projects = updated_projects
  WHERE id = profile_id;
  
  -- Find and return the updated project
  FOR i IN 0..jsonb_array_length(updated_projects) - 1 LOOP
    project := updated_projects->i;
    IF project->>'id' = project_id::text THEN
      RETURN project;
    END IF;
  END LOOP;
  
  -- This should not happen if found is true
  RAISE EXCEPTION 'Could not retrieve updated project';
END;
$$;

-- 6. Create a function to delete a project
CREATE OR REPLACE FUNCTION public.delete_project(
  profile_id UUID,
  project_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authorized BOOLEAN;
  current_projects JSONB;
  updated_projects JSONB := '[]'::jsonb;
  project JSONB;
  found BOOLEAN := false;
BEGIN
  -- Check if the user is authorized to delete projects for this profile
  authorized := (profile_id = auth.uid());
  
  IF NOT authorized THEN
    RAISE EXCEPTION 'Not authorized to delete projects for this profile';
  END IF;
  
  -- Get current projects
  SELECT projects INTO current_projects
  FROM profiles
  WHERE id = profile_id;
  
  IF current_projects IS NULL OR jsonb_array_length(current_projects) = 0 THEN
    RAISE EXCEPTION 'No projects found for this profile';
  END IF;
  
  -- Create a new projects array without the project to delete
  FOR i IN 0..jsonb_array_length(current_projects) - 1 LOOP
    project := current_projects->i;
    
    IF project->>'id' = project_id::text THEN
      found := true;
    ELSE
      updated_projects := updated_projects || project;
    END IF;
  END LOOP;
  
  IF NOT found THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Update the profile with the updated projects array
  UPDATE profiles
  SET projects = updated_projects
  WHERE id = profile_id;
  
  RETURN true;
END;
$$;

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.get_full_profile(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.add_project(UUID, TEXT, TEXT, JSONB[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_project(UUID, UUID, TEXT, TEXT, JSONB[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_project(UUID, UUID) TO authenticated;

-- Keep the projects and project_media tables for reference but mark them as deprecated
COMMENT ON TABLE "public"."projects" IS 'DEPRECATED - Projects are now stored directly in the profiles table as a JSONB array';
COMMENT ON TABLE "public"."project_media" IS 'DEPRECATED - Project media is now stored within the projects JSONB array in the profiles table';

-- Add example projects as seed data
WITH example_projects AS (
  SELECT jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'title', 'Mobile App Development',
      'description', 'Developed a cross-platform app using React Native with Firebase backend',
      'project_order', 0,
      'media', jsonb_build_array(
        jsonb_build_object(
          'id', gen_random_uuid(),
          'media_type', 'image',
          'url', 'https://example.com/project1.jpg',
          'media_order', 0
        )
      )
    ),
    jsonb_build_object(
      'id', gen_random_uuid(),
      'title', 'E-commerce Website',
      'description', 'Built a full-stack e-commerce platform with Next.js and Supabase',
      'project_order', 1,
      'media', jsonb_build_array(
        jsonb_build_object(
          'id', gen_random_uuid(),
          'media_type', 'image',
          'url', 'https://example.com/project2.jpg',
          'media_order', 0
        )
      )
    )
  ) AS example_projects_json
)
UPDATE profiles p
SET projects = example_projects.example_projects_json
FROM example_projects
WHERE p.user_role = 'candidate' AND (p.projects IS NULL OR jsonb_array_length(p.projects) = 0);

COMMIT;
