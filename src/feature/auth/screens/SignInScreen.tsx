import { Button, Text, TextField } from "@shared/components/atoms";
import SafeArea from "@shared/components/safearea/SafeArea";
import { EyeOpen, Google } from "@shared/icons";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

import { Header } from "../components";

function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);

  const signIn = async () => {
    await GoogleOneTapSignIn.checkPlayServices();

    let response = await GoogleOneTapSignIn.signIn();
    console.warn(response.type);

    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.createAccount();
      console.warn(response.type);
    }
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.presentExplicitSignIn();
      console.warn(response.type);
    }

    if (isSuccessResponse(response)) {
      const { user, serverAuthCode } = response.data;
      // Send idToken to your backend for verification
      console.warn(user.email, serverAuthCode);
    }
  };

  return (
    <SafeArea>
      <Header />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("@assets/images/brand-illustration.png")}
          className="mt-3 h-33 w-full rounded-2xl"
        />

        <Text className="mt-12 mb-6 text-center font-h3 text-h3 text-[#14171A]">
          Sign in
        </Text>

        <View className="gap-4">
          <TextField label="Display Name" placeholder="Joseph" />
          <TextField label="Cohort" placeholder="Rise Academy 2026" />
          <TextField
            label="Password"
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            suffix={
              <Pressable
                onPress={() => setShowPassword((shown) => !shown)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <EyeOpen />
              </Pressable>
            }
          />
          <Text className="-mt-2 font-caption text-caption text-text-secondary">
            Forgot password
          </Text>
        </View>
      </KeyboardAwareScrollView>

      <View className="gap-4 py-2">
        <Button
          variant="secondary"
          className="gap-2 border-border-strong"
          onPress={signIn}
        >
          <Google />
          <Text className="font-label text-label text-text-primary">
            Continue with Google
          </Text>
        </Button>
        <Button label="Sign in" />
      </View>
    </SafeArea>
  );
}

export default SignInScreen;
