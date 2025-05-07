import { ScrollView, Text, View } from "react-native";

export default function StartupDashboard() {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: "#111827" }}>
      <View className="p-6">
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
