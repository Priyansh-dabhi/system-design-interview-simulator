import { CaretRightIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

interface ControlRowProps {
    label: string;
    icon: React.ComponentType<{ size: number; color: string }>;
    iconColor?: string;
    iconBg?: string;
    labelColor?: string;
    chevronColor?: string;
    isLast?: boolean;
    onPress: () => void;
}

export function ControlRow({
    label,
    icon: Icon,
    iconColor,
    iconBg,
    labelColor,
    chevronColor,
    isLast = false,
    onPress,
}: ControlRowProps) {
    const { colors } = useTheme();

    const currentIconColor = iconColor || colors.text;
    const currentIconBg = iconBg || (colors.surfaceHighlight + '60');
    const currentLabelColor = labelColor || colors.text;
    const currentChevronColor = chevronColor || colors.textSecondary;

    const styles = React.useMemo(() => StyleSheet.create({
        controlRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: Layout.spacing.md,
            paddingVertical: Layout.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        controlRowLast: {
            borderBottomWidth: 0,
        },
        controlLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Layout.spacing.sm + 4,
        },
        controlIconContainer: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        controlLabel: {
            fontSize: 15,
            fontWeight: '500',
        },
    }), [colors]);

    return (
        <TouchableOpacity
            style={[styles.controlRow, isLast && styles.controlRowLast]}
            activeOpacity={0.6}
            onPress={onPress}
        >
            <View style={styles.controlLeft}>
                <View style={[styles.controlIconContainer, { backgroundColor: currentIconBg }]}>
                    <Icon size={20} color={currentIconColor} />
                </View>
                <Text style={[styles.controlLabel, { color: currentLabelColor }]}>{label}</Text>
            </View>
            <CaretRightIcon size={16} color={currentChevronColor} />
        </TouchableOpacity>
    );
}

