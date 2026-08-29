import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WifiSlashIcon } from "phosphor-react-native";
import NetInfo from "@react-native-community/netinfo";
import { useDispatch } from "react-redux";
import { Layout } from "../constants/Layout";
import { createSessionStartAPi } from "../redux/api/interview_api";

export const OfflineScreen = () => {
    const [isOffline, setIsOffline] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const dispatch = useDispatch();

    const checkNetwork = useCallback(() => {
        NetInfo.fetch().then(state => {
            setIsOffline(state.isConnected === false);
        });
    }, []);

    useEffect(() => {
        // NetInfo automatically fires this listener on mount with the initial state,
        // so we instantly know if we are offline without any delays.
        const unsubscribe = NetInfo.addEventListener(state => {
            const currentlyOffline = state.isConnected === false;
            
            setIsOffline(prevWasOffline => {
                // If we were offline and just came back online, tell Redux to refetch data
                if (prevWasOffline && !currentlyOffline) {
                    dispatch(createSessionStartAPi.util.invalidateTags(['InterviewHistory']));
                }
                return currentlyOffline;
            });
        });

        return () => unsubscribe();
    }, [dispatch]);

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

                <TouchableOpacity style={styles.retryButton} onPress={checkNetwork} activeOpacity={0.7}>
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
