import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/Colors";

export default function HistoryScreen() {
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Text style={styles.text}>History Screen</Text>
                <Text style={styles.subtext}>Interview History Coming Soon</Text>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.text,
    },
    subtext: {
        marginTop: 8,
        fontSize: 16,
        color: Colors.textSecondary,
    },
});
