import { useMyProfile } from "@/api/my-profile";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ProfileCard from "../../../components/profile-card";

// Modified for startup job platform
export default function ProfilePage() {
  const { data: profile } = useMyProfile();
  const isStartup = profile?.user_role === "startup";

  // Add sign out handler
  const handleSignOut = async () => {
    try {
      console.log("Signing out user...");
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        Alert.alert("Error", "Failed to sign out: " + error.message);
      } else {
        console.log("Sign out successful");
        router.replace("/(auth)/sign-in");
      }
    } catch (e) {
      console.error("Exception during sign out:", e);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  // Common routes that exist in the app already
  const commonRoutes = {
    profile: "/profile",
    preferences: "/preferences",
    skills: "/preferences/skills",
    location: "/preferences/location",
    distance: "/preferences/distance",
    funding: "/preferences/funding",
    roles: "/preferences/roles",
  };

  const handleNavigation = (route: string) => {
    // Check if the route exists or is implemented
    if (Object.values(commonRoutes).includes(route)) {
      router.push(route as any);
    } else {
      // For routes not yet implemented
      Alert.alert(
        "Feature Coming Soon",
        "This feature is under development and will be available soon.",
        [{ text: "OK" }]
      );
    }
  };

  const startupOptions = [
    {
      key: "edit-profile",
      icon: "business-outline" as const,
      title: "Company Profile",
      subtitle: "Edit your startup details",
      route: commonRoutes.profile,
    },
    {
      key: "funding",
      icon: "cash-outline" as const,
      title: "Funding Stage",
      subtitle: "Update your company's funding info",
      route: commonRoutes.funding,
    },
    {
      key: "roles",
      icon: "search-outline" as const,
      title: "Roles Needed",
      subtitle: "What talent are you looking for?",
      route: commonRoutes.roles,
    },
    {
      key: "offer-details",
      icon: "gift-outline" as const,
      title: "Offer Details",
      subtitle: "Equity, compensation, and benefits",
      route: commonRoutes.preferences,
    },
    {
      key: "why-us",
      icon: "people-outline" as const,
      title: "Why Join Us",
      subtitle: "Share your company vision",
      route: commonRoutes.preferences,
    },
    {
      key: "photos",
      icon: "image-outline" as const,
      title: "Photos & Media",
      subtitle: "Team photos, office, product demos",
      route: commonRoutes.profile,
    },
  ];

  const candidateOptions = [
    {
      key: "edit-profile",
      icon: "person-outline" as const,
      title: "Personal Profile",
      subtitle: "Edit your basic details",
      route: commonRoutes.profile,
    },
    {
      key: "skills",
      icon: "code-slash-outline" as const,
      title: "Skills & Expertise",
      subtitle: "Update your technical skills",
      route: commonRoutes.skills,
    },
    {
      key: "location",
      icon: "location-outline" as const,
      title: "Location",
      subtitle: "Set your preferred location",
      route: commonRoutes.location,
    },
    {
      key: "distance",
      icon: "compass-outline" as const,
      title: "Maximum Distance",
      subtitle: "Set your maximum distance",
      route: commonRoutes.distance,
    },
    {
      key: "photos",
      icon: "image-outline" as const,
      title: "Profile Photos",
      subtitle: "Update your profile pictures",
      route: commonRoutes.profile,
    },
    {
      key: "preferences",
      icon: "options-outline" as const,
      title: "Other Preferences",
      subtitle: "Configure additional settings",
      route: commonRoutes.preferences,
    },
  ];

  const options = isStartup ? startupOptions : candidateOptions;

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-gray-900">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="flex-row px-4 py-2 justify-between items-center">
            <Text
              style={{
                fontFamily: "playfair-semibold",
                fontSize: 32,
                color: "#ecac6d",
              }}
            >
              My Profile
            </Text>
            <TouchableOpacity
              onPress={() => handleNavigation(commonRoutes.preferences)}
            >
              <Ionicons name="options-outline" size={24} color="#ecac6d" />
            </TouchableOpacity>
          </View>

          <View className="px-4 items-center">
            <View className="items-center gap-2 my-8">
              <Pressable
                className="h-32 aspect-square rounded-full border-4 p-1"
                style={{ borderColor: "#ecac6d" }}
                onPress={() => handleNavigation(commonRoutes.profile)}
              >
                <Image
                  source={
                    profile?.avatar_url
                      ? { uri: profile.avatar_url }
                      : require("../../../../assets/images/icon.png")
                  }
                  className="flex-1 rounded-full bg-neutral-400"
                />
              </Pressable>
              <Text
                className="text-2xl font-poppins-semibold"
                style={{ color: "#ecac6d" }}
              >
                {profile?.first_name} {profile?.last_name}
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name={isStartup ? "business" : "person"}
                  size={16}
                  color="#ecac6d"
                  style={{ marginRight: 5 }}
                />
                <Text
                  className="text-base font-poppins"
                  style={{ color: "#ecac6d" }}
                >
                  {isStartup ? "Startup" : "Candidate"}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-4 mb-4">
            <View className="bg-gray-800 p-4 rounded-xl">
              <Text className="text-white font-poppins-medium mb-2">
                Profile Completion
              </Text>
              <View className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <View
                  style={{
                    width: `${80}%`,
                    height: "100%",
                    backgroundColor: "#ecac6d",
                  }}
                />
              </View>
              <Text className="text-gray-400 text-xs mt-1">
                Complete all sections to improve your matches
              </Text>
            </View>
          </View>

          <View className="flex-1 px-4 gap-3">
            {options.map((option) => (
              <ProfileCard
                key={option.key}
                icon={
                  <Ionicons
                    name={option.icon}
                    className="text-2xl"
                    style={{ color: "#ecac6d" }}
                  />
                }
                title={option.title}
                subtitle={option.subtitle}
                onPress={() => handleNavigation(option.route)}
              />
            ))}

            {/* Sign Out Button */}
            <ProfileCard
              key="sign-out"
              icon={
                <Ionicons
                  name="log-out-outline"
                  className="text-2xl"
                  style={{ color: "#e74c3c" }}
                />
              }
              title="Sign Out"
              subtitle="Log out of your account"
              onPress={handleSignOut}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
