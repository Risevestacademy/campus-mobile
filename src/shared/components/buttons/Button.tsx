import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
}

export default function Button({ title, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="max-w-85.5 items-center justify-center rounded-lg bg-action-primary-default px-6 py-3"
      {...props}
    >
      <Text className="font-label text-body-md text-action-primary-text">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
