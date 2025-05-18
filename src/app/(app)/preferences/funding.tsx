import { PrivateProfile } from "@/api/my-profile/types";
import { StackHeaderV4 } from "@/components/stack-header-v4";
import { supabase } from "@/lib/supabase";
import { useEdit } from "@/store/edit";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

const fundingStages = [
  { id: 1, name: "Pre-seed" },
  { id: 2, name: "Seed" },
  { id: 3, name: "Series A" },
  { id: 4, name: "Series B" },
  { id: 5, name: "Series C+" },
  { id: 6, name: "Bootstrapped" },
  { id: 7, name: "Revenue Generating" },
];

export default function FundingPreference() {
  const { edits, setEdits } = useEdit();
  const [selected, setSelected] = useState(edits?.funding_stage || "");

  const handlePress = async () => {
    try {
      setEdits({
        ...edits,
        funding_stage: selected,
      } as PrivateProfile);

      // Get the current user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update the profile directly
      const { error } = await supabase
        .from("profiles")
        .update({ funding_stage: selected } as any)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      router.back();
    } catch (error) {
      Alert.alert("Error", "Something went wrong, please try again later.");
      console.error(error);
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-gray-900 p-5">
      <StackHeaderV4 title="Funding Stage" onPressBack={handlePress} />
      <View className="mt-4">
        {fundingStages.map((stage) => (
          <Pressable
            key={stage.id}
            onPress={() => setSelected(stage.name)}
            className={`py-3 px-4 rounded mb-2 ${
              selected === stage.name ? "bg-amber-800" : "bg-gray-800"
            }`}
          >
            <Text className="text-white">{stage.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
