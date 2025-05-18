import Checkbox from "expo-checkbox";
import { FC, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import colors from "tailwindcss/colors";

interface CheckboxOption {
  id: string;
  label: string;
}

interface Props {
  items: CheckboxOption[];
  selectedIds: string[];
  onChange: (selected: string[]) => void;
}

export const CheckboxList: FC<Props> = ({ items, selectedIds, onChange }) => {
  const [selected, setSelected] = useState<string[]>(selectedIds || []);

  // Update selected values when props change
  useEffect(() => {
    setSelected(selectedIds || []);
  }, [selectedIds]);

  const toggleSelection = (option: CheckboxOption) => {
    const updatedSelection = selected.includes(option.id)
      ? selected.filter((id) => id !== option.id)
      : [...selected, option.id];
    setSelected(updatedSelection);
    onChange(updatedSelection);
  };

  return (
    <FlatList
      data={items}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View className="h-px bg-neutral-800" />}
      renderItem={({ item }) => {
        const isChecked = selected.includes(item.id);
        return (
          <Pressable
            className="flex-row justify-between py-5"
            onPress={() => toggleSelection(item)}
          >
            <Text className="text-white font-poppins-regular">
              {item.label}
            </Text>
            <Checkbox
              value={isChecked}
              color={isChecked ? "#ecac6d" : colors.neutral[400]}
              className="h-5 w-5"
              pointerEvents="none"
            />
          </Pressable>
        );
      }}
    />
  );
};
