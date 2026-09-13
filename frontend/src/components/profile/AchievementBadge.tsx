import {
    Books,
    Crown,
    Fire,
    Lightning,
    LockSimple,
    Microphone,
    Sparkle,
    Trophy,
} from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Achievement } from '../../utils/achievements';

interface AchievementBadgeProps {
    achievement: Achievement;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
    const { colors, isDark } = useTheme();
    const isUnlocked = achievement.unlocked;

    const renderIcon = () => {
        const iconSize = 20;
        const iconColor = isUnlocked
            ? colors.primary
            : (isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.3)');
        const weight = isUnlocked ? 'fill' : 'regular';

        switch (achievement.icon) {
            case 'trophy':
                return <Trophy size={iconSize} color={isUnlocked ? '#F59E0B' : iconColor} weight={weight} />;
            case 'fire':
                return <Fire size={iconSize} color={isUnlocked ? '#F97316' : iconColor} weight={weight} />;
            case 'lightning':
                return <Lightning size={iconSize} color={isUnlocked ? '#3B82F6' : iconColor} weight={weight} />;
            case 'books':
                return <Books size={iconSize} color={isUnlocked ? '#8B5CF6' : iconColor} weight={weight} />;
            case 'microphone':
                return <Microphone size={iconSize} color={isUnlocked ? '#EC4899' : iconColor} weight={weight} />;
            case 'sparkle':
                return <Sparkle size={iconSize} color={isUnlocked ? '#10B981' : iconColor} weight={weight} />;
            case 'crown':
                return <Crown size={iconSize} color={isUnlocked ? '#EAB308' : iconColor} weight={weight} />;
            default:
                return <Trophy size={iconSize} color={iconColor} weight={weight} />;
        }
    };

    const styles = React.useMemo(() => StyleSheet.create({
        card: {
            width: '48.5%',
            borderRadius: 14,
            padding: 12,
            backgroundColor: isUnlocked
                ? (isDark ? 'rgba(30, 41, 59, 0.7)' : colors.surface)
                : (isDark ? 'rgba(17, 24, 39, 0.4)' : 'rgba(241, 245, 249, 0.6)'),
            borderWidth: 1,
            borderColor: isUnlocked
                ? (isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.2)')
                : colors.border,
            gap: 8,
            minHeight: 104,
            justifyContent: 'space-between',
        },
        topRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        iconBox: {
            width: 32,
            height: 32,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isUnlocked
                ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)')
                : (isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'),
        },
        lockPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 10,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
        },
        lockText: {
            fontSize: 9,
            fontWeight: '600',
            color: colors.textDim,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
        },
        unlockedPill: {
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 10,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
        },
        unlockedText: {
            fontSize: 9,
            fontWeight: '700',
            color: '#10B981',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
        },
        title: {
            fontSize: 13,
            fontWeight: '700',
            color: isUnlocked ? colors.text : colors.textSecondary,
            letterSpacing: -0.1,
        },
        description: {
            fontSize: 11,
            color: colors.textDim,
            lineHeight: 15,
            marginTop: 2,
        },
    }), [colors, isDark, isUnlocked]);

    return (
        <View style={styles.card}>
            <View style={styles.topRow}>
                <View style={styles.iconBox}>{renderIcon()}</View>
                {isUnlocked ? (
                    <View style={styles.unlockedPill}>
                        <Text style={styles.unlockedText}>Earned</Text>
                    </View>
                ) : (
                    <View style={styles.lockPill}>
                        <LockSimple size={10} color={colors.textDim} weight="bold" />
                        <Text style={styles.lockText}>Locked</Text>
                    </View>
                )}
            </View>

            <View>
                <Text style={styles.title} numberOfLines={1}>{achievement.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{achievement.description}</Text>
            </View>
        </View>
    );
};
