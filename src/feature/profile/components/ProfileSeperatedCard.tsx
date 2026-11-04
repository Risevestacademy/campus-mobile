import { Card, Divider, Row, Text } from "@shared/components/atoms";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { FlatList, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useCSSVariable, withUniwind } from "uniwind";

const StyledChevronRight = withUniwind(ChevronRight);

type ProfileSeparatedCardProps = {
  data: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    icon: LucideIcon;
  }[];
};

export function ProfileSeparatedCard({ data }: ProfileSeparatedCardProps) {
  const color: string = useCSSVariable("--color-text-primary") as string;

  return (
    <Card className="border border-border-default p-0">
      <FlatList
        scrollEnabled={false}
        ItemSeparatorComponent={
          <Divider dividerBgClassName="bg-border-default" />
        }
        data={data}
        renderItem={({ item: e, index: i }) => {
          const Icon = e.icon;
          return (
            <Pressable key={i} onPress={e.onPress}>
              <Row className="px-4 py-3" align="center">
                <View className="size-8 items-center justify-center rounded-[8px] bg-bg-raised-cool">
                  <Icon size={16} color={color} />
                </View>
                <View className="flex-1 justify-center gap-0.5">
                  <Text variant="label">{e.title}</Text>
                  {e.subtitle && (
                    <Text variant="caption" color="secondary">
                      {e.subtitle}
                    </Text>
                  )}
                </View>
                <StyledChevronRight
                  colorClassName="accent-text-muted"
                  size={16}
                />
              </Row>
            </Pressable>
          );
        }}
      />
    </Card>
  );
}
