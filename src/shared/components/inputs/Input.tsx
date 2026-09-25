import { EyeOpen } from "@shared/icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
// import { Picker } from "@react-native-picker/picker";

interface InputProps extends TextInputProps {
  label: string;
  placeholder?: string;
  variant?: "password" | "text" | "text-area" | "select";
  options?: string[];
  value?: string;
  onValueChange?: (value: string) => void;
}

export default function Input({
  label,
  placeholder,
  variant = "password",
  options = ["Available", "Not-Available"],
  value,
  onValueChange,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  // const [selected, setSelected] = useState<"Available" | "Not-Available">(
  //   "Available",
  // );
  const [selected, setSelected] = useState(value ?? options[0]);
  const [open, setOpen] = useState(false);

  const handleSelect = (item: string) => {
    setSelected(item);
    onValueChange?.(item);
    setOpen(false);
  };
  switch (variant) {
    case "password":
      return (
        <View className="gap-2">
          <Text className="font-label text-label text-text-secondary">
            {label}
          </Text>
          <View className="flex flex-row items-center rounded-lg border border-border-default">
            <TextInput
              className="py-3 pr-9 pl-4"
              {...rest}
              secureTextEntry={!showPassword}
              placeholder={placeholder}
              placeholderTextColorClassName="accent-text-primary"
            />
            <View className="absolute top-0 right-3 bottom-0 flex w-5 items-center justify-center">
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                <EyeOpen />
              </Pressable>
            </View>
          </View>
        </View>
      );

    case "text":
      return (
        <View className="gap-2">
          <Text className="font-label text-label text-text-secondary">
            {label}
          </Text>
          <View className="flex flex-row items-center rounded-lg border border-border-default">
            <TextInput
              className="px-4 py-3"
              {...rest}
              placeholder={placeholder}
              placeholderTextColorClassName="accent-text-primary"
            />
          </View>
        </View>
      );

    case "text-area":
      return (
        <View className="gap-2">
          <Text className="font-label text-label text-text-secondary">
            {label}
          </Text>
          <View className="flex flex-row items-center rounded-lg border border-border-default">
            <TextInput
              className="h-18 px-4 py-3"
              {...rest}
              placeholder={placeholder}
              placeholderTextColorClassName="accent-text-primary"
              textAlignVertical="top"
            />
          </View>
        </View>
      );

    // case "select":
    //   return (
    //     <View className="gap-2">
    //       <Text className="font-label text-label text-text-secondary">
    //         {label}
    //       </Text>
    //       <View className="flex flex-row items-center rounded-lg border border-border-default">
    //         <Picker
    //           selectedValue={selected}
    //           onValueChange={(itemValue) => setSelected(itemValue)}
    //         >
    //           <Picker.Item label="Available" value="Available" />
    //           <Picker.Item label="Not-Available" value="Not-Available" />
    //         </Picker>
    //       </View>
    //     </View>
    //   );

    case "select":
      return (
        <View className="gap-2">
          <Text className="font-label text-label text-text-secondary">
            {label}
          </Text>

          <Pressable
            onPress={() => setOpen(true)}
            className="flex flex-row items-center justify-between rounded-lg border border-border-default px-4 py-3"
          >
            <Text className="text-text-primary">{selected}</Text>
            {/* <ChevronDown /> */}
          </Pressable>

          <Modal visible={open} transparent animationType="fade">
            <Pressable
              className="flex-1 justify-end bg-black/40"
              onPress={() => setOpen(false)}
            >
              <View className="rounded-t-2xl bg-bg-surface p-2">
                <FlatList
                  data={options}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      className="px-4 py-3"
                    >
                      <Text
                        className={
                          item === selected
                            ? "font-semibold text-text-primary"
                            : "text-text-secondary"
                        }
                      >
                        {item}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            </Pressable>
          </Modal>
        </View>
      );
  }
}
