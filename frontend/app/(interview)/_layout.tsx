import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function InterviewLayout() {
    return (
        <KeyboardProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="problem-selection" />
                <Stack.Screen name="session" />
                <Stack.Screen name="summary" />
            </Stack>
        </KeyboardProvider>
    );
}
