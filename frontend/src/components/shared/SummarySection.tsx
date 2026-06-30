import {
    CheckCircleIcon,
    LightbulbIcon,
    WarningCircleIcon,
} from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface SummarySectionProps {
    strengths: string[];
    missedTopics: string[];
    suggestions: string[];
}

function BulletCard({ text, dotColor, borderColor }: { text: string; dotColor: string; borderColor: string }) {
    return (
        <View style={[styles.bulletCard, { borderColor }]}>
            <View style={[styles.bulletDot, { backgroundColor: dotColor }]} />
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <View style={styles.reviewSectionHeader}>
            {icon}
            <Text style={styles.reviewSectionTitle}>{title}</Text>
        </View>
    );
}

export function SummarySection({ strengths, missedTopics, suggestions }: SummarySectionProps) {
    return (
        <View style={styles.container}>
            {/* Strengths */}
            <View style={styles.reviewSection}>
                <SectionHeader
                    icon={
                        <View style={[styles.reviewIconContainer, { backgroundColor: '#10B98120' }]}>
                            <CheckCircleIcon size={16} color="#10B981" weight="fill" />
                        </View>
                    }
                    title="Strengths"
                />
                {strengths.map((text, i) => (
                    <BulletCard key={`s-${i}`} text={text} dotColor="#10B981" borderColor="#10B98125" />
                ))}
            </View>

            {/* Missed Topics */}
            <View style={styles.reviewSection}>
                <SectionHeader
                    icon={
                        <View style={[styles.reviewIconContainer, { backgroundColor: '#F59E0B20' }]}>
                            <WarningCircleIcon size={16} color="#F59E0B" weight="fill" />
                        </View>
                    }
                    title="Missed Topics"
                />
                {missedTopics.map((text, i) => (
                    <BulletCard key={`m-${i}`} text={text} dotColor="#F59E0B" borderColor="#F59E0B25" />
                ))}
            </View>

            {/* Suggestions */}
            <View style={styles.reviewSection}>
                <SectionHeader
                    icon={
                        <View style={[styles.reviewIconContainer, { backgroundColor: '#3B82F620' }]}>
                            <LightbulbIcon size={16} color="#3B82F6" weight="fill" />
                        </View>
                    }
                    title="Suggestions"
                />
                {suggestions.map((text, i) => (
                    <BulletCard key={`sg-${i}`} text={text} dotColor="#3B82F6" borderColor="#3B82F625" />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Layout.spacing.lg,
    },
    reviewSection: {
        gap: Layout.spacing.sm,
    },
    reviewSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.sm,
        marginBottom: 2,
    },
    reviewIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    bulletCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.background,
        paddingHorizontal: Layout.spacing.sm + 4,
        paddingVertical: Layout.spacing.sm + 2,
        borderRadius: Layout.borderRadius.sm + 2,
        borderWidth: 1,
        gap: Layout.spacing.sm,
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
    },
    bulletText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        color: Colors.textSecondary,
    },
});
