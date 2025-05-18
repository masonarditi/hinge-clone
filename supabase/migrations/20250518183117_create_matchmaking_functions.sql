BEGIN;

-- First, let's add a compatibility_score column to the interactions table if it doesn't exist
ALTER TABLE "public"."interactions" 
  ADD COLUMN IF NOT EXISTS "compatibility_score" NUMERIC;

-- Function to calculate compatibility score between a candidate and a startup
CREATE OR REPLACE FUNCTION public.calculate_compatibility_score(startup_id UUID, candidate_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  startup_record RECORD;
  candidate_skills TEXT[];
  matching_skills_count INT;
  compatibility NUMERIC;
BEGIN
  -- Get startup looking_for_roles
  SELECT looking_for_roles INTO startup_record
  FROM profiles
  WHERE id = startup_id AND user_role = 'startup';
  
  -- Get candidate skills
  SELECT ARRAY(
    SELECT s.name
    FROM profile_skills ps
    JOIN skills s ON ps.skill_id = s.id
    WHERE ps.profile_id = candidate_id
  ) INTO candidate_skills;
  
  -- Count matching skills (simple implementation)
  SELECT COUNT(*) INTO matching_skills_count
  FROM (
    SELECT unnest(startup_record.looking_for_roles) AS role
    INTERSECT
    SELECT unnest(candidate_skills) AS role
  ) AS matching;
  
  -- Calculate score (0-10 scale)
  -- This is a simple implementation - can be enhanced with more sophisticated algorithms
  IF array_length(startup_record.looking_for_roles, 1) > 0 THEN
    compatibility := (matching_skills_count::NUMERIC / array_length(startup_record.looking_for_roles, 1)::NUMERIC) * 10;
  ELSE
    compatibility := 5; -- Default middle score if no roles specified
  END IF;
  
  -- Ensure score is between 0 and 10
  compatibility := GREATEST(0, LEAST(10, compatibility));
  
  RETURN compatibility;
END;
$$;

-- Function to search startups by candidate needs
CREATE OR REPLACE FUNCTION public.search_startups_by_needs(
  p_candidate_id UUID,
  p_funding_stage TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  one_line_description TEXT,
  funding_stage TEXT,
  looking_for_roles TEXT[],
  offer_details JSONB,
  why_us_platform TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ,
  compatibility_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  candidate_skills TEXT[];
BEGIN
  -- Get the candidate's skills
  SELECT ARRAY(
    SELECT s.name
    FROM profile_skills ps
    JOIN skills s ON ps.skill_id = s.id
    WHERE ps.profile_id = p_candidate_id
  ) INTO candidate_skills;

  -- Return startups filtered based on input parameters
  RETURN QUERY
  WITH filtered_startups AS (
    SELECT 
      p.id,
      p.first_name,
      p.one_line_description,
      p.funding_stage,
      p.looking_for_roles,
      p.offer_details,
      p.why_us_platform,
      (SELECT photo_url FROM profile_photos pp WHERE pp.profile_id = p.id AND pp.is_active = true ORDER BY pp.photo_order LIMIT 1) AS profile_photo_url,
      p.created_at,
      public.calculate_compatibility_score(p.id, p_candidate_id) AS compatibility_score
    FROM profiles p
    WHERE 
      p.user_role = 'startup'
      AND p.id <> p_candidate_id -- Exclude own profile if somehow it's of type startup
      AND (p_funding_stage IS NULL OR p.funding_stage = p_funding_stage)
      AND NOT EXISTS (
        -- Exclude startups the candidate has already interacted with
        SELECT 1 FROM interactions i
        WHERE 
          i.actor_id = p_candidate_id
          AND i.target_id = p.id
      )
  )
  SELECT * FROM filtered_startups
  ORDER BY 
    -- Prioritize startups that are looking for skills the candidate has
    (
      SELECT COUNT(*) 
      FROM unnest(looking_for_roles) role
      WHERE role = ANY(candidate_skills)
    ) DESC,
    compatibility_score DESC,
    created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to search candidates by startup needs
CREATE OR REPLACE FUNCTION public.search_candidates_by_needs(
  p_startup_id UUID,
  p_role_needed TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  one_line_description TEXT,
  skills TEXT[],
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ,
  compatibility_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  startup_looking_for TEXT[];
BEGIN
  -- Get what the startup is looking for
  SELECT looking_for_roles INTO startup_looking_for
  FROM profiles
  WHERE id = p_startup_id AND user_role = 'startup';

  -- Return candidates filtered based on input parameters
  RETURN QUERY
  WITH candidate_skills AS (
    SELECT 
      ps.profile_id,
      array_agg(s.name) AS skills
    FROM profile_skills ps
    JOIN skills s ON ps.skill_id = s.id
    GROUP BY ps.profile_id
  ),
  filtered_candidates AS (
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.one_line_description,
      COALESCE(cs.skills, '{}'::text[]) AS skills,
      (SELECT photo_url FROM profile_photos pp WHERE pp.profile_id = p.id AND pp.is_active = true ORDER BY pp.photo_order LIMIT 1) AS profile_photo_url,
      p.created_at,
      public.calculate_compatibility_score(p_startup_id, p.id) AS compatibility_score
    FROM profiles p
    LEFT JOIN candidate_skills cs ON p.id = cs.profile_id
    WHERE 
      p.user_role = 'candidate'
      AND p.id <> p_startup_id -- Exclude own profile if somehow it's of type candidate
      AND (p_role_needed IS NULL OR p_role_needed = ANY(cs.skills))
      AND NOT EXISTS (
        -- Exclude candidates the startup has already interacted with
        SELECT 1 FROM interactions i
        WHERE 
          i.actor_id = p_startup_id
          AND i.target_id = p.id
      )
  )
  SELECT * FROM filtered_candidates
  ORDER BY 
    -- Prioritize candidates that have skills the startup is looking for
    (
      SELECT COUNT(*) 
      FROM unnest(startup_looking_for) role
      WHERE role = ANY(skills)
    ) DESC,
    compatibility_score DESC,
    created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Update the like_profile function to handle startup-candidate matching
CREATE OR REPLACE FUNCTION public.like_profile(target_id UUID)
RETURNS TABLE(
  id UUID,
  status_id SMALLINT,
  compatibility_score NUMERIC,
  is_match BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID;
  v_actor_role TEXT;
  v_target_role TEXT;
  v_status_id SMALLINT := 2; -- status_id = 2 represents 'like' in existing schema
  v_match BOOLEAN := FALSE;
  v_compatibility_score NUMERIC;
  v_interaction_id UUID;
  v_interaction_record RECORD;
BEGIN
  -- Get the ID of the current user
  v_actor_id := auth.uid();
  
  -- Get the roles of both users
  SELECT user_role INTO v_actor_role FROM profiles WHERE user_id = v_actor_id;
  SELECT user_role INTO v_target_role FROM profiles WHERE id = target_id;
  
  -- Check if a reverse interaction exists (target has already liked the actor)
  SELECT i.id, i.status_id INTO v_interaction_record
  FROM interactions i
  JOIN profiles p_actor ON i.actor_id = p_actor.id
  JOIN profiles p_target ON i.target_id = p_target.id
  WHERE i.actor_id = target_id
    AND i.target_id = (SELECT id FROM profiles WHERE user_id = v_actor_id)
    AND i.status_id = 2; -- 'like' status
  
  -- Calculate compatibility score
  IF v_actor_role = 'startup' AND v_target_role = 'candidate' THEN
    SELECT calculate_compatibility_score(
      (SELECT id FROM profiles WHERE user_id = v_actor_id),
      target_id
    ) INTO v_compatibility_score;
  ELSIF v_actor_role = 'candidate' AND v_target_role = 'startup' THEN
    SELECT calculate_compatibility_score(
      target_id,
      (SELECT id FROM profiles WHERE user_id = v_actor_id)
    ) INTO v_compatibility_score;
  ELSE
    -- Default score if roles don't match the expected pattern
    v_compatibility_score := 5;
  END IF;
  
  -- Insert the new interaction
  INSERT INTO interactions(actor_id, target_id, status_id, compatibility_score)
  VALUES (
    (SELECT id FROM profiles WHERE user_id = v_actor_id),
    target_id,
    v_status_id,
    v_compatibility_score
  )
  RETURNING id INTO v_interaction_id;
  
  -- If there's a reverse 'like', it's a match!
  IF v_interaction_record.id IS NOT NULL THEN
    -- Update both interactions to 'match' status (3)
    UPDATE interactions SET status_id = 3 WHERE id = v_interaction_id OR id = v_interaction_record.id;
    v_status_id := 3;
    v_match := TRUE;
    
    -- Create a chat channel for the match if a chat.create_channel function exists
    BEGIN
      PERFORM 'chat.create_channel'::regproc;
      -- If the function exists, call it (commented out to avoid errors if it doesn't exist)
      -- PERFORM chat.create_channel(
      --   (SELECT id FROM profiles WHERE user_id = v_actor_id),
      --   target_id
      -- );
    EXCEPTION WHEN undefined_function THEN
      -- Function doesn't exist, that's okay
      NULL;
    END;
  END IF;
  
  -- Return the result
  RETURN QUERY
  SELECT 
    v_interaction_id,
    v_status_id,
    v_compatibility_score,
    v_match;
END;
$$;

-- Update skill functions for candidates
CREATE OR REPLACE FUNCTION public.update_candidate_skills(
  p_profile_id UUID,
  p_skill_names TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_skill_id UUID;
  v_skill_name TEXT;
BEGIN
  -- Clear existing skills for this profile
  DELETE FROM profile_skills WHERE profile_id = p_profile_id;
  
  -- Add each skill
  FOREACH v_skill_name IN ARRAY p_skill_names
  LOOP
    -- Check if skill exists
    SELECT id INTO v_skill_id FROM skills WHERE name = v_skill_name;
    
    -- If skill doesn't exist, create it
    IF v_skill_id IS NULL THEN
      INSERT INTO skills (name) VALUES (v_skill_name) RETURNING id INTO v_skill_id;
    END IF;
    
    -- Add the profile-skill relationship
    INSERT INTO profile_skills (profile_id, skill_id) 
    VALUES (p_profile_id, v_skill_id)
    ON CONFLICT (profile_id, skill_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_compatibility_score(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_startups_by_needs(UUID, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_candidates_by_needs(UUID, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.like_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_candidate_skills(UUID, TEXT[]) TO authenticated;

COMMIT;
