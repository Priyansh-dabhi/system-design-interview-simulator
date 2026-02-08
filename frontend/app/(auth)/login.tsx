import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, isLoading } = useAuth();

    const handleLogin = async () => {
        if (email && password) {
            await signIn(email);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your interview prep</Text>
                </View>

                <View style={styles.form}>
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
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        isLoading={isLoading}
                        style={styles.loginButton}
                    />

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.line} />
                    </View>

                    <Button
                        title="Continue with Google"
                        variant="secondary"
                        onPress={() => console.log('Google Auth Placeholder')}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <Link href="/(auth)/register" asChild>
                        <Button
                            title="Sign Up"
                            variant="ghost"
                            style={styles.linkButton}
                            textStyle={styles.linkText}
                            onPress={() => router.push("/(auth)/register")}
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
    loginButton: {
        marginTop: Layout.spacing.sm,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Layout.spacing.lg,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    orText: {
        color: Colors.textDim,
        marginHorizontal: Layout.spacing.md,
        fontSize: 12,
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
