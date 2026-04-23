import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
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
 * LiveChart: A custom SVG-based line chart with smooth Bézier curves.
 * Demonstrates manual coordinate mapping and gradient rendering.
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
  // Simple technique: cubic curve segments
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
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.4" />
            <Stop offset="1" stopColor={color} stopOpacity="0.01" />
          </LinearGradient>
        </Defs>

        {/* Background Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <Line
            key={`grid-${p}`}
            x1="0"
            y1={padding + p * usableHeight}
            x2={chartWidth}
            y2={padding + p * usableHeight}
            stroke={Colors[theme].border}
            strokeWidth="0.5"
            strokeDasharray="4,4"
          />
        ))}

        <Path
          d={fillPath}
          fill="url(#gradient)"
        />
        <Path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulse Dot at current value */}
        {points.length > 0 && (
          <Circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill={color}
          />
        )}
      </Svg>
    </View>
  );
};

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


