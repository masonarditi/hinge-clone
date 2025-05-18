import { PrivateProfile } from "@/api/my-profile/types";
import { PublicProfile } from "@/api/profiles/types";
import { Profile } from "@/types/profile";

// New traits mapping for the startup job matching platform
const traitsMapping = [
  {
    key: "funding_stage",
    icon: "trending-up",
    privateLabel: (profile: PrivateProfile) => profile.funding_stage,
    publicLabel: (profile: PublicProfile) => profile.funding_stage,
  },
  {
    key: "skills",
    icon: "code-slash",
    privateLabel: (profile: PrivateProfile) =>
      profile.skills && profile.skills.length > 0
        ? `${profile.skills.length} skills`
        : null,
    publicLabel: (profile: PublicProfile) =>
      profile.skills && profile.skills.length > 0
        ? `${profile.skills.length} skills`
        : null,
  },
  {
    key: "looking_for_roles",
    icon: "people-outline",
    privateLabel: (profile: PrivateProfile) =>
      profile.looking_for_roles && profile.looking_for_roles.length > 0
        ? `${profile.looking_for_roles.length} roles`
        : null,
    publicLabel: (profile: PublicProfile) =>
      profile.looking_for_roles && profile.looking_for_roles.length > 0
        ? `${profile.looking_for_roles.length} roles`
        : null,
  },
];

export const transformPrivateProfile = (profile: PrivateProfile): Profile => {
  const traits = [];

  // Add appropriate traits based on user role
  if (profile.user_role === "startup") {
    if (profile.funding_stage) {
      traits.push({
        key: "funding_stage",
        icon: "trending-up",
        label: profile.funding_stage,
      });
    }
    if (profile.looking_for_roles && profile.looking_for_roles.length > 0) {
      traits.push({
        key: "looking_for_roles",
        icon: "people-outline",
        label: `${profile.looking_for_roles.length} roles`,
      });
    }
  } else {
    // candidate
    if (profile.skills && profile.skills.length > 0) {
      traits.push({
        key: "skills",
        icon: "code-slash",
        label: `${profile.skills.length} skills`,
      });
    }
  }

  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    user_role: profile.user_role || "candidate",
    one_line_description: profile.one_line_description,
    photos: profile.photos || [],
    answers: profile.answers || [],
    traits,
    funding_stage: profile.funding_stage,
    looking_for_roles: profile.looking_for_roles,
    offer_details: profile.offer_details,
    why_us_platform: profile.why_us_platform,
    skills: profile.skills,
    work_experiences: profile.work_experiences,
    projects: profile.projects,
  };
};

export const transformPublicProfile = (profile: PublicProfile): Profile => {
  const traits = [];

  // Add appropriate traits based on user role
  if (profile.user_role === "startup") {
    if (profile.funding_stage) {
      traits.push({
        key: "funding_stage",
        icon: "trending-up",
        label: profile.funding_stage,
      });
    }
    if (profile.looking_for_roles && profile.looking_for_roles.length > 0) {
      traits.push({
        key: "looking_for_roles",
        icon: "people-outline",
        label: `${profile.looking_for_roles.length} roles`,
      });
    }
  } else {
    // candidate
    if (profile.skills && profile.skills.length > 0) {
      traits.push({
        key: "skills",
        icon: "code-slash",
        label: `${profile.skills.length} skills`,
      });
    }
  }

  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    user_role: profile.user_role || "candidate",
    one_line_description: profile.one_line_description,
    photos: profile.photos || [],
    answers: profile.answers || [],
    traits,
    funding_stage: profile.funding_stage,
    looking_for_roles: profile.looking_for_roles,
    offer_details: profile.offer_details,
    why_us_platform: profile.why_us_platform,
    skills: profile.skills,
    work_experiences: profile.work_experiences,
    projects: profile.projects,
  };
};
