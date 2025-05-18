import { Database } from "@/types/database.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

// Detect if we're running in a simulator or device
const isSimulator =
  Platform.OS === "ios" &&
  !Platform.isPad &&
  !Platform.isTVOS &&
  (/simulator/i.test(navigator.userAgent) ||
    window.hasOwnProperty("__REACT_DEVTOOLS_GLOBAL_HOOK__"));

// When running in a simulator, we need to use 10.0.2.2 (Android) or localhost (iOS)
// instead of the actual IP address for accessing local services
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;

// For iOS simulators, convert 127.0.0.1 to localhost to avoid network issues
if (Platform.OS === "ios" && supabaseUrl.includes("127.0.0.1")) {
  supabaseUrl = supabaseUrl.replace("127.0.0.1", "localhost");
  console.log("Using iOS simulator-friendly URL:", supabaseUrl);
}

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Supabase URL:", supabaseUrl);
console.log("Connecting to Supabase...");

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    // Increase timeouts
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        signal:
          options?.signal ||
          (AbortSignal?.timeout ? AbortSignal.timeout(15000) : undefined),
      });
    },
  },
});

// Add this at the bottom of the file
supabase.auth.onAuthStateChange((event, session) => {
  console.log(
    "Auth state changed:",
    event,
    session ? "Session exists" : "No session"
  );
});

// Test connection
supabase
  .from("profiles")
  .select("count")
  .then(({ data, error }) => {
    console.log(
      "Supabase connection test:",
      error ? `Error: ${error.message}` : "Connected"
    );
  });
