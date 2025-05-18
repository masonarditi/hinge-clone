import { useMyProfile } from "@/api/my-profile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CandidateDashboard() {
  const { data: profile } = useMyProfile();

  const skills = [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "UI/UX",
    "DevOps",
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
            CANDIDATE DASHBOARD
          </Text>

          {/* Analytics Card */}
          <View className="bg-gray-800 rounded-3xl overflow-hidden mb-6 p-4">
            <Text
              className="text-xl font-poppins-medium mb-3"
              style={{ color: "#ecac6d" }}
            >
              Your Analytics
            </Text>

            <View className="flex-row justify-between mb-3">
              <View className="items-center">
                <Text className="text-white text-2xl font-poppins-medium">
                  18
                </Text>
                <Text className="text-gray-400 text-xs">Profile Views</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-poppins-medium">
                  5
                </Text>
                <Text className="text-gray-400 text-xs">Matches</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-poppins-medium">
                  7
                </Text>
                <Text className="text-gray-400 text-xs">Saved</Text>
              </View>
            </View>
          </View>

          {/* Startups Interested In You */}
          <Text
            className="text-xl font-poppins-medium mb-3"
            style={{ color: "#ecac6d" }}
          >
            Startups Interested In You
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
                    Startup {item}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {item === 1
                      ? "Seed Stage"
                      : item === 2
                        ? "Series A"
                        : "Series B"}
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

          {/* Skills Section */}
          <Text
            className="text-xl font-poppins-medium mb-3"
            style={{ color: "#ecac6d" }}
          >
            YOUR SKILLS
          </Text>

          {/* Skills Grid */}
          <View className="flex-row flex-wrap justify-between mb-4">
            {(profile?.skills || skills).map((skill, index) => (
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
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recommended Startups */}
          <Text
            className="text-xl font-poppins-medium mb-3"
            style={{ color: "#ecac6d" }}
          >
            RECOMMENDED STARTUPS
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
                    Tech Startup {item}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    Looking for:{" "}
                    {item === 1
                      ? "Frontend Developer"
                      : item === 2
                        ? "Full Stack Developer"
                        : "DevOps Engineer"}
                  </Text>
                </View>
                <TouchableOpacity className="bg-gray-700 p-2 rounded-full">
                  <Ionicons name="star-outline" size={16} color="#ecac6d" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            className="rounded-xl p-3 mb-6"
            style={{ backgroundColor: "#ecac6d" }}
            onPress={() => router.push("/profile")}
          >
            <Text className="text-gray-900 text-center font-bold">
              Edit Your Profile
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Tab Bar */}
      <View
        className="h-16 flex-row justify-around items-center rounded-t-xl"
        style={{ backgroundColor: "#1f2937" }}
      >
        <TouchableOpacity onPress={() => router.push("/")}>
          <Ionicons name="search" size={22} color="#ecac6d" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/likes")}>
          <Ionicons name="bookmark" size={22} color="#ecac6d" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/matches")}>
          <Ionicons name="chatbubbles" size={22} color="#ecac6d" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Ionicons name="person" size={22} color="#ecac6d" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
