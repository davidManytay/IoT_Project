import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  Animated, KeyboardAvoidingView, Platform, StatusBar, 
  Dimensions, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [operatorId, setOperatorId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const scanAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1. Check for biometric support
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (hasHardware && supportedTypes.length > 0) {
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('FACE');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('FINGERPRINT');
        }
      }
    })();

    // 2. Continuous Scanning Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    // 3. Icon Glow Pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogin = () => {
    if (!operatorId || !accessKey) {
      // Shake animation for error
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      return;
    }

    setIsAuthenticating(true);
    
    // Simulate high-security check
    setTimeout(() => {
      setIsAuthenticating(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  const handleBiometricLogin = async () => {
    if (biometricType === 'FACE') {
      const { status } = await requestPermission();
      if (status === 'granted') {
        setShowCamera(true);
        // Simulate scanning for 3 seconds
        setTimeout(() => {
          setShowCamera(false);
          setIsAuthenticating(true);
          setTimeout(() => {
            setIsAuthenticating(false);
            router.replace('/(tabs)');
          }, 1000);
        }, 3000);
      }
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access IoT Sentinel',
      fallbackLabel: 'Enter Access Key',
    });

    if (result.success) {
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        router.replace('/(tabs)');
      }, 1000);
    }
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#050505', '#000']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.header}>
          <FontAwesome name="lock" size={30} color="#ff4d4d" />
          <Text style={styles.title}>SYSTEM LOGIN</Text>
          <Text style={styles.subtitle}>Enter your credentials to access the dashboard</Text>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.scanBox}>
            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
            <Animated.View style={{ opacity: glowAnim }}>
              <FontAwesome 
                name="user-secret" 
                size={70} 
                color="#ff4d4d" 
                style={{
                  textShadowColor: 'rgba(255, 77, 77, 0.5)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 20,
                }} 
              />
            </Animated.View>
          </View>
          <Text style={styles.statusText}>SYSTEM STATUS: <Text style={{ color: '#ff4d4d' }}>LOCKED</Text></Text>
        </View>

        <View style={styles.form}>
          <View style={[
            styles.inputContainer, 
            focusedField === 'user' && styles.inputFocused
          ]}>
            <FontAwesome 
              name="user" 
              size={16} 
              color={focusedField === 'user' ? '#ff4d4d' : '#444'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="USERNAME"
              placeholderTextColor="#444"
              value={operatorId}
              onChangeText={setOperatorId}
              onFocus={() => setFocusedField('user')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={[
            styles.inputContainer, 
            focusedField === 'pass' && styles.inputFocused
          ]}>
            <FontAwesome 
              name="key" 
              size={16} 
              color={focusedField === 'pass' ? '#ff4d4d' : '#444'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="PASSWORD"
              placeholderTextColor="#444"
              value={accessKey}
              onChangeText={setAccessKey}
              onFocus={() => setFocusedField('pass')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, isAuthenticating && styles.loginBtnDisabled]} 
            onPress={handleLogin}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>LOGIN</Text>
                <FontAwesome name="chevron-right" size={12} color="#fff" style={{ marginLeft: 10 }} />
              </>
            )}
          </TouchableOpacity>

          {biometricType && (
            <TouchableOpacity 
              style={styles.biometricBtn} 
              onPress={handleBiometricLogin}
              disabled={isAuthenticating}
            >
              <FontAwesome 
                name={biometricType === 'FACE' ? 'camera' : 'dot-circle-o'} 
                size={20} 
                color="#ff4d4d" 
              />
              <Text style={styles.biometricText}>
                START {biometricType} SCAN
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ENCRYPTION: AES-256 ACTIVE</Text>
          <View style={styles.secureBadge}>
            <FontAwesome name="circle" size={8} color="#51cf66" />
            <Text style={styles.secureText}>PROTOCOL SECURE</Text>
          </View>
        </View>
      </Animated.View>

      {showCamera && (
        <View style={styles.cameraOverlay}>
          <CameraView style={styles.camera} facing="front" />
          <View style={[StyleSheet.absoluteFill, styles.cameraFrameContainer]}>
            <View style={styles.cameraFrame}>
              <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
            </View>
            <Text style={styles.scanningText}>ANALYZING BIOMETRIC DATA...</Text>
            <ActivityIndicator color="#ff4d4d" style={{ marginTop: 20 }} />
          </View>
          <TouchableOpacity style={styles.closeCamera} onPress={() => setShowCamera(false)}>
            <FontAwesome name="times" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 15,
  },
  subtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scanArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scanBox: {
    width: 200,
    height: 200,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hackerIcon: {
    textShadowColor: 'rgba(255, 77, 77, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 2,
    backgroundColor: '#ff4d4d',
    shadowColor: '#ff4d4d',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 10,
  },
  statusText: {
    color: '#444',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 15,
    letterSpacing: 2,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    paddingHorizontal: 15,
  },
  inputFocused: {
    borderColor: '#ff4d4d',
    backgroundColor: '#0f0505',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 55,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  loginBtn: {
    height: 55,
    backgroundColor: '#ff4d4d',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#ff4d4d',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
  },
  biometricText: {
    color: '#ff4d4d',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  footerText: {
    color: '#333',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a1a0d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  secureText: {
    color: '#51cf66',
    fontSize: 8,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 100,
  },
  camera: {
    flex: 1,
  },
  cameraFrameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFrame: {
    width: 280,
    height: 380,
    borderWidth: 3,
    borderColor: '#ff4d4d',
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#ff4d4d',
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  scanningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 30,
    letterSpacing: 2,
  },
  closeCamera: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
  }
});
