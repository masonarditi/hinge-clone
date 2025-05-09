import { PrivateProfile } from "@/api/my-profile/types";

export const identity = [
  {
    title: "I am a",
    getValue: (p: PrivateProfile) => p.user_types || "User",
    route: "/profile/user-types",
  },

  {
    title: "Pronouns",
    getValue: (profile: PrivateProfile) => {
      return (
        profile?.pronouns.map((pronoun) => pronoun.name).join(", ") || "None"
      );
    },
    route: "/profile/pronouns",
  },
  {
    title: "Gender",
    getValue: (profile: PrivateProfile) => {
      return profile?.gender?.name || "None";
    },
    route: "/profile/gender",
  },
  {
    title: "Sexuality",
    getValue: (profile: PrivateProfile) => {
      return profile?.sexuality?.name || "None";
    },
    route: "/profile/sexuality",
  },
  {
    title: "I'm interested in",
    getValue: (profile: PrivateProfile) => {
      return (
        profile?.gender_preferences.map((gender) => gender.name).join(", ") ||
        "Everyone"
      );
    },
    route: "/profile/gender-preferences",
  },
];
