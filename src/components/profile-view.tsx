import { Profile, Project, WorkExperience } from "@/types/profile";
import { Ionicons } from "@expo/vector-icons";
import { FC } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { ProfilePhoto } from "./profile-photo";

interface Props {
  profile: Profile;
  myProfile?: boolean;
  onLike?: (id: string, type: "answer" | "photo") => void;
}

export const ProfileView: FC<Props> = ({ profile, myProfile, onLike }) => {
  const renderStartupProfile = () => {
    const elements: JSX.Element[] = [];

    // Compatibility score
    elements.push(
      <View key="compatibility" className="bg-gray-800 rounded-xl p-4 mb-4">
        <Text className="text-white font-poppins-medium mb-1">
          Compatibility Score
        </Text>
        <View className="flex-row items-center">
          <View className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
              style={{ width: `${(profile.compatibility_score || 7) * 10}%` }}
            />
          </View>
          <Text className="text-white font-poppins-medium ml-3">
            {profile.compatibility_score?.toFixed(1) || "7.0"}/10
          </Text>
        </View>
      </View>
    );

    // Photos in a better layout
    if (profile.photos && profile.photos.length > 0) {
      elements.push(
        <View key="photos" className="mb-4 rounded-xl overflow-hidden">
          <ProfilePhoto photo={profile.photos[0]} />
        </View>
      );
    }

    // Funding stage moved higher up - immediately after photos for more visibility
    if (profile.funding_stage) {
      elements.push(
        <View key="funding" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="cash-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              Funding Stage
            </Text>
          </View>
          <View className="bg-gray-700 py-3 px-4 rounded-lg">
            <Text className="text-white font-poppins-medium text-center">
              {profile.funding_stage}
            </Text>
          </View>
        </View>
      );
    }

    // Company description
    if (profile.one_line_description) {
      elements.push(
        <View key="description" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="business-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              About the Company
            </Text>
          </View>
          <Text className="text-white font-poppins text-base">
            {profile.one_line_description}
          </Text>
        </View>
      );
    }

    // Looking for roles
    if (profile.looking_for_roles && profile.looking_for_roles.length > 0) {
      elements.push(
        <View key="roles" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="search-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              What we're looking for
            </Text>
          </View>
          <View className="flex-row flex-wrap">
            {profile.looking_for_roles.map((role, index) => (
              <View
                key={index}
                className="bg-gray-700 rounded-full px-4 py-2 mr-2 mb-2"
              >
                <Text className="text-white font-poppins">{role}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    // Offer details
    if (profile.offer_details) {
      elements.push(
        <View key="offer" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="gift-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              What we offer
            </Text>
          </View>
          <View className="flex-row mb-2">
            <View className="flex-1 bg-gray-700 rounded-lg p-3 mr-2">
              <Text className="text-gray-400 text-xs mb-1">Equity</Text>
              <Text className="text-white font-poppins-medium">
                {profile.offer_details.equity}
              </Text>
            </View>
            <View className="flex-1 bg-gray-700 rounded-lg p-3">
              <Text className="text-gray-400 text-xs mb-1">Salary Range</Text>
              <Text className="text-white font-poppins-medium">
                {profile.offer_details.salary_range}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // Why us
    if (profile.why_us_platform) {
      elements.push(
        <View key="why_us" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="people-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              Why join us
            </Text>
          </View>
          <Text className="text-white font-poppins">
            {profile.why_us_platform}
          </Text>
        </View>
      );
    }

    // Additional photos in gallery format
    if (profile.photos && profile.photos.length > 1) {
      elements.push(
        <View key="gallery" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="images-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              Team & Office
            </Text>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {profile.photos.slice(1).map((photo, index) => (
              <View
                key={index}
                className="w-[48%] aspect-square mb-4 rounded-lg overflow-hidden"
              >
                <ProfilePhoto photo={photo} />
              </View>
            ))}
          </View>
        </View>
      );
    }

    return elements;
  };

  const renderCandidateProfile = () => {
    const elements: JSX.Element[] = [];

    // Compatibility score
    elements.push(
      <View key="compatibility" className="bg-gray-800 rounded-xl p-4 mb-4">
        <Text className="text-white font-poppins-medium mb-1">
          Compatibility Score
        </Text>
        <View className="flex-row items-center">
          <View className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
              style={{ width: `${(profile.compatibility_score || 8) * 10}%` }}
            />
          </View>
          <Text className="text-white font-poppins-medium ml-3">
            {profile.compatibility_score?.toFixed(1) || "8.0"}/10
          </Text>
        </View>
      </View>
    );

    // Main profile photo
    if (profile.photos && profile.photos.length > 0) {
      elements.push(
        <View key="photos" className="mb-4 rounded-xl overflow-hidden">
          <ProfilePhoto photo={profile.photos[0]} />
        </View>
      );
    }

    // Candidate description
    if (profile.one_line_description) {
      elements.push(
        <View key="description" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="person-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              About me
            </Text>
          </View>
          <Text className="text-white font-poppins text-base">
            {profile.one_line_description}
          </Text>
        </View>
      );
    }

    // Skills with visual styling
    if (profile.skills && profile.skills.length > 0) {
      elements.push(
        <View key="skills" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="code-slash-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              Skills & Languages
            </Text>
          </View>
          <View className="flex-row flex-wrap">
            {profile.skills.map((skill, index) => (
              <View
                key={index}
                className="bg-gray-700 rounded-full px-4 py-2 mr-2 mb-2"
              >
                <Text className="text-white font-poppins">{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    // Work experience with timeline styling
    if (profile.work_experiences && profile.work_experiences.length > 0) {
      elements.push(
        <View key="work" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="briefcase-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              Work Experience
            </Text>
          </View>
          {profile.work_experiences.map((work: WorkExperience, index) => (
            <View key={index} className="mb-4 flex-row">
              <View
                className="w-2 bg-gray-700 rounded-full mr-3 mt-1"
                style={{
                  height:
                    index === profile.work_experiences!.length - 1
                      ? 20
                      : "100%",
                }}
              />
              <View className="flex-1 bg-gray-700 p-3 rounded-lg">
                <Text className="text-white font-poppins-medium text-base">
                  {work.company_name}
                </Text>
                <Text className="text-white font-poppins">{work.role}</Text>
                <Text className="text-gray-400 font-poppins-light text-sm">
                  {work.is_current
                    ? "Current"
                    : work.start_date + " - " + (work.end_date || "Present")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    // Projects with better showcase
    if (profile.projects && profile.projects.length > 0) {
      elements.push(
        <View key="projects" className="bg-gray-800 p-5 rounded-xl mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="folder-open-outline" size={20} color="#ecac6d" />
            <Text
              className="text-lg font-poppins-medium ml-2"
              style={{ color: "#ecac6d" }}
            >
              Portfolio & Projects
            </Text>
          </View>
          {profile.projects.map((project: Project, index) => (
            <View
              key={`project_${index}`}
              className="mb-4 bg-gray-700 rounded-lg overflow-hidden"
            >
              {project.media && project.media.length > 0 && (
                <View className="h-40 overflow-hidden">
                  <ProfilePhoto
                    photo={{
                      id: project.media[0].id,
                      photo_url: project.media[0].url,
                      photo_order: project.media[0].media_order,
                    }}
                  />
                </View>
              )}
              <View className="p-3">
                <Text className="text-white font-poppins-medium text-lg mb-1">
                  {project.title}
                </Text>
                <Text className="text-white font-poppins">
                  {project.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    return elements;
  };

  const generateProfile = (): JSX.Element[] => {
    // Determine if this is a startup or candidate profile
    if (profile.user_role === "startup") {
      return renderStartupProfile();
    } else {
      return renderCandidateProfile();
    }
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="py-3 gap-2"
      showsVerticalScrollIndicator={false}
    >
      {!myProfile && (
        <View className="bg-gray-800 p-4 rounded-xl mb-4 flex-row items-center">
          <View className="w-14 h-14 rounded-full overflow-hidden mr-3">
            {profile.photos && profile.photos.length > 0 ? (
              <Image
                source={{ uri: profile.photos[0].photo_url }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View className="w-full h-full bg-gray-700 items-center justify-center">
                <Ionicons
                  name={profile.user_role === "startup" ? "business" : "person"}
                  size={24}
                  color="#ecac6d"
                />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text
              className="text-2xl font-poppins-semibold"
              style={{ color: "#ecac6d" }}
            >
              {profile.first_name} {profile.last_name}
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name={profile.user_role === "startup" ? "business" : "person"}
                size={14}
                color="#ecac6d"
                style={{ marginRight: 4 }}
              />
              <Text
                className="text-base font-poppins"
                style={{ color: "#ecac6d" }}
              >
                {profile.user_role === "startup" ? "Startup" : "Candidate"}
              </Text>
            </View>
          </View>
        </View>
      )}
      {generateProfile()}
    </ScrollView>
  );
};
