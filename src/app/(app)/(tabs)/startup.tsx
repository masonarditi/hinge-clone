// src/app/(app)/(tabs)/startup.tsx
import { useEffect } from "react";
import { View } from "react-native";

export default function StartupTab() {
  useEffect(() => {
    console.log("Startup tab component rendered");
  }, []);

  // This is just a placeholder, we'll redirect to /startup-dashboard from the tab press
  return <View />;
}
