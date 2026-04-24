import React, { useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { LiveChart } from '@/components/LiveChart';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function DashboardScreen() {
  const systemColorScheme = useColorScheme();
  const { 
    tempBuffer, 
    humidityBuffer, 
    alerts, 
    isPaused,
    userTheme,
    addReading,
    clearAlerts,
    togglePause,
    resetSimulation
  } = useStore();

  const theme = userTheme === 'system' ? (systemColorScheme ?? 'dark') : userTheme;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Pulse Animation for the "LIVE" indicator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Simulation Loop
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      addReading('temperature');
      addReading('humidity');
    }, 1000); 
    return () => clearInterval(interval);
  }, [addReading, isPaused]);

  const latestTemp = tempBuffer.last() ?? 0;
  const latestHumidity = humidityBuffer.last() ?? 0;

  // Logic for the creative "Warning Glow" when near thresholds
  const rules = useStore.getState().rules;
  const isTempNear = rules.some(r => r.sensorType === 'temperature' && r.operator === '>' && latestTemp > r.value * 0.9);
  const isHumNear = rules.some(r => r.sensorType === 'humidity' && r.operator === '<' && latestHumidity < r.value * 1.1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Stack.Screen options={{ title: 'Dashboard', headerTitleStyle: { fontFamily: 'SpaceMono' } }} />

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: Colors[theme].card, borderColor: alerts.length > 0 ? '#ff6b6b' : Colors[theme].border }]}>
          <Text style={[styles.summaryLabel, { color: Colors[theme].subtext }]}>System Health</Text>
          <Text style={[styles.summaryValue, { color: alerts.length > 0 ? '#ff6b6b' : '#51cf66' }]}>
            {alerts.length > 0 ? 'Action Required' : 'Optimal'}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
          <Text style={[styles.summaryLabel, { color: Colors[theme].subtext }]}>Active Rules</Text>
          <Text style={[styles.summaryValue, { color: Colors[theme].text }]}>{rules.length}</Text>
        </View>
      </View>

      {/* Status Bar */}
      <View style={[styles.statusRow, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
        <View style={styles.liveIndicator}>
          <Animated.View style={[styles.pulseCircle, { opacity: pulseAnim }]} />
          <Text style={[styles.statusText, { color: Colors[theme].subtext }]}>{isPaused ? 'SIMULATION PAUSED' : 'LIVE SIMULATION'}</Text>
        </View>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: Colors[theme].placeholder }]} onPress={togglePause}>
          <FontAwesome name={isPaused ? 'play' : 'pause'} size={14} color={Colors[theme].text} />
          <Text style={[styles.controlBtnText, { color: Colors[theme].text }]}>{isPaused ? 'RESUME' : 'PAUSE'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Real-time Cards */}
      <View style={styles.row}>
        <View style={[
          styles.card, 
          { backgroundColor: Colors[theme].card, borderColor: isTempNear ? '#ff6b6b' : Colors[theme].border },
          isTempNear && styles.warningGlow
        ]}>
          <View style={styles.cardHeader}>
            <View style={styles.labelGroup}>
              <FontAwesome name="thermometer-half" size={12} color="#ff6b6b" style={{ marginRight: 6 }} />
              <Text style={[styles.label, { color: Colors[theme].subtext }]}>Temperature</Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: isTempNear ? '#ff6b6b30' : '#ff6b6b10' }]}>
              {isTempNear ? (
                <FontAwesome name="warning" size={10} color="#ff6b6b" />
              ) : (
                <FontAwesome name="line-chart" size={10} color="#ff6b6b" />
              )}
            </View>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: isTempNear ? '#ff6b6b' : Colors[theme].text }]}>
              {latestTemp.toFixed(1)}
            </Text>
            <Text style={[styles.unit, { color: Colors[theme].subtext }]}>°C</Text>
          </View>
          <LiveChart 
            data={tempBuffer.toArray()} 
            color="#ff6b6b" 
            min={15} 
            max={35} 
          />
        </View>

        <View style={[
          styles.card, 
          { backgroundColor: Colors[theme].card, borderColor: isHumNear ? '#ff6b6b' : Colors[theme].border },
          isHumNear && styles.warningGlow
        ]}>
          <View style={styles.cardHeader}>
            <View style={styles.labelGroup}>
              <FontAwesome name="tint" size={12} color="#4dabf7" style={{ marginRight: 6 }} />
              <Text style={[styles.label, { color: Colors[theme].subtext }]}>Humidity</Text>
            </View>
            <View style={[styles.trendBadge, { backgroundColor: isHumNear ? '#ff6b6b30' : '#4dabf710' }]}>
              {isHumNear ? (
                <FontAwesome name="warning" size={10} color="#ff6b6b" />
              ) : (
                <FontAwesome name="line-chart" size={10} color="#4dabf7" />
              )}
            </View>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: isHumNear ? '#ff6b6b' : Colors[theme].text }]}>
              {latestHumidity.toFixed(1)}
            </Text>
            <Text style={[styles.unit, { color: Colors[theme].subtext }]}>%</Text>
          </View>
          <LiveChart 
            data={humidityBuffer.toArray()} 
            color="#4dabf7" 
            min={0} 
            max={100} 
          />
        </View>
      </View>

      {/* Alerts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>Triggered Alerts</Text>
          {alerts.length > 0 && (
            <TouchableOpacity onPress={clearAlerts}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {alerts.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
            <FontAwesome name="check-circle" size={40} color="#51cf66" style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: Colors[theme].text }]}>System Healthy</Text>
            <Text style={[styles.emptySubText, { color: Colors[theme].subtext }]}>No alerts triggered in this session</Text>
          </View>
        ) : (
          alerts.map(alert => (
            <View key={alert.id} style={[styles.alertItem, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
              <View style={[styles.alertIcon, { backgroundColor: alert.ruleId === '3' ? '#ff6b6b20' : '#fcc41920' }]}>
                <FontAwesome name="warning" size={14} color={alert.ruleId === '3' ? '#ff6b6b' : '#fcc419'} />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertLabel, { color: Colors[theme].text }]}>{alert.label}</Text>
                <Text style={[styles.alertMeta, { color: Colors[theme].subtext }]}>
                  Value: {alert.value.toFixed(1)} | {new Date(alert.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  summaryCard: {
    flex: 0.48,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  controlBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 0.48,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  warningGlow: {
    shadowColor: '#ff6b6b',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    marginLeft: 2,
    fontWeight: '600',
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  alertMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 12,
    marginTop: 4,
  }
});

