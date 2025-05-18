// src/app/(app)/(tabs)/startup.tsx
import { useMyProfile } from "@/api/my-profile";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function StartupTab() {
  const { data: user } = useMyProfile();

  useEffect(() => {
    if (user?.user_role === "startup") {
      router.replace("/startup-dashboard" as any);
    } else if (user?.user_role === "candidate") {
      router.replace("/candidate-dashboard" as any);
    }
  }, [user]);

  // Display a loading indicator while redirecting
  return (
    <View className="flex-1 bg-gray-900 items-center justify-center">
      <ActivityIndicator size="large" color="#ecac6d" />
    </View>
  );
}
