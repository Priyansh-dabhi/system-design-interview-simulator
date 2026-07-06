import { ArrowLeftIcon, DesktopIcon, MoonIcon, SunIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';
import { ThemeMode } from '../../src/theme/types';

export default function PreferencesScreen() {
    const router = useRouter();
    const { colors, themeMode, setThemeMode } = useTheme();

    const options = [
        { id: 'light', label: 'Light', icon: SunIcon },
        { id: 'dark', label: 'Dark', icon: MoonIcon },
        { id: 'system', label: 'System', icon: DesktopIcon },
    ] as const;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ArrowLeftIcon size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Preferences</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                        Customize how the app looks on your device.
                    </Text>

                    <View style={[styles.segmentedControl, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {options.map((option, index) => {
                            const isSelected = themeMode === option.id;
                            const Icon = option.icon;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.segment,
                                        isSelected && { backgroundColor: colors.primaryBrand + '15' },
                                        index < options.length - 1 && { borderRightWidth: 1, borderRightColor: colors.border }
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => setThemeMode(option.id as ThemeMode)}
                                >
                                    <Icon 
                                        size={20} 
                                        color={isSelected ? colors.primaryBrand : colors.textSecondary} 
                                        weight={isSelected ? 'fill' : 'regular'} 
                                    />
                                    <Text style={[
                                        styles.segmentText,
                                        { color: isSelected ? colors.primaryBrand : colors.textSecondary },
                                        isSelected && styles.segmentTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: Layout.spacing.lg,
    },
    section: {
        marginBottom: Layout.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        marginBottom: Layout.spacing.lg,
    },
    segmentedControl: {
        flexDirection: 'row',
        borderRadius: Layout.borderRadius.md,
        borderWidth: 1,
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
    segmentText: {
        fontSize: 15,
        fontWeight: '500',
    },
    segmentTextSelected: {
        fontWeight: '600',
    },
});
