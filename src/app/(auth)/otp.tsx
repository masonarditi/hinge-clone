import { useVerifyOtp } from "@/api/auth";
import { Fab } from "@/components/fab";
import { StackHeader } from "@/components/stack-header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

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
    verifyOtp(
      { phone, token: otp },
      {
        onSuccess: () => {
          console.log("OTP verified, redirecting to onboarding-user-role");
          router.push("/onboarding-user-role");
          console.log("router.push called");
        },
        onError: (err) => {
          console.log("OTP verification failed:", err);
        },
      }
    );
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
        <View className="items-end">
          <Fab
            disabled={!isValid || isPending}
            onPress={handleSubmit}
            loading={isPending}
            iconClassName="text-white text-4xl"
            className="bg-[#ecac6d]"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
