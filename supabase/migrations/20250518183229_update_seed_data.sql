BEGIN;

-- Create users in auth.users first if they don't exist (this is a mock since we can't directly insert into auth.users in migrations)
-- In a real scenario, you'd create these users through the Supabase Auth API or dashboard
-- For now, we'll use existing users in the system

-- We need to query for existing user_ids to use for our profiles
-- This ensures we don't violate the foreign key constraint
WITH existing_users AS (
  SELECT user_id FROM profiles LIMIT 6
), user_ids AS (
  SELECT 
    user_id,
    ROW_NUMBER() OVER() as row_num
  FROM existing_users
)

-- Insert startup and candidate profiles in a single transaction
-- Insert startups
INSERT INTO profiles (id, user_id, first_name, last_name, user_role, one_line_description, funding_stage, looking_for_roles, offer_details, why_us_platform)
SELECT 
  uuid_generate_v4(),  -- Generate random UUIDs
  user_id,
  CASE 
    WHEN row_num = 1 THEN 'TechNova'
    WHEN row_num = 2 THEN 'GreenEarth'
    ELSE 'HealthPulse'
  END,
  NULL,
  'startup',
  CASE 
    WHEN row_num = 1 THEN 'AI-powered data analytics platform revolutionizing business intelligence'
    WHEN row_num = 2 THEN 'Sustainable agtech solutions for the modern farmer'
    ELSE 'Personalized healthcare platform connecting patients with specialists'
  END,
  CASE 
    WHEN row_num = 1 THEN 'Series A'
    WHEN row_num = 2 THEN 'Seed'
    ELSE 'Pre-seed'
  END,
  CASE 
    WHEN row_num = 1 THEN ARRAY['Technical co-founder', 'Full-stack developer', 'AI/ML engineer']
    WHEN row_num = 2 THEN ARRAY['Creative director', 'React Native developer', 'Project manager']
    ELSE ARRAY['Technical co-founder', 'UI/UX designer', 'Backend developer']
  END,
  CASE 
    WHEN row_num = 1 THEN '{"equity": "2-5%", "salary_range": "120k-150k"}'::jsonb
    WHEN row_num = 2 THEN '{"equity": "3-8%", "salary_range": "90k-130k"}'::jsonb
    ELSE '{"equity": "10-20%", "salary_range": "70k-110k"}'::jsonb
  END,
  CASE 
    WHEN row_num = 1 THEN 'Join our mission to democratize data analytics for businesses of all sizes'
    WHEN row_num = 2 THEN 'Make a real impact on climate change while building cutting-edge technology'
    ELSE 'Help us build the future of healthcare accessibility and patient empowerment'
  END
FROM user_ids
WHERE row_num <= 3;

-- Add the necessary skills for matching - check if they don't exist first
DO $$
DECLARE
    skill_names TEXT[] := ARRAY['React', 'Node.js', 'Python', 'UI/UX Design', 'Figma', 'Machine Learning', 
                              'Data Science', 'React Native', 'Project Management', 'Full-stack developer',
                              'Technical co-founder', 'Creative director', 'Backend developer', 'AI/ML engineer'];
    skill_name TEXT;
BEGIN
    FOREACH skill_name IN ARRAY skill_names
    LOOP
        IF NOT EXISTS (SELECT 1 FROM skills WHERE name = skill_name) THEN
            INSERT INTO skills (id, name) VALUES (uuid_generate_v4(), skill_name);
        END IF;
    END LOOP;
END $$;

-- Now get another set of user IDs for candidates
WITH existing_users AS (
  SELECT user_id FROM profiles WHERE id NOT IN (SELECT id FROM profiles WHERE user_role = 'startup') LIMIT 3
), user_ids AS (
  SELECT 
    user_id,
    ROW_NUMBER() OVER() as row_num
  FROM existing_users
)
-- Insert candidates
INSERT INTO profiles (id, user_id, first_name, last_name, user_role, one_line_description)
SELECT 
  uuid_generate_v4(),  -- Generate random UUIDs
  user_id,
  CASE 
    WHEN row_num = 1 THEN 'Alex'
    WHEN row_num = 2 THEN 'Jordan'
    ELSE 'Taylor'
  END,
  CASE 
    WHEN row_num = 1 THEN 'Johnson'
    WHEN row_num = 2 THEN 'Chen'
    ELSE 'Smith'
  END,
  'candidate',
  CASE 
    WHEN row_num = 1 THEN 'Experienced full-stack developer with a passion for clean code'
    WHEN row_num = 2 THEN 'UI/UX designer with 5+ years of experience in fintech and healthcare'
    ELSE 'AI/ML engineer specializing in computer vision and natural language processing'
  END
FROM user_ids;

-- Now that we have our profiles, let's add photos, skills, etc.
-- Since we've generated random UUIDs, we need to query for the IDs

-- Add profile photos for startups
WITH startup_profiles AS (
  SELECT id FROM profiles WHERE user_role = 'startup' ORDER BY created_at DESC LIMIT 3
), startup_data AS (
  SELECT 
    id,
    ROW_NUMBER() OVER() as row_num
  FROM startup_profiles
)
INSERT INTO profile_photos (id, profile_id, photo_url, photo_order, is_active)
SELECT 
  uuid_generate_v4(),  -- Generate random UUIDs
  id,
  CASE 
    WHEN row_num = 1 THEN 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0'
    WHEN row_num = 2 THEN 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf'
    ELSE 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'
  END,
  1,
  true
FROM startup_data;

-- Add profile photos for candidates
WITH candidate_profiles AS (
  SELECT id FROM profiles WHERE user_role = 'candidate' ORDER BY created_at DESC LIMIT 3
), candidate_data AS (
  SELECT 
    id,
    ROW_NUMBER() OVER() as row_num
  FROM candidate_profiles
)
INSERT INTO profile_photos (id, profile_id, photo_url, photo_order, is_active)
SELECT 
  uuid_generate_v4(),  -- Generate random UUIDs
  id,
  CASE 
    WHEN row_num = 1 THEN 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5'
    WHEN row_num = 2 THEN 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'
    ELSE 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'
  END,
  1,
  true
FROM candidate_data;

-- Associate skills with candidates - using skill names instead of IDs
WITH candidate_profiles AS (
  SELECT id FROM profiles WHERE user_role = 'candidate' ORDER BY created_at DESC LIMIT 3
), candidate_data AS (
  SELECT 
    id,
    ROW_NUMBER() OVER() as row_num
  FROM candidate_profiles
), candidate_skills AS (
  SELECT 
    c.id AS profile_id,
    c.row_num,
    s.id AS skill_id
  FROM candidate_data c
  CROSS JOIN LATERAL (
    SELECT id 
    FROM skills 
    WHERE
      (c.row_num = 1 AND name IN ('React', 'Node.js', 'React Native', 'Full-stack developer')) OR
      (c.row_num = 2 AND name IN ('UI/UX Design', 'Figma', 'React', 'Creative director')) OR
      (c.row_num = 3 AND name IN ('Python', 'Machine Learning', 'Data Science'))
  ) s
)
INSERT INTO profile_skills (profile_id, skill_id)
SELECT profile_id, skill_id
FROM candidate_skills
ON CONFLICT (profile_id, skill_id) DO NOTHING;

-- Add work experience for candidates
WITH candidate_profiles AS (
  SELECT id FROM profiles WHERE user_role = 'candidate' ORDER BY created_at DESC LIMIT 3
), candidate_data AS (
  SELECT 
    id,
    ROW_NUMBER() OVER() as row_num
  FROM candidate_profiles
)
INSERT INTO work_experiences (id, profile_id, company_name, role, start_date, end_date, is_current, industry)
SELECT 
  uuid_generate_v4(),  -- Generate random UUIDs for first job
  id,
  CASE 
    WHEN row_num = 1 THEN 'Tech Solutions Inc.'
    WHEN row_num = 2 THEN 'DesignHub'
    ELSE 'DataWave Analytics'
  END,
  CASE 
    WHEN row_num = 1 THEN 'Senior Developer'
    WHEN row_num = 2 THEN 'UI/UX Designer'
    ELSE 'Data Scientist'
  END,
  CASE 
    WHEN row_num = 1 THEN '2019-06-01'::date
    WHEN row_num = 2 THEN '2018-03-10'::date
    ELSE '2017-07-15'::date
  END,
  CASE 
    WHEN row_num = 1 THEN '2021-12-31'::date
    WHEN row_num = 2 THEN '2020-08-15'::date
    ELSE '2020-05-30'::date
  END,
  false,
  CASE 
    WHEN row_num = 1 THEN 'Technology'
    WHEN row_num = 2 THEN 'Design'
    ELSE 'Data Analytics'
  END
FROM candidate_data
UNION ALL
SELECT 
  uuid_generate_v4(),  -- Generate random UUIDs for second job
  id,
  CASE 
    WHEN row_num = 1 THEN 'Innovate Labs'
    WHEN row_num = 2 THEN 'HealthTech Solutions'
    ELSE 'AI Innovations'
  END,
  CASE 
    WHEN row_num = 1 THEN 'Lead Engineer'
    WHEN row_num = 2 THEN 'Senior Product Designer'
    ELSE 'ML Engineer'
  END,
  CASE 
    WHEN row_num = 1 THEN '2022-01-15'::date
    WHEN row_num = 2 THEN '2020-09-01'::date
    ELSE '2020-06-15'::date
  END,
  NULL,
  true,
  CASE 
    WHEN row_num = 1 THEN 'Software'
    WHEN row_num = 2 THEN 'Healthcare Technology'
    ELSE 'Artificial Intelligence'
  END
FROM candidate_data;

-- Add projects for candidates
WITH candidate_profiles AS (
  SELECT id FROM profiles WHERE user_role = 'candidate' ORDER BY created_at DESC LIMIT 3
), candidate_data AS (
  SELECT 
    id,
    ROW_NUMBER() OVER() as row_num
  FROM candidate_profiles
)
INSERT INTO projects (id, profile_id, title, description, project_order)
SELECT 
  uuid_generate_v4(),  -- Generate random UUIDs for first project
  id,
  CASE 
    WHEN row_num = 1 THEN 'E-commerce Platform'
    WHEN row_num = 2 THEN 'Healthcare Dashboard'
    ELSE 'Sentiment Analysis Tool'
  END,
  CASE 
    WHEN row_num = 1 THEN 'Built a scalable e-commerce platform with React, Node.js, and MongoDB.'
    WHEN row_num = 2 THEN 'Designed an intuitive dashboard for healthcare professionals to monitor patient data.'
    ELSE 'Built a machine learning model to analyze customer feedback sentiment with 91% accuracy.'
  END,
  1
FROM candidate_data
UNION ALL
SELECT 
  uuid_generate_v4(),  -- Generate random UUIDs for second project
  id,
  CASE 
    WHEN row_num = 1 THEN 'Mobile Banking App'
    WHEN row_num = 2 THEN 'Fitness App Redesign'
    ELSE 'Computer Vision System'
  END,
  CASE 
    WHEN row_num = 1 THEN 'Developed a secure banking application using React Native and Firebase.'
    WHEN row_num = 2 THEN 'Completely reimagined the user experience for a popular fitness tracking application.'
    ELSE 'Developed a computer vision system for manufacturing quality control.'
  END,
  2
FROM candidate_data;

-- Add project media using dynamic project IDs
WITH project_data AS (
  SELECT id, profile_id, ROW_NUMBER() OVER() as row_num 
  FROM projects 
  ORDER BY created_at DESC 
  LIMIT 6
)
INSERT INTO project_media (id, project_id, media_type, url, media_order)
SELECT 
  uuid_generate_v4(),  -- Generate random UUIDs
  id,
  'image',
  CASE 
    WHEN row_num = 1 THEN 'https://images.unsplash.com/photo-1661956602944-249bcd04b63f'
    WHEN row_num = 2 THEN 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f'
    WHEN row_num = 3 THEN 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0'
    WHEN row_num = 4 THEN 'https://images.unsplash.com/photo-1576678927484-cc907957088c'
    WHEN row_num = 5 THEN 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
    ELSE 'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb'
  END,
  1
FROM project_data;

COMMIT;
