import { clearSession } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash } from 'phosphor-react-native';
import React from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { getSafeBottomInset } from '../../src/utils/safeArea';
import { useDeleteSessionMutation, useGetHistoryQuery, useGetSessionDetailQuery } from '../../src/redux/api/interview_api';

export default function SummaryScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const safeBottom = getSafeBottomInset(insets.bottom, Layout.spacing.lg);
    const params = useLocalSearchParams<{ sessionId?: string }>();
    const rawSessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
    const isFromHistory = Boolean(rawSessionId);

    // If viewing from history, fetch detail from API
    const { data: sessionDetail, isLoading: isSessionLoading } = useGetSessionDetailQuery(
        { sessionId: rawSessionId as string },
        { skip: !rawSessionId }
    );
    // Also read from history cache so data is displayed instantly even if detail endpoint is unavailable
    const { data: historyData } = useGetHistoryQuery(undefined, { skip: !isFromHistory });
    const cachedHistoryItem = isFromHistory && rawSessionId
        ? historyData?.history?.find((item) => item.id === rawSessionId)
        : undefined;

    const [deleteSession, { isLoading: isDeleting }] = useDeleteSessionMutation();

    // Redux session state (for newly completed interview)
    const activeSummary = useSelector((state: RootState) => state.session.summary);
    const activeMessages = useSelector((state: RootState) => state.session.messages);
    const activeSessionId = useSelector((state: RootState) => state.session.sessionId);
    const activeTopic = useSelector((state: RootState) => state.problem.selectedTopic?.title) || 'System Design Interview';

    const summary = isFromHistory ? (sessionDetail?.summary || cachedHistoryItem?.summary || null) : activeSummary;
    const topicTitle = isFromHistory ? (sessionDetail?.topic || cachedHistoryItem?.topic || 'System Design Interview') : activeTopic;
    const rawMessages = isFromHistory ? (sessionDetail?.messages || []) : activeMessages;
    const messages = rawMessages.map((m) => ({ role: m.role as 'user' | 'interviewer', text: m.text }));
    const targetSessionId = rawSessionId || activeSessionId;

    const { colors } = useTheme();
    const { exportPdf, isExporting } = useExportTranscript();

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: Layout.spacing.md,
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
        iconButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        deleteButton: {
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderColor: 'rgba(239, 68, 68, 0.25)',
        },
        headerCenter: {
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: Layout.spacing.sm,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
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
            paddingHorizontal: Layout.spacing.lg,
            paddingTop: Layout.spacing.md,
            paddingBottom: safeBottom,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
    }), [colors, safeBottom]);

    const handleBack = () => {
        if (isFromHistory) {
            router.back();
        } else {
            dispatch(clearSession());
            router.replace('/(main)/home' as any);
        }
    };

    const handleDelete = () => {
        if (!targetSessionId || isDeleting) return;

        Alert.alert(
            "Delete Interview Session?",
            "Are you sure you want to permanently delete this interview and its evaluation? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteSession({ sessionId: targetSessionId }).unwrap();
                            if (isFromHistory) {
                                router.back();
                            } else {
                                dispatch(clearSession());
                                router.replace('/(main)/home' as any);
                            }
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete the interview session. Please try again.");
                        }
                    },
                },
            ]
        );
    };

    const handleExport = () => {
        if (!summary) return;
        exportPdf({ topicTitle, messages, summary });
    };

    const isActuallyLoading = isFromHistory && isSessionLoading && !cachedHistoryItem?.summary;

    if (isActuallyLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Typography variant="body2" color="textSecondary">Loading evaluation…</Typography>
                </View>
            </SafeAreaView>
        );
    }

    if (!summary) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.emptyContainer}>
                    <Typography variant="body1" color="textSecondary">No summary available for this session</Typography>
                    <Button title="Go Back" onPress={handleBack} style={{ minWidth: 150 }} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.iconButton} accessibilityLabel="Back">
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Typography variant="body1" weight="semibold" numberOfLines={1}>{topicTitle}</Typography>
                    <Typography
                        variant="caption"
                        weight="bold"
                        style={{
                            color: isFromHistory ? colors.primary : (colors.success || '#10B981'),
                            letterSpacing: 1,
                            marginTop: 2,
                        }}
                    >
                        {isFromHistory ? 'EVALUATION OVERVIEW' : 'INTERVIEW COMPLETE'}
                    </Typography>
                </View>

                <View style={styles.headerActions}>
                    {targetSessionId && (
                        <TouchableOpacity
                            onPress={handleDelete}
                            style={[styles.iconButton, styles.deleteButton]}
                            disabled={isDeleting}
                            accessibilityLabel="Delete session"
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <Trash size={18} color="#EF4444" />
                            )}
                        </TouchableOpacity>
                    )}
                    <ExportButton onPress={handleExport} isLoading={isExporting} />
                </View>
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
                <Button
                    title={isFromHistory ? "Back to History" : "Done"}
                    onPress={handleBack}
                />
            </View>
        </SafeAreaView>
    );
}
