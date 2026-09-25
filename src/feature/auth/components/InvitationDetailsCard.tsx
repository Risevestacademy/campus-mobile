import { Text, View } from "react-native";

const DetailRow = ({ title, value }: { title: string; value: string }) => {
  return (
    <View className="flex flex-row items-center gap-4">
      <Text className="w-16 shrink-0 font-body-sm text-label text-text-secondary">
        {title}
      </Text>
      <Text className="font-body-sm text-label text-text-primary">{value}</Text>
    </View>
  );
};

const InvitationDetailsCard = () => {
  return (
    <View className="mb-5.5 gap-3 rounded-lg border border-border-default bg-bg-surface p-4">
      <DetailRow title="Name" value="Joseph Akintomide" />
      <DetailRow title="Email" value="Jjoseph@example.com" />
      <DetailRow title="Role" value="Student" />
      <DetailRow title="Cohort" value="Product Design 2026" />
    </View>
  );
};

export default InvitationDetailsCard;
