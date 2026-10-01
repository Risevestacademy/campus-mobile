import { Text } from "@shared/components/atoms";
import { View } from "react-native";

const DetailRow = ({ title, value }: { title: string; value: string }) => {
  return (
    <View className="flex flex-row items-center justify-between gap-4">
      <Text variant="body-sm" color="muted">
        {title}
      </Text>
      <Text variant="body-md" color="primary">
        {value}
      </Text>
    </View>
  );
};

const InvitationDetailsCard = () => {
  return (
    <View className="mb-4 gap-4 rounded-lg border border-border-default bg-bg-card p-5 dark:border-none">
      <DetailRow title="Name" value="David Olaleye" />
      <DetailRow title="Email" value="someone@email.com" />
      <DetailRow title="Role" value="Student" />
      <DetailRow title="Cohort" value="Product Design 2026" />
    </View>
  );
};

export default InvitationDetailsCard;
