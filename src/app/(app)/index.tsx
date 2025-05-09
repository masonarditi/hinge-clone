import { useMyProfile } from "@/api/my-profile";
import {
  useChildren,
  useCovidVaccine,
  useEthnicities,
  useFamilyPlans,
  useGenders,
  usePets,
  usePrompts,
  usePronouns,
  useSexualities,
  useZodiacSigns,
} from "@/api/options";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function Page() {
  const { isPending, isError } = useMyProfile();

  usePrompts();
  useChildren();
  useCovidVaccine();
  useEthnicities();
  useFamilyPlans();
  useGenders();
  usePets();
  usePronouns();
  useSexualities();
  useZodiacSigns();

  if (isPending) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size={"small"} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text>Something went wrong.</Text>
      </View>
    );
  }

  return <Redirect href={"/(app)/(tabs)"} />;
}
