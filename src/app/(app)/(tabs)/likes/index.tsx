import { useMyProfile } from "@/api/my-profile";
import { useLikes } from "@/api/profiles";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useRefreshOnFocus } from "@/hooks/refetch";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SavedPage() {
  const { data: myProfile } = useMyProfile();
  const { data, isFetching, isError, refetch } = useLikes();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  useRefreshOnFocus(refetch);

  const isStartup = myProfile?.user_role === "startup";
  const savedLabel = isStartup ? "Saved Candidates" : "Saved Startups";

  if (isFetching) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Empty
        title="Something went wrong"
        subTitle="We ran into a problem loading your saved profiles, sorry about that!"
        primaryText="Try again"
        onPrimaryPress={() => refetch()}
      />
    );
  }

  const renderGridItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        className="bg-gray-800 rounded-xl overflow-hidden"
        style={{ width: "48%", marginBottom: 16 }}
        onPress={() => router.push(`/likes/${item.id}`)}
      >
        <View className="h-36 bg-gray-700">
          {item.profile.photos && item.profile.photos.length > 0 ? (
            <Image
              source={{ uri: item.profile.photos[0].photo_url }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons
                name={
                  item.profile.user_role === "startup" ? "business" : "person"
                }
                size={40}
                color="#ecac6d"
              />
            </View>
          )}
        </View>
        <View className="p-3">
          <Text className="text-white font-poppins-medium">
            {item.profile.first_name} {item.profile.last_name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons
              name={
                item.profile.user_role === "startup" ? "business" : "briefcase"
              }
              size={12}
              color="#8E8E93"
              style={{ marginRight: 4 }}
            />
            <Text className="text-gray-400 text-xs">
              {item.profile.user_role === "startup"
                ? item.profile.funding_stage || "Startup"
                : item.profile.skills && item.profile.skills.length > 0
                  ? item.profile.skills[0]
                  : "Candidate"}
            </Text>
          </View>
        </View>
        {item.compatibility_score && (
          <View
            className="absolute top-2 right-2 bg-gray-900 rounded-full px-2 py-1 flex-row items-center"
            style={{ opacity: 0.9 }}
          >
            <Ionicons
              name="star"
              size={12}
              color="#ecac6d"
              style={{ marginRight: 2 }}
            />
            <Text className="text-white text-xs font-poppins-medium">
              {item.compatibility_score.toFixed(1)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        className="bg-gray-800 rounded-xl overflow-hidden mb-4 flex-row"
        onPress={() => router.push(`/likes/${item.id}`)}
      >
        <View className="h-20 w-20 bg-gray-700">
          {item.profile.photos && item.profile.photos.length > 0 ? (
            <Image
              source={{ uri: item.profile.photos[0].photo_url }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons
                name={
                  item.profile.user_role === "startup" ? "business" : "person"
                }
                size={28}
                color="#ecac6d"
              />
            </View>
          )}
        </View>
        <View className="flex-1 p-3 justify-center">
          <Text className="text-white font-poppins-medium">
            {item.profile.first_name} {item.profile.last_name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons
              name={
                item.profile.user_role === "startup" ? "business" : "briefcase"
              }
              size={12}
              color="#8E8E93"
              style={{ marginRight: 4 }}
            />
            <Text className="text-gray-400 text-xs" numberOfLines={1}>
              {item.profile.user_role === "startup"
                ? item.profile.funding_stage || "Startup"
                : item.profile.skills && item.profile.skills.length > 0
                  ? item.profile.skills.slice(0, 2).join(", ")
                  : "Candidate"}
            </Text>
          </View>
        </View>
        {item.compatibility_score && (
          <View className="px-3 justify-center">
            <View className="bg-gray-900 rounded-full px-2 py-1 flex-row items-center">
              <Ionicons
                name="star"
                size={12}
                color="#ecac6d"
                style={{ marginRight: 2 }}
              />
              <Text className="text-white text-xs font-poppins-medium">
                {item.compatibility_score.toFixed(1)}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row justify-between items-center">
          <Text
            className="text-3xl font-playfair-semibold"
            style={{ color: "#ecac6d" }}
          >
            {savedLabel}
          </Text>
          <View className="flex-row bg-gray-800 rounded-full p-1">
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${viewMode === "grid" ? "bg-gray-700" : ""}`}
              onPress={() => setViewMode("grid")}
            >
              <Ionicons name="grid" size={18} color="#ecac6d" />
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${viewMode === "list" ? "bg-gray-700" : ""}`}
              onPress={() => setViewMode("list")}
            >
              <Ionicons name="list" size={18} color="#ecac6d" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {data.length === 0 ? (
        <Empty
          title={`No saved ${isStartup ? "candidates" : "startups"} yet`}
          subTitle={`When you find ${isStartup ? "candidates" : "startups"} you're interested in, save them here to view later.`}
        />
      ) : viewMode === "grid" ? (
        <FlatList
          data={data}
          renderItem={renderGridItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={data}
          renderItem={renderListItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
