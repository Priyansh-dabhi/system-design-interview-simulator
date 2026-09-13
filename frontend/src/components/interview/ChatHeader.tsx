import { ArrowLeft, Clock } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';
import { Typography } from '../ui/Typography';

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

    const timerColor = !showTimer
        ? colors.textSecondary
        : remainingSeconds! <= 60
            ? colors.error
            : remainingSeconds! <= 300
                ? AMBER
                : colors.primary;

    const styles = React.useMemo(() => StyleSheet.create({
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: Layout.spacing.lg,
            paddingVertical: Layout.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
            zIndex: 10,
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
            justifyContent: 'center',
            marginHorizontal: Layout.spacing.md,
            gap: 4,
        },
        timerPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: Layout.borderRadius.full,
            backgroundColor: timerColor + '15',
            borderWidth: 1,
            borderColor: timerColor + '30',
        },
        endButton: {
            paddingHorizontal: Layout.spacing.md,
            paddingVertical: 8,
            borderRadius: Layout.borderRadius.full,
            backgroundColor: colors.error + '15',
            borderWidth: 1,
            borderColor: colors.error + '30',
        },
    }), [colors, timerColor]);

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <Typography variant="body1" weight="semibold" numberOfLines={1}>{topicTitle}</Typography>
                {showTimer ? (
                    <View style={styles.timerPill}>
                        <Clock size={14} color={timerColor} weight="bold" />
                        <Typography variant="caption" weight="bold" style={{ color: timerColor, fontVariant: ['tabular-nums'] }}>
                            {formatTime(remainingSeconds!)}
                        </Typography>
                    </View>
                ) : (
                    <Typography variant="caption" color="textSecondary" weight="semibold" style={{ letterSpacing: 0.5 }}>
                        AI INTERVIEWER
                    </Typography>
                )}
            </View>

            <TouchableOpacity onPress={onEnd} style={styles.endButton}>
                <Typography variant="caption" weight="bold" style={{ color: colors.error }}>End</Typography>
            </TouchableOpacity>
        </View>
    );
}
