import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bgPulseAnim = useRef(new Animated.Value(0.05)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  
  // Staggered Entrance Values
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    // Staggered Text Entrance
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.timing(subtitleFade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.delay(400),
      Animated.timing(buttonFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Continuous Floating Icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -20, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    // Grid Scanning Animation
    Animated.loop(
      Animated.timing(gridAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Background Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgPulseAnim, { toValue: 0.2, duration: 4000, useNativeDriver: true }),
        Animated.timing(bgPulseAnim, { toValue: 0.05, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleStart = () => {
    router.push('/login');
  };

  const translateY = gridAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#050505', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Cinematic Grid Background */}
      <View style={styles.gridContainer}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.gridLine} />
        ))}
        <Animated.View style={[styles.gridScanner, { transform: [{ translateY }] }]} />
      </View>

      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Animated.View style={[styles.iconContainer, { transform: [{ translateY: floatAnim }] }]}>
          <View style={styles.shieldWrapper}>
            <FontAwesome name="shield" size={90} color="#ff4d4d" />
          </View>
          <Animated.View style={[styles.pulseRing, { opacity: bgPulseAnim, transform: [{ scale: 1.2 }] }]} />
          <Animated.View style={[styles.pulseRing, { opacity: bgPulseAnim * 0.5, transform: [{ scale: 1.5 }] }]} />
        </Animated.View>

        <View style={styles.textContainer}>
          <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleSlide }] }}>
            <Text style={styles.brandTag}>SECURE INFRASTRUCTURE</Text>
            <Text style={styles.title}>SENTINEL</Text>
            <View style={styles.titleBar} />
          </Animated.View>
          
          <Animated.View style={{ opacity: subtitleFade }}>
            <Text style={styles.subtitle}>Predictive IoT Intelligence & Advanced Sensor Analytics</Text>
          </Animated.View>
        </View>
        
        <Animated.View style={[styles.buttonWrapper, { opacity: buttonFade }]}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff4d4d', '#800000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>ESTABLISH SESSION</Text>
              <FontAwesome name="lock" size={14} color="#fff" style={{ marginLeft: 12 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footerContainer}>
          <Text style={styles.footer}>AUTHORIZED PERSONNEL ONLY</Text>
          <Text style={styles.projectTag}>ITMSD 3 | CAPSTONE DEFENSE EDITION</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLine: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 77, 77, 0.2)',
    marginVertical: height / 20,
  },
  gridScanner: {
    position: 'absolute',
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 77, 0.5)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
    zIndex: 10,
  },
  iconContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  shieldWrapper: {
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#ff4d4d',
        shadowOpacity: 1,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      }
    }),
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255, 77, 77, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  brandTag: {
    color: '#ff4d4d',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 8,
    textAlign: 'center',
  },
  titleBar: {
    alignSelf: 'center',
    width: 60,
    height: 4,
    backgroundColor: '#ff4d4d',
    marginTop: 20,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 10,
  },
  buttonWrapper: {
    width: '100%',
  },
  button: {
    width: '100%',
    height: 68,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.5)',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  footerContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footer: {
    color: 'rgba(255, 77, 77, 0.6)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 6,
  },
  projectTag: {
    color: '#333',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});

