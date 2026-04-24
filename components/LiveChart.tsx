import React, { useEffect, useRef } from 'react';
import { View, Dimensions, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';

import { useColorScheme } from '@/components/useColorScheme';
import { useStore } from '@/src/store/useStore';
import Colors from '@/constants/Colors';

interface LiveChartProps {
  data: number[];
  color: string;
  min: number;
  max: number;
  height?: number;
}

/**
 * LiveChart: A premium custom SVG-based line chart.
 * Features: Cinematic neon glow, pulsing live indicator, and professional gradients.
 */
export const LiveChart: React.FC<LiveChartProps> = ({ 
  data, 
  color, 
  min, 
  max, 
  height = 120 
}) => {
  const systemColorScheme = useColorScheme();
  const { userTheme } = useStore();
  const theme = userTheme === 'system' ? (systemColorScheme ?? 'dark') : userTheme;
  const { width: screenWidth } = Dimensions.get('window');
  // Adjust width based on typical card padding
  const chartWidth = screenWidth - 72; 
  
  // Animation for the pulsing dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (data.length < 2) return <View style={[styles.placeholder, { height, backgroundColor: Colors[theme].placeholder }]} />;


  // Calculate dynamic bounds based on data + provided min/max
  const dataMin = Math.min(...data);
  const dataMax = Math.max(...data);
  
  // Use the broader of the two ranges (provided vs actual)
  const finalMin = Math.min(min, dataMin);
  const finalMax = Math.max(max, dataMax);
  const range = (finalMax - finalMin) || 1; // Prevent division by zero

  // Map points to SVG coordinate system with 10% vertical padding
  const padding = height * 0.1;
  const usableHeight = height - (padding * 2);

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const normalizedVal = (val - finalMin) / range;
    const y = (height - padding) - (normalizedVal * usableHeight);
    return { x, y };
  });


  // Generate smooth path using Bézier curve logic
  let d = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX = (curr.x + next.x) / 2;
    d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }

  const fillPath = `${d} L ${chartWidth} ${height} L 0 ${height} Z`;

  return (
    <View style={styles.container}>
      <Svg height={height} width={chartWidth}>
        <Defs>
          <LinearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="0.5" stopColor={color} stopOpacity="0.1" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Background Grid - Ultra Subtle */}
        {[0, 0.5, 1].map((p) => (
          <Line
            key={`grid-${p}`}
            x1="0"
            y1={padding + p * usableHeight}
            x2={chartWidth}
            y2={padding + p * usableHeight}
            stroke={Colors[theme].border}
            strokeWidth="0.5"
            opacity={0.3}
          />
        ))}

        {/* Faded Fill Area */}
        <Path
          d={fillPath}
          fill="url(#gradientFill)"
        />

        {/* The Glow Effect (Thick secondary line for light bleed) */}
        <Path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="6"
          opacity={0.15}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The Main Sharp Line */}
        <Path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Live Pulse Indicator at current value */}
        {points.length > 0 && (
          <>
            <AnimatedCircle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={Animated.multiply(pulseAnim, 6)}
              fill={color}
              opacity={0.3}
            />
            <Circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="3.5"
              fill={color}
              stroke="#fff"
              strokeWidth="1"
            />
          </>
        )}
      </Svg>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    padding: 0,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    borderRadius: 8,
    marginTop: 10,
  }
});


