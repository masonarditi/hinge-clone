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
import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Page() {
  const { isPending, isError, error } = useMyProfile();
  const router = useRouter();

  useEffect(() => {
    // If there's a profile not found error, redirect to sign-in
    if (isError && error?.message?.includes("profile not found")) {
      console.log("Redirecting to sign-in page...");
      router.replace("/(auth)/sign-in");
    }
  }, [isError, error, router]);

  console.log("App index loading state:", { isPending, isError, error });

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
