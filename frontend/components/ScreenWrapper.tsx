import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

import { ScreenWrapperProps } from '../types';

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    withPadding = true
}) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <View style={[
                styles.container,
                withPadding && styles.padding,
                style
            ]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    padding: {
        paddingHorizontal: Layout.spacing.lg,
        paddingTop: Layout.spacing.md,
    },
});
