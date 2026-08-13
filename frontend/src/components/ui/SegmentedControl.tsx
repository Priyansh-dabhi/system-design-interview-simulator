import type { IconWeight } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Layout } from '../../constants/Layout';

export interface SegmentedControlOption<T extends string | number> {
    label: string;
    value: T;
    icon?: React.ComponentType<{ size: number; color: string; weight?: IconWeight }>;
}

interface SegmentedControlProps<T extends string | number> {
    options: SegmentedControlOption<T>[];
    value: T;
    onChange: (value: T) => void;
}

// Reusable segmented control, generalized from the hand-rolled pattern that
// previously lived only in the Preferences screen.
export function SegmentedControl<T extends string | number>({
    options,
    value,
    onChange,
}: SegmentedControlProps<T>) {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        segmentedControl: {
            flexDirection: 'row',
            borderRadius: Layout.borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            overflow: 'hidden',
        },
        segment: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: Layout.spacing.md,
            gap: 8,
        },
        segmentSelected: {
            backgroundColor: colors.primaryBrand + '15',
        },
        segmentDivider: {
            borderRightWidth: 1,
            borderRightColor: colors.border,
        },
        segmentText: {
            fontSize: 15,
            fontWeight: '500',
            color: colors.textSecondary,
        },
        segmentTextSelected: {
            color: colors.primaryBrand,
            fontWeight: '600',
        },
    }), [colors]);

    return (
        <View style={styles.segmentedControl}>
            {options.map((option, index) => {
                const isSelected = option.value === value;
                const Icon = option.icon;
                return (
                    <TouchableOpacity
                        key={String(option.value)}
                        style={[
                            styles.segment,
                            isSelected && styles.segmentSelected,
                            index < options.length - 1 && styles.segmentDivider,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => onChange(option.value)}
                    >
                        {Icon && (
                            <Icon
                                size={18}
                                color={isSelected ? colors.primaryBrand : colors.textSecondary}
                                weight={isSelected ? 'fill' : 'regular'}
                            />
                        )}
                        <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
