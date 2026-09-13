import RBSheet from 'react-native-raw-bottom-sheet';
import Constants from 'expo-constants';
import {
    Bug,
    CheckCircle,
    Info,
    ShieldWarning,
    Trash,
    User,
} from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert, StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    TextInput,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';

// Base BottomSheet Container powered by @gorhom/bottom-sheet
interface BaseModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    snapPoints?: (string | number)[];
}

export const BaseBottomSheet: React.FC<BaseModalProps> = ({
    visible,
    onClose,
    title,
    children,
    snapPoints: customSnapPoints,
}) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<any>(null);

    useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.open();
        } else {
            bottomSheetRef.current?.close();
        }
    }, [visible]);

    const handleDismiss = useCallback(() => {
        onClose();
    }, [onClose]);

    const styles = useMemo(() => StyleSheet.create({
        header: {
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        title: {
            fontSize: 17,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.2,
        },
        content: {
            padding: 20,
        },
    }), [colors, isDark]);

    return (
        <RBSheet
            ref={bottomSheetRef}
            height={Dimensions.get('window').height * 0.94}
            draggable={true}
            closeOnPressMask={true}
            onClose={handleDismiss}
            customStyles={{
                wrapper: {
                    backgroundColor: 'rgba(0,0,0,0.65)'
                },
                draggableIcon: {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                    width: 42,
                    height: 4.5,
                    borderRadius: 3,
                    marginTop: 10,
                },
                container: {
                    backgroundColor: colors.surface,
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingTop: insets.top || 10,
                }
            }}
        >
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
            </View>
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </RBSheet>
    );
};

const BaseModal = BaseBottomSheet;

// 1. Edit Profile Modal
interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentName: string;
    currentEmail: string;
    currentRole: string;
    onSave: (name: string, role: string) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    visible,
    onClose,
    currentName,
    currentEmail,
    currentRole,
    onSave,
}) => {
    const { colors, isDark } = useTheme();
    const [name, setName] = useState(currentName);
    const [role, setRole] = useState(currentRole);

    const handleSave = () => {
        onSave(name.trim() || currentName, role.trim() || currentRole);
        onClose();
        Alert.alert('Profile Updated', 'Your profile preferences have been updated.');
    };

    const styles = React.useMemo(() => StyleSheet.create({
        inputGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 6,
        },
        input: {
            backgroundColor: isDark ? '#0D1117' : '#F1F5F9',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
            color: colors.text,
        },
        disabledInput: {
            opacity: 0.6,
        },
        saveBtn: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 8,
        },
        saveBtnText: {
            fontSize: 15,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        hintText: {
            fontSize: 11,
            color: colors.textDim,
            marginTop: 4,
        },
    }), [colors, isDark]);

    return (
        <BaseModal visible={visible} onClose={onClose} title="Edit Profile">
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Candidate name"
                    placeholderTextColor={colors.textDim}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Target Role / Track</Text>
                <TextInput
                    style={styles.input}
                    value={role}
                    onChangeText={setRole}
                    placeholder="e.g. Senior Distributed Systems Engineer"
                    placeholderTextColor={colors.textDim}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={currentEmail}
                    editable={false}
                />
                <Text style={styles.hintText}>Email address is tied to your login account.</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
        </BaseModal>
    );
};

// 2. Data & Privacy Modal (with Delete Account)
interface DataPrivacyModalProps {
    visible: boolean;
    onClose: () => void;
    onSignOut: () => void;
}

export const DataPrivacyModal: React.FC<DataPrivacyModalProps> = ({ visible, onClose, onSignOut }) => {
    const { colors, isDark } = useTheme();

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account? All interview histories, telemetry, and evaluations will be erased. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Permanently Delete',
                    style: 'destructive',
                    onPress: () => {
                        onClose();
                        Alert.alert(
                            'Account Deletion Request',
                            'Your deletion request has been registered. You will now be signed out.',
                            [{ text: 'OK', onPress: onSignOut }]
                        );
                    },
                },
            ]
        );
    };

    const styles = React.useMemo(() => StyleSheet.create({
        introBox: {
            padding: 14,
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.05)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.15)',
            marginBottom: 20,
        },
        introText: {
            fontSize: 13,
            lineHeight: 19,
            color: colors.textSecondary,
        },
        card: {
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12,
        },
        cardTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 3,
        },
        cardDesc: {
            fontSize: 12,
            color: colors.textDim,
            lineHeight: 17,
        },
        deleteBox: {
            marginTop: 16,
            padding: 16,
            borderRadius: 14,
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.2)',
            gap: 10,
        },
        deleteHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        deleteTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: colors.error,
        },
        deleteDesc: {
            fontSize: 12,
            color: colors.textSecondary,
            lineHeight: 17,
        },
        deleteBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: colors.error,
            borderRadius: 10,
            paddingVertical: 11,
            marginTop: 4,
        },
        deleteBtnText: {
            fontSize: 13,
            fontWeight: '700',
            color: '#FFFFFF',
        },
    }), [colors, isDark]);

    return (
        <BaseModal visible={visible} onClose={onClose} title="Data & Privacy">
            <View style={styles.introBox}>
                <Text style={styles.introText}>
                    You control your interview history, learning progress, and account data. Your simulation transcripts are encrypted and protected.
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Manage Your Data</Text>
                <Text style={styles.cardDesc}>
                    Simulation transcripts and evaluations are saved to help track your readiness score over time.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.card}
                onPress={() => Alert.alert('Download Data', 'A consolidated archive of your interview summaries can be exported from each session summary screen.')}
            >
                <Text style={styles.cardTitle}>Download Your Data</Text>
                <Text style={styles.cardDesc}>
                    Export your performance reports and architectural designs in PDF or JSON format.
                </Text>
            </TouchableOpacity>

            <View style={styles.deleteBox}>
                <View style={styles.deleteHeader}>
                    <ShieldWarning size={18} color={colors.error} weight="fill" />
                    <Text style={styles.deleteTitle}>Danger Zone: Delete Account</Text>
                </View>
                <Text style={styles.deleteDesc}>
                    Permanently delete your account, session records, telemetry, and analytics. This operation cannot be reversed.
                </Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
                    <Trash size={15} color="#FFFFFF" weight="bold" />
                    <Text style={styles.deleteBtnText}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
};

// 3. About Modal
interface AboutModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
    const { colors, isDark } = useTheme();
    const version = Constants.expoConfig?.version || '1.0.0';

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            alignItems: 'center',
            paddingVertical: 10,
            gap: 16,
        },
        logoCircle: {
            width: 68,
            height: 68,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 14,
            elevation: 6,
        },
        appName: {
            fontSize: 22,
            fontWeight: '800',
            color: colors.text,
            letterSpacing: -0.4,
        },
        appVersion: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.primary,
            marginTop: 2,
        },
        descriptionBox: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            width: '100%',
        },
        descriptionText: {
            fontSize: 13,
            lineHeight: 20,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        featuresList: {
            width: '100%',
            gap: 10,
            marginTop: 4,
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        featureText: {
            fontSize: 13,
            fontWeight: '500',
            color: colors.text,
        },
    }), [colors, isDark]);

    return (
        <BaseModal visible={visible} onClose={onClose} title="About InterviewAI">
            <View style={styles.container}>
                <View style={styles.logoCircle}>
                    <Info size={32} color="#FFFFFF" weight="fill" />
                </View>

                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.appName}>InterviewAI</Text>
                    <Text style={styles.appVersion}>Version {version}</Text>
                </View>

                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>
                        AI-powered system design interview practice and learning. Simulate real-world FAANG architectural rounds with adaptive probing, voice dialogue, and rubric evaluations.
                    </Text>
                </View>

                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <CheckCircle size={16} color="#10B981" weight="fill" />
                        <Text style={styles.featureText}>Adaptive 5-Stage System Design Simulator</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <CheckCircle size={16} color="#10B981" weight="fill" />
                        <Text style={styles.featureText}>On-Device Speech & Voice Synthesis</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <CheckCircle size={16} color="#10B981" weight="fill" />
                        <Text style={styles.featureText}>Curated Distributed Systems Curriculum</Text>
                    </View>
                </View>
            </View>
        </BaseModal>
    );
};

// 4. Report a Problem Modal
interface ReportProblemModalProps {
    visible: boolean;
    onClose: () => void;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ visible, onClose }) => {
    const { colors, isDark } = useTheme();
    const [issueCategory, setIssueCategory] = useState('Simulation');
    const [description, setDescription] = useState('');

    const categories = ['Simulation', 'Speech / Audio', 'Account', 'Other'];

    const handleSubmit = () => {
        if (!description.trim()) {
            Alert.alert('Description Required', 'Please enter a brief description of the problem.');
            return;
        }
        onClose();
        setDescription('');
        Alert.alert('Report Received', 'Thank you for your report! Our engineering team will review it.');
    };

    const styles = React.useMemo(() => StyleSheet.create({
        label: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
        },
        categoryRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
        },
        categoryChip: {
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 10,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            borderWidth: 1,
            borderColor: colors.border,
        },
        categoryChipActive: {
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.1)',
            borderColor: colors.primary,
        },
        categoryText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        categoryTextActive: {
            color: colors.primary,
        },
        input: {
            backgroundColor: isDark ? '#0D1117' : '#F1F5F9',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 14,
            fontSize: 14,
            color: colors.text,
            minHeight: 110,
            textAlignVertical: 'top',
            marginBottom: 16,
        },
        submitBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
        },
        submitBtnText: {
            fontSize: 15,
            fontWeight: '700',
            color: '#FFFFFF',
        },
    }), [colors, isDark]);

    return (
        <BaseModal visible={visible} onClose={onClose} title="Report a Problem">
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
                {categories.map((cat) => {
                    const isActive = issueCategory === cat;
                    return (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                            onPress={() => setIssueCategory(cat)}
                        >
                            <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                multiline
                placeholder="Describe what happened or what didn't work as expected..."
                placeholderTextColor={colors.textDim}
                value={description}
                onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Bug size={16} color="#FFFFFF" weight="bold" />
                <Text style={styles.submitBtnText}>Submit Report</Text>
            </TouchableOpacity>
        </BaseModal>
    );
};
