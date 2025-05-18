import { useMyProfile } from "@/api/my-profile";
import {
  useLikeProfile,
  useProfiles,
  useReviewProfiles,
  useSkipProfile,
} from "@/api/profiles";
import { Empty } from "@/components/empty";
import { Fab } from "@/components/fab";
import { Loader } from "@/components/loader";
import { ProfileView } from "@/components/profile-view";
import { useRefreshOnFocus } from "@/hooks/refetch";
import { supabase } from "@/lib/supabase";
import { transformPublicProfile } from "@/utils/profile";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RefreshProfilesButton = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { error } = await supabase.rpc("reset_profile_interactions");

      if (error) {
        console.error("Error refreshing profiles:", error);
        Alert.alert("Error", "Failed to refresh profiles: " + error.message);
      } else {
        await queryClient.invalidateQueries({ queryKey: ["profiles"] });
        console.log("Profiles refreshed successfully");
      }
    } catch (e) {
      console.error("Exception during profile refresh:", e);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleRefresh}
      disabled={isRefreshing}
      className="bg-gray-800 rounded-full py-3 px-5 flex-row items-center justify-center mt-4"
      style={{ borderColor: "#ecac6d", borderWidth: 1 }}
    >
      {isRefreshing ? (
        <ActivityIndicator size="small" color="#ecac6d" />
      ) : (
        <>
          <Ionicons
            name="refresh"
            size={18}
            color="#ecac6d"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: "#ecac6d" }} className="font-poppins-medium">
            Refresh Profiles
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default function Page() {
  const { data: myProfile, isLoading: profileLoading } = useMyProfile();
  const { data: allProfiles, isFetching, error, refetch } = useProfiles();
  useRefreshOnFocus(refetch);

  const [currentIndex, setCurrentIndex] = useState(0);
  const { mutate: skip, isPending: skipPending } = useSkipProfile();
  const { mutate: review, isPending: reviewPending } = useReviewProfiles();
  const { mutate: like, isPending: likePending } = useLikeProfile();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("all");

  const userRole = myProfile?.user_role || "candidate";
  const isStartup = userRole === "startup";

  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (!allProfiles || !myProfile) return;

    // Log what we're working with for debugging
    console.log("My user role:", myProfile.user_role);
    console.log("All profiles count:", allProfiles.length);
    console.log("Available user roles:", [
      ...new Set(allProfiles.map((p) => p.user_role)),
    ]);

    const oppositeRoleProfiles = allProfiles.filter((profile) => {
      // Enhanced filtering logic to handle all cases
      if (myProfile.user_role === "startup") {
        return (
          profile.user_role === "candidate" || profile.user_role === "candidate"
        );
      } else if (
        myProfile.user_role === "candidate" ||
        myProfile.user_role === "user"
      ) {
        return profile.user_role === "startup";
      }
      return profile.user_role !== myProfile.user_role;
    });

    console.log("Filtered profiles count:", oppositeRoleProfiles.length);

    setFilteredProfiles(oppositeRoleProfiles);
    setCurrentIndex(0);
  }, [allProfiles, myProfile, isStartup]);

  const filterOptions = isStartup
    ? [
        { id: "all", label: "All Candidates" },
        { id: "dev", label: "Developers" },
        { id: "creative", label: "Creatives" },
        { id: "management", label: "Management" },
      ]
    : [
        { id: "all", label: "All Startups" },
        { id: "seed", label: "Seed Stage" },
        { id: "seriesA", label: "Series A" },
        { id: "seriesB", label: "Series B+" },
      ];

  const hasProfiles = filteredProfiles?.length > 0;
  const profile =
    hasProfiles && currentIndex < filteredProfiles.length
      ? transformPublicProfile(filteredProfiles[currentIndex])
      : null;

  const handleSkip = () => {
    if (profile) {
      skip(profile?.id, {
        onSuccess: () => {
          if (hasProfiles && currentIndex < filteredProfiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else if (hasProfiles) {
            queryClient.invalidateQueries({
              queryKey: ["profiles"],
            });
            setCurrentIndex(0);
          }
        },
        onError: () => {
          Alert.alert("Error", "Something went wrong, please try again later");
        },
      });
    }
  };

  const handleReview = () => {
    review(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["profiles"],
        });
      },
      onError: () => {
        Alert.alert("Error", "Something went wrong, please try again later");
      },
    });
  };

  const handleLike = (id: string, type: "answer" | "photo") => {
    if (profile) {
      like(
        {
          profile: profile?.id,
          answer: type === "answer" ? id : undefined,
          photo: type === "photo" ? id : undefined,
        },
        {
          onSuccess: () => {
            if (hasProfiles && currentIndex < filteredProfiles.length - 1) {
              setCurrentIndex(currentIndex + 1);
            } else if (hasProfiles) {
              queryClient.invalidateQueries({
                queryKey: ["profiles"],
              });
              setCurrentIndex(0);
            }
          },
          onError: () => {
            Alert.alert(
              "Error",
              "Something went wrong, please try again later"
            );
          },
        }
      );
    }
  };

  if (
    profileLoading ||
    isFetching ||
    skipPending ||
    reviewPending ||
    likePending
  ) {
    return <Loader />;
  }

  if (error) {
    return (
      <Empty
        title="Something went wrong"
        subTitle="We ran into a problem loading profiles, sorry about that!"
        onPrimaryPress={refetch}
        primaryText="Try again"
      />
    );
  }

  if (!hasProfiles) {
    return (
      <Empty
        title={`No ${isStartup ? "candidates" : "startups"} found`}
        subTitle="Try changing your filters to see more results - or check back later!"
        primaryText="Change filters"
        secondaryText="Review skipped profiles"
        onPrimaryPress={() => router.push("/preferences")}
        onSecondaryPress={handleReview}
        extraContent={<RefreshProfilesButton />}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <View className="px-4 py-2">
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className="text-3xl font-playfair-semibold"
            style={{ color: "#ecac6d" }}
          >
            {isStartup ? "Find Talent" : "Discover Startups"}
          </Text>
          <TouchableOpacity onPress={() => router.push("/preferences")}>
            <Ionicons name="options-outline" size={24} color="#ecac6d" />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor:
                  activeFilter === item.id ? "#ecac6d" : "#1f2937",
              }}
            >
              <Text
                style={{
                  color: activeFilter === item.id ? "#1f2937" : "#ecac6d",
                  fontFamily: "poppins-medium",
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      </View>

      <ScrollView className="flex-1 px-5">
        {profile && <ProfileView profile={profile} onLike={handleLike} />}
      </ScrollView>

      <View className="flex-row justify-between px-5 pb-5">
        <Fab
          onPress={handleSkip}
          iconName="close"
          className="bg-gray-800 shadow-sm h-14 w-14 rounded-full"
          iconClassName="text-red-500 text-xl"
          loaderClassName="text-white"
        />
        <Fab
          onPress={() => handleLike(profile?.id || "", "photo")}
          iconName="star"
          className="bg-gray-800 shadow-sm h-14 w-14 rounded-full"
          iconClassName="text-[#ecac6d] text-xl"
          loaderClassName="text-white"
        />
      </View>
    </SafeAreaView>
  );
}
