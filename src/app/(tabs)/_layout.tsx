import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useCSSVariable, useResolveClassNames } from "uniwind";

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  const tabBarStyle = useResolveClassNames("bg-card border-t border-border");
  const activeTint = useCSSVariable("--color-primary") as string;
  const inactiveTint = useCSSVariable("--color-muted-foreground") as string;

  if (!isLoaded) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!isSignedIn) return <Redirect href={"/(auth)/sign-in" as any} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { ...tabBarStyle, height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="home" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "ACTIVITY",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "list-sharp" : "list-outline"}
              size={focused ? 24 : 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "BUDGET",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "pie-chart" : "pie-chart-outline"}
              size={focused ? 24 : 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "SETTINGS",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={focused ? 24 : 22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
