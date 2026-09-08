import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import { BooksIcon, ClockCounterClockwiseIcon, HouseIcon } from "phosphor-react-native";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme/useTheme";

export default function MainLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Dynamically calculate padding based on device insets to avoid overlap with system nav buttons
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          borderTopWidth: 1,
          elevation: 0, // Remove shadow for cleaner look
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HouseIcon size={size} color={color} weight="fill" />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          href: null, // This hides it from the bottom tab bar
          title: "Practice",
          tabBarIcon: ({ color, size }) => (
            <BooksIcon size={size} color={color} weight="fill" />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <ClockCounterClockwiseIcon size={size} color={color} weight="fill" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          href: null,
          title: "Preferences",
        }}
      />
    </Tabs>
  );
}
