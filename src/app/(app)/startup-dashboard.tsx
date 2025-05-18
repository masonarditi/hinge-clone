import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function StartupDashboard() {
  const roles = [
    "Full Stack",
    "Frontend",
    "Backend",
    "UI/UX",
    "Mobile",
    "DevOps",
  ];

  const handleClose = () => {
    router.push("/(app)/(tabs)");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#111827" }}>
      <ScrollView className="flex-1">
        <View className="p-6 relative">
          <TouchableOpacity
            onPress={handleClose}
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
            STARTUP DASHBOARD
          </Text>

          {/* Analytics Card */}
          <View className="bg-gray-800 rounded-3xl overflow-hidden mb-6 p-4">
            <Text
              className="text-xl font-poppins-medium mb-3"
              style={{ color: "#ecac6d" }}
            >
              Candidate Analytics
            </Text>

            <View className="flex-row justify-between mb-3">
              <View className="items-center">
                <Text className="text-white text-2xl font-poppins-medium">
                  24
                </Text>
                <Text className="text-gray-400 text-xs">Profile Views</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-poppins-medium">
                  8
                </Text>
                <Text className="text-gray-400 text-xs">Matches</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-poppins-medium">
                  12
                </Text>
                <Text className="text-gray-400 text-xs">Saved</Text>
              </View>
            </View>
          </View>

          {/* Recent Candidates */}
          <Text
            className="text-xl font-poppins-medium mb-3"
            style={{ color: "#ecac6d" }}
          >
            Recent Candidates
          </Text>

          <View className="mb-6">
            {[1, 2, 3].map((item) => (
              <View
                key={item}
                className="bg-gray-800 rounded-lg mb-3 p-3 flex-row items-center"
              >
                <View className="bg-gray-700 h-12 w-12 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-white font-poppins-medium">
                    Candidate {item}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    Full Stack Developer
                  </Text>
                </View>
                <TouchableOpacity className="bg-gray-700 p-2 rounded-full">
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#ecac6d"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Roles Section */}
          <Text
            className="text-xl font-poppins-medium mb-3"
            style={{ color: "#ecac6d" }}
          >
            OPEN ROLES
          </Text>

          {/* Role Buttons Grid */}
          <View className="flex-row flex-wrap justify-between mb-4">
            {roles.map((role, index) => (
              <TouchableOpacity
                key={index}
                className="w-[48%] rounded-xl p-3 mb-4"
                style={{
                  backgroundColor: "#1f2937",
                  borderColor: "#ecac6d",
                  borderWidth: 1,
                }}
              >
                <Text className="text-center" style={{ color: "#ecac6d" }}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add New Role Button */}
          <TouchableOpacity
            className="rounded-xl p-3 mb-6"
            style={{ backgroundColor: "#ecac6d" }}
          >
            <Text className="text-gray-900 text-center font-bold">
              + Add New Role
            </Text>
          </TouchableOpacity>
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
