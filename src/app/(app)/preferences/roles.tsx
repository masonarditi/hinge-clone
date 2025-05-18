import { useMyProfile, useUpdateLookingForRoles } from "@/api/my-profile";
import { PrivateProfile } from "@/api/my-profile/types";
import { CheckboxList } from "@/components/checkbox-list";
import { StackHeaderV4 } from "@/components/stack-header-v4";
import { useEdit } from "@/store/edit";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

const availableRoles = [
  { id: 1, name: "Full Stack Developer" },
  { id: 2, name: "Frontend Developer" },
  { id: 3, name: "Backend Developer" },
  { id: 4, name: "UI/UX Designer" },
  { id: 5, name: "Product Manager" },
  { id: 6, name: "DevOps Engineer" },
  { id: 7, name: "Mobile Developer" },
  { id: 8, name: "Data Scientist" },
  { id: 9, name: "Machine Learning Engineer" },
  { id: 10, name: "QA Engineer" },
];

export default function RolesPreference() {
  const { edits, setEdits } = useEdit();
  const { data: profile } = useMyProfile();
  const { mutate, reset } = useUpdateLookingForRoles();

  // Convert looking_for_roles array to objects that match CheckboxList format
  const initialSelection =
    edits?.looking_for_roles?.map((role) => {
      const found = availableRoles.find((r) => r.name === role);
      return found || { id: -1, name: role };
    }) || [];

  const [selected, setSelected] = useState(initialSelection);

  const handlePress = () => {
    // Convert selected roles back to array of strings
    const roleNames = selected.map((role) => role.name);

    setEdits({
      ...edits,
      looking_for_roles: roleNames,
    } as PrivateProfile);

    mutate(
      { roles: roleNames },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert("Error", "Something went wrong, please try again later.");
          reset();
          router.back();
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-gray-900 p-5">
      <StackHeaderV4
        title={
          profile?.user_role === "startup"
            ? "Roles We're Looking For"
            : "Roles I'm Interested In"
        }
        onPressBack={handlePress}
      />
      <CheckboxList
        options={availableRoles}
        onChange={setSelected}
        initialSelection={initialSelection}
      />
    </View>
  );
}
