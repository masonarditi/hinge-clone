import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";

export const useSignInWithOtp = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      console.log("Attempting to sign in with OTP for:", phone);

      try {
        let { error } = await supabase.auth.signInWithOtp({
          phone,
        });

        if (error) {
          console.error("Supabase OTP error:", error.code, error.message);
          let message = "Something went wrong, please try again later.";

          switch (error.code) {
            case "sms_send_failed":
              message =
                "Please ensure your phone number is correct and try again.";
              break;
            case "over_sms_send_rate_limit":
              message = "Too many attempts. Please try again later.";
              break;
            case "timeout":
              message =
                "The request timed out. Please check your internet connection and try again.";
              break;
          }
          throw new Error(message);
        }

        console.log("OTP sent successfully");
      } catch (error) {
        console.error("Unexpected error during OTP request:", error);
        throw error instanceof Error
          ? error
          : new Error("Network error during OTP request");
      }
    },
    retry: 1, // Try once, then fail
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async ({ phone, token }: { phone: string; token: string }) => {
      console.log("Attempting to verify OTP for:", phone);

      try {
        let { error } = await supabase.auth.verifyOtp({
          phone,
          token,
          type: "sms",
        });

        if (error) {
          console.error(
            "Supabase OTP verification error:",
            error.code,
            error.message
          );
          let message = "Something went wrong, please try again later.";

          switch (error.code) {
            case "otp_expired":
              message = "Your code is either invalid or expired.";
              break;
            case "timeout":
              message =
                "The request timed out. Please check your internet connection and try again.";
              break;
          }
          throw new Error(message);
        }

        console.log("OTP verified successfully");
      } catch (error) {
        console.error("Unexpected error during OTP verification:", error);
        throw error instanceof Error
          ? error
          : new Error("Network error during OTP verification");
      }
    },
    retry: 1, // Try once, then fail
  });
};

export const useSignOut = () => {
  return useMutation({
    mutationFn: async () => {
      console.log("Attempting to sign out");

      try {
        let { error } = await supabase.auth.signOut();

        if (error) {
          console.error("Supabase sign out error:", error.message);
          throw new Error(error.message);
        }

        console.log("Sign out successful");
      } catch (error) {
        console.error("Unexpected error during sign out:", error);
        throw error instanceof Error
          ? error
          : new Error("Error during sign out");
      }
    },
  });
};
