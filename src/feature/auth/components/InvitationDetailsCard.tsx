import { Text } from "@shared/components/atoms";
import { View } from "react-native";

const DetailRow = ({ title, value }: { title: string; value: string }) => {
  return (
    <View className="flex flex-row items-center justify-between gap-4">
      <Text className="font-body-sm text-label text-[#6B7280]">{title}</Text>
      <Text className="shrink font-body-md text-body-md text-[#14171A]">
        {value}
      </Text>
    </View>
  );
};

const InvitationDetailsCard = () => {
  return (
    <View className="mb-4 gap-4 rounded-lg border border-[#E5E6EB] bg-[#F6F7F8] p-5">
      <DetailRow title="Name" value="David Olaleye" />
      <DetailRow title="Email" value="someone@email.com" />
      <DetailRow title="Role" value="Student" />
      <DetailRow title="Cohort" value="Product Design 2026" />
    </View>
  );
};

export default InvitationDetailsCard;
