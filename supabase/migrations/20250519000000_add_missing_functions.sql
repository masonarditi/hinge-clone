BEGIN;

-- Add missing get_profile_skills function
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

-- Add missing update_candidate_skills function
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_profile_skills(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_skills(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.update_candidate_skills(UUID, TEXT[]) TO authenticated;

COMMIT; 