import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface LoadingOverlayProps {
    title?: string;
    subtitle?: string;
}

export function LoadingOverlay({
    title = 'Generating Summary',
    subtitle = 'Analyzing your interview performance...',
}: LoadingOverlayProps) {
    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <ActivityIndicator size="large" color={Colors.primaryBrand} />
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: 32,
        alignItems: 'center',
        gap: 16,
        marginHorizontal: 40,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
