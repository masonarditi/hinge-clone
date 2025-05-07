import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function StartupDashboard() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isStartup, setIsStartup] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkUserRole() {
      if (!session?.user?.id) return;

      try {
        // Fetch user profile to check role
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setIsStartup((data as any)?.user_role === "startup");
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    checkUserRole();
  }, [session]);

  // Show loading state
  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "#111827" }}
      >
        <ActivityIndicator size="large" color="#ecac6d" />
      </View>
    );
  }

  // Redirect non-startup users
  if (!isStartup) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: "#111827" }}>
      <View className="p-6">
        <Text
          className="text-3xl font-playfair-semibold mb-4"
          style={{ color: "#ecac6d" }}
        >
          Startup Dashboard
        </Text>

        <View className="bg-gray-800 rounded-lg p-5 mb-5">
          <Text
            className="text-xl font-poppins-semibold mb-2"
            style={{ color: "#ecac6d" }}
          >
            Welcome, {profile?.first_name || "Founder"}!
          </Text>
          <Text className="text-white mb-4">
            This page is exclusively for startup accounts.
          </Text>
        </View>

        <View className="bg-gray-800 rounded-lg p-5 mb-5">
          <Text
            className="text-lg font-poppins-semibold mb-2"
            style={{ color: "#ecac6d" }}
          >
            Startup Metrics
          </Text>
          <Text className="text-white">Profile Views: 324</Text>
          <Text className="text-white">Connection Requests: 18</Text>
          <Text className="text-white">Matches: 7</Text>
        </View>

        <View className="bg-gray-800 rounded-lg p-5">
          <Text
            className="text-lg font-poppins-semibold mb-2"
            style={{ color: "#ecac6d" }}
          >
            Recent Activity
          </Text>
          <Text className="text-white">• Jane Doe viewed your profile</Text>
          <Text className="text-white">• New message from John Smith</Text>
          <Text className="text-white">• Your pitch was rated 4.8/5</Text>
          <Text className="text-white">
            • 3 new candidates matched your criteria
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
