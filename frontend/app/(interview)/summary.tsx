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
import { SummarySection } from '../../src/components/shared/SummarySection';
import { useTheme } from '../../src/theme/useTheme';
import { Layout } from '../../src/constants/Layout';

export default function SummaryScreen() {
    const router = useRouter();
    const dispatch = useDispatch();

    const summary = useSelector((state: RootState) => state.session.summary);
    const topicTitle = useSelector((state: RootState) => state.problem.selectedTopic?.title) || 'System Design Interview';
    const { colors } = useTheme();

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
                    <ArrowLeftIcon size={24} color={colors.text} />
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
                <SummarySection
                    strengths={summary.strengths}
                    missedTopics={summary.missed_topics}
                    suggestions={summary.suggestions}
                />
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
