export interface Profile {
  id: string;
  first_name: string;
  last_name?: string;
  user_role: "startup" | "candidate";
  one_line_description?: string;
  photos: Photo[];
  answers: Answer[];
  traits: Trait[];
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
  // Matching fields
  compatibility_score?: number;
}

export interface Trait {
  key: string;
  icon: string;
  label: string | null;
}

export interface Photo {
  id: string;
  photo_url: string;
  photo_order: number;
}

export interface Answer {
  id: string;
  question: string;
  answer_text: string;
  answer_order: number;
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
