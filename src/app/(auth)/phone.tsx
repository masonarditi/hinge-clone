import { useSignInWithOtp } from "@/api/auth";
import { Fab } from "@/components/fab";
import { StackHeader } from "@/components/stack-header";
import { router, useFocusEffect } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

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
    setPhone(text);
  };

  const isValid = useMemo(() => {
    return /^\+[1-9]\d{1,14}$/.test(phone);
  }, [phone]);

  const handleSubmit = () => {
    signInWithOtp(phone, {
      onSuccess: () =>
        router.push({
          pathname: "/otp",
          params: { phone },
        }),
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
              })
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
