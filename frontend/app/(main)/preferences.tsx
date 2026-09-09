import { ArrowLeft, Desktop, Moon, Sun } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';
import { ThemeMode } from '../../src/theme/types';
import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';

export default function PreferencesScreen() {
    const router = useRouter();
    const { colors, themeMode, setThemeMode } = useTheme();

    const options = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Desktop },
    ] as const;

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Layout.spacing.lg,
            paddingVertical: Layout.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
        },
        headerCenter: {
            flex: 1,
            alignItems: 'center',
        },
        content: {
            padding: Layout.spacing.lg,
        },
        section: {
            marginBottom: Layout.spacing.xl,
        },
        segmentedControl: {
            flexDirection: 'row',
            borderRadius: Layout.borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            overflow: 'hidden',
        },
        segment: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: Layout.spacing.md,
            gap: 8,
        },
    }), [colors]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Typography variant="body1" weight="semibold">Preferences</Typography>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Typography variant="h3" weight="semibold" style={{ marginBottom: 4 }}>Appearance</Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: Layout.spacing.lg }}>
                        Customize how the app looks on your device.
                    </Typography>

                    <Card padding="none" variant="outlined" style={styles.segmentedControl}>
                        {options.map((option, index) => {
                            const isSelected = themeMode === option.id;
                            const Icon = option.icon;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.segment,
                                        isSelected && { backgroundColor: colors.primary + '15' },
                                        index < options.length - 1 && { borderRightWidth: 1, borderRightColor: colors.border }
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => setThemeMode(option.id as ThemeMode)}
                                >
                                    <Icon 
                                        size={20} 
                                        color={isSelected ? colors.primary : colors.textSecondary} 
                                        weight={isSelected ? 'fill' : 'regular'} 
                                    />
                                    <Typography 
                                        variant="body2" 
                                        weight={isSelected ? 'bold' : 'medium'}
                                        style={{ color: isSelected ? colors.primary : colors.textSecondary }}
                                    >
                                        {option.label}
                                    </Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </Card>
                </View>
            </View>
        </SafeAreaView>
    );
}
