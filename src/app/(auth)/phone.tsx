import { useSignInWithOtp } from "@/api/auth";
import { StackHeader } from "@/components/stack-header";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Set to true to enable debug/test mode with bypass
const ENABLE_DEBUG_MODE = true;

export default function Page() {
  const [phone, setPhone] = useState("");
  const phoneRef = useRef<TextInput>(null);
  const {
    mutate: signInWithOtp,
    isPending,
    isError,
    error,
    reset,
  } = useSignInWithOtp();

  const handlePhoneChange = (text: string) => {
    if (isError) {
      reset();
    }

    // Ensure phone number starts with +
    if (text && !text.startsWith("+")) {
      text = "+" + text;
    }

    setPhone(text);
  };

  const isValid = useMemo(() => {
    return /^\+[1-9]\d{1,14}$/.test(phone);
  }, [phone]);

  const handleSubmit = () => {
    console.log("Submit button pressed, phone:", phone);

    if (!isValid) {
      console.log("Phone format invalid");
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid phone number with country code (+)"
      );
      return;
    }

    try {
      signInWithOtp(phone, {
        onSuccess: () => {
          console.log("OTP sent successfully, navigating to OTP screen");
          router.push({
            pathname: "/otp",
            params: { phone },
          });
        },
        onError: (err) => {
          console.log("Error sending OTP:", err);
        },
      });
    } catch (e) {
      console.error("Exception submitting phone number:", e);
    }
  };

  // Debug function to bypass OTP for development
  const handleDebugSkip = () => {
    console.log("DEBUG MODE: Bypassing OTP verification");
    if (!isValid) {
      setPhone("+8761234567"); // Set a default test number
    }
    router.push({
      pathname: "/otp",
      params: { phone: phone || "+8761234567" },
    });
  };

  useFocusEffect(() => {
    phoneRef.current?.focus();
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-900 p-5"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <StackHeader />
      <StatusBar barStyle="light-content" />
      <View className="flex-1 justify-center pt-28">
        <View className="flex-1">
          <Text
            className="text-4xl font-playfair-semibold"
            style={{ color: "#ecac6d" }}
          >
            What's your phone number?
          </Text>
          <View className="h-28" />
          <TextInput
            className="border-b h-16 text-4xl font-poppins-semibold"
            style={{
              color: "#ecac6d",
              borderColor: "#ecac6d",
              ...(Platform.OS === "ios" && {
                lineHeight: undefined,
              }),
            }}
            selectionColor={"#ecac6d"}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoFocus={true}
            value={phone}
            onChangeText={handlePhoneChange}
            maxLength={16}
            ref={phoneRef}
          />
          {isError && (
            <Text
              className="text-sm text-center mt-4"
              style={{ color: "#ecac6d" }}
            >
              {error.message}
            </Text>
          )}
        </View>

        <View className="flex-row justify-between">
          {ENABLE_DEBUG_MODE && (
            <TouchableOpacity
              onPress={handleDebugSkip}
              activeOpacity={0.7}
              style={{
                backgroundColor: "#444",
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#ecac6d" }}>Debug Skip</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isValid || isPending}
            activeOpacity={0.7}
            style={{
              backgroundColor: isValid && !isPending ? "#ecac6d" : "#777777",
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "flex-end",
            }}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <Ionicons name="chevron-forward" size={40} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
