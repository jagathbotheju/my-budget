import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

WebBrowser.maybeCompleteAuthSession();
const USafeAreaView = withUniwind(SafeAreaView);

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: startGoogleFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startAppleFlow } = useOAuth({
    strategy: "oauth_apple",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
    if (!isLoaded || !email.trim() || !password) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err: unknown) {
      const msg =
        (err as { errors?: { message: string }[] })?.errors?.[0]?.message ??
        "Failed to sign in";
      Alert.alert("Sign In Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    try {
      const start = provider === "google" ? startGoogleFlow : startAppleFlow;
      const { createdSessionId, setActive: setActiveSession } = await start();
      if (createdSessionId && setActiveSession) {
        await setActiveSession({ session: createdSessionId });
      }
    } catch (err: unknown) {
      const msg =
        (err as Error)?.message ?? `Failed to sign in with ${provider}`;
      Alert.alert("OAuth Error", msg);
    }
  };

  console.log("SignIN");

  return (
    <USafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-bold tracking-tight text-center text-primary">
              My Budget
            </Text>
            <Text className="text-muted-foreground mt-2 text-base text-center">
              Take control of your finances
            </Text>
          </View>

          {/* Email / Password */}
          <View className="gap-3 mb-4">
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            <Button
              label={loading ? "Signing in…" : "Sign In"}
              onPress={handleEmailSignIn}
              disabled={loading || !isLoaded}
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-sm text-muted-foreground">
              or continue with
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Social buttons */}
          <View className="gap-3">
            <Button
              label="Continue with Google"
              variant="ghost"
              onPress={() => handleOAuth("google")}
            />
            {Platform.OS === "ios" && (
              <Button
                label="Continue with Apple"
                variant="ghost"
                onPress={() => handleOAuth("apple")}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </USafeAreaView>
  );
}
