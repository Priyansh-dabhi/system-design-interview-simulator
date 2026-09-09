import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, Line, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

interface AuthBackgroundProps {
    children?: React.ReactNode;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
    const { width, height } = useWindowDimensions();

    // Center coordinates for the glow (aligned with the logo in upper third)
    const centerX = width / 2;
    const centerY = height * 0.24;
    const glowRadius = width * 0.78;
    const coreRadius = width * 0.34;

    const baseColor = '#050810';
    const gridStroke = 'rgba(59, 130, 246, 0.16)';

    return (
        <View style={[styles.container, { backgroundColor: baseColor }]}>
            {/* SVG Background Layer */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
                    <Defs>
                        {/* 40px Grid Pattern */}
                        <Pattern
                            id="authGrid"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <Line
                                x1="0"
                                y1="0"
                                x2="40"
                                y2="0"
                                stroke={gridStroke}
                                strokeWidth="0.8"
                            />
                            <Line
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="40"
                                stroke={gridStroke}
                                strokeWidth="0.8"
                            />
                        </Pattern>

                        {/* Wide Atmospheric Cloud Radial Glow */}
                        <RadialGradient
                            id="cloudGlow"
                            cx={centerX}
                            cy={centerY}
                            r={glowRadius}
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
                            <Stop offset="25%" stopColor="#1D4ED8" stopOpacity={0.18} />
                            <Stop offset="50%" stopColor="#1E3A8A" stopOpacity={0.10} />
                            <Stop offset="75%" stopColor="#172554" stopOpacity={0.04} />
                            <Stop offset="100%" stopColor={baseColor} stopOpacity="0" />
                        </RadialGradient>

                        {/* Concentrated Core Glow right behind the logo badge */}
                        <RadialGradient
                            id="coreGlow"
                            cx={centerX}
                            cy={centerY}
                            r={coreRadius}
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="#3B82F6" stopOpacity={0.38} />
                            <Stop offset="45%" stopColor="#2563EB" stopOpacity={0.16} />
                            <Stop offset="80%" stopColor="#1D4ED8" stopOpacity={0.03} />
                            <Stop offset="100%" stopColor={baseColor} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>

                    {/* Base Background */}
                    <Rect width="100%" height="100%" fill={baseColor} />

                    {/* Grid Pattern Layer */}
                    <Rect width="100%" height="100%" fill="url(#authGrid)" opacity={0.45} />

                    {/* Wide Atmospheric Cloud */}
                    <Rect width="100%" height="100%" fill="url(#cloudGlow)" />

                    {/* Inner Core Glow under logo */}
                    <Rect width="100%" height="100%" fill="url(#coreGlow)" />
                </Svg>
            </View>

            {/* Content Layer */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});
