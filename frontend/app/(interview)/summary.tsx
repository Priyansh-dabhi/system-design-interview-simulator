import { clearSession } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'phosphor-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';

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
            gap: Layout.spacing.lg,
            padding: Layout.spacing.xl,
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
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        headerCenter: {
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: Layout.spacing.sm,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: Layout.spacing.lg,
            paddingBottom: Layout.spacing.xxl,
            gap: Layout.spacing.xl,
        },
        footer: {
            padding: Layout.spacing.lg,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
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
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.emptyContainer}>
                    <Typography variant="body1" color="textSecondary">No summary available</Typography>
                    <Button title="Go Back" onPress={() => router.back()} style={{ minWidth: 150 }} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleDone} style={styles.backButton}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Typography variant="body1" weight="semibold" numberOfLines={1}>{topicTitle}</Typography>
                    <Typography variant="caption" weight="bold" style={{ color: colors.success || '#10B981', letterSpacing: 1, marginTop: 2 }}>
                        INTERVIEW COMPLETE
                    </Typography>
                </View>
                <ExportButton onPress={handleExport} isLoading={isExporting} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {typeof summary.overall_score === 'number' && (
                    <ScoreHeader overallScore={summary.overall_score} durationSeconds={summary.durationSeconds} />
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
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Done" onPress={handleDone} />
            </View>
        </SafeAreaView>
    );
}
