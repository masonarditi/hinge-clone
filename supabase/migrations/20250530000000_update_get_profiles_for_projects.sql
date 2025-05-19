DROP FUNCTION IF EXISTS get_profiles(integer);

CREATE OR REPLACE FUNCTION get_profiles(
  page_size integer
)
RETURNS TABLE (
  id uuid,
  first_name text,
  age integer,
  height_cm integer,
  neighborhood text,
  children text,
  family_plan text,
  covid_vaccine text,
  zodiac_sign text,
  gender text, 
  sexuality text,
  ethnicities text[], 
  pets text[], 
  pronouns text[], 
  photos jsonb, 
  user_role text,
  answers jsonb,
  looking_for_roles text[],
  funding_stage text,
  offer_details jsonb,
  why_us_platform text,
  skills text[],
  projects jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id uuid;
  current_profile profiles%rowtype;
  like_status int := 2;
  match_status int := 4;
  unmatch_status int := 5;
  review_status int := 6;
BEGIN

SELECT profiles.id INTO v_profile_id 
FROM profiles WHERE profiles.user_id = auth.uid();
  
IF v_profile_id IS NULL THEN
  RAISE EXCEPTION 'profile not found for user %', auth.uid();
END IF;

SELECT * INTO current_profile 
FROM profiles WHERE profiles.id = v_profile_id;

RETURN QUERY
WITH filtered_profiles AS (
  SELECT p.*
  FROM profiles p
  WHERE p.id <> v_profile_id
    AND extract(year FROM age(p.dob)) BETWEEN current_profile.min_age AND current_profile.max_age
    AND extract(year FROM age(current_profile.dob)) BETWEEN p.min_age AND p.max_age
    AND st_dwithin(p.location, current_profile.location, current_profile.max_distance_km * 1000)
)
SELECT
  p.id,
  p.first_name,
  extract(year FROM age(p.dob))::int AS age,
  p.height_cm,
  p.neighborhood,
  children.name AS children,
  family_plans.name AS family_plan,
  covid_vaccine.name AS covid_vaccine,
  zodiac_signs.name AS zodiac_sign,
  genders.name AS gender,
  sexualities.name AS sexuality,
  (
    SELECT coalesce(array_agg(ethnicities.name), '{}')
    FROM profile_ethnicities
    LEFT JOIN ethnicities ON ethnicities.id = profile_ethnicities.ethnicity_id
    WHERE profile_ethnicities.profile_id = p.id
  ) AS ethnicities,
  (
    SELECT coalesce(array_agg(pets.name), '{}')
    FROM profile_pets
    LEFT JOIN pets ON pets.id = profile_pets.pet_id
    WHERE profile_pets.profile_id = p.id
  ) AS pets,
  (
    SELECT coalesce(array_agg(pronouns.name), '{}')
    FROM profile_pronouns
    LEFT JOIN pronouns ON pronouns.id = profile_pronouns.pronoun_id
    WHERE profile_pronouns.profile_id = p.id
  ) AS pronouns,
  (
    SELECT coalesce(jsonb_agg(json_build_object(
      'id', profile_photos.id, 
      'photo_url', profile_photos.photo_url, 
      'photo_order', profile_photos.photo_order
    ) ORDER BY profile_photos.photo_order)::jsonb, '[]'::jsonb ) 
    FROM profile_photos
    WHERE profile_photos.profile_id = p.id AND profile_photos.is_active = true
  ) AS photos,
  p.user_role,
  (
    SELECT coalesce(jsonb_agg(json_build_object(
      'id', profile_answers.id, 
      'answer_text', profile_answers.answer_text, 
      'answer_order', profile_answers.answer_order, 
      'question', prompts.question
    ) ORDER BY profile_answers.answer_order)::jsonb, '[]'::jsonb ) 
    FROM profile_answers
    LEFT JOIN prompts ON prompts.id = profile_answers.prompt_id
    WHERE profile_answers.profile_id = p.id AND profile_answers.is_active = true
  ) AS answers,
  p.looking_for_roles,
  p.funding_stage,
  p.offer_details,
  p.why_us_platform,
  p.skills,
  p.projects       -- Use the projects column directly from profiles table
FROM filtered_profiles p
LEFT JOIN children ON children.id = p.children_id
LEFT JOIN family_plans ON family_plans.id = p.family_plan_id
LEFT JOIN covid_vaccine ON covid_vaccine.id = p.covid_vaccine_id
LEFT JOIN zodiac_signs ON zodiac_signs.id = p.zodiac_sign_id
LEFT JOIN genders ON genders.id = p.gender_id
LEFT JOIN sexualities ON sexualities.id = p.sexuality_id
LEFT JOIN profile_gender_preferences pgp_cp ON pgp_cp.profile_id = v_profile_id
LEFT JOIN profile_gender_preferences pgp_p ON pgp_p.profile_id = p.id
LEFT JOIN profile_ethnicity_preferences pep_cp ON pep_cp.profile_id = v_profile_id
LEFT JOIN profile_ethnicity_preferences pep_p ON pep_p.profile_id = p.id
LEFT JOIN interactions i_cp ON i_cp.target_id = p.id AND i_cp.actor_id = v_profile_id
LEFT JOIN interactions i_p ON i_p.target_id = v_profile_id AND i_p.actor_id = p.id
WHERE (p.gender_id = pgp_cp.gender_id OR pgp_cp.gender_id IS NULL) 
  AND (current_profile.gender_id = pgp_p.gender_id OR pgp_p.gender_id IS NULL)
  AND (pep_cp.ethnicity_id IN (
    SELECT profile_ethnicities.ethnicity_id 
    FROM profile_ethnicities
    WHERE profile_ethnicities.profile_id = p.id
  ) OR pep_cp.ethnicity_id IS NULL)
  AND (pep_p.ethnicity_id IN (
    SELECT profile_ethnicities.ethnicity_id
    FROM profile_ethnicities
    WHERE profile_ethnicities.profile_id = v_profile_id
  ) OR pep_p.ethnicity_id IS NULL)
  AND (i_cp.status_id IS NULL OR i_cp.status_id IN (review_status, unmatch_status))
  AND (i_p.status_id IS NULL OR i_p.status_id NOT IN (like_status, match_status))
LIMIT get_profiles.page_size;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_profiles(integer) TO authenticated, anon;
