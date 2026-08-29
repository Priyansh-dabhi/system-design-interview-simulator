import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WifiSlashIcon } from "phosphor-react-native";
import NetInfo from "@react-native-community/netinfo";
import { useDispatch } from "react-redux";
import { Layout } from "../constants/Layout";
import { createSessionStartAPi, useGetHistoryQuery } from "../redux/api/interview_api";

export const OfflineScreen = () => {
    const [isOffline, setIsOffline] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const wasOfflineRef = useRef(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const dispatch = useDispatch();

    // Track whether the history API is currently fetching.
    // Used to keep the overlay visible until data has actually loaded.
    const { isFetching } = useGetHistoryQuery();

    const checkNetwork = useCallback(() => {
        NetInfo.fetch().then(state => {
            const offline = state.isConnected === false;
            if (wasOfflineRef.current && !offline) {
                setIsReconnecting(true);
                // Manually tell RTK Query to refetch all InterviewHistory data.
                // refetchOnReconnect doesn't work on React Native (it relies on
                // browser 'online' events), so we trigger this ourselves.
                dispatch(createSessionStartAPi.util.invalidateTags(["InterviewHistory"]));
            }
            setIsOffline(offline);
            wasOfflineRef.current = offline;
        });
    }, [dispatch]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const offline = state.isConnected === false;

            // Detect the offline → online transition
            if (wasOfflineRef.current && !offline) {
                setIsReconnecting(true);
                dispatch(createSessionStartAPi.util.invalidateTags(["InterviewHistory"]));
            }

            setIsOffline(offline);
            wasOfflineRef.current = offline;
        });

        return () => unsubscribe();
    }, [dispatch]);

    // Dismiss the "Reconnecting" overlay once the API has finished refetching.
    // We wait for isFetching to become true (refetch started) and then false
    // (refetch complete). A safety timeout prevents getting stuck forever.
    const fetchStartedRef = useRef(false);

    useEffect(() => {
        if (!isReconnecting) {
            fetchStartedRef.current = false;
            return;
        }

        if (isFetching) {
            fetchStartedRef.current = true;
        }

        // Only dismiss after the fetch has started AND completed
        if (fetchStartedRef.current && !isFetching) {
            setIsReconnecting(false);
        }
    }, [isReconnecting, isFetching]);

    // Safety timeout — never stay stuck longer than 5 seconds
    useEffect(() => {
        if (!isReconnecting) return;
        const timer = setTimeout(() => setIsReconnecting(false), 5000);
        return () => clearTimeout(timer);
    }, [isReconnecting]);

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
        backgroundColor: "#09090B",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    },
    content: {
        alignItems: "center",
        paddingHorizontal: Layout.spacing.xl,
    },
    iconContainer: {
        width: 96,
        height: 96,
        backgroundColor: "#18181B",
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#27272A",
        marginBottom: Layout.spacing.lg,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: Layout.spacing.sm,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#A1A1AA",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: Layout.spacing.xl,
    },
    retryButton: {
        paddingVertical: Layout.spacing.sm + 4,
        paddingHorizontal: Layout.spacing.xl,
        backgroundColor: "#18181B",
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: "#27272A",
    },
    retryText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
});
