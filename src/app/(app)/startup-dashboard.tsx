import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  // Get screen width to calculate square dimensions
  const screenWidth = Dimensions.get("window").width - 48; // Accounting for padding

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
          <View
            className="bg-gray-800 rounded-3xl overflow-hidden mb-4"
            style={{ width: screenWidth, height: screenWidth }}
          >
            {/* Top Image (bottom half visible) */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: screenWidth / 4,
                width: screenWidth / 2,
                height: screenWidth / 3.5,
                overflow: "hidden",
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}
            >
              <Image
                source={{
                  uri: "https://www.instagram.com/p/Cyns-rouX1i/media?size=l",
                }}
                style={{
                  width: "100%",
                  height: screenWidth / 1.75,
                  marginTop: -screenWidth / 3.5,
                }}
                resizeMode="cover"
              />
            </View>

            {/* Bottom Left Image (top-right corner visible) */}
            <View
              style={{
                position: "absolute",
                bottom: -10,
                left: -10,
                width: screenWidth / 3,
                height: screenWidth / 3,
                overflow: "hidden",
                borderTopRightRadius: 20,
              }}
            >
              <Image
                source={{
                  uri: "https://www.instagram.com/p/C5Ef_4ZvU4D/media?size=l",
                }}
                style={{
                  width: screenWidth / 1.5,
                  height: screenWidth / 1.5,
                  marginLeft: -screenWidth / 6,
                  marginTop: -screenWidth / 6,
                }}
                resizeMode="cover"
              />
            </View>

            {/* Bottom Right Image (left half visible) */}
            <View
              style={{
                position: "absolute",
                bottom: -10,
                right: -10,
                width: screenWidth / 3,
                height: screenWidth / 3,
                overflow: "hidden",
                borderTopLeftRadius: 20,
              }}
            >
              <Image
                source={{
                  uri: "https://www.instagram.com/p/Cyns-rouX1i/media?size=l",
                }}
                style={{
                  width: screenWidth / 1.5,
                  height: screenWidth / 3,
                }}
                resizeMode="cover"
              />
            </View>

            <View className="flex-1 justify-center items-center p-4">
              <View className="flex-1 w-full justify-center items-center">
                <Text
                  style={{
                    color: "#ecac6d",
                    fontSize: 52,
                    fontWeight: "900",
                    letterSpacing: 2,
                    textAlign: "center",
                  }}
                >
                  SPOTLIGHT
                </Text>

                <Text
                  style={{
                    color: "#ecac6d",
                    fontSize: 20,
                    fontWeight: "800",
                    textAlign: "center",
                    marginTop: 12,
                  }}
                >
                  SYNC DAILY
                </Text>
              </View>
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
