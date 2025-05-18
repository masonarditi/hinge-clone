import React from "react";
import { Pressable, Text, View } from "react-native";

interface ProfileCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

const ProfileCard = ({
  icon,
  title,
  subtitle,
  onPress,
  ...rest
}: ProfileCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 border rounded-md p-3"
      style={{ borderColor: "#ecac6d" }}
      {...rest}
    >
      <View
        className="h-12 aspect-square rounded-full items-center justify-center"
        style={{
          backgroundColor: "#1a1a1a",
          borderColor: "#ecac6d",
          borderWidth: 1,
        }}
      >
        {icon}
      </View>
      <View>
        <Text className="font-poppins-medium" style={{ color: "#ecac6d" }}>
          {title}
        </Text>
        <Text
          className="text-sm font-poppins-light"
          style={{ color: "#ecac6d" }}
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
};

export default ProfileCard;
