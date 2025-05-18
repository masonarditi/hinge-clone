import { FC, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  title: string;
  subTitle: string;
  primaryText?: string;
  secondaryText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  extraContent?: ReactNode;
}

export const Empty: FC<Props> = ({
  title,
  subTitle,
  onPrimaryPress,
  onSecondaryPress,
  primaryText,
  secondaryText,
  extraContent,
}) => {
  return (
    <SafeAreaView className="flex-1 p-5 bg-gray-900 justify-center gap-8">
      <View className="gap-2">
        <Text
          className="text-2xl font-playfair-semibold text-center"
          style={{ color: "#ecac6d" }}
        >
          {title}
        </Text>
        <Text
          className="font-poppins-light text-center"
          style={{ color: "#ecac6d" }}
        >
          {subTitle}
        </Text>
      </View>
      <View className="gap-2 px-5">
        {primaryText && (
          <Pressable
            className="h-14 bg-black items-center justify-center rounded-full w-full"
            style={{ borderColor: "#ecac6d", borderWidth: 1 }}
            onPress={onPrimaryPress}
          >
            <Text className="font-poppins-medium" style={{ color: "#ecac6d" }}>
              {primaryText}
            </Text>
          </Pressable>
        )}
        {secondaryText && (
          <Pressable
            className="h-14 bg-gray-900 items-center justify-center rounded-full border"
            style={{ borderColor: "#ecac6d" }}
            onPress={onSecondaryPress}
          >
            <Text className="font-poppins-medium" style={{ color: "#ecac6d" }}>
              {secondaryText}
            </Text>
          </Pressable>
        )}
        {extraContent && (
          <View className="items-center mt-4">{extraContent}</View>
        )}
      </View>
    </SafeAreaView>
  );
};
