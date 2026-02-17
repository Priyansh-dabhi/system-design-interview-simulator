import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import { BooksIcon, ClockCounterClockwiseIcon, HouseIcon } from "phosphor-react-native";
import { Platform } from "react-native";
import { Colors } from "../../src/constants/Colors";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 96 : 70, // Increased height
          paddingBottom: Platform.OS === 'ios' ? 32 : 12, // Increased padding
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primaryBrand,
        tabBarInactiveTintColor: Colors.textSecondary,
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
    </Tabs>
  );
}
