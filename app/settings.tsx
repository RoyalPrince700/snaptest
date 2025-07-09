import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, Switch, ScrollView, TextInput, Modal, RefreshControl, Pressable, Image as RNImage } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabaseService } from '@/services/supabase';
import AvatarSelector from '@/components/AvatarSelector';
import { useThemePreference } from './_layout';
import { useTheme } from '@react-navigation/native';

const avatarSources = [
  require('../assets/avatars/avatar1.jpg'),
  require('../assets/avatars/avatar2.jpg'),
  require('../assets/avatars/avatar3.jpg'),
  require('../assets/avatars/avatar4.jpg'),
  require('../assets/avatars/avatar5.jpg'),
  require('../assets/avatars/avatar6.jpg'),
  require('../assets/avatars/avatar7.jpg'),
  require('../assets/avatars/avatar8.jpg'),
  require('../assets/avatars/avatar9.jpg'),
];

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const { theme, setTheme } = useThemePreference();
  const navTheme = useTheme();
  const isDark = navTheme.dark;

  useEffect(() => {
    fetchUserData();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setNotificationsEnabled(parsedSettings.notificationsEnabled ?? true);
        setAutoSaveEnabled(parsedSettings.autoSaveEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        notificationsEnabled,
        autoSaveEnabled,
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const u = await supabaseService.getCurrentUser();
      setUser(u);
      if (u) {
        const { data, error } = await supabaseService.supabase
          .from('user_profiles')
          .select('username, avatar_index')
          .eq('id', u.id)
          .single();
        if (error) {
          console.error('[Settings] Error fetching user profile:', error);
        }
        setProfile(data);
        setSelectedAvatar(typeof data?.avatar_index === 'number' ? data.avatar_index : null);
      }
    } catch (error) {
      console.error('[Settings] Error fetching user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  // Helper to update avatar in Supabase
  const updateAvatarInSupabase = async (idx: number) => {
    if (!user) return;
    try {
      await supabaseService.supabase
        .from('user_profiles')
        .update({ avatar_index: idx })
        .eq('id', user.id);
    } catch (error) {
      console.error('[Settings] Exception updating avatar in Supabase:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', style: 'destructive', onPress: async () => {
            setLoading(true);
            try {
              await supabaseService.signOut();
              await AsyncStorage.clear();
              router.replace('/login');
            } catch (err) {
              Alert.alert('Error', 'Failed to log out.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openAccountModal = () => {
    setEditUsername(profile?.username || '');
    setEditEmail(user?.email || '');
    setAccountModalVisible(true);
  };

  const handleSaveAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabaseService.supabase
        .from('user_profiles')
        .update({ username: editUsername })
        .eq('id', user.id);
      // Optionally update email in auth if changed
      if (editEmail && editEmail !== user.email) {
        await supabaseService.supabase.auth.updateUser({ email: editEmail });
      }
      setAccountModalVisible(false);
      fetchUserData();
      Alert.alert('Success', 'Account updated successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to update account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: navTheme.colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]} contentContainerStyle={{ paddingBottom: 80 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Avatar at the very top with new style (now scrollable) */}
        <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
          <Pressable onPress={() => setAvatarModalVisible(true)}>
            <View style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              backgroundColor: navTheme.colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: navTheme.colors.text,
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
              borderWidth: selectedAvatar !== null ? 3 : 0,
              borderColor: selectedAvatar !== null ? navTheme.colors.primary : 'transparent',
              overflow: 'hidden',
            }}>
              {/* Always show the profile icon as a fallback */}
              <IconSymbol name="person.circle.fill" size={96} color={navTheme.colors.text + '55'} style={{ position: 'absolute', left: 8, top: 8 }} />
              {/* If avatar is selected, overlay it on top */}
              {selectedAvatar !== null && (
                <RNImage
                  source={avatarSources[selectedAvatar]}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              )}
            </View>
          </Pressable>
          <ThemedText style={{ marginTop: 8, fontSize: 15, color: navTheme.colors.text }}>Tap to change avatar</ThemedText>
        </View>
        {/* Avatar selection modal */}
        <Modal
          visible={avatarModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAvatarModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' }}>
              <ThemedText style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Choose Your Avatar</ThemedText>
              <AvatarSelector
                selected={selectedAvatar}
                onSelect={async idx => {
                  setSelectedAvatar(idx);
                  setAvatarModalVisible(false);
                  await updateAvatarInSupabase(idx);
                }}
              />
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)} style={{ marginTop: 12 }}>
                <ThemedText style={{ color: '#1D3D47', fontWeight: 'bold' }}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Settings content below */}
        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: navTheme.colors.text }]}>Account</ThemedText>
          <TouchableOpacity style={styles.menuItem} onPress={openAccountModal}>
            <IconSymbol name="person.circle.fill" size={24} color="#1D3D47" />
            <ThemedText style={[styles.menuText, { color: navTheme.colors.text }]}>Account Settings</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        {/* Preferences Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: navTheme.colors.text }]}>Preferences</ThemedText>
          <View style={styles.menuItemRow}>
            <IconSymbol name="moon.fill" size={24} color="#1D3D47" />
            <ThemedText style={[styles.menuText, { color: navTheme.colors.text }]}>Theme</ThemedText>
            <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 8 }}>
              <TouchableOpacity
                style={[styles.themeBtn, theme === 'light' && styles.themeBtnActive]}
                onPress={() => setTheme('light')}
              >
                <ThemedText style={[styles.themeBtnText, theme === 'light' && styles.themeBtnTextActive]}>Light</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeBtn, theme === 'dark' && styles.themeBtnActive]}
                onPress={() => setTheme('dark')}
              >
                <ThemedText style={[styles.themeBtnText, theme === 'dark' && styles.themeBtnTextActive]}>Dark</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeBtn, theme === 'system' && styles.themeBtnActive]}
                onPress={() => setTheme('system')}
              >
                <ThemedText style={[styles.themeBtnText, theme === 'system' && styles.themeBtnTextActive]}>System</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.menuItem}>
            <IconSymbol name="bell.fill" size={24} color="#1D3D47" />
            <ThemedText style={[styles.menuText, { color: navTheme.colors.text }]}>Notifications</ThemedText>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ccc', true: '#1D3D47' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          <View style={styles.menuItem}>
            <IconSymbol name="arrow.clockwise.circle.fill" size={24} color="#1D3D47" />
            <ThemedText style={[styles.menuText, { color: navTheme.colors.text }]}>Auto-save Questions</ThemedText>
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              trackColor={{ false: '#ccc', true: '#1D3D47' }}
              thumbColor={autoSaveEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <ThemedText style={[styles.menuText, { color: navTheme.colors.text }]}>Reset to Defaults</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        {/* Logout Section */}
       
      </ScrollView>
      {/* Account Settings Modal */}
      <Modal
        visible={accountModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 320 }}>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Edit Account</ThemedText>
            <ThemedText style={{ marginBottom: 4 }}>Username</ThemedText>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 }}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Username"
            />
            <ThemedText style={{ marginBottom: 4 }}>Email</ThemedText>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 20 }}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={handleSaveAccount} style={{ backgroundColor: '#1D3D47', padding: 12, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' }}>
                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Save</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAccountModalVisible(false)} style={{ backgroundColor: '#eee', padding: 12, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: 'center' }}>
                <ThemedText style={{ color: '#1D3D47', fontWeight: 'bold' }}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  themeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F0F4F7',
    marginLeft: 6,
  },
  themeBtnActive: {
    backgroundColor: '#1D3D47',
  },
  themeBtnText: {
    color: '#1D3D47',
    fontWeight: 'bold',
    fontSize: 14,
  },
  themeBtnTextActive: {
    color: '#fff',
  },
}); 