import { ClockCounterClockwiseIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

export function EmptyState() {
    return (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <ClockCounterClockwiseIcon size={40} color={Colors.textDim} />
            </View>
            <Text style={styles.emptyTitle}>No Interviews Yet</Text>
            <Text style={styles.emptySubtitle}>
                Complete your first mock interview to see your history and performance reviews here.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.xl,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 21,
    },
});
