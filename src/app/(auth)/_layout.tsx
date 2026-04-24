import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isSignedIn) return <Redirect href={'/(tabs)' as any} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
