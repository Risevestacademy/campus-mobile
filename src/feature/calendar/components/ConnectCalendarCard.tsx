import { isApiError } from "@core/api/error";
import { Button, Text, toast } from "@shared/components/atoms";
import { CalendarPlus } from "lucide-react-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";

import { useConnectGoogleCalendar } from "../hooks";

const StyledCalendarPlus = withUniwind(CalendarPlus);

/** Shown in place of the week when no calendar is connected. */
export function ConnectCalendarCard() {
  const { connect, isConnecting } = useConnectGoogleCalendar();

  const onConnect = async () => {
    try {
      await connect();
    } catch (error) {
      toast.error(
        isApiError(error) && error.message
          ? error.message
          : "Couldn't connect your calendar. Try again.",
      );
    }
  };

  return (
    <View className="items-center gap-3 rounded-xl border border-border-default bg-bg-card p-5">
      <StyledCalendarPlus size={28} colorClassName="accent-text-link" />
      <View className="items-center gap-1">
        <Text variant="h5" className="text-center">
          Connect Google Calendar
        </Text>
        <Text variant="body-sm" color="secondary" className="text-center">
          See your classes and meetings for the week here. Campus can only read
          your calendar, never change it.
        </Text>
      </View>
      <Button
        label="Connect Google Calendar"
        className="self-stretch"
        loading={isConnecting}
        onPress={onConnect}
      />
    </View>
  );
}
