"use client";
import { Fab } from "@/components/fab";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, TouchableOpacity, View } from "react-native";

const ROLES = ["user", "startup"];

export default function OnboardingUserRole() {
  const { session } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigateToApp = () => {
    try {
      console.log("Direct navigation to app initiated");
      router.replace("/(app)");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Navigation Error",
        "Could not navigate to the app. Please try again."
      );
    }
  };

  const handleSelect = async (role: string) => {
    console.log("=== START ROLE SELECTION PROCESS ===");
    console.log(`Selected role: "${role}"`);
    setSelected(role);
    setLoading(true);

    if (!session?.user?.id) {
      console.log("❌ ERROR: No user ID found in session");
      setLoading(false);
      alert("No user ID found. Please try signing in again.");
      return;
    }

    const userId = session.user.id;

    // Just update the existing profile with the selected role
    const { data, error } = await supabase
      .from("profiles")
      .update({ user_role: role })
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error("Error updating profile:", error);
      setLoading(false);
      alert("Error updating profile: " + error.message);
      return;
    }

    navigateToApp();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 p-8" style={{ backgroundColor: "#111827" }}>
        <TouchableOpacity onPress={navigateToApp} className="self-end mb-8">
          <Text
            style={{ color: "#ecac6d" }}
            className="text-lg font-poppins-semibold"
          >
            Skip
          </Text>
        </TouchableOpacity>

        <View className="flex-1 justify-center items-center">
          <Text
            className="text-4xl font-playfair-semibold mb-8"
            style={{ color: "#ecac6d" }}
          >
            I am a…
          </Text>
          {ROLES.map((role) => (
            <Pressable
              key={role}
              onPress={() => handleSelect(role)}
              className={`w-full py-4 mb-4 items-center justify-center rounded-full ${
                selected === role ? "border-0" : "border border-[#ecac6d]"
              }`}
              style={{
                backgroundColor: selected === role ? "#ecac6d" : "#111827",
              }}
              disabled={loading}
            >
              <Text
                className="text-lg font-poppins-semibold"
                style={{
                  color: selected === role ? "#111827" : "#ecac6d",
                }}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <TouchableOpacity
          onPress={navigateToApp}
          className="h-16 items-center justify-center rounded-full mt-10"
          style={{
            backgroundColor: "#ecac6d",
          }}
          activeOpacity={0.7}
        >
          <Text
            className="text-lg font-poppins-semibold"
            style={{ color: "#111827" }}
          >
            Continue
          </Text>
        </TouchableOpacity>

        {/* Keep the original Fab as a backup */}
        <View className="absolute bottom-5 right-5">
          <Fab
            onPress={navigateToApp}
            iconName="chevron-forward"
            loading={loading}
            className="bg-[#ecac6d]"
            iconClassName="text-white text-4xl"
          />
        </View>
      </View>
    </>
  );
}
