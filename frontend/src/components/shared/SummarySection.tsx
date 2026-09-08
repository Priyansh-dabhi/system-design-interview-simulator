import { CheckCircle, Lightbulb, WarningCircle } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';

interface SummarySectionProps {
    strengths: string[];
    missedTopics: string[];
    suggestions: string[];
}

function BulletCard({ text, icon }: { text: string; icon: React.ReactNode }) {
    const { colors } = useTheme();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Layout.spacing.sm, marginBottom: Layout.spacing.md }}>
            <View style={{ marginTop: 2 }}>{icon}</View>
            <Typography variant="body2" color="textSecondary" style={{ flex: 1, lineHeight: 22 }}>{text}</Typography>
        </View>
    );
}

export function SummarySection({ strengths, missedTopics, suggestions }: SummarySectionProps) {
    const { colors } = useTheme();
    return (
        <View style={styles.container}>
            {/* Strengths */}
            {strengths?.length > 0 && (
                <Card padding="lg" variant="outlined" style={styles.sectionCard}>
                    <View style={styles.headerRow}>
                        <View style={[styles.iconWrapper, { backgroundColor: colors.success + '15' }]}>
                            <CheckCircle size={18} color={colors.success} weight="fill" />
                        </View>
                        <Typography variant="h4" weight="semibold">Strengths</Typography>
                    </View>
                    <View style={styles.list}>
                        {strengths.map((text, i) => (
                            <BulletCard key={`s-${i}`} text={text} icon={<View style={[styles.dot, { backgroundColor: colors.success }]} />} />
                        ))}
                    </View>
                </Card>
            )}

            {/* Missed Topics */}
            {missedTopics?.length > 0 && (
                <Card padding="lg" variant="outlined" style={styles.sectionCard}>
                    <View style={styles.headerRow}>
                        <View style={[styles.iconWrapper, { backgroundColor: '#F59E0B15' }]}>
                            <WarningCircle size={18} color="#F59E0B" weight="fill" />
                        </View>
                        <Typography variant="h4" weight="semibold">Missed Topics</Typography>
                    </View>
                    <View style={styles.list}>
                        {missedTopics.map((text, i) => (
                            <BulletCard key={`m-${i}`} text={text} icon={<View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />} />
                        ))}
                    </View>
                </Card>
            )}

            {/* Suggestions */}
            {suggestions?.length > 0 && (
                <Card padding="lg" variant="outlined" style={styles.sectionCard}>
                    <View style={styles.headerRow}>
                        <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
                            <Lightbulb size={18} color={colors.primary} weight="fill" />
                        </View>
                        <Typography variant="h4" weight="semibold">Suggestions</Typography>
                    </View>
                    <View style={styles.list}>
                        {suggestions.map((text, i) => (
                            <BulletCard key={`sg-${i}`} text={text} icon={<View style={[styles.dot, { backgroundColor: colors.primary }]} />} />
                        ))}
                    </View>
                </Card>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Layout.spacing.lg,
    },
    sectionCard: {
        marginBottom: Layout.spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.sm,
        marginBottom: Layout.spacing.md,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        marginTop: Layout.spacing.xs,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
    },
});
