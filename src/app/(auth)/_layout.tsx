import { useAuth } from "@/store/auth";
import { Redirect, Stack, usePathname } from "expo-router";

export default function Layout() {
  const { session } = useAuth();
  const pathname = usePathname();

  // Allow access to onboarding even when authenticated
  if (session && pathname !== "/onboarding-user-role") {
    return <Redirect href={"/(app)/(tabs)"} />;
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="onboarding-user-role" />
    </Stack>
  );
}
