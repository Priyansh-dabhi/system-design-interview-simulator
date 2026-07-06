import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { useTheme } from "../../src/theme/useTheme";

export default function PracticeScreen() {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        text: {
            fontSize: 24,
            fontWeight: "bold",
            color: colors.text,
        },
        subtext: {
            marginTop: 8,
            fontSize: 16,
            color: colors.textSecondary,
        },
    }), [colors]);

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Text style={styles.text}>Practice Screen</Text>
                <Text style={styles.subtext}>Coming Soon</Text>
            </View>
        </ScreenWrapper>
    );
}

