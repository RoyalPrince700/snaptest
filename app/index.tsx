import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, Image as RNImage, Modal, Pressable, Dimensions, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabaseService, User } from '@/services/supabase';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AvatarSelector from '@/components/AvatarSelector';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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

const BRAND_BLUE_GRADIENT = ['#007bff', '#3399ff'];
const LOGO_SIZE = 96;
const TAGLINE = 'Turn any text into practice questions';
const VERSION = 'Powered by SnapTest AI · v1.0';

export default function IndexRedirect() {
  useEffect(() => {
    async function checkAuth() {
      const user = await supabaseService.getCurrentUser();
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
    checkAuth();
  }, []);
  return null;
}

const HomeScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarIndex, setAvatarIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const theme = useTheme();

  const fetchUserData = async () => {
    try {
      const u = await supabaseService.getCurrentUser();
      setUser(u);
      setIsAuthenticated(!!u);
      if (u) {
        const { data } = await supabaseService.supabase
          .from('user_profiles')
          .select('username, avatar_index')
          .eq('id', u.id)
          .single();
        if (data && data.username) {
          setUsername(data.username);
        }
        setAvatarIndex(typeof data?.avatar_index === 'number' ? data.avatar_index : 0);
      }
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  // Helper to update avatar in Supabase
  const updateAvatarInSupabase = async (idx: number) => {
    if (!user) return;
    try {
      console.log('[Home] Updating avatar in Supabase for user:', user.id, 'to index:', idx);
      const { data, error } = await supabaseService.supabase
        .from('user_profiles')
        .update({ avatar_index: idx })
        .eq('id', user.id);
      if (error) {
        console.error('[Home] Failed to update avatar in Supabase:', error);
      } else {
        console.log('[Home] Avatar update response:', data);
      }
    } catch (error) {
      console.error('[Home] Exception updating avatar in Supabase:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const handleUploadPress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please sign up or log in to upload content and generate questions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Up', onPress: () => router.push('/signup') }
        ]
      );
      return;
    }
    router.push('/upload');
  };

  const handleQuestionsPress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please sign up or log in to view your questions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Up', onPress: () => router.push('/signup') }
        ]
      );
      return;
    }
    router.push('/questions');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* User card at the very top */}
      {isAuthenticated && (
        <View style={styles.userCardWrapper}>
          <View style={[styles.userCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
            <Pressable onPress={() => setAvatarModalVisible(true)}>
              <View style={[styles.avatarBox, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
                <IconSymbol name="person.circle.fill" size={56} color={theme.colors.text + '55'} style={{ position: 'absolute', left: 0, top: 0 }} />
                {avatarIndex !== null && (
                  <RNImage
                    source={avatarSources[avatarIndex]}
                    style={styles.avatarImg}
                  />
                )}
              </View>
            </Pressable>
            <Modal
              visible={avatarModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setAvatarModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ThemedText style={styles.modalTitle}>Choose Your Avatar</ThemedText>
                  <AvatarSelector
                    selected={avatarIndex}
                    onSelect={async idx => {
                      setAvatarIndex(idx);
                      setAvatarModalVisible(false);
                      await updateAvatarInSupabase(idx);
                    }}
                  />
                  <TouchableOpacity onPress={() => setAvatarModalVisible(false)} style={{ marginTop: 12 }}>
                    <ThemedText style={{ color: theme.colors.text, fontWeight: 'bold' }}>Cancel</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.userInfoBox}>
              <ThemedText style={[styles.username, { color: theme.colors.text }]}>{username ? username : 'User'}</ThemedText>
              <ThemedText style={styles.welcomeLabel}>Welcome to SnapTest!</ThemedText>
            </View>
          </View>
        </View>
      )}
      {/* Centered main content */}
      <View style={styles.centerContent}>
        {!isAuthenticated && (
        <>
        <View style={styles.logoCard}>
          <RNImage
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <ThemedText style={styles.tagline}>{TAGLINE}</ThemedText>
      </>
      
        )}
        
        
        <View style={styles.buttonGroup}>
          {isAuthenticated ? (
            <>
              <TouchableOpacity style={styles.card} onPress={handleUploadPress}>
                <ThemedText style={styles.cardLabel}>Snap or Upload Textbook</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.card, { backgroundColor: '#A1CEDC' }]} onPress={handleQuestionsPress}>
                <ThemedText style={[styles.cardLabel, { color: '#1D3D47' }]}>View My Questions</ThemedText>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
        {!isAuthenticated && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonWrapper}
            onPress={() => router.push('/login')}
          >
            <LinearGradient colors={BRAND_BLUE_GRADIENT} style={styles.getStartedButton} start={{x:0, y:0}} end={{x:1, y:0}}>
              <ThemedText style={styles.getStartedText}>Get Started</ThemedText>
              <Ionicons name="arrow-forward" size={22} color="#fff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>{VERSION}</ThemedText>
      </View>
    </ThemedView>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  userCardWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
  },
  userCard: {
    width: '92%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfoBox: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A3A3A',
  },
  welcomeLabel: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: SCREEN_HEIGHT * 0.55,
  },
  headline: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  welcomeHeadline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  description: {
    fontSize: 16,
    color: '#4B5C6B',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonGroup: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  card: {
    width: '92%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    paddingVertical: 24,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3A',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  logoCard: {
    width: LOGO_SIZE + 4,
    height: LOGO_SIZE + 4,
    borderRadius: (LOGO_SIZE + 10) / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    marginBottom: 28,
  },
  
  logo: {
    width: LOGO_SIZE - 6,
    height: LOGO_SIZE - 6,
    borderRadius: (LOGO_SIZE - 10) / 2,
    overflow: 'hidden',
  },
  
  tagline: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: '#555',
    textAlign: 'center',
    marginBottom: 36,
    marginHorizontal: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  buttonWrapper: {
    width: '80%',
    maxWidth: 340,
    alignItems: 'center',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#007bff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  getStartedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 18,
    paddingTop: 8,
  },
  footerText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
}); 