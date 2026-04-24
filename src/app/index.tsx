import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isSignedIn) return <Redirect href={"/(tabs)" as any} />;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Redirect href={"/(auth)/sign-in" as any} />;
}
