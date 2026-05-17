import { clearSession } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useRouter } from 'expo-router';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    LightbulbIcon,
    WarningCircleIcon,
} from 'phosphor-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';

export default function SummaryScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const summary = useSelector((state: RootState) => state.session.summary);
    const topicTitle = useSelector((state: RootState) => state.problem.selectedTopic?.title) || 'System Design Interview';

    const handleDone = () => {
        dispatch(clearSession());
        router.dismissAll();
    };

    if (!summary) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No summary available</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.doneButton}>
                        <Text style={styles.doneButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleDone} style={styles.backButton}>
                    <ArrowLeftIcon size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.topicTitle}>{topicTitle}</Text>
                    <Text style={styles.completedLabel}>INTERVIEW COMPLETE</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Strengths Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconContainer, { backgroundColor: '#10B98120' }]}>
                            <CheckCircleIcon size={22} color="#10B981" weight="fill" />
                        </View>
                        <Text style={styles.sectionTitle}>Strengths</Text>
                    </View>
                    {summary.strengths.map((item, index) => (
                        <View key={`s-${index}`} style={[styles.card, styles.strengthCard]}>
                            <View style={[styles.cardDot, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.cardText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Missed Topics Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconContainer, { backgroundColor: '#F59E0B20' }]}>
                            <WarningCircleIcon size={22} color="#F59E0B" weight="fill" />
                        </View>
                        <Text style={styles.sectionTitle}>Missed Topics</Text>
                    </View>
                    {summary.missed_topics.map((item, index) => (
                        <View key={`m-${index}`} style={[styles.card, styles.missedCard]}>
                            <View style={[styles.cardDot, { backgroundColor: '#F59E0B' }]} />
                            <Text style={styles.cardText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Suggestions Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconContainer, { backgroundColor: '#3B82F620' }]}>
                            <LightbulbIcon size={22} color="#3B82F6" weight="fill" />
                        </View>
                        <Text style={styles.sectionTitle}>Suggestions</Text>
                    </View>
                    {summary.suggestions.map((item, index) => (
                        <View key={`sg-${index}`} style={[styles.card, styles.suggestionCard]}>
                            <View style={[styles.cardDot, { backgroundColor: '#3B82F6' }]} />
                            <Text style={styles.cardText}>{item}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Done Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.doneButton}
                    activeOpacity={0.8}
                    onPress={handleDone}
                >
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    completedLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#10B981',
        letterSpacing: 1,
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Layout.spacing.lg,
        gap: Layout.spacing.xl,
        paddingBottom: Layout.spacing.md,
    },
    section: {
        gap: Layout.spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.sm,
        marginBottom: Layout.spacing.xs,
    },
    sectionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.surface,
        padding: Layout.spacing.md,
        borderRadius: Layout.borderRadius.md,
        borderWidth: 1,
        gap: Layout.spacing.sm,
    },
    strengthCard: {
        borderColor: '#10B98130',
    },
    missedCard: {
        borderColor: '#F59E0B30',
    },
    suggestionCard: {
        borderColor: '#3B82F630',
    },
    cardDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
    },
    cardText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 21,
        color: Colors.text,
    },
    buttonContainer: {
        paddingHorizontal: Layout.spacing.lg,
        paddingVertical: Layout.spacing.md,
        paddingBottom: Layout.spacing.lg,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    doneButton: {
        height: 56,
        backgroundColor: Colors.primaryBrand,
        borderRadius: Layout.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primaryBrand,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
