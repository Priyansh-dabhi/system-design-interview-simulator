import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WifiSlashIcon } from "phosphor-react-native";
import { Layout } from "../constants/Layout";

// On web, navigator.onLine is instant and requires no network request, so it
// avoids the CORS issue that causes `fetch` to fail against third-party URLs
// when running in a browser.
// On native (iOS/Android), we fall back to a lightweight fetch ping.
const checkIsOnline = async (): Promise<boolean> => {
    if (Platform.OS === "web") {
        return typeof navigator !== "undefined" ? navigator.onLine : true;
    }

    // Native: lightweight ping to a public, CORS-free endpoint
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const res = await fetch("https://clients3.google.com/generate_204", {
            method: "HEAD",
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
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

        if (Platform.OS === "web") {
            // On web, rely on browser events — no polling needed
            const handleOnline = () => setIsOffline(false);
            const handleOffline = () => setIsOffline(true);
            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);

            return () => {
                clearTimeout(initialTimer);
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
            };
        }

        // On native, poll every 10 seconds
        const interval = setInterval(refresh, 10000);

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
                    <WifiSlashIcon size={44} color="#FFFFFF" weight="duotone" />
                </View>

                <Text style={styles.title}>You&apos;re Offline</Text>

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
        backgroundColor: "#09090B", // Black theme background
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
        backgroundColor: "#18181B", // Black theme surface
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#27272A", // Black theme border
        marginBottom: Layout.spacing.lg,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#FFFFFF", // Black theme text
        marginBottom: Layout.spacing.sm,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#A1A1AA", // Black theme textSecondary
        textAlign: "center",
        lineHeight: 22,
        marginBottom: Layout.spacing.xl,
    },
    retryButton: {
        paddingVertical: Layout.spacing.sm + 4,
        paddingHorizontal: Layout.spacing.xl,
        backgroundColor: "#18181B", // Black theme surface
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: "#27272A", // Black theme border
    },
    retryText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
});

