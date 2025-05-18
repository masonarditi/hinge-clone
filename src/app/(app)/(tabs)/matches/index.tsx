import { useMyProfile } from "@/api/my-profile";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data for connections
const MOCK_CONNECTIONS = [
  {
    id: "1",
    name: "TechNova",
    role: "startup",
    photo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    funding: "Series A",
    lastMessage:
      "Thanks for connecting! Are you available for a call this week?",
    timestamp: "10:30 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Alex Johnson",
    role: "candidate",
    photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5",
    skills: ["Full Stack", "React", "Node.js"],
    lastMessage: "Looking forward to discussing the opportunity!",
    timestamp: "Yesterday",
    unread: 0,
  },
  {
    id: "3",
    name: "GreenEarth",
    role: "startup",
    photo: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf",
    funding: "Seed",
    lastMessage: "Hi there! We'd love to chat more about your experience.",
    timestamp: "2 days ago",
    unread: 0,
  },
  {
    id: "4",
    name: "Jordan Chen",
    role: "candidate",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    skills: ["UI/UX", "Figma", "React"],
    lastMessage: "Thanks for the offer! Let me review the details.",
    timestamp: "3 days ago",
    unread: 0,
  },
];

export default function ConnectionsPage() {
  const { data: myProfile, isLoading } = useMyProfile();
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);

  const isStartup = myProfile?.user_role === "startup";

  // Fetch connections effect
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setConnections(MOCK_CONNECTIONS);
      setIsLoadingConnections(false);
    }, 1000);
  }, []);

  if (isLoading || isLoadingConnections) {
    return <Loader />;
  }

  const renderConnectionItem = ({ item }: { item: any }) => {
    const isUserStartup = myProfile?.user_role === "startup";
    const isCounterpartStartup = item.role === "startup";

    // Only show connections relevant to the user
    // For startups: show candidates, for candidates: show startups
    if (isUserStartup === isCounterpartStartup) {
      return null;
    }

    return (
      <TouchableOpacity
        className="bg-gray-800 p-4 rounded-xl mb-3 flex-row"
        onPress={() => router.push(`/matches/${item.id}`)}
      >
        <View className="h-16 w-16 rounded-full overflow-hidden bg-gray-700 mr-3">
          {item.photo ? (
            <Image
              source={{ uri: item.photo }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons
                name={isCounterpartStartup ? "business" : "person"}
                size={24}
                color="#ecac6d"
              />
            </View>
          )}
        </View>

        <View className="flex-1 justify-center">
          <View className="flex-row justify-between items-center">
            <Text className="text-white font-poppins-medium text-base">
              {item.name}
            </Text>
            <Text className="text-gray-400 text-xs">{item.timestamp}</Text>
          </View>

          <View className="flex-row items-center mt-1">
            <Ionicons
              name={isCounterpartStartup ? "business" : "code-slash"}
              size={12}
              color="#8E8E93"
              style={{ marginRight: 4 }}
            />
            <Text className="text-gray-400 text-xs" numberOfLines={1}>
              {isCounterpartStartup ? item.funding : item.skills?.join(", ")}
            </Text>
          </View>

          <Text className="text-gray-300 text-sm mt-1" numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>

        {item.unread > 0 && (
          <View
            className="h-5 w-5 rounded-full bg-ecac6d items-center justify-center"
            style={{ backgroundColor: "#ecac6d" }}
          >
            <Text className="text-gray-900 text-xs font-bold">
              {item.unread}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filteredConnections = connections.filter(
    (conn) =>
      (isStartup && conn.role === "candidate") ||
      (!isStartup && conn.role === "startup")
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="px-4 pt-2 pb-4">
        <Text
          className="text-3xl font-playfair-semibold"
          style={{ color: "#ecac6d" }}
        >
          Connections
        </Text>
      </View>

      {filteredConnections.length === 0 ? (
        <Empty
          title="No connections yet"
          subTitle={`When you match with ${isStartup ? "candidates" : "startups"}, you'll be able to message them here.`}
        />
      ) : (
        <FlatList
          data={connections}
          renderItem={renderConnectionItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
