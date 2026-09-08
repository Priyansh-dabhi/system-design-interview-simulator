import { useStartSessionMutation } from '@/src/redux/api/interview_api';
import { setDuration, setDifficulty } from '@/src/redux/slices/problem';
import { setSession } from '@/src/redux/slices/session';
import type { RootState } from '@/src/redux/store';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Target, Info, MicrophoneStage, Keyboard } from 'phosphor-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { SegmentedControl, SegmentedControlOption } from '../../src/components/ui/SegmentedControl';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';

const DURATION_OPTIONS: SegmentedControlOption<number>[] = [
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '60m', value: 60 },
];

const DIFFICULTY_OPTIONS: SegmentedControlOption<'junior' | 'mid' | 'senior'>[] = [
    { label: 'Junior', value: 'junior' },
    { label: 'Mid', value: 'mid' },
    { label: 'Senior', value: 'senior' },
];

export default function SetupScreen() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { colors } = useTheme();

    const selectedTopic = useSelector((state: RootState) => state.problem.selectedTopic);
    const durationMinutes = useSelector((state: RootState) => state.problem.durationMinutes);
    const difficultyLevel = useSelector((state: RootState) => state.problem.difficultyLevel);
    
    // We can add voice mode toggle later, keep as state for now
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    
    const [startSession, { isLoading }] = useStartSessionMutation();

    const handleStartInterview = async () => {
        if (!selectedTopic?.title) {
            Alert.alert("Missing Topic", "Please go back and select a topic first.");
            return;
        }

        try {
            const result = await startSession({ 
                problem: selectedTopic.title, 
                durationMinutes, 
                difficultyLevel 
            }).unwrap();

            dispatch(setSession({
                sessionId: result.sessionId,
                openingMessage: result.message,
                problem: selectedTopic.title,
                durationMinutes,
                difficultyLevel,
            }));
            
            router.push('/(interview)/session');
        } catch (err: any) {
            Alert.alert(
                'Failed to Start Interview',
                err?.data?.message || 'Something went wrong. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    if (!selectedTopic) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Typography>Loading...</Typography>
            </SafeAreaView>
        );
    }

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: Layout.spacing.lg,
            paddingTop: Layout.spacing.md,
            paddingBottom: Layout.spacing.lg,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Layout.spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: Layout.spacing.lg,
            paddingBottom: Layout.spacing.xl,
            gap: Layout.spacing.lg,
        },
        controlHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.sm,
            marginBottom: Layout.spacing.md,
        },
        iconBox: {
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
        },
        footer: {
            padding: Layout.spacing.lg,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        instructionsBox: {
            backgroundColor: colors.surfaceHighlight,
            padding: Layout.spacing.md,
            borderRadius: Layout.borderRadius.md,
            flexDirection: 'row',
            gap: Layout.spacing.md,
        },
    }), [colors]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Typography variant="h2" weight="bold">{selectedTopic.title}</Typography>
                <Typography variant="body1" color="textSecondary" style={{ marginTop: Layout.spacing.xs }}>
                    Customize your interview parameters
                </Typography>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                
                <Card padding="lg" variant="outlined">
                    <View style={styles.controlHeader}>
                        <View style={styles.iconBox}>
                            <Clock size={18} color={colors.primary} weight="fill" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typography variant="body1" weight="semibold">Duration</Typography>
                            <Typography variant="caption" color="textSecondary">Target time to solve the problem</Typography>
                        </View>
                    </View>
                    <SegmentedControl
                        options={DURATION_OPTIONS}
                        value={durationMinutes}
                        onChange={(value) => dispatch(setDuration(value))}
                    />
                </Card>

                <Card padding="lg" variant="outlined">
                    <View style={styles.controlHeader}>
                        <View style={styles.iconBox}>
                            <Target size={18} color={colors.primary} weight="fill" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typography variant="body1" weight="semibold">Difficulty</Typography>
                            <Typography variant="caption" color="textSecondary">Adjusts AI evaluation strictness</Typography>
                        </View>
                    </View>
                    <SegmentedControl
                        options={DIFFICULTY_OPTIONS}
                        value={difficultyLevel}
                        onChange={(value) => dispatch(setDifficulty(value))}
                    />
                </Card>

                <View style={styles.instructionsBox}>
                    <Info size={24} color={colors.primary} weight="fill" />
                    <View style={{ flex: 1 }}>
                        <Typography variant="body2" weight="semibold" style={{ marginBottom: 4 }}>What to expect</Typography>
                        <Typography variant="body2" color="textSecondary" style={{ lineHeight: 20 }}>
                            You will be evaluated on Requirements Gathering, Architecture, Scalability, and Trade-offs. 
                            The AI interviewer will adapt its questions based on your responses.
                        </Typography>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={isLoading ? "Preparing Interview..." : "Start Interview"}
                    onPress={handleStartInterview}
                    isLoading={isLoading}
                    disabled={isLoading}
                />
            </View>
        </SafeAreaView>
    );
}
