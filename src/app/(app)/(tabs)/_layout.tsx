import { useMyProfile } from "@/api/my-profile";
import { useRefreshOnFocus } from "@/hooks/refetch";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function Layout() {
  const { data: user, refetch } = useMyProfile();
  useRefreshOnFocus(refetch);

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  // Proper navigation based on user role
  useEffect(() => {
    if (!user) {
      return; // Wait for user data to load
    }
    setIsLoading(false);
  }, [user]);

  // If user is not available, render a placeholder while loading
  if (!user || isLoading) {
    return <View style={{ flex: 1, backgroundColor: "#1f2937" }} />; // Loading placeholder
  }

  const isStartup = user?.user_role === "startup";

  return (
    <>
      <StatusBar style="light" backgroundColor="#1f2937" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#1f2937",
            borderTopColor: "#374151",
            height: 60,
          },
          tabBarActiveTintColor: "#ecac6d",
          tabBarInactiveTintColor: "white",
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: "poppins-regular",
            marginBottom: 5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Discover",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="likes"
          options={{
            title: "Saved",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bookmark" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="matches"
          options={{
            title: "Connections",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        {/* Show only one profile tab option based on user role */}
        <Tabs.Screen
          name={isStartup ? "startup" : "profile"}
          options={{
            title: isStartup ? "Dashboard" : "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={isStartup ? "business" : "person"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
