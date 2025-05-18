import React, { FC, PropsWithChildren, useEffect } from "react";
import { AppState, Dimensions, StyleSheet, View } from "react-native";
import {
  GestureHandlerRootView,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";

export const DebugTouchHandler: FC<PropsWithChildren> = ({ children }) => {
  const { width, height } = Dimensions.get("window");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log("App state changed to:", nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      console.log("Touch detected at:", {
        x: event.nativeEvent.x,
        y: event.nativeEvent.y,
      });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TapGestureHandler onHandlerStateChange={onHandlerStateChange}>
        <View style={StyleSheet.absoluteFillObject}>{children}</View>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
};
