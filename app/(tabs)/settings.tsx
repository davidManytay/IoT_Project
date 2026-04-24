import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Image, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { FontAwesome } from '@expo/vector-icons';
import { AlertRule } from '@/src/logic/RuleEngine';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Line } from 'react-native-svg';

// Creative Component: Gaussian Bell Curve Visualization
const GaussianCurve = ({ mean, stdDev, color, label, theme }: { mean: number, stdDev: number, color: string, label: string, theme: 'light' | 'dark' }) => {
  const width = 200;
  const height = 60;
  const points = [];
  
  for (let x = 0; x <= width; x++) {
    const xVal = (x / width) * 40 + (mean - 20);
    const exponent = -Math.pow(xVal - mean, 2) / (2 * Math.pow(stdDev, 2));
    const yVal = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    const y = height - (yVal * height * stdDev * 2.5);
    points.push(`${x},${y}`);
  }

  return (
    <View style={styles.gaussianContainer}>
      <Text style={[styles.gaussianLabel, { color: theme === 'dark' ? '#888' : '#666' }]}>{label} Probability Distribution</Text>
      <Svg width={width} height={height}>
        <Path
          d={`M 0,${height} L ${points.join(' L ')} L ${width},${height}`}
          fill={`${color}20`}
          stroke={color}
          strokeWidth="2"
        />
        <Line x1={width/2} y1="0" x2={width/2} y2={height} stroke={color} strokeDasharray="4 2" opacity={0.5} />
      </Svg>
    </View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const { 
    config, 
    updateConfig, 
    rules, 
    userTheme, 
    setTheme, 
    addRule, 
    removeRule, 
    resetSimulation,
    profileImage,
    setProfileImage,
    userName,
    setUserName,
    voiceEnabled,
    setVoiceEnabled
  } = useStore();
  
  const theme = userTheme === 'system' ? (systemColorScheme ?? 'dark') : userTheme;
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    router.replace('/welcome');
  };

  const [newRule, setNewRule] = useState<Omit<AlertRule, 'id'>>({
    label: '',
    type: 'simple',
    sensorType: 'temperature',
    operator: '>',
    value: 30
  });

  const handleAddRule = () => {
    if (!newRule.label) return;
    addRule(newRule);
    setModalVisible(false);
    setNewRule({ label: '', type: 'simple', sensorType: 'temperature', operator: '>', value: 30 });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <Stack.Screen options={{ title: 'System Orchestration', headerTitleStyle: { fontFamily: 'SpaceMono' } }} />

        {/* Premium Profile & Identity Card */}
        <View style={[styles.identityCard, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[theme].background }]}>
                  <FontAwesome name="user-secret" size={32} color="#ff4d4d" />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <FontAwesome name="camera" size={8} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.identityText}>
              {isEditingName ? (
                <TextInput
                  style={[styles.identityNameInput, { color: Colors[theme].text, borderBottomColor: Colors[theme].tint }]}
                  value={tempName}
                  onChangeText={setTempName}
                  autoFocus
                  onBlur={() => {
                    if (tempName.trim()) setUserName(tempName.trim());
                    setIsEditingName(false);
                  }}
                  onSubmitEditing={() => {
                    if (tempName.trim()) setUserName(tempName.trim());
                    setIsEditingName(false);
                  }}
                />
              ) : (
                <TouchableOpacity onPress={() => {
                  setTempName(userName);
                  setIsEditingName(true);
                }}>
                  <Text style={[styles.identityName, { color: Colors[theme].text }]}>{userName}</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.identityRole}>CHIEF SENTINEL OPERATOR</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>ID: SN-772-ALPHA</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <FontAwesome name="power-off" size={16} color="#ff4d4d" />
              <Text style={styles.logoutText}>EXIT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Simulation Controls Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: Colors[theme].subtext }]}>Simulation Core</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.controlGrid}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#ff6b6b10', borderColor: '#ff6b6b40' }]} 
            onPress={resetSimulation}
          >
            <FontAwesome name="refresh" size={16} color="#ff6b6b" />
            <Text style={[styles.actionTitle, { color: '#ff6b6b' }]}>Hard Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#4dabf710', borderColor: '#4dabf740' }]} 
            onPress={() => {
              const oldMean = config.tempMean;
              updateConfig({ tempMean: oldMean + 15 });
              setTimeout(() => updateConfig({ tempMean: oldMean }), 4000);
            }}
          >
            <FontAwesome name="bolt" size={16} color="#4dabf7" />
            <Text style={[styles.actionTitle, { color: '#4dabf7' }]}>Stress Test</Text>
          </TouchableOpacity>
        </View>

        {/* Algorithm Settings */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: Colors[theme].subtext }]}>Gaussian Parameters</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={[styles.paramCard, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
          <View style={styles.paramHeader}>
            <FontAwesome name="thermometer-half" size={14} color="#ff6b6b" />
            <Text style={[styles.paramTitle, { color: Colors[theme].text }]}>Thermal Distribution</Text>
          </View>
          <View style={styles.paramGrid}>
            <View style={styles.paramInputGroup}>
              <Text style={styles.paramLabel}>MEAN</Text>
              <TextInput
                style={[styles.paramInput, { backgroundColor: Colors[theme].background, color: Colors[theme].text, borderColor: Colors[theme].border }]}
                value={config.tempMean.toString()}
                keyboardType="numeric"
                onChangeText={(val) => updateConfig({ tempMean: parseFloat(val) || 0 })}
              />
            </View>
            <View style={styles.paramInputGroup}>
              <Text style={styles.paramLabel}>STD DEV</Text>
              <TextInput
                style={[styles.paramInput, { backgroundColor: Colors[theme].background, color: Colors[theme].text, borderColor: Colors[theme].border }]}
                value={config.tempStdDev.toString()}
                keyboardType="numeric"
                onChangeText={(val) => updateConfig({ tempStdDev: parseFloat(val) || 0 })}
              />
            </View>
          </View>
          <GaussianCurve mean={config.tempMean} stdDev={config.tempStdDev} color="#ff6b6b" label="Thermal" theme={theme} />
        </View>

        <View style={[styles.paramCard, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border, marginTop: 12 }]}>
          <View style={styles.paramHeader}>
            <FontAwesome name="tint" size={14} color="#4dabf7" />
            <Text style={[styles.paramTitle, { color: Colors[theme].text }]}>Atmospheric Humidity</Text>
          </View>
          <View style={styles.paramGrid}>
            <View style={styles.paramInputGroup}>
              <Text style={styles.paramLabel}>MEAN</Text>
              <TextInput
                style={[styles.paramInput, { backgroundColor: Colors[theme].background, color: Colors[theme].text, borderColor: Colors[theme].border }]}
                value={config.humidityMean.toString()}
                keyboardType="numeric"
                onChangeText={(val) => updateConfig({ humidityMean: parseFloat(val) || 0 })}
              />
            </View>
            <View style={styles.paramInputGroup}>
              <Text style={styles.paramLabel}>STD DEV</Text>
              <TextInput
                style={[styles.paramInput, { backgroundColor: Colors[theme].background, color: Colors[theme].text, borderColor: Colors[theme].border }]}
                value={config.humidityStdDev.toString()}
                keyboardType="numeric"
                onChangeText={(val) => updateConfig({ humidityStdDev: parseFloat(val) || 0 })}
              />
            </View>
          </View>
          <GaussianCurve mean={config.humidityMean} stdDev={config.humidityStdDev} color="#4dabf7" label="Humidity" theme={theme} />
        </View>

        {/* Rule Engine */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: Colors[theme].subtext }]}>Logic Engine</Text>
          <TouchableOpacity style={styles.addRuleBtn} onPress={() => setModalVisible(true)}>
            <FontAwesome name="plus" size={10} color="#fff" />
            <Text style={styles.addRuleText}>ADD RULE</Text>
          </TouchableOpacity>
        </View>

        {rules.map((rule) => (
          <View key={rule.id} style={[styles.ruleItem, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
            <View style={styles.ruleInfo}>
              <Text style={[styles.ruleTitle, { color: Colors[theme].text }]}>{rule.label}</Text>
              <Text style={styles.ruleSub}>{rule.sensorType?.toUpperCase()} | {rule.operator} {rule.value}</Text>
            </View>
            <TouchableOpacity onPress={() => removeRule(rule.id)}>
              <FontAwesome name="trash" size={16} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        ))}

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: Colors[theme].modalBackground, borderColor: Colors[theme].border }]}>
              <Text style={[styles.modalHeader, { color: Colors[theme].text }]}>New Rule Configuration</Text>
              
              <Text style={styles.modalLabel}>RULE IDENTIFIER</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: Colors[theme].background, color: Colors[theme].text, borderColor: Colors[theme].border }]}
                value={newRule.label}
                onChangeText={(t) => setNewRule({...newRule, label: t})}
              />

              <Text style={styles.modalLabel}>SENSOR SOURCE</Text>
              <View style={styles.modalPicker}>
                <TouchableOpacity 
                  style={[styles.pickerItem, newRule.sensorType === 'temperature' && styles.pickerItemActive]}
                  onPress={() => setNewRule({...newRule, sensorType: 'temperature'})}
                >
                  <Text style={[styles.pickerText, newRule.sensorType === 'temperature' && { color: '#fff' }]}>THERMAL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerItem, newRule.sensorType === 'humidity' && styles.pickerItemActive]}
                  onPress={() => setNewRule({...newRule, sensorType: 'humidity'})}
                >
                  <Text style={[styles.pickerText, newRule.sensorType === 'humidity' && { color: '#fff' }]}>HUMIDITY</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>THRESHOLD VALUE</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: Colors[theme].background, color: Colors[theme].text, borderColor: Colors[theme].border }]}
                value={newRule.value?.toString()}
                keyboardType="numeric"
                placeholder="e.g. 30"
                placeholderTextColor="#666"
                onChangeText={(t) => setNewRule({...newRule, value: parseFloat(t) || 0})}
              />

              <Text style={styles.modalLabel}>LOGICAL OPERATOR</Text>
              <View style={styles.modalPicker}>
                {(['>', '<', '='] as const).map((op) => (
                  <TouchableOpacity 
                    key={op}
                    style={[styles.pickerItem, newRule.operator === op && styles.pickerItemActive]}
                    onPress={() => setNewRule({...newRule, operator: op})}
                  >
                    <Text style={[styles.pickerText, newRule.operator === op && { color: '#fff' }]}>{op}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelAction} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveAction} onPress={handleAddRule}>
                  <Text style={styles.saveText}>ACTIVATE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* System Settings */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: Colors[theme].subtext }]}>System Configuration</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={[styles.settingCard, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
          <View style={[styles.settingItem, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabelText, { color: Colors[theme].text }]}>Voice Alerts</Text>
              <Text style={styles.settingSubLabel}>Announce breaches via text-to-speech</Text>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
              trackColor={{ false: '#333', true: '#ff4d4d' }}
              thumbColor={voiceEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabelText, { color: Colors[theme].text }]}>Interface Theme</Text>
              <Text style={styles.settingSubLabel}>Toggle between light and dark modes</Text>
            </View>
            <View style={styles.themePicker}>
              {(['light', 'dark', 'system'] as const).map((t) => (
                <TouchableOpacity 
                  key={t}
                  onPress={() => setTheme(t)}
                  style={[
                    styles.themeBtn, 
                    userTheme === t && { backgroundColor: '#ff4d4d' }
                  ]}
                >
                  <Text style={[styles.themeBtnText, userTheme === t && { color: '#fff' }]}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  identityCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 30,
    shadowColor: '#ff4d4d',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#ff4d4d',
    padding: 2,
    marginRight: 18,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 33 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff4d4d',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  identityText: { flex: 1 },
  identityName: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  identityNameInput: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5, borderBottomWidth: 1, paddingVertical: 0 },
  identityRole: { fontSize: 9, fontWeight: '900', color: '#ff4d4d', letterSpacing: 1.5, marginTop: 2 },
  idBadge: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  idText: { fontSize: 9, color: '#ff4d4d', fontWeight: 'bold', letterSpacing: 0.5 },
  logoutBtn: { alignItems: 'center', marginLeft: 10 },
  logoutText: { fontSize: 8, fontWeight: '900', color: '#ff4d4d', marginTop: 4 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', marginRight: 15 },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  
  controlGrid: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  actionBtn: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 8 },
  actionTitle: { fontSize: 12, fontWeight: 'bold' },
  
  paramCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
  paramHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  paramTitle: { fontSize: 14, fontWeight: 'bold' },
  paramGrid: { flexDirection: 'row', gap: 12 },
  paramInputGroup: { flex: 1 },
  paramLabel: { fontSize: 9, fontWeight: '900', color: '#666', marginBottom: 6 },
  paramInput: { borderRadius: 12, padding: 12, fontSize: 16, borderWidth: 1 },
  
  gaussianContainer: { alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  gaussianLabel: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  
  addRuleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff4d4d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 6 },
  addRuleText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  ruleItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  ruleInfo: { flex: 1 },
  ruleTitle: { fontSize: 14, fontWeight: 'bold' },
  ruleSub: { fontSize: 10, color: '#888', marginTop: 2 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24, borderWidth: 1 },
  modalHeader: { fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 24 },
  modalLabel: { fontSize: 9, fontWeight: '900', color: '#666', marginBottom: 8 },
  modalInput: { borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20, borderWidth: 1 },
  modalPicker: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  pickerItem: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  pickerItemActive: { backgroundColor: '#ff4d4d', borderColor: '#ff4d4d' },
  pickerText: { fontSize: 11, fontWeight: '900', color: '#666' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  cancelAction: { padding: 14 },
  cancelText: { color: '#666', fontWeight: 'bold' },
  saveAction: { backgroundColor: '#ff4d4d', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
  saveText: { color: '#fff', fontWeight: 'bold' },
  
  settingCard: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 20, marginBottom: 20 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1 },
  settingTextGroup: { flex: 1 },
  settingLabelText: { fontSize: 14, fontWeight: 'bold' },
  settingSubLabel: { fontSize: 10, color: '#666', marginTop: 2 },
  themePicker: { flexDirection: 'row', gap: 6 },
  themeBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  themeBtnText: { fontSize: 8, fontWeight: '900', color: '#666' }
});
