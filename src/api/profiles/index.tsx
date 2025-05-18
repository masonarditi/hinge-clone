import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Like, PublicProfile } from "./types";

export const useProfiles = (page_size: number = 10) => {
  return useQuery<PublicProfile[]>({
    queryKey: ["profiles", page_size],
    queryFn: async () => {
      console.log("=============================================");
      console.log("[useProfiles] START: Fetching profiles");
      console.log("[useProfiles] Parameters:", { page_size });

      try {
        console.log("[useProfiles] Making RPC call to get_profiles...");

        // Get raw response to examine before type casting
        const rawResponse = await supabase.rpc("get_profiles", { page_size });
        console.log("[useProfiles] Raw response status:", rawResponse.status);
        console.log(
          "[useProfiles] Raw error:",
          JSON.stringify(rawResponse.error)
        );

        if (rawResponse.error) {
          // Detailed error logging
          console.error("[useProfiles] ERROR DETAILS:", {
            code: rawResponse.error.code,
            message: rawResponse.error.message,
            details: rawResponse.error.details,
            hint: rawResponse.error.hint,
          });

          // Log column types if available
          if (
            rawResponse.error.message.includes("does not match expected type")
          ) {
            console.error(
              "[useProfiles] TYPE MISMATCH DETECTED in column data"
            );
          }

          throw rawResponse.error;
        }

        // Debug the structure of the first item if available
        if (rawResponse.data && rawResponse.data.length > 0) {
          console.log(
            "[useProfiles] First item keys:",
            Object.keys(rawResponse.data[0])
          );

          // Check if looking_for_roles exists and log its type
          if ("looking_for_roles" in rawResponse.data[0]) {
            console.log(
              "[useProfiles] looking_for_roles type:",
              typeof rawResponse.data[0].looking_for_roles,
              "Is array?",
              Array.isArray(rawResponse.data[0].looking_for_roles),
              "Value:",
              rawResponse.data[0].looking_for_roles
            );
          }

          // Check if funding_stage exists and log its value
          if ("funding_stage" in rawResponse.data[0]) {
            console.log(
              "[useProfiles] funding_stage:",
              rawResponse.data[0].funding_stage,
              "Type:",
              typeof rawResponse.data[0].funding_stage
            );
          } else {
            console.log("[useProfiles] funding_stage not found in data");
          }

          // Check offer_details and why_us_platform
          console.log(
            "[useProfiles] offer_details:",
            "offer_details" in rawResponse.data[0]
              ? rawResponse.data[0].offer_details
              : "not found"
          );
          console.log(
            "[useProfiles] why_us_platform:",
            "why_us_platform" in rawResponse.data[0]
              ? rawResponse.data[0].why_us_platform
              : "not found"
          );
        }

        // Now make the typed call
        const { data, error } = await supabase
          .rpc("get_profiles", { page_size })
          .returns<PublicProfile[]>();

        if (error) {
          console.error("[useProfiles] Error with typed query:", error);
          throw error;
        }

        console.log(
          "[useProfiles] SUCCESS: Received profiles data:",
          data?.length || 0,
          "items"
        );

        // Log sample structure of returned data
        if (data && data.length > 0) {
          console.log("[useProfiles] Sample profile structure:", {
            id: data[0].id,
            user_role: data[0].user_role,
            funding_stage: data[0].funding_stage,
            offer_details: data[0].offer_details,
            why_us_platform: data[0].why_us_platform,
            looking_for_roles_type: typeof data[0].looking_for_roles,
          });
        }

        console.log("[useProfiles] END: Profiles fetch completed");
        console.log("=============================================");
        return data;
      } catch (e) {
        console.error("[useProfiles] EXCEPTION during fetch:", e);
        console.log("=============================================");
        throw e;
      }
    },
    initialData: [],
  });
};

export const useSkipProfile = () => {
  return useMutation({
    mutationFn: async (profile: string) => {
      console.log("[useSkipProfile] Skipping profile:", profile);
      const { error } = await supabase.rpc("skip_profile", {
        profile,
      });

      if (error) {
        console.error("[useSkipProfile] Error skipping profile:", error);
        throw error;
      }
    },
  });
};

export const useLikeProfile = () => {
  return useMutation({
    mutationFn: async ({
      profile,
      answer,
      photo,
    }: {
      profile: string;
      answer: string | undefined;
      photo: string | undefined;
    }) => {
      console.log("[useLikeProfile] Liking profile:", {
        profile,
        answer,
        photo,
      });
      const { error } = await supabase.rpc("like_profile", {
        profile,
        answer,
        photo,
      });

      if (error) {
        console.error("[useLikeProfile] Error liking profile:", error);
        throw error;
      }
    },
  });
};

export const useReviewProfiles = () => {
  return useMutation({
    mutationFn: async () => {
      console.log("[useReviewProfiles] Reviewing profiles");
      const { error } = await supabase.rpc("review_profiles");

      if (error) {
        console.error("[useReviewProfiles] Error reviewing profiles:", error);
        throw error;
      }
    },
  });
};

export const useLikes = () => {
  return useQuery<Like[]>({
    queryKey: ["likes"],
    queryFn: async () => {
      console.log("[useLikes] Fetching likes");
      const { data, error } = await supabase.rpc("get_likes").returns<Like[]>();

      if (error) {
        console.error("[useLikes] Error fetching likes:", error);
        throw error;
      }

      console.log(
        "[useLikes] Received likes data:",
        data?.length || 0,
        "items"
      );
      return data;
    },
    initialData: [],
  });
};

export const useRemoveLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interaction: string) => {
      console.log(
        "[useRemoveLike] Removing like for interaction:",
        interaction
      );
      const { error } = await supabase.rpc("remove_like", {
        interaction,
      });

      if (error) {
        console.error("[useRemoveLike] Error removing like:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
};

export const useMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interaction: string) => {
      console.log("[useMatch] Matching interaction:", interaction);
      const { error } = await supabase.rpc("match", {
        interaction,
      });

      if (error) {
        console.error("[useMatch] Error matching:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
};

export const useUnmatch = () => {
  return useMutation({
    mutationFn: async (interaction: string) => {
      console.log("[useUnmatch] Unmatching interaction:", interaction);
      const { error } = await supabase.rpc("unmatch", {
        interaction,
      });

      if (error) {
        console.error("[useUnmatch] Error unmatching:", error);
        throw error;
      }
    },
  });
};
