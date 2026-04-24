import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View, TouchableOpacity } from 'react-native';



import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useStore } from '@/src/store/useStore';
import Svg, { Rect, Path, Circle } from 'react-native-svg';


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function DashboardIcon({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ marginBottom: -3 }}
    >
      <Rect width="7" height="9" x="3" y="3" rx="1" />
      <Rect width="7" height="5" x="14" y="3" rx="1" />
      <Rect width="7" height="9" x="14" y="12" rx="1" />
      <Rect width="7" height="5" x="3" y="16" rx="1" />
    </Svg>
  );
}

function SettingsIcon({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ marginBottom: -3 }}
    >
      <Path d="M14 17H5" />
      <Path d="M19 7h-9" />
      <Circle cx="17" cy="17" r="3" />
      <Circle cx="7" cy="7" r="3" />
    </Svg>
  );
}

function ProfileIcon({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ marginBottom: -3 }}
    >
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

function SunIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2" />
      <Path d="M12 20v2" />
      <Path d="m4.93 4.93 1.41 1.41" />
      <Path d="m17.66 17.66 1.41 1.41" />
      <Path d="M2 12h2" />
      <Path d="M20 12h2" />
      <Path d="m6.34 17.66-1.41 1.41" />
      <Path d="m19.07 4.93-1.41 1.41" />
    </Svg>
  );
}




export default function TabLayout() {
  const systemColorScheme = useColorScheme();
  const { userTheme, resetSimulation, setTheme } = useStore();
  const theme = userTheme === 'system' ? (systemColorScheme ?? 'dark') : userTheme;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff4d4d',
        tabBarInactiveTintColor: '#555',
        headerStyle: {
          backgroundColor: Colors[theme].header,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: Colors[theme].headerText,
          fontWeight: 'bold',
          fontSize: 18,
          letterSpacing: 0.5,
        },
        headerTintColor: Colors[theme].tint,
        tabBarStyle: {
          backgroundColor: Colors[theme].tabBar,
          borderTopWidth: 1,
          borderTopColor: Colors[theme].border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'IoT Dashboard',
          tabBarIcon: ({ color }) => <DashboardIcon color={color} />,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
              <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 18 }}>
                {theme === 'dark' ? (
                  <FontAwesome name="moon-o" size={20} color="#ff4d4d" />
                ) : (
                  <SunIcon color="#888" size={22} />
                )}
              </TouchableOpacity>


              <Pressable onPress={resetSimulation} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginRight: 5 })}>
                <FontAwesome name="refresh" size={20} color="#ff6b6b" />
              </Pressable>
            </View>
          ),
        }}
      />



      <Tabs.Screen
        name="settings"
        options={{
          title: 'Simulation Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

