import { StatusDot, Text } from "@shared/components/atoms";
import { CaretDownIcon } from "phosphor-react-native";
import React from "react";
import { Pressable } from "react-native";
import { withUniwind } from "uniwind";

const options = [
  {
    short: "Avaliable",
    long: "Avaliable",
    status: "online",
    description: "Waves, messages and nearby audio come through",
  },
] as const;

const StyledChevronDown = withUniwind(CaretDownIcon);

export function ActivityToggle() {
  const [selectedOption, _setSelectedOption] = React.useState(options[0]);

  return (
    <Pressable className="flex-row items-center gap-1 rounded-full bg-overlay-white-15 px-3 py-0.5">
      <StatusDot status={selectedOption?.status} />
      <Text className="text-text-on-dark">{selectedOption?.short}</Text>
      <StyledChevronDown
        colorClassName="accent-text-on-dark"
        size={12}
        weight="bold"
      />
    </Pressable>
  );
}
