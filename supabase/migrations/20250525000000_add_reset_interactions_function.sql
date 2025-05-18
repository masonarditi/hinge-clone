-- 20250525000000_add_reset_interactions_function.sql
CREATE OR REPLACE FUNCTION public.reset_profile_interactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- Get the current user's profile ID
  SELECT id INTO v_profile_id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid();
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user %', auth.uid();
  END IF;
  
  -- Delete all interactions where the user is the actor
  DELETE FROM interactions
  WHERE actor_id = v_profile_id;
  
  -- Could also reset interactions where user is the target
  -- Uncomment if you want complete reset:
  -- DELETE FROM interactions
  -- WHERE target_id = v_profile_id;
END;
$$;
