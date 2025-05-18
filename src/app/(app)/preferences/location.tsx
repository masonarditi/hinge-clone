import { useUpdateLocation } from "@/api/my-profile";
import { LocationView } from "@/components/location-view";
import { StackHeaderV4 } from "@/components/stack-header-v4";
import { useEdit } from "@/store/edit";
import { LocationData } from "@/types/location";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

export default function LocationPage() {
  const { edits } = useEdit();
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    latitude: edits?.latitude || null,
    longitude: edits?.longitude || null,
    neighborhood: edits?.neighborhood || null,
  });
  const { mutate, reset } = useUpdateLocation();

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
      mutate(
        {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          neighborhood: selectedLocation.neighborhood,
        },
        {
          onSuccess: () => {
            router.back();
          },
          onError: () => {
            Alert.alert(
              "Error",
              "Something went wrong, please try again later."
            );
            reset();
          },
        }
      );
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-900 p-5">
      <StackHeaderV4 title="Location" onPressBack={handlePress} />
      <Text className="text-white font-poppins-light mb-6">
        Set your location to help match with local opportunities.
      </Text>
      <Text className="text-white font-poppins-light mb-10">
        Only your city/region will be visible on your profile. Exact coordinates
        are kept private.
      </Text>
      <LocationView
        location={selectedLocation}
        onLocationChange={handleLocationChange}
      />
    </View>
  );
}
