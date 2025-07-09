import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

const ACTIVE_TAB_COLOR = '#A1CEDC';

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
      {/* Home Tab (Upload) */}
      <TouchableOpacity
        style={[styles.tabItem, (pathname === '/' || pathname === '/index' || pathname === '/upload') && [styles.active, { backgroundColor: ACTIVE_TAB_COLOR }]]}
        onPress={() => router.push('/upload')}
        activeOpacity={0.7}
      >
        <MaterialIcons name="home-filled" size={28} color={(pathname === '/' || pathname === '/index' || pathname === '/upload') ? '#1D3D47' : theme.colors.text + '99'} />
      </TouchableOpacity>
      {/* My Questions Tab */}
      <TouchableOpacity
        style={[styles.tabItem, pathname === '/questions' && [styles.active, { backgroundColor: ACTIVE_TAB_COLOR }]]}
        onPress={() => router.push('/questions')}
        activeOpacity={0.7}
      >
        <Ionicons name="document-text-outline" size={28} color={pathname === '/questions' ? '#1D3D47' : theme.colors.text + '99'} />
      </TouchableOpacity>
      {/* Profile Tab */}
      <TouchableOpacity
        style={[styles.tabItem, pathname === '/settings' && [styles.active, { backgroundColor: ACTIVE_TAB_COLOR }]]}
        onPress={() => router.push('/settings')}
        activeOpacity={0.7}
      >
        <Ionicons name="person-circle" size={28} color={pathname === '/settings' ? '#1D3D47' : theme.colors.text + '99'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 10,
    margin: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 5,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
  },
  active: {
    backgroundColor: '#A1CEDC',
  },
}); 