import { Stack } from 'expo-router';

export default function InterviewLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="problem-selection" />
            <Stack.Screen name="session" />
            <Stack.Screen name="summary" />
        </Stack>
    );
}
