import { useMyProfile } from "@/api/my-profile";
import { CheckboxList } from "@/components/checkbox-list";
import { Fab } from "@/components/fab";
import { Loader } from "@/components/loader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define skills list
const skillOptions = [
  { id: "JavaScript", label: "JavaScript" },
  { id: "TypeScript", label: "TypeScript" },
  { id: "React", label: "React" },
  { id: "React Native", label: "React Native" },
  { id: "Node.js", label: "Node.js" },
  { id: "Python", label: "Python" },
  { id: "Java", label: "Java" },
  { id: "C++", label: "C++" },
  { id: "Ruby", label: "Ruby" },
  { id: "PHP", label: "PHP" },
  { id: "Swift", label: "Swift" },
  { id: "Kotlin", label: "Kotlin" },
  { id: "Go", label: "Go" },
  { id: "Rust", label: "Rust" },
  { id: "SQL", label: "SQL" },
  { id: "MongoDB", label: "MongoDB" },
  { id: "AWS", label: "AWS" },
  { id: "UI/UX Design", label: "UI/UX Design" },
  { id: "DevOps", label: "DevOps" },
  { id: "Machine Learning", label: "Machine Learning" },
];

export default function SkillsPreferences() {
  const { data: profile, isLoading, refetch } = useMyProfile();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (profile?.skills) {
      setSelectedSkills(profile.skills);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!session?.user.id || !profile?.id) {
      Alert.alert("Error", "You must be logged in to update your skills");
      return;
    }

    setIsUpdating(true);
    try {
      // First, clear existing skills
      const { error: deleteError } = await supabase
        .from("profile_skills")
        .delete()
        .eq("profile_id", profile.id);

      if (deleteError) {
        throw deleteError;
      }

      // For each skill, check if it exists or create it, then add the profile-skill relationship
      for (const skillName of selectedSkills) {
        // Check if skill exists
        const { data: existingSkill } = await supabase
          .from("skills")
          .select("id")
          .eq("name", skillName)
          .maybeSingle();

        let skillId;

        if (!existingSkill) {
          // Create skill
          const { data: newSkill, error: createError } = await supabase
            .from("skills")
            .insert({ name: skillName })
            .select("id")
            .single();

          if (createError) {
            console.error("Error creating skill:", createError);
            continue;
          }

          skillId = newSkill.id;
        } else {
          skillId = existingSkill.id;
        }

        // Add profile-skill relationship
        if (skillId) {
          await supabase.from("profile_skills").insert({
            profile_id: profile.id,
            skill_id: skillId,
          });
        }
      }

      await refetch();
      router.back();
    } catch (error) {
      console.error("Error updating skills:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  // Add a check to make sure the user is a candidate
  if (profile?.user_role !== "candidate") {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerText}>Skills Preferences</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.errorText}>
            This section is only available for candidates.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Skills Preferences</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.noteText}>
          Select the skills you have. This helps startups find you based on
          their needs.
        </Text>
        <CheckboxList
          items={skillOptions}
          selectedIds={selectedSkills}
          onChange={(ids) => setSelectedSkills(ids)}
        />
      </View>
      <Fab
        onPress={handleSave}
        loading={isUpdating}
        iconName="checkmark"
        className="bg-ecac6d shadow-sm active:h-[4.75rem] h-20 absolute bottom-5 right-5"
        iconClassName="text-white text-4xl"
        loaderClassName="text-white"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  headerText: {
    color: "#ecac6d",
    fontSize: 24,
    fontFamily: "playfair-semibold",
    marginVertical: 16,
    marginLeft: 16,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noteText: {
    color: "#ffffff",
    marginBottom: 20,
    fontFamily: "poppins-regular",
  },
  errorText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontFamily: "poppins-regular",
  },
});
