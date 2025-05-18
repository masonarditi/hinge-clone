import { PrivateProfile } from "@/api/my-profile/types";

export const memberPreferences = [
  {
    title: "I am a",
    getValue: (profile: PrivateProfile) =>
      profile.user_role === "startup" ? "Startup" : "Candidate",
    route: "/preferences/user-role",
  },
  {
    title: "Looking for",
    getValue: (profile: PrivateProfile) => {
      if (profile.user_role === "startup") {
        return profile?.looking_for_roles?.join(", ") || "Any roles";
      } else {
        return "Startup opportunities";
      }
    },
    route: "/preferences/roles",
  },
  {
    title: "Skills",
    getValue: (profile: PrivateProfile) => {
      if (profile.user_role === "candidate") {
        return profile?.skills?.join(", ") || "None specified";
      }
      return "N/A";
    },
    route: "/preferences/skills",
  },
  {
    title: "Location",
    getValue: (profile: PrivateProfile) => {
      return profile?.neighborhood || "Remote";
    },
    route: "/preferences/location",
  },
  {
    title: "Maximum distance",
    getValue: (profile: PrivateProfile) => {
      return `${profile?.max_distance_km || 160} km`;
    },
    route: "/preferences/distance",
  },
  {
    title: "Funding stage",
    getValue: (profile: PrivateProfile) => {
      if (profile.user_role === "startup") {
        return profile?.funding_stage || "Not specified";
      }
      return "Any";
    },
    route: "/preferences/funding",
  },
];
