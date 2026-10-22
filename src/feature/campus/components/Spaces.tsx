import { Row, Text } from "@shared/components/atoms";
import { cn } from "@shared/utils/style";
import { ClassValue } from "clsx";
import { Link } from "expo-router";
import { FileText, Laptop, Presentation, UserRound } from "lucide-react-native";
import React from "react";
import { FlatList, View } from "react-native";
import { withUniwind } from "uniwind";

type SpaceProp = {
  icon: React.ReactNode;
  label?: React.ReactNode;
  title: string;
  subtitle: string;
  bgColorClassName: ClassValue;
};

const StyledPresentation = withUniwind(Presentation);
const StyledUserRound = withUniwind(UserRound);
const StyledLaptop = withUniwind(Laptop);
const StyledFileText = withUniwind(FileText);

export function SpaceCard({
  icon,
  label,
  title,
  subtitle,
  bgColorClassName,
}: SpaceProp) {
  return (
    <View
      className={cn(
        "flex-1 items-stretch justify-center gap-3 rounded-lg p-4 dark:bg-bg-card",
        bgColorClassName,
      )}
    >
      <Row justify="between" align="center">
        <View className="size-8.5 items-center justify-center rounded-lg bg-bg-card">
          {icon}
        </View>
        {label}
      </Row>
      <View className="gap-0.5">
        <Text variant="label">{title}</Text>
        <Text variant="caption" color="secondary">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export function Spaces() {
  const spaces: SpaceProp[] = [
    {
      icon: (
        <StyledPresentation size={18} colorClassName="accent-text-sky-strong" />
      ),
      title: "Classroom",
      subtitle: "29 inside",
      bgColorClassName: "bg-bg-tint-sky-card",
    },
    {
      icon: <StyledUserRound size={18} colorClassName="accent-text-violet" />,
      title: "Mentor Pop 1",
      subtitle: "Ayobami",
      bgColorClassName: "bg-bg-tint-violet-card",
    },
    {
      icon: <StyledLaptop size={18} colorClassName="accent-text-lemon" />,
      title: "Project Studio",
      subtitle: "4 Heads down",
      bgColorClassName: "bg-bg-tint-lemon-card",
    },
    {
      icon: <StyledFileText size={18} colorClassName="accent-text-turquoise" />,
      title: "Resource Center",
      subtitle: "Rise Classroom",
      bgColorClassName: "bg-bg-tint-turquoise",
    },
  ];

  return (
    <View className="mx-6 gap-4">
      <Row justify="between">
        <Text variant="h5">Spaces</Text>
        {spaces.length > 0 && (
          <Link asChild href="/(tabs)/(campus)/spaces">
            <Text color="link" variant="label">
              See all {spaces.length}
            </Text>
          </Link>
        )}
      </Row>
      <FlatList
        scrollEnabled={false}
        numColumns={2}
        data={spaces}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item, index: i }) => <SpaceCard key={i} {...item} />}
      />
    </View>
  );
}
