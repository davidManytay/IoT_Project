import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';

export default function ModalScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <FontAwesome name="shield" size={60} color="#ff4d4d" style={styles.icon} />
      <Text style={styles.title}>IoT Sentinel Architecture</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mathematical Engine</Text>
        <Text style={styles.description}>
          Utilizes the <Text style={styles.highlight}>Box-Muller Transform</Text> to generate pseudo-random numbers following a normal (Gaussian) distribution. This ensures realistic sensor simulation compared to standard uniform distribution.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Architecture</Text>
        <Text style={styles.description}>
          Implemented using a custom <Text style={styles.highlight}>Circular Buffer</Text> data structure. This guarantees O(1) time complexity for data ingestion, preventing UI lag during high-frequency sensor updates.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>State Management</Text>
        <Text style={styles.description}>
          Powered by <Text style={styles.highlight}>Zustand</Text> with custom persistence middleware. State is select-mapped to prevent unnecessary re-renders, ensuring a 60FPS fluid experience.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Developed for ITMSD 3 Final Capstone</Text>
        <Text style={styles.version}>v2.4.0-STABLE</Text>
      </View>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '100%',
  },
  section: {
    width: '100%',
    marginBottom: 25,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4d4d',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#888',
  },
  highlight: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  version: {
    fontSize: 10,
    color: '#333',
    marginTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  }
});
