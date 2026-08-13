import { ArrowLeftIcon, ClockIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface ChatHeaderProps {
    topicTitle: string;
    onBack: () => void;
    onEnd: () => void;
    remainingSeconds?: number;
}

const AMBER = '#F59E0B';

const formatTime = (totalSeconds: number) => {
    const clamped = Math.max(0, totalSeconds);
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function ChatHeader({ topicTitle, onBack, onEnd, remainingSeconds }: ChatHeaderProps) {
    const { colors } = useTheme();
    const showTimer = typeof remainingSeconds === 'number';

    // Colour-shift as time runs low: amber in the last 5 min, red in the last minute.
    const timerColor = !showTimer
        ? colors.textSecondary
        : remainingSeconds! <= 60
            ? colors.error
            : remainingSeconds! <= 300
                ? AMBER
                : colors.primaryBrand;

    const styles = React.useMemo(() => StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: Layout.spacing.md,
            paddingVertical: Layout.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
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
            justifyContent: 'center',
            marginHorizontal: Layout.spacing.md,
            gap: 4,
        },
        topicTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            textAlign: 'center',
        },
        aiLabel: {
            fontSize: 11,
            fontWeight: '500',
            color: colors.textSecondary,
            letterSpacing: 0.5,
        },
        timerPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: Layout.borderRadius.full,
            backgroundColor: timerColor + '1A',
            borderWidth: 1,
            borderColor: timerColor + '40',
        },
        timerText: {
            fontSize: 13,
            fontWeight: '700',
            color: timerColor,
            fontVariant: ['tabular-nums'],
        },
        endButton: {
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor: colors.dangerSurfaceBg,
            borderWidth: 1,
            borderColor: colors.dangerSurfaceBorder,
        },
        endButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.error,
        },
    }), [colors, timerColor]);

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <ArrowLeftIcon size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <Text style={styles.topicTitle} numberOfLines={1}>{topicTitle}</Text>
                {showTimer ? (
                    <View style={styles.timerPill}>
                        <ClockIcon size={13} color={timerColor} weight="fill" />
                        <Text style={styles.timerText}>{formatTime(remainingSeconds!)}</Text>
                    </View>
                ) : (
                    <Text style={styles.aiLabel}>AI INTERVIEWER</Text>
                )}
            </View>

            <TouchableOpacity onPress={onEnd} style={styles.endButton}>
                <Text style={styles.endButtonText}>End</Text>
            </TouchableOpacity>
        </View>
    );
}
