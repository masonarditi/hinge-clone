import { useMyProfile } from "@/api/my-profile";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";
import { cn } from "@/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import { useConnection } from "@sendbird/uikit-react-native";
import { Image } from "expo-image";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import colors from "tailwindcss/colors";

export default function Layout() {
  const { data: profile } = useMyProfile();
  const { connect } = useConnection();
  const { session } = useAuth();
  const [isStartup, setIsStartup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      connect(profile.id, { nickname: profile.first_name || undefined });
    }
  }, [profile, connect]);

  useEffect(() => {
    async function checkUserRole() {
      console.log("=== CHECKING USER ROLE ===");
      console.log("Session user ID:", session?.user?.id);

      if (!session?.user?.id) {
        console.log("No user ID in session, skipping role check");
        return;
      }

      try {
        console.log("Fetching profile from Supabase...");
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) {
          console.log("Error fetching profile:", error);
          return;
        }

        console.log("Profile data:", JSON.stringify(data, null, 2));
        console.log("User role:", (data as any)?.user_role);

        const isUserStartup = (data as any)?.user_role === "startup";
        console.log("Is startup?", isUserStartup);

        setIsStartup(isUserStartup);
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    }

    checkUserRole();
  }, [session]);

  console.log("Current isStartup state:", isStartup);
  console.log("Rendering tabs, showing startup tab?", isStartup);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.neutral[950],
        },
        tabBarActiveTintColor: "#ecac6d",
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: colors.gray[900],
        },
        headerTitleStyle: {
          color: colors.white,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
          headerTitle: "",
          headerShadowVisible: false,
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox-outline" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="startup"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" color={color} size={size} />
          ),
          tabBarButton: (props) =>
            isStartup ? <Pressable {...props} /> : null,
          headerShown: false,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/startup-dashboard");
          },
        }}
      />
      <Tabs.Screen
        name="hinge"
        options={{
          tabBarIcon: ({ color, size, focused }) =>
            profile && profile.avatar_url ? (
              <View
                style={{
                  width: size,
                  height: size,
                }}
                className={cn(
                  focused && "border border-white rounded-full p-0.5"
                )}
              >
                <Image
                  source={profile.avatar_url}
                  className="flex-1 aspect-square rounded-full bg-neutral-200"
                />
              </View>
            ) : (
              <Ionicons name="person-circle" color={color} size={size} />
            ),
        }}
      />
    </Tabs>
  );
}
