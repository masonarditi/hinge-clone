import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function StartupDashboard() {
  const [activeIndex] = useState(0);
  const roles = [
    "Designer",
    "Developer",
    "Marketing",
    "Finance",
    "Sales",
    "Creative",
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: "#111827" }}>
      <ScrollView className="flex-1">
        <View className="p-6 relative">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute right-6 top-0 z-10"
          >
            <Text className="text-2xl" style={{ color: "#ecac6d" }}>
              ✕
            </Text>
          </TouchableOpacity>

          <Text
            className="text-3xl font-playfair-semibold mb-6"
            style={{ color: "#ecac6d" }}
          >
            DISCOVER
          </Text>

          {/* Spotlight Profile Card */}
          <View className="bg-gray-800 rounded-3xl overflow-hidden mb-4">
            <View className="p-4">
              <Image
                source={{ uri: "https://placehold.co/400x200" }}
                className="w-full h-48 rounded-xl mb-4"
                resizeMode="cover"
              />
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: "#ecac6d" }}
              >
                SPOTLIGHT
              </Text>
              <Text className="text-sm mb-4" style={{ color: "#ecac6d" }}>
                SYNC DAILY
              </Text>

              <Image
                source={{ uri: "https://placehold.co/400x150" }}
                className="w-full h-28 rounded-xl mb-4"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Pagination Dots */}
          <View className="flex-row justify-center space-x-2 mb-6">
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === activeIndex ? "bg-amber-500" : "bg-gray-600"
                }`}
                style={{
                  backgroundColor: i === activeIndex ? "#ecac6d" : "#374151",
                }}
              />
            ))}
          </View>

          {/* Roles Section */}
          <Text
            className="text-2xl font-playfair-semibold mb-4"
            style={{ color: "#ecac6d" }}
          >
            ROLES
          </Text>

          {/* Role Buttons Grid */}
          <View className="flex-row flex-wrap justify-between">
            {roles.map((role, index) => (
              <TouchableOpacity
                key={index}
                className="w-[48%] rounded-xl p-3 mb-4"
                style={{ backgroundColor: "#ecac6d" }}
              >
                <Text className="text-gray-900 text-center font-bold">
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Tab Bar */}
      <View
        className="h-16 flex-row justify-around items-center rounded-t-xl"
        style={{ backgroundColor: "#1f2937" }}
      >
        <TouchableOpacity>
          <Text style={{ color: "#ecac6d", fontSize: 22 }}>★</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={{ color: "#ecac6d", fontSize: 22 }}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={{ color: "#ecac6d", fontSize: 22 }}>✦</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={{ color: "#ecac6d", fontSize: 22 }}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={{ color: "#ecac6d", fontSize: 22 }}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
