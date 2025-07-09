import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, ScrollView, ActivityIndicator, RefreshControl, Image, Modal } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabaseService } from '@/services/supabase';
import AvatarSelector from '../../components/AvatarSelector';

const avatarSources = [
  require('../../assets/avatars/avatar1.jpg'),
  require('../../assets/avatars/avatar2.jpg'),
  require('../../assets/avatars/avatar3.jpg'),
  require('../../assets/avatars/avatar4.jpg'),
  require('../../assets/avatars/avatar5.jpg'),
  require('../../assets/avatars/avatar6.jpg'),
  require('../../assets/avatars/avatar7.jpg'),
  require('../../assets/avatars/avatar8.jpg'),
  require('../../assets/avatars/avatar9.jpg'),
];

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    questionSets: 0,
    quizzesTaken: 0,
    avgScore: 0
  });
  const [avatarIndex, setAvatarIndex] = useState<number | null>(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const fetchUserData = async () => {
    try {
      const u = await supabaseService.getCurrentUser();
      setUser(u);
      
      if (u) {
        // Fetch user profile (username, avatar_index)
        const { data: profileData, error: profileError } = await supabaseService.supabase
          .from('user_profiles')
          .select('username, avatar_index')
          .eq('id', u.id)
          .single();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
        } else {
          setProfile(profileData);
          setAvatarIndex(typeof profileData?.avatar_index === 'number' ? profileData.avatar_index : 0);
        }

        // Fetch user stats
        await fetchUserStats(u.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      // Get question sets count
      const { count: questionSetsCount } = await supabaseService.supabase
        .from('question_sets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get quiz sessions count and average score
      const { data: quizSessions, error: sessionsError } = await supabaseService.supabase
        .from('quiz_sessions')
        .select('score, total_questions')
        .eq('user_id', userId)
        .eq('completed', true);

      let quizzesTaken = 0;
      let totalScore = 0;
      let totalQuestions = 0;

      if (quizSessions && quizSessions.length > 0) {
        quizzesTaken = quizSessions.length;
        quizSessions.forEach(session => {
          if (session.score !== null && session.total_questions > 0) {
            totalScore += session.score;
            totalQuestions += session.total_questions;
          }
        });
      }

      const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

      setStats({
        questionSets: questionSetsCount || 0,
        quizzesTaken,
        avgScore
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await supabaseService.signOut();
            setUser(null);
            setProfile(null);
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleSignIn = () => {
    router.replace('/signup');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleAbout = () => {
    router.push('/about');
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Need help? Here are some common questions:\n\n• How to upload content?\n• How to generate questions?\n• How to take quizzes?\n• How to view progress?\n\nFor more help, contact support.',
      [{ text: 'OK' }]
    );
  };

  // Helper to update avatar in Supabase
  const updateAvatarInSupabase = async (idx: number) => {
    if (!user) return;
    try {
      await supabaseService.supabase
        .from('user_profiles')
        .update({ avatar_index: idx })
        .eq('id', user.id);
      setAvatarIndex(idx);
      // Optionally, refresh profile or trigger a global update if needed
    } catch (error) {
      console.error('Failed to update avatar in Supabase:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D3D47" />
        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setAvatarModalVisible(true)} activeOpacity={0.7}>
            <View style={styles.avatarOutline}>
              <Image
                source={avatarIndex !== null ? avatarSources[avatarIndex] : avatarSources[0]}
                style={styles.avatar}
              />
            </View>
          </TouchableOpacity>
        </View>
        {user && profile ? (
          <>
            <ThemedText type="title" style={styles.title}>{profile.username}</ThemedText>
            <ThemedText style={styles.subtitle}>{user.email}</ThemedText>
          </>
        ) : (
          <>
            <ThemedText type="title" style={styles.title}>Welcome to SnapTest</ThemedText>
            <ThemedText style={styles.subtitle}>Sign up or log in to save your questions</ThemedText>
          </>
        )}
      </View>

      <View style={styles.section}>
        {user ? (
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#1D3D47" />
            <ThemedText style={styles.menuText}>Log Out</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.menuItem} onPress={handleSignIn}>
            <IconSymbol name="person.badge.plus" size={24} color="#1D3D47" />
            <ThemedText style={styles.menuText}>Sign up or Log in</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <IconSymbol name="gearshape.fill" size={24} color="#1D3D47" />
          <ThemedText style={styles.menuText}>Settings</ThemedText>
          <IconSymbol name="chevron.right" size={20} color="#999" />
        </TouchableOpacity>

        {user && (
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/questions')}>
            <IconSymbol name="doc.text.fill" size={24} color="#1D3D47" />
            <ThemedText style={styles.menuText}>View All Questions</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
          <IconSymbol name="questionmark.circle.fill" size={24} color="#1D3D47" />
          <ThemedText style={styles.menuText}>Help & Support</ThemedText>
          <IconSymbol name="chevron.right" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
          <IconSymbol name="info.circle.fill" size={24} color="#1D3D47" />
          <ThemedText style={styles.menuText}>About SnapTest</ThemedText>
          <IconSymbol name="chevron.right" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.statsSection}>
          <ThemedText type="subtitle" style={styles.statsTitle}>Your Stats</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{stats.questionSets}</ThemedText>
              <ThemedText style={styles.statLabel}>Question Sets</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{stats.quizzesTaken}</ThemedText>
              <ThemedText style={styles.statLabel}>Quizzes Taken</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{stats.avgScore}%</ThemedText>
              <ThemedText style={styles.statLabel}>Avg Score</ThemedText>
            </View>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          SnapTest v1.0.0
        </ThemedText>
        <ThemedText style={styles.footerSubtext}>
          Powered by Fireworks AI
        </ThemedText>
      </View>

      <Modal
        visible={avatarModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', width: 340 }}>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Choose Your Avatar</ThemedText>
            <AvatarSelector
              selected={avatarIndex}
              onSelect={async idx => {
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  avatarOutline: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginRight: 8,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
});
