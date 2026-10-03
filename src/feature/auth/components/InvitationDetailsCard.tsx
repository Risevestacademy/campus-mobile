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

type InvitationDetailsCardProps = {
  email: string;
  role: string;
  cohort: string;
  name: string;
};

const InvitationDetailsCard = ({
  email,
  role,
  cohort,
  name,
}: InvitationDetailsCardProps) => {
  return (
    <View className="mb-4 gap-4 rounded-lg border border-border-default bg-bg-card p-5 dark:border-none">
      <DetailRow title="Name" value={name} />
      <DetailRow title="Email" value={email} />
      <DetailRow title="Role" value={role} />
      <DetailRow title="Cohort" value={cohort} />
    </View>
  );
};

export default InvitationDetailsCard;
