import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp, isLoading } = useAuth();

    const handleRegister = async () => {
        // if (name && email && password) {
        //     await signUp(name, email);
        // }
        router.push("/(main)/home")
    };

    return (
        <ScreenWrapper>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Start mastering system design today</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                    <Input
                        label="Email"
                        placeholder="name@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Input
                        label="Password"
                        placeholder="Create a password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Create Account"
                        onPress={handleRegister}
                        isLoading={isLoading}
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                        <Button
                            title="Sign In"
                            variant="ghost"
                            style={styles.linkButton}
                            textStyle={styles.linkText}
                            onPress={() => router.push("/(auth)/login")}
                        />
                    </Link>
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: Layout.spacing.xxl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    form: {
        marginBottom: Layout.spacing.xl,
    },
    button: {
        marginTop: Layout.spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        color: Colors.textSecondary,
    },
    linkButton: {
        width: 'auto',
        minHeight: 0,
        paddingVertical: 0,
        paddingHorizontal: 4,
    },
    linkText: {
        color: Colors.primary,
    }
});
