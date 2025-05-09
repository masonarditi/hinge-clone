import { AnswerList } from "@/components/answer-list";
import { List } from "@/components/list";
import { PhotoGrid } from "@/components/photo-grid";
import { useEdit } from "@/store/edit";
import { identity } from "@/utils/identity";
import { vitals } from "@/utils/vitals";
import { ScrollView, Text, View } from "react-native";

export default function Page() {
  const { edits, gridActive } = useEdit();

  if (!edits) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text>Something went wrong.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-900 pt-10"
      contentContainerClassName="pb-20 gap-5"
      showsVerticalScrollIndicator={false}
      scrollEnabled={!gridActive}
    >
      <View className="px-5">
        <Text className="text-white font-poppins-semibold mb-2" style={{ color: "#ecac6d" }}>My Photos</Text>
        <PhotoGrid profile={edits} />
        <View className="h-10" />
        <Text className="font-poppins-semibold mb-2" style={{ color: "#ecac6d" }}>
          My Answers
        </Text>
        <AnswerList profile={edits} />
      </View>
      <View className="pl-5 gap-10">
        <List title="My Vitals" data={vitals} profile={edits} />
        <List title="Identity" data={identity} profile={edits} />
      </View>
    </ScrollView>
  );
}
