import { Tabs } from "expo-router";
import { BooksIcon, ClockCounterClockwiseIcon, HouseIcon, GraduationCap, User } from "phosphor-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme/useTheme";
import { getSafeBottomInset } from "../../src/utils/safeArea";

export default function MainLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomPadding = getSafeBottomInset(insets.bottom, 10);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background, // Figma #080B12
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.primary, // Figma Accent Blue #2563EB
        tabBarInactiveTintColor: colors.textDim, // Figma #94A3B8
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <HouseIcon size={22} color={color} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size, focused }) => (
            <GraduationCap size={22} color={color} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Practice",
          tabBarIcon: ({ color, size, focused }) => (
            <BooksIcon size={22} color={color} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size, focused }) => (
            <ClockCounterClockwiseIcon size={22} color={color} weight={focused ? "bold" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <User size={22} color={color} weight={focused ? "fill" : "regular"} />
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
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: "Settings",
        }}
      />

    </Tabs>
  );
}
