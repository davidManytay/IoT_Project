import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CircularBuffer } from '../logic/CircularBuffer';
import { SensorReading, generateGaussianSensorData } from '../logic/sensorUtils';
import { AlertRule, TriggeredAlert, evaluateRule } from '../logic/RuleEngine';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface SimulationConfig {
  tempMean: number;
  tempStdDev: number;
  humidityMean: number;
  humidityStdDev: number;
}

interface DashboardState {
  // Live Buffers (Not persisted)
  tempBuffer: CircularBuffer<number>;
  humidityBuffer: CircularBuffer<number>;
  
  // Persisted Logic
  rules: AlertRule[];
  alerts: TriggeredAlert[];
  config: SimulationConfig;
  isPaused: boolean;
  userTheme: 'light' | 'dark' | 'system';
  profileImage: string | null;
  userName: string;

  // Actions
  addReading: (type: 'temperature' | 'humidity') => void;
  addRule: (rule: Omit<AlertRule, 'id'>) => void;
  removeRule: (id: string) => void;
  updateConfig: (config: Partial<SimulationConfig>) => void;
  clearAlerts: () => void;
  togglePause: () => void;
  resetSimulation: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setProfileImage: (uri: string | null) => void;
  setUserName: (name: string) => void;
}


// Fixed size for the buffers as per CS concept requirements
const BUFFER_SIZE = 50;

const DEFAULT_RULES: AlertRule[] = [
  { id: '1', type: 'simple', sensorType: 'temperature', operator: '>', value: 30, label: 'Critical Overheat' },
  { id: '2', type: 'simple', sensorType: 'humidity', operator: '<', value: 20, label: 'Low Humidity Warning' },
  { id: '3', type: 'rateOfChange', sensorType: 'temperature', windowSize: 10, threshold: 5, label: 'Sudden Temp Spike' },
];

export const useStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initialize buffers
      tempBuffer: new CircularBuffer<number>(BUFFER_SIZE),
      humidityBuffer: new CircularBuffer<number>(BUFFER_SIZE),
      
      rules: DEFAULT_RULES,
      alerts: [],
      config: {
        tempMean: 25,
        tempStdDev: 2,
        humidityMean: 50,
        humidityStdDev: 5,
      },
      isPaused: false,
      userTheme: 'system',
      profileImage: null,
      userName: 'John Doe',


      addReading: (type) => {
        const { config, rules, alerts, tempBuffer, humidityBuffer, isPaused } = get();
        if (isPaused) return;

        const value = type === 'temperature' 
          ? generateGaussianSensorData(config.tempMean, config.tempStdDev)
          : generateGaussianSensorData(config.humidityMean, config.humidityStdDev);

        const reading: SensorReading = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          value,
          timestamp: Date.now(),
        };

        // Update local buffer (O(1) push)
        if (type === 'temperature') tempBuffer.push(value);
        else humidityBuffer.push(value);

        // Check Rules
        rules.forEach(rule => {
          const historyGetter = (index: number) => {
            if (rule.sensorType === 'temperature') return tempBuffer.at(index);
            if (rule.sensorType === 'humidity') return humidityBuffer.at(index);
            return null;
          };

          if (evaluateRule(reading, rule, historyGetter)) {
            const newAlert: TriggeredAlert = {
              id: Math.random().toString(36).substr(2, 9),
              ruleId: rule.id,
              label: rule.label,
              value: reading.value,
              timestamp: reading.timestamp,
            };
            
            const lastAlert = alerts[0];
            const isDuplicate = lastAlert && lastAlert.ruleId === rule.id && (reading.timestamp - lastAlert.timestamp < 2000);
            
            if (!isDuplicate) {
              set({ alerts: [newAlert, ...alerts].slice(0, 50) }); 
              
              // Trigger High-End Sensory Feedback
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
            }
          }
        });

        set({ tempBuffer, humidityBuffer }); 
      },

      addRule: (rule) => set(state => ({
        rules: [...state.rules, { ...rule, type: rule.type || 'simple', id: Math.random().toString(36).substr(2, 9) }]
      })),

      removeRule: (id) => set(state => ({
        rules: state.rules.filter(r => r.id !== id)
      })),

      updateConfig: (newConfig) => set(state => ({
        config: { ...state.config, ...newConfig }
      })),

      clearAlerts: () => set({ alerts: [] }),

      togglePause: () => set(state => ({ isPaused: !state.isPaused })),

      setTheme: (theme) => set({ userTheme: theme }),
      setProfileImage: (uri) => set({ profileImage: uri }),
      setUserName: (name) => set({ userName: name }),

      resetSimulation: () => {
        const newTemp = new CircularBuffer<number>(BUFFER_SIZE);
        const newHum = new CircularBuffer<number>(BUFFER_SIZE);
        set({ 
          tempBuffer: newTemp, 
          humidityBuffer: newHum, 
          alerts: [] 
        });
      }
    }),
    {
      name: 'iot-dashboard-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        rules: state.rules, 
        alerts: state.alerts, 
        config: state.config,
        isPaused: state.isPaused,
        userTheme: state.userTheme,
        profileImage: state.profileImage,
        userName: state.userName
      }),
    }
  )
);
