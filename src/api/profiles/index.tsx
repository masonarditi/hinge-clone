import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Like, PublicProfile } from "./types";

export const useProfiles = (page_size: number = 10) => {
  return useQuery<PublicProfile[]>({
    queryKey: ["profiles", page_size],
    queryFn: async () => {
      console.log("[useProfiles] Fetching profiles with page_size:", page_size);
      const { data, error } = await supabase
        .rpc("get_profiles", {
          page_size,
        })
        .returns<PublicProfile[]>();

      if (error) {
        console.error("[useProfiles] Error fetching profiles:", error);
        throw error;
      }

      console.log(
        "[useProfiles] Received profiles data:",
        data?.length || 0,
        "items"
      );
      return data;
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
