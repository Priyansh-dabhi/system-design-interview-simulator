import { CaretRight } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface ProfileRowProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightBadge?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    destructive?: boolean;
    showChevron?: boolean;
}

export const ProfileRow: React.FC<ProfileRowProps> = ({
    icon,
    title,
    subtitle,
    rightBadge,
    rightElement,
    onPress,
    destructive = false,
    showChevron = true,
}) => {
    const { colors, isDark } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: colors.surface,
        },
        leftContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 13,
            flex: 1,
            paddingRight: 10,
        },
        iconContainer: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: destructive
                ? 'rgba(239, 68, 68, 0.12)'
                : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
            borderWidth: 1,
            borderColor: destructive ? 'rgba(239, 68, 68, 0.22)' : colors.border,
        },
        textContainer: {
            flex: 1,
        },
        title: {
            fontSize: 14,
            fontWeight: '600',
            color: destructive ? colors.error : colors.text,
            letterSpacing: -0.1,
        },
        subtitle: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
        },
        rightContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        badge: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(37, 99, 235, 0.08)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.15)',
        },
        badgeText: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.primary,
        },
    }), [colors, isDark, destructive]);

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [
                styles.row,
                { opacity: pressed && onPress ? 0.75 : 1 },
            ]}
        >
            <View style={styles.leftContent}>
                <View style={styles.iconContainer}>{icon}</View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
            </View>

            <View style={styles.rightContent}>
                {rightBadge ? (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{rightBadge}</Text>
                    </View>
                ) : null}
                {rightElement}
                {showChevron && onPress && !rightElement ? (
                    <CaretRight size={15} color={colors.textDim} weight="bold" />
                ) : null}
            </View>
        </Pressable>
    );
};
