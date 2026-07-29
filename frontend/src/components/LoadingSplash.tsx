import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";

export const LoadingSplash = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { colors } = useTheme();

    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
        },
        content: {
            alignItems: "center",
        },
        logoPlaceholder: {
            width: 80,
            height: 80,
            backgroundColor: colors.surface,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
        },
        logoText: {
            fontSize: 32,
            fontWeight: "bold",
            color: colors.text,
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: 8,
        },
        tagline: {
            fontSize: 16,
            color: colors.textSecondary,
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>AI</Text>
                </View>
                <Text style={styles.title}>System Design Interview</Text>
                <Text style={styles.tagline}>Practice like it&apos;s real</Text>
            </Animated.View>
        </View>
    );
};


