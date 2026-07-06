import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import { BooksIcon, ClockCounterClockwiseIcon, HouseIcon } from "phosphor-react-native";
import { Platform } from "react-native";
import { useTheme } from "../../src/theme/useTheme";

export default function MainLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 96 : 70, // Increased height
          paddingBottom: Platform.OS === 'ios' ? 32 : 12, // Increased padding
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primaryBrand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
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
