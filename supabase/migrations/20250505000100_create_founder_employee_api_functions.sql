-- Function to get a user's full profile with all related data
CREATE OR REPLACE FUNCTION public.get_full_profile(profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_data JSONB;
  skills_data JSONB;
  work_experience_data JSONB;
  projects_data JSONB;
BEGIN
  -- Get the profile data
  SELECT 
    jsonb_build_object(
      'id', p.id,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'one_line_description', p.one_line_description,
      'user_role', p.user_role,
      'profile_photos', (
        SELECT jsonb_agg(jsonb_build_object(
          'id', pp.id,
          'photo_url', pp.photo_url,
          'photo_order', pp.photo_order
        ))
        FROM profile_photos pp
        WHERE pp.profile_id = p.id AND pp.is_active = true
        ORDER BY pp.photo_order
      )
    ) INTO profile_data
  FROM profiles p
  WHERE p.id = profile_id;

  -- Get skills data
  SELECT 
    jsonb_agg(s.name)
  INTO skills_data
  FROM profile_skills ps
  JOIN skills s ON ps.skill_id = s.id
  WHERE ps.profile_id = profile_id;

  -- Get work experience data
  SELECT 
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
      we.start_date DESC
    )
  INTO work_experience_data
  FROM work_experiences we
  WHERE we.profile_id = profile_id;

  -- Get projects with their media
  SELECT 
    jsonb_agg(jsonb_build_object(
      'id', p.id,
      'title', p.title,
      'description', p.description,
      'project_order', p.project_order,
      'media', (
        SELECT jsonb_agg(jsonb_build_object(
          'id', pm.id,
          'media_type', pm.media_type,
          'storage_path', pm.storage_path,
          'url', pm.url,
          'media_order', pm.media_order
        ) ORDER BY pm.media_order)
        FROM project_media pm
        WHERE pm.project_id = p.id
      )
    ) ORDER BY p.project_order)
  INTO projects_data
  FROM projects p
  WHERE p.profile_id = profile_id;

  -- Combine all data
  RETURN jsonb_build_object(
    'profile', profile_data,
    'skills', skills_data,
    'work_experience', work_experience_data,
    'projects', projects_data
  );
END;
$$;

-- Make the function accessible to all authenticated users
GRANT EXECUTE ON FUNCTION public.get_full_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_full_profile(UUID) TO anon;

-- Function to update a user's skills
CREATE OR REPLACE FUNCTION public.update_profile_skills(profile_id UUID, skill_names TEXT[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authorized BOOLEAN;
BEGIN
  -- Check if the user is authorized to update this profile
  authorized := (profile_id = auth.uid());
  
  IF NOT authorized THEN
    RAISE EXCEPTION 'Not authorized to update skills for this profile';
  END IF;

  -- Delete existing skills
  DELETE FROM profile_skills
  WHERE profile_id = update_profile_skills.profile_id;
  
  -- Insert new skills, creating any that don't exist
  INSERT INTO profile_skills (profile_id, skill_id)
  SELECT 
    update_profile_skills.profile_id,
    s.id
  FROM unnest(skill_names) AS skill_name
  LEFT JOIN skills s ON s.name = skill_name
  WHERE s.id IS NOT NULL;
  
  -- For any new skills that don't exist, create them first
  WITH new_skills AS (
    SELECT DISTINCT skill_name
    FROM unnest(skill_names) AS skill_name
    WHERE NOT EXISTS (
      SELECT 1 FROM skills s
      WHERE s.name = skill_name
    )
  ),
  inserted_skills AS (
    INSERT INTO skills (name)
    SELECT skill_name FROM new_skills
    RETURNING id, name
  )
  INSERT INTO profile_skills (profile_id, skill_id)
  SELECT update_profile_skills.profile_id, id
  FROM inserted_skills;
END;
$$;

-- Make the function accessible to authenticated users
GRANT EXECUTE ON FUNCTION public.update_profile_skills(UUID, TEXT[]) TO authenticated;

-- Function to search for candidates based on skills
CREATE OR REPLACE FUNCTION public.search_candidates_by_skills(
  user_role TEXT,
  required_skills TEXT[],
  optional_skills TEXT[] DEFAULT NULL,
  limit_param INTEGER DEFAULT 20,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  profile_id UUID,
  first_name TEXT,
  last_name TEXT,
  one_line_description TEXT,
  profile_photo TEXT,
  skills TEXT[],
  skill_match_percentage NUMERIC,
  required_skills_matched TEXT[],
  optional_skills_matched TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidate_skills AS (
    -- Get all candidates of the specified role and their skills
    SELECT 
      p.id AS p_id,
      p.first_name,
      p.last_name,
      p.one_line_description,
      (
        SELECT photo_url
        FROM profile_photos pp
        WHERE pp.profile_id = p.id AND pp.is_active = true
        ORDER BY pp.photo_order
        LIMIT 1
      ) AS profile_photo,
      ARRAY_AGG(s.name) AS skills
    FROM profiles p
    JOIN profile_skills ps ON p.id = ps.profile_id
    JOIN skills s ON ps.skill_id = s.id
    WHERE p.user_role = search_candidates_by_skills.user_role
    GROUP BY p.id
  ),
  matched_candidates AS (
    -- Match candidates against required and optional skills
    SELECT 
      cs.p_id,
      cs.first_name,
      cs.last_name,
      cs.one_line_description,
      cs.profile_photo,
      cs.skills,
      ARRAY(
        SELECT sk 
        FROM unnest(required_skills) AS sk
        WHERE sk = ANY(cs.skills)
      ) AS required_matched,
      CASE 
        WHEN optional_skills IS NULL THEN ARRAY[]::TEXT[]
        ELSE ARRAY(
          SELECT sk 
          FROM unnest(optional_skills) AS sk
          WHERE sk = ANY(cs.skills)
        )
      END AS optional_matched,
      -- Calculate match percentage
      CASE 
        WHEN array_length(required_skills, 1) = 0 THEN 0
        ELSE (
          ARRAY_LENGTH(
            ARRAY(
              SELECT sk 
              FROM unnest(required_skills) AS sk
              WHERE sk = ANY(cs.skills)
            ), 
            1
          )::NUMERIC / 
          ARRAY_LENGTH(required_skills, 1)::NUMERIC * 100.0
        )
      END +
      CASE 
        WHEN optional_skills IS NULL OR array_length(optional_skills, 1) = 0 THEN 0
        ELSE (
          ARRAY_LENGTH(
            ARRAY(
              SELECT sk 
              FROM unnest(optional_skills) AS sk
              WHERE sk = ANY(cs.skills)
            ), 
            1
          )::NUMERIC / 
          ARRAY_LENGTH(optional_skills, 1)::NUMERIC * 25.0 -- Optional skills are worth less
        )
      END AS total_match_percentage
    FROM candidate_skills cs
  )
  SELECT 
    mc.p_id AS profile_id,
    mc.first_name,
    mc.last_name,
    mc.one_line_description,
    mc.profile_photo,
    mc.skills,
    LEAST(mc.total_match_percentage, 100.0) AS skill_match_percentage,
    mc.required_matched AS required_skills_matched,
    mc.optional_matched AS optional_skills_matched
  FROM matched_candidates mc
  -- Only return candidates matching at least one required skill
  WHERE array_length(mc.required_matched, 1) > 0 OR array_length(required_skills, 1) = 0
  ORDER BY 
    array_length(mc.required_matched, 1) DESC,
    mc.total_match_percentage DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Make the function accessible to authenticated users (typically founders)
GRANT EXECUTE ON FUNCTION public.search_candidates_by_skills(TEXT, TEXT[], TEXT[], INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_candidates_by_skills(TEXT, TEXT[], TEXT[], INTEGER, INTEGER) TO anon;

-- Function to update a user's basic profile info
CREATE OR REPLACE FUNCTION public.update_profile_info(
  profile_id UUID,
  first_name TEXT DEFAULT NULL,
  last_name TEXT DEFAULT NULL,
  one_line_description TEXT DEFAULT NULL,
  user_role TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authorized BOOLEAN;
  updated_profile JSONB;
BEGIN
  -- Check if the user is authorized to update this profile
  authorized := (profile_id = auth.uid());
  
  IF NOT authorized THEN
    RAISE EXCEPTION 'Not authorized to update this profile';
  END IF;

  -- Update profile with non-null values
  UPDATE profiles p
  SET
    first_name = COALESCE(update_profile_info.first_name, p.first_name),
    last_name = COALESCE(update_profile_info.last_name, p.last_name),
    one_line_description = COALESCE(update_profile_info.one_line_description, p.one_line_description),
    user_role = CASE
      WHEN update_profile_info.user_role IS NOT NULL AND 
           update_profile_info.user_role IN ('startup', 'user')
      THEN update_profile_info.user_role
      ELSE p.user_role
    END,
    updated_at = now()
  WHERE p.id = profile_id
  RETURNING jsonb_build_object(
    'id', p.id,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'one_line_description', p.one_line_description,
    'user_role', p.user_role,
    'updated_at', p.updated_at
  ) INTO updated_profile;
  
  RETURN updated_profile;
END;
$$;

-- Make the function accessible to authenticated users
GRANT EXECUTE ON FUNCTION public.update_profile_info(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Function to add a new project with media
CREATE OR REPLACE FUNCTION public.add_project(
  profile_id UUID,
  title TEXT,
  description TEXT,
  media JSONB[] DEFAULT NULL -- Array of {media_type, url/storage_path}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authorized BOOLEAN;
  project_id UUID;
  media_item JSONB;
  project_order INTEGER;
  project_data JSONB;
BEGIN
  -- Check if the user is authorized to add a project to this profile
  authorized := (profile_id = auth.uid());
  
  IF NOT authorized THEN
    RAISE EXCEPTION 'Not authorized to add projects for this profile';
  END IF;
  
  -- Get the next project order for this profile
  SELECT COALESCE(MAX(project_order) + 1, 0)
  INTO project_order
  FROM projects
  WHERE profile_id = add_project.profile_id;

  -- Insert the new project
  INSERT INTO projects (profile_id, title, description, project_order)
  VALUES (profile_id, title, description, project_order)
  RETURNING id INTO project_id;
  
  -- Insert the media items if provided
  IF media IS NOT NULL AND array_length(media, 1) > 0 THEN
    FOR i IN 1..array_length(media, 1) LOOP
      media_item := media[i];
      
      INSERT INTO project_media (
        project_id,
        media_type,
        storage_path,
        url,
        media_order
      )
      VALUES (
        project_id,
        media_item->>'media_type',
        media_item->>'storage_path',
        media_item->>'url',
        i - 1 -- Zero-based ordering
      );
    END LOOP;
  END IF;
  
  -- Return the created project with its media
  SELECT jsonb_build_object(
    'id', p.id,
    'title', p.title,
    'description', p.description,
    'project_order', p.project_order,
    'created_at', p.created_at,
    'media', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', pm.id,
        'media_type', pm.media_type,
        'storage_path', pm.storage_path,
        'url', pm.url,
        'media_order', pm.media_order
      ) ORDER BY pm.media_order)
      FROM project_media pm
      WHERE pm.project_id = p.id),
      '[]'::jsonb
    )
  )
  INTO project_data
  FROM projects p
  WHERE p.id = project_id;
  
  RETURN project_data;
END;
$$;

-- Make the function accessible to authenticated users
GRANT EXECUTE ON FUNCTION public.add_project(UUID, TEXT, TEXT, JSONB[]) TO authenticated;

-- Function to add work experience
CREATE OR REPLACE FUNCTION public.add_work_experience(
  profile_id UUID,
  company_name TEXT,
  role TEXT,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  is_current BOOLEAN DEFAULT false,
  industry TEXT DEFAULT NULL,
  campaign_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authorized BOOLEAN;
  experience_id UUID;
  experience_data JSONB;
BEGIN
  -- Check if the user is authorized to add work experience to this profile
  authorized := (profile_id = auth.uid());
  
  IF NOT authorized THEN
    RAISE EXCEPTION 'Not authorized to add work experience for this profile';
  END IF;
  
  -- If is_current is true, end_date should be NULL
  IF is_current THEN
    end_date := NULL;
  END IF;
  
  -- Insert the new work experience
  INSERT INTO work_experiences (
    profile_id,
    company_name,
    role,
    start_date,
    end_date,
    is_current,
    industry,
    campaign_name
  )
  VALUES (
    profile_id,
    company_name,
    role,
    start_date,
    end_date,
    is_current,
    industry,
    campaign_name
  )
  RETURNING id INTO experience_id;
  
  -- Return the created work experience
  SELECT jsonb_build_object(
    'id', we.id,
    'company_name', we.company_name,
    'role', we.role,
    'start_date', we.start_date,
    'end_date', we.end_date,
    'is_current', we.is_current,
    'industry', we.industry,
    'campaign_name', we.campaign_name,
    'created_at', we.created_at
  )
  INTO experience_data
  FROM work_experiences we
  WHERE we.id = experience_id;
  
  RETURN experience_data;
END;
$$;

-- Make the function accessible to authenticated users
GRANT EXECUTE ON FUNCTION public.add_work_experience(UUID, TEXT, TEXT, DATE, DATE, BOOLEAN, TEXT, TEXT) TO authenticated; 