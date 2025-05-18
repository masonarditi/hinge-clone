import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { PrivateProfile } from "./types";

export const useMyProfile = () => {
  return useQuery<PrivateProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      try {
        let { data, error } = await supabase
          .rpc("get_profile")
          .returns<PrivateProfile>()
          .single();

        if (error) {
          console.error("Profile fetch error:", error);
          // If profile not found, sign out user
          if (error.message.includes("profile not found")) {
            console.log("Profile not found for user, signing out...");
            await supabase.auth.signOut();
          }
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Profile fetch failed:", error);
        throw error;
      }
    },
    initialData: null,
  });
};

export const useUpdateCandidateSkills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      skills,
      profileId,
    }: {
      skills: string[];
      profileId: string;
    }) => {
      const { error } = await supabase.rpc("update_candidate_skills", {
        p_profile_id: profileId,
        p_skill_names: skills,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: async (profile: PrivateProfile) => {
      const answers = profile.answers.map(
        ({ id, prompt_id, answer_text, answer_order }) => {
          return {
            id: id.startsWith("temp") ? null : id,
            prompt_id,
            answer_text,
            answer_order,
          };
        }
      );

      const uploadPhoto = async (photoUrl: string) => {
        const arraybuffer = await fetch(photoUrl).then((res) =>
          res.arrayBuffer()
        );
        const fileExt = photoUrl.split(".").pop()?.toLowerCase() ?? "jpeg";
        const filePath = `${
          profile.id
        }/photos/${Crypto.randomUUID()}.${fileExt}`;

        const { error } = await supabase.storage
          .from("profiles")
          .upload(filePath, arraybuffer, {
            contentType: `image/${fileExt}`,
          });

        if (error) {
          throw error;
        }

        const { data } = supabase.storage
          .from("profiles")
          .getPublicUrl(filePath);

        if (!data?.publicUrl) {
          throw error;
        }

        return data.publicUrl;
      };

      const photos = await Promise.all(
        profile.photos.map(async ({ id, photo_url, photo_order }) => {
          let photoUrl = photo_url;

          if (photoUrl.startsWith("file://")) {
            photoUrl = await uploadPhoto(photoUrl);
          }

          return {
            id: id.startsWith("temp") ? null : id,
            photo_url: photoUrl,
            photo_order,
          };
        })
      );

      // Standard profile update parameters
      const updateParams: Record<string, any> = {
        user_role: profile.user_role,
        answers: answers,
        children: profile.children?.id,
        covid_vaccine: profile.covid_vaccine?.id,
        dob: profile.dob,
        first_name: profile.first_name,
        gender: profile.gender?.id,
        height_cm: profile.height_cm,
        last_name: profile.last_name,
        latitude: profile.latitude,
        longitude: profile.longitude,
        neighborhood: profile.neighborhood,
        photos: photos,
        sexuality: profile.sexuality?.id,
        zodiac_sign: profile.zodiac_sign?.id,
      };

      // Add array parameters if they exist
      if (profile.ethnicities) {
        updateParams.ethnicities = profile.ethnicities.map(
          (option) => option.id
        );
      }

      if (profile.gender_preferences) {
        updateParams.gender_preferences = profile.gender_preferences.map(
          (option) => option.id
        );
      }

      if (profile.pets) {
        updateParams.pets = profile.pets.map((option) => option.id);
      }

      if (profile.pronouns) {
        updateParams.pronouns = profile.pronouns.map((option) => option.id);
      }

      // Add startup-specific fields if they exist
      if (profile.looking_for_roles) {
        updateParams.looking_for_roles = profile.looking_for_roles;
      }

      let { error } = await supabase.rpc("update_profile", updateParams);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
};

export const useUpdateLookingForRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roles }: { roles: string[] }) => {
      // Get the current user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update the profile directly using the update method with type assertion
      const { error } = await supabase
        .from("profiles")
        .update({ looking_for_roles: roles } as any)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useUpdateAgeRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      min_age,
      max_age,
    }: {
      min_age: number;
      max_age: number;
    }) => {
      const { error } = await supabase.rpc("update_age_range", {
        min_age: min_age,
        max_age: max_age,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useUpdateDistance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ distance }: { distance: number }) => {
      const { error } = await supabase.rpc("update_distance", {
        distance: distance,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useUpdateEthnicityPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ethnicities }: { ethnicities: number[] }) => {
      const { error } = await supabase.rpc("update_ethnicity_preferences", {
        ethnicity_preferences: ethnicities,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useUpdateGenderPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ genders }: { genders: number[] }) => {
      const { error } = await supabase.rpc("update_gender_preferences", {
        gender_preferences: genders,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      latitude,
      longitude,
      neighborhood,
    }: {
      latitude: number;
      longitude: number;
      neighborhood: string;
    }) => {
      const { error } = await supabase.rpc("update_location", {
        latitude: latitude,
        longitude: longitude,
        neighborhood: neighborhood,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};
