import { useVerifyOtp } from "@/api/auth";
import { StackHeader } from "@/components/stack-header";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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
  const [otp, setOtp] = useState("");
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const {
    mutate: verifyOtp,
    isPending,
    isError,
    error,
    reset,
  } = useVerifyOtp();
  const router = useRouter();

  const handleOtpChange = (text: string) => {
    if (isError) {
      reset();
    }
    setOtp(text);
  };

  const isValid = useMemo(() => {
    return otp.length === 6;
  }, [otp]);

  const handleSubmit = () => {
    console.log("Submitting OTP:", otp, "for phone:", phone);
    try {
      verifyOtp(
        { phone, token: otp },
        {
          onSuccess: () => {
            console.log("OTP verified, redirecting to onboarding-user-role");
            try {
              router.push("/onboarding-user-role");
              console.log("router.push called");
            } catch (e) {
              console.error("Navigation error:", e);
              Alert.alert(
                "Navigation Error",
                "Could not navigate to the next screen. Please try again."
              );
            }
          },
          onError: (err) => {
            console.log("OTP verification failed:", err);
            Alert.alert("Verification Error", err.message);
          },
        }
      );
    } catch (e) {
      console.error("Exception in handleSubmit:", e);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // Debug function to bypass OTP verification
  const handleDebugSkip = () => {
    console.log("DEBUG MODE: Bypassing OTP verification");
    router.push("/onboarding-user-role");
  };

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
            Enter your verification code?
          </Text>
          <View className="h-28" />
          <View className="flex-row gap-2 h-16">
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={index}
                className="border-b flex-1 items-center justify-center"
                style={{ borderColor: "#ecac6d" }}
              >
                <Text
                  className="text-4xl font-poppins-semibold"
                  style={{ color: "#ecac6d" }}
                >
                  {otp[index] || ""}
                </Text>
              </View>
            ))}
          </View>
          <TextInput
            className="absolute h-1 w-1 opacity-0"
            style={
              Platform.OS === "ios" && {
                lineHeight: undefined,
              }
            }
            selectionColor={"#ecac6d"}
            keyboardType="numeric"
            textContentType="oneTimeCode"
            autoFocus={true}
            value={otp}
            onChangeText={handleOtpChange}
            maxLength={6}
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
