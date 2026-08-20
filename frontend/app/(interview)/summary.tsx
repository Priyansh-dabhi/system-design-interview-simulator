import { clearSession } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useRouter } from 'expo-router';
import {
    ArrowLeftIcon,
} from 'phosphor-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { SummarySection } from '../../src/components/shared/SummarySection';
import { ScoreHeader } from '../../src/components/interview/ScoreHeader';
import { DimensionBars } from '../../src/components/interview/DimensionBars';
import { CoverageChecklist } from '../../src/components/interview/CoverageChecklist';
import { StudyPlanList } from '../../src/components/interview/StudyPlanList';
import { IdealAnswerCard } from '../../src/components/interview/IdealAnswerCard';
import { ExportButton } from '../../src/components/interview/ExportButton';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';
import { useExportTranscript } from '../../src/utils/useExportTranscript';

export default function SummaryScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const summary = useSelector((state: RootState) => state.session.summary);
    const messages = useSelector((state: RootState) => state.session.messages);
    const topicTitle = useSelector((state: RootState) => state.problem.selectedTopic?.title) || 'System Design Interview';
    const { colors } = useTheme();
    const { exportPdf, isExporting } = useExportTranscript();

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
        },
        emptyText: {
            fontSize: 16,
            color: colors.textSecondary,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Layout.spacing.md,
            paddingVertical: Layout.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        headerCenter: {
            flex: 1,
            alignItems: 'center',
        },
        topicTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
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
            paddingBottom: Layout.spacing.md,
        },
        content: {
            gap: Layout.spacing.lg,
        },
        buttonContainer: {
            paddingHorizontal: Layout.spacing.lg,
            paddingVertical: Layout.spacing.md,
            paddingBottom: Layout.spacing.lg,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        doneButton: {
            height: 56,
            backgroundColor: colors.primaryBrand,
            borderRadius: Layout.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primaryBrand,
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
    }), [colors]);

    const handleDone = () => {
        dispatch(clearSession());
        router.dismissAll();
    };

    const handleExport = () => {
        if (!summary) return;
        exportPdf({ topicTitle, messages, summary });
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
                    <ArrowLeftIcon size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.topicTitle}>{topicTitle}</Text>
                    <Text style={styles.completedLabel}>INTERVIEW COMPLETE</Text>
                </View>
                <ExportButton onPress={handleExport} isLoading={isExporting} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {typeof summary.overall_score === 'number' && (
                        <ScoreHeader
                            overallScore={summary.overall_score}
                            durationSeconds={summary.durationSeconds}
                        />
                    )}
                    {summary.dimension_scores && (
                        <DimensionBars scores={summary.dimension_scores} />
                    )}
                    <SummarySection
                        strengths={summary.strengths}
                        missedTopics={summary.missed_topics}
                        suggestions={summary.suggestions}
                    />
                    {summary.topic_coverage && summary.topic_coverage.length > 0 && (
                        <CoverageChecklist items={summary.topic_coverage} />
                    )}
                    {summary.study_plan && summary.study_plan.length > 0 && (
                        <StudyPlanList items={summary.study_plan} />
                    )}
                    {summary.ideal_answer ? (
                        <IdealAnswerCard text={summary.ideal_answer} />
                    ) : null}
                </View>
            </ScrollView>

            {/* Done Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.doneButton} activeOpacity={0.8} onPress={handleDone}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
