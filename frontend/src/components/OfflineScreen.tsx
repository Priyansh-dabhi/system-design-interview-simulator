import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WifiSlashIcon } from "phosphor-react-native";
import NetInfo from "@react-native-community/netinfo";
import { Layout } from "../constants/Layout";
import { useGetHistoryQuery } from "../redux/api/interview_api";

export const OfflineScreen = () => {
    const [isOffline, setIsOffline] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const wasOfflineRef = useRef(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Track whether the history API is currently fetching.
    // When we transition offline → online, we keep the overlay visible
    // until this fetch completes so the user never sees empty "0" data.
    const { isFetching } = useGetHistoryQuery();

    const checkNetwork = useCallback(() => {
        NetInfo.fetch().then(state => {
            const offline = state.isConnected === false;
            if (wasOfflineRef.current && !offline) {
                setIsReconnecting(true);
            }
            setIsOffline(offline);
            wasOfflineRef.current = offline;
        });
    }, []);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const offline = state.isConnected === false;

            // Detect the offline → online transition
            if (wasOfflineRef.current && !offline) {
                setIsReconnecting(true);
            }

            setIsOffline(offline);
            wasOfflineRef.current = offline;
        });

        return () => unsubscribe();
    }, []);

    // Dismiss the "Reconnecting" overlay once the API has finished refetching.
    // A minimum 1.5-second display prevents a jarring flash if the API responds
    // instantly, and a 5-second safety timeout prevents getting stuck forever
    // if the fetch silently fails.
    useEffect(() => {
        if (!isReconnecting) return;

        let dismissed = false;
        const dismiss = () => {
            if (dismissed) return;
            dismissed = true;
            setIsReconnecting(false);
        };

        // Minimum display time so the "Reconnecting" text is readable
        const minTimer = setTimeout(() => {
            // After the minimum time, dismiss if we're no longer fetching
            if (!isFetching) {
                dismiss();
            }
            // Otherwise, the other effect branch (isFetching becoming false) will dismiss
        }, 1500);

        // Safety fallback — never stay stuck longer than 5 seconds
        const maxTimer = setTimeout(dismiss, 5000);

        return () => {
            clearTimeout(minTimer);
            clearTimeout(maxTimer);
        };
    }, [isReconnecting]); // intentionally exclude isFetching to avoid re-running timers

    // If we're in reconnecting state and isFetching just finished,
    // dismiss after the minimum time has likely passed
    useEffect(() => {
        if (isReconnecting && !isFetching) {
            const timer = setTimeout(() => setIsReconnecting(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [isReconnecting, isFetching]);

    // Show the overlay when offline OR when reconnecting (data still loading)
    const showOverlay = isOffline || isReconnecting;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: showOverlay ? 1 : 0,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [showOverlay, fadeAnim]);

    return (
        <Animated.View
            style={[styles.container, { opacity: fadeAnim }]}
            pointerEvents={showOverlay ? "auto" : "none"}
        >
            <View style={styles.content}>
                {isReconnecting ? (
                    // Reconnecting state: show spinner while data loads
                    <>
                        <View style={styles.iconContainer}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                        </View>
                        <Text style={styles.title}>Reconnecting...</Text>
                        <Text style={styles.subtitle}>
                            Loading your data.{"\n"}
                            This won&apos;t take long.
                        </Text>
                    </>
                ) : (
                    // Offline state: show Wi-Fi icon and retry button
                    <>
                        <View style={styles.iconContainer}>
                            <WifiSlashIcon size={44} color="#FFFFFF" weight="duotone" />
                        </View>
                        <Text style={styles.title}>You&apos;re Offline</Text>
                        <Text style={styles.subtitle}>
                            No internet connection detected.{"\n"}
                            Check your Wi-Fi or mobile data.
                        </Text>
                        <TouchableOpacity style={styles.retryButton} onPress={checkNetwork} activeOpacity={0.7}>
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </>
                )}
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
