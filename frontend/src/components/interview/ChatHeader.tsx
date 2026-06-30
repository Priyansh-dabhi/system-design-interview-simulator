import { ArrowLeftIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface ChatHeaderProps {
    topicTitle: string;
    onBack: () => void;
    onEnd: () => void;
}

export function ChatHeader({ topicTitle, onBack, onEnd }: ChatHeaderProps) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <ArrowLeftIcon size={24} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <Text style={styles.topicTitle}>{topicTitle}</Text>
                <Text style={styles.aiLabel}>AI INTERVIEWER</Text>
            </View>

            <TouchableOpacity onPress={onEnd} style={styles.endButton}>
                <Text style={styles.endButtonText}>End</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Layout.spacing.md,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
    },
    aiLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginTop: 2,
        letterSpacing: 0.5,
    },
    endButton: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#1A0A0A',
        borderWidth: 1,
        borderColor: '#2A1010',
    },
    endButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.error,
    },
});
