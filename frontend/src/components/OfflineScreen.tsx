import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WifiSlashIcon } from "phosphor-react-native";
import { Colors } from "../constants/Colors";
import { Layout } from "../constants/Layout";

// Zero-dependency connectivity check using a plain fetch ping.
// This is critical for EAS updates to avoid native module crashes.
const checkIsOnline = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        // Standard captive portal check endpoint
        const res = await fetch("https://clients3.google.com/generate_204", {
            method: "HEAD",
            cache: "no-store",
            headers: {
                "Cache-Control": "no-cache",
            },
            signal: controller.signal,
        });

        clearTimeout(timeout);
        return res.status === 204 || res.ok;
    } catch {
        return false;
    }
};

export const OfflineScreen = () => {
    const [isOffline, setIsOffline] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const refresh = useCallback(async () => {
        const online = await checkIsOnline();
        setIsOffline(!online);
    }, []);

    useEffect(() => {
        // Initial check delayed slightly to not block app boot
        const initialTimer = setTimeout(refresh, 1000);

        // Poll every 5 seconds
        const interval = setInterval(refresh, 5000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [refresh]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: isOffline ? 1 : 0,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [isOffline, fadeAnim]);

    return (
        <Animated.View
            style={[styles.container, { opacity: fadeAnim }]}
            pointerEvents={isOffline ? "auto" : "none"}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <WifiSlashIcon size={44} color={Colors.text} weight="duotone" />
                </View>

                <Text style={styles.title}>You're Offline</Text>

                <Text style={styles.subtitle}>
                    No internet connection detected.{"\n"}
                    Check your Wi-Fi or mobile data.
                </Text>

                <TouchableOpacity style={styles.retryButton} onPress={refresh} activeOpacity={0.7}>
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999, // Ensure it sits on top of everything
    },
    content: {
        alignItems: "center",
        paddingHorizontal: Layout.spacing.xl,
    },
    iconContainer: {
        width: 96,
        height: 96,
        backgroundColor: Colors.surface,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Layout.spacing.lg,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: Layout.spacing.xl,
    },
    retryButton: {
        paddingVertical: Layout.spacing.sm + 4,
        paddingHorizontal: Layout.spacing.xl,
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    retryText: {
        color: Colors.text,
        fontSize: 15,
        fontWeight: "600",
    },
});
