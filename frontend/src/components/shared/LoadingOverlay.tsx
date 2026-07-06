import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface LoadingOverlayProps {
    title?: string;
    subtitle?: string;
}

export function LoadingOverlay({
    title = 'Generating Summary',
    subtitle = 'Analyzing your interview performance...',
}: LoadingOverlayProps) {
    const { colors, isDark } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.overlayBackground,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: Layout.borderRadius.lg,
            padding: 32,
            alignItems: 'center',
            gap: 16,
            marginHorizontal: 40,
            borderWidth: 1,
            borderColor: colors.border,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
        },
        subtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
        },
    }), [colors]);

    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <ActivityIndicator size="large" color={colors.primaryBrand} />
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
        </View>
    );
}

