// app/_layout.tsx
import { DebugTouchHandler } from "@/components/debug-touch";
import { fonts } from "@/constants/fonts";
import { platformServices } from "@/lib/sendbird";
import { AuthProvider } from "@/store/auth";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SendbirdUIKitContainer } from "@sendbird/uikit-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { VideoView } from "expo-video";
import LottieView from "lottie-react-native";
import { cssInterop } from "nativewind";
import React, { useEffect } from "react";
import { View } from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

cssInterop(VideoView, { className: { target: "style" } });
cssInterop(Ionicons, { className: { target: "style" } });
cssInterop(Image, { className: { target: "style" } });
cssInterop(MapView, { className: { target: "style" } });
cssInterop(Checkbox, { className: { target: "style" } });
cssInterop(LottieView, { className: { target: "style" } });

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function Layout() {
  const [loaded, error] = useFonts(fonts);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <DebugTouchHandler>
      <View style={{ flex: 1, backgroundColor: "#1f2937" }}>
        <StatusBar style="light" translucent={true} />
        <SafeAreaView edges={["top"]} className="flex-1 bg-gray-900">
          <SendbirdUIKitContainer
            appId={process.env.EXPO_PUBLIC_SENDBIRD_APP_ID!}
            chatOptions={{ localCacheStorage: AsyncStorage }}
            platformServices={platformServices}
          >
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen
                    name="(app)"
                    options={{
                      animation: "none",
                    }}
                  />
                  <Stack.Screen
                    name="(auth)"
                    options={{
                      animation: "none",
                    }}
                  />
                </Stack>
              </AuthProvider>
            </QueryClientProvider>
          </SendbirdUIKitContainer>
        </SafeAreaView>
      </View>
    </DebugTouchHandler>
  );
}
