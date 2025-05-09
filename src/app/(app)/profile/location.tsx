import { PrivateProfile } from "@/api/my-profile/types";
import { LocationView } from "@/components/location-view";
import { StackHeaderV4 } from "@/components/stack-header-v4";
import { useEdit } from "@/store/edit";
import { LocationData } from "@/types/location";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

export default function Page() {
  const { edits, setEdits } = useEdit();
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    latitude: edits?.latitude || null,
    longitude: edits?.longitude || null,
    neighborhood: edits?.neighborhood || null,
  });

  const handleLocationChange = (location: LocationData | null) => {
    if (location) {
      setSelectedLocation(location);
    } else {
      setSelectedLocation({
        latitude: null,
        longitude: null,
        neighborhood: "",
      });
    }
  };

  const handlePress = () => {
    if (
      selectedLocation.latitude !== null &&
      selectedLocation.longitude !== null &&
      selectedLocation.neighborhood !== null
    ) {
      setEdits({
        ...edits,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        neighborhood: selectedLocation.neighborhood,
      } as PrivateProfile);
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-900 p-5">
      <StackHeaderV4 title="Location" onPressBack={handlePress} />
      <Text className="text-white font-poppins-light mb-10">
        Only the neighborhood name will appear on your profile.
      </Text>
      <LocationView
        location={selectedLocation}
        onLocationChange={handleLocationChange}
      />
    </View>
  );
}
