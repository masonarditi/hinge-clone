export interface PrivateProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_role: "startup" | "candidate";
  one_line_description?: string;
  answers: Answer[];
  photos: Photo[];
  avatar_url: string;

  // Startup specific fields
  funding_stage?: string;
  looking_for_roles?: string[];
  offer_details?: {
    equity: string;
    salary_range: string;
  };
  why_us_platform?: string;

  // Candidate specific fields
  skills?: string[];
  work_experiences?: WorkExperience[];
  projects?: Project[];

  // Legacy dating app fields (keeping for backward compatibility)
  dob?: string;
  height_cm?: number;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  max_distance_km?: number;
  min_age?: number;
  max_age?: number;
  children?: Option | null;
  family_plan?: Option | null;
  covid_vaccine?: Option | null;
  zodiac_sign?: Option | null;
  sexuality?: Option | null;
  gender?: Option | null;
  ethnicities?: Option[];
  pets?: Option[];
  pronouns?: Option[];
  ethnicity_preferences?: Option[];
  gender_preferences?: Option[];
}

export interface Photo {
  id: string;
  photo_url: string;
  photo_order: number;
}

export interface Answer {
  id: string;
  question: string;
  prompt_id: number;
  answer_text: string;
  answer_order: number;
}

export interface Option {
  id: number;
  name: string;
  plural_name?: string;
}

export interface WorkExperience {
  id: string;
  company_name: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  industry: string;
  campaign_name?: string; // For creatives
}

export interface Project {
  id: string;
  title: string;
  description: string;
  project_order: number;
  media?: ProjectMedia[];
}

export interface ProjectMedia {
  id: string;
  media_type: string;
  url: string;
  media_order: number;
}
