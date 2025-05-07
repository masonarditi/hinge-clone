"use client";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const ROLES = ["user", "startup"];

export default function OnboardingUserRole() {
  const { session } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (role: string) => {
    console.log("Role selected:", role);
    setSelected(role);
    setLoading(true);
    console.log("Updating profile in Supabase for user_id:", session?.user.id);
    const { error } = await supabase
      .from("profiles")
      .update({ user_role: role } as any)
      .eq("user_id", session?.user.id || "");
    setLoading(false);
    if (!error) {
      console.log("Profile updated successfully, redirecting to app");
      router.replace("/(app)");
    } else {
      console.log("Failed to update role:", error.message);
      alert("Failed to update role: " + error.message);
    }
  };

  return (
    <View className="flex-1 bg-gray-900 justify-center items-center p-8">
      <Text className="text-3xl font-bold text-white mb-8">I am a…</Text>
      {ROLES.map((role) => (
        <Pressable
          key={role}
          onPress={() => handleSelect(role)}
          className={`w-full py-4 mb-4 rounded-lg items-center ${
            selected === role ? "bg-fuchsia-700" : "bg-gray-800"
          }`}
          disabled={loading}
        >
          <Text className="text-white text-xl capitalize">{role}</Text>
        </Pressable>
      ))}
    </View>
  );
}
