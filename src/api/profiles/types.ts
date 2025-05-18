import { Profile } from "@/types/profile";

export interface PublicProfile extends Profile {
  distance_km: number;
  age: number | null;
}

export interface Like {
  id: string;
  created_at: string;
  status_id: number;
  actor_id: string;
  target_id: string;
  compatibility_score: number;
  first_name: string;
  photo_url: string | null;
  user_role: "startup" | "candidate";
  one_line_description: string | null;
}

export interface Match {
  id: string;
  created_at: string;
  actor_id: string;
  target_id: string;
  first_name: string;
  photo_url: string | null;
  user_role: "startup" | "candidate";
  one_line_description: string | null;
}

export interface Answer {
  id: string;
  question: string;
  answer_text: string;
  answer_order: number;
}

export interface Photo {
  id: string;
  photo_url: string;
  photo_order: number;
}
