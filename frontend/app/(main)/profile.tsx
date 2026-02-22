import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { Colors } from "../../src/constants/Colors";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
    const { signOut } = useAuth();

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Text style={styles.text}>Profile Screen</Text>
                <Text style={styles.text}>Add Feature user can select their own LLM api </Text>
                <TouchableOpacity onPress={signOut} style={styles.button}>
                    <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
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
        marginBottom: 20,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.surfaceHighlight,
        borderRadius: 8,
    },
    buttonText: {
        color: Colors.error,
        fontWeight: '600',
    }

});
