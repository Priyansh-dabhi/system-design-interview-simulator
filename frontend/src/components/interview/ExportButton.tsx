import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ShareNetworkIcon } from 'phosphor-react-native';
import { useTheme } from '../../theme/useTheme';

interface ExportButtonProps {
    onPress: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function ExportButton({ onPress, isLoading, disabled = false }: ExportButtonProps) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity 
            onPress={onPress} 
            disabled={isLoading || disabled}
            style={styles.container}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={colors.primaryBrand} />
            ) : (
                <ShareNetworkIcon 
                    size={24} 
                    color={disabled ? colors.textSecondary : colors.text} 
                    weight="regular" 
                />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
