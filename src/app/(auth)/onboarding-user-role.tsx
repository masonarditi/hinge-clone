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
    const phone = session.user.phone || "";

    console.log(`Session user info - ID: ${userId}, Phone: ${phone}`);
    console.log("Searching for existing profile...");

    try {
      // First try to find profile by user_id
      console.log(`🔍 Querying profiles by user_id: ${userId}`);
      const { data: userIdData, error: userIdError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId);

      if (userIdError) {
        console.log(`❌ Error querying by user_id: ${userIdError.message}`);
      } else {
        console.log(`Found ${userIdData?.length || 0} profiles by user_id`);
        if (userIdData?.length > 0) {
          console.log(`User ID profile data:`, userIdData[0]);
        }
      }

      const profileByUserId = userIdData || [];

      // Then try to find by phone number
      let profileByPhone: any[] = [];
      if (phone) {
        console.log(`🔍 Querying profiles by phone: ${phone}`);
        const { data: phoneData, error: phoneError } = await supabase
          .from("profiles")
          .select("*")
          .eq("phone", phone);

        if (phoneError) {
          console.log(`❌ Error querying by phone: ${phoneError.message}`);
        } else {
          console.log(`Found ${phoneData?.length || 0} profiles by phone`);
          if (phoneData?.length > 0) {
            console.log(`Phone profile data:`, phoneData[0]);
          }
        }

        profileByPhone = phoneData || [];
      } else {
        console.log("⚠️ No phone number available to query");
      }

      // Determine if we have an existing profile
      const existingProfile =
        profileByUserId.length > 0
          ? profileByUserId[0]
          : profileByPhone.length > 0
            ? profileByPhone[0]
            : null;

      console.log(
        "Profile search result:",
        existingProfile ? "FOUND" : "NOT FOUND"
      );

      if (!existingProfile) {
        // No profile found - create new one
        console.log("➕ Creating new profile with data:", {
          user_id: userId,
          phone: phone || null,
          user_role: role,
        });

        const { data: insertData, error: createError } = await supabase
          .from("profiles")
          .insert({
            user_id: userId,
            phone: phone || null,
            user_role: role,
          } as any)
          .select();

        if (createError) {
          console.log(
            `❌ Error creating profile: ${createError.message}`,
            createError
          );
          throw createError;
        }

        console.log("✅ Profile created successfully!", insertData);
      } else {
        // Profile exists - update it
        console.log(
          `🔄 Updating profile ID: ${existingProfile.id} with data:`,
          {
            user_id: userId,
            user_role: role,
          }
        );

        const { data: updateData, error: updateError } = await supabase
          .from("profiles")
          .update({
            user_id: userId,
            user_role: role,
          } as any)
          .eq("id", existingProfile.id)
          .select();

        if (updateError) {
          console.log(
            `❌ Error updating profile: ${updateError.message}`,
            updateError
          );
          throw updateError;
        }

        console.log("✅ Profile updated successfully!", updateData);
      }

      console.log("✅ Profile operation completed, redirecting to app");
      router.replace("/(app)");
    } catch (e: any) {
      console.error("❌❌❌ Exception during profile operation:", e);
      console.error("Error details:", JSON.stringify(e, null, 2));
      setLoading(false);
      alert("An error occurred: " + (e?.message || "Unknown error"));
    } finally {
      console.log("=== END ROLE SELECTION PROCESS ===");
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
