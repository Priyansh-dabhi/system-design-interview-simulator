import { Stack } from 'expo-router';

export default function InterviewLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="topic-selection" />
            <Stack.Screen name="session" />
        </Stack>
    );
}
