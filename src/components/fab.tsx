import { cn } from "@/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import React, { FC } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

interface Props {
  disabled?: boolean;
  onPress?: () => void;
  loading?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  className?: string;
  iconClassName?: string;
  loaderClassName?: string;
}

export const Fab: FC<Props> = ({
  disabled = false,
  onPress,
  loading = false,
  iconName = "chevron-forward",
  className,
  iconClassName,
  loaderClassName,
}) => {
  const handlePress = () => {
    console.log("Fab button pressed", { iconName, disabled });
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      className={cn(
        "h-16 aspect-square rounded-full justify-center items-center bg-fuchsia-900",
        {
          "bg-neutral-200": disabled && !loading,
          "opacity-50": disabled,
        },
        className
      )}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      {loading ? (
        <ActivityIndicator className={cn(" text-white", loaderClassName)} />
      ) : (
        <View
          className={cn(
            "text-white",
            { "text-neutral-400": disabled },
            iconClassName
          )}
        >
          <Ionicons
            name={iconName}
            className={cn(
              "text-2xl text-white",
              { "text-neutral-400": disabled },
              iconClassName
            )}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};
