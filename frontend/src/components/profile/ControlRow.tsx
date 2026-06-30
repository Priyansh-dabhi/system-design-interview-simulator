import { CaretRightIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
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
    iconColor = Colors.text,
    iconBg = Colors.surfaceHighlight + '60',
    labelColor = Colors.text,
    chevronColor = Colors.textSecondary,
    isLast = false,
    onPress,
}: ControlRowProps) {
    return (
        <TouchableOpacity
            style={[styles.controlRow, isLast && styles.controlRowLast]}
            activeOpacity={0.6}
            onPress={onPress}
        >
            <View style={styles.controlLeft}>
                <View style={[styles.controlIconContainer, { backgroundColor: iconBg }]}>
                    <Icon size={20} color={iconColor} />
                </View>
                <Text style={[styles.controlLabel, { color: labelColor }]}>{label}</Text>
            </View>
            <CaretRightIcon size={16} color={chevronColor} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
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
});
