import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function StartupDashboard() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: "#111827" }}>
      <View className="p-6 relative">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute right-6 top-0 z-10"
        >
          <Text className="text-2xl text-white">✕</Text>
        </TouchableOpacity>

        <Text
          className="text-3xl font-playfair-semibold mb-4"
          style={{ color: "#ecac6d" }}
        >
          Discover
        </Text>
        {/* Blank content */}
      </View>
    </ScrollView>
  );
}
