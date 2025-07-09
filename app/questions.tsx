import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  FlatList, 
  Alert, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  Image as RNImage,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabaseService, User, QuestionSet, QuizSession } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

export default function QuestionsScreen() {
  const [activeTab, setActiveTab] = useState<'sets' | 'sessions'>('sets');
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const theme = useTheme();

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Check authentication first
      const u = await supabaseService.getCurrentUser();
      setUser(u);
      if (!u) {
        setError('Please log in to view your questions');
        setLoading(false);
        return;
      }
      const { data } = await supabaseService.supabase
        .from('user_profiles')
        .select('username')
        .eq('id', u.id)
        .single();
      if (data && data.username) {
        setUsername(data.username);
      }

      // Fetch question sets
      const sets = await supabaseService.getUserQuestionSets();
      const parsedSets = sets.map(set => ({
        ...set,
        questions: typeof set.questions === 'string' ? JSON.parse(set.questions) : set.questions,
      }));
      setQuestionSets(parsedSets);

      // Fetch quiz sessions
      const sessions = await supabaseService.getUserQuizSessions();
      const sessionsWithTitles = sessions.map(session => ({
        ...session,
        questionSetTitle: parsedSets.find(s => s.id === session.question_set_id)?.title || 'Untitled',
      }));
      setQuizSessions(sessionsWithTitles);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load your questions');
      setQuestionSets([]);
      setQuizSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeleteQuestionSet = async (id: string) => {
    Alert.alert(
      'Delete Question Set',
      'Are you sure you want to delete this question set? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await supabaseService.deleteQuestionSet(id);
              if (success) {
                setQuestionSets(prev => prev.filter(set => set.id !== id));
                Alert.alert('Success', 'Question set deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete question set');
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete question set');
            }
          }
        }
      ]
    );
  };

  const handleDeleteQuizSession = async (id: string) => {
    Alert.alert(
      'Delete Quiz History',
      'Are you sure you want to delete this quiz history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabaseService.supabase
                .from('quiz_sessions')
                .delete()
                .eq('id', id);
              
              if (!error) {
                setQuizSessions(prev => prev.filter(session => session.id !== id));
                Alert.alert('Success', 'Quiz history deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete quiz history');
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete quiz history');
            }
          }
        }
      ]
    );
  };

  const renderQuestionSet = ({ item }: { item: QuestionSet }) => (
    <View style={[styles.setCard, { backgroundColor: theme.colors.card, shadowColor: theme.dark ? '#22272e' : '#000' }]}>
      <View style={styles.setCardHeader}>
        <ThemedText style={[styles.setCardTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <View style={[
          styles.typeBadge, 
          { backgroundColor: item.question_type === 'objective' ? theme.colors.primary : theme.colors.card }
        ]}>
          <ThemedText style={styles.typeText}>
            {item.question_type === 'objective' ? 'MCQ' : 'Theory'}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.setCardContent}>
        <ThemedText style={[styles.setCardSubtext, { color: theme.colors.text }]}>
          {item.questions.length} questions
        </ThemedText>
        <ThemedText style={[styles.setCardDate, { color: theme.colors.text }]}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </ThemedText>
      </View>
      
      <View style={styles.setCardActions}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => router.push({ pathname: '/quiz', params: { id: item.id } })}
        >
          <ThemedText style={[styles.buttonText, { color: theme.colors.background }]}>Start Quiz</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.primary, borderWidth: 1 }
          ]}
          onPress={() => router.push({ pathname: '/question-detail', params: { id: item.id } })}
        >
          <ThemedText style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>View</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteQuestionSet(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#d11a2a" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuizSession = ({ item }: { item: QuizSession }) => (
    <View style={[styles.quizHistoryCard, { backgroundColor: theme.colors.card, shadowColor: theme.dark ? '#22272e' : '#000' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 20 }}>
        <ThemedText style={[styles.cardTitle, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>{item.questionSetTitle}</ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.scoreBadge}>
            <ThemedText style={[styles.scoreText, { color: theme.colors.text }]}>
              {item.score || 0}/{item.total_questions}
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <ThemedText style={[styles.cardSubtext, { color: theme.colors.text }]}>Score: {Math.round(((item.score || 0) / item.total_questions) * 100)}%</ThemedText>
        <ThemedText style={[styles.cardDate, { color: theme.colors.text }]}>Completed: {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'N/A'}</ThemedText>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <TouchableOpacity onPress={() => handleDeleteQuizSession(item.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#d11a2a" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading your questions...</ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={64} color={theme.colors.primary} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.scrollContent}>
          {/* Remove headerBox with avatar and username */}
          {/* Start directly with tabs and lists */}
          <View style={[styles.tabContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'sets' && { backgroundColor: theme.colors.primary }]}
              onPress={() => setActiveTab('sets')}
            >
              <ThemedText style={[styles.tabText, { color: activeTab === 'sets' ? theme.colors.background : theme.colors.text }]}>
                Question Sets ({questionSets.length})
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'sessions' && { backgroundColor: theme.colors.primary }]}
              onPress={() => setActiveTab('sessions')}
            >
              <ThemedText style={[styles.tabText, { color: activeTab === 'sessions' ? theme.colors.background : theme.colors.text }]}>
                Quiz History ({quizSessions.length})
              </ThemedText>
            </TouchableOpacity>
          </View>

          {activeTab === 'sets' ? (
            <FlatList
              data={questionSets}
              keyExtractor={item => item.id}
              renderItem={renderQuestionSet}
              contentContainerStyle={{ paddingBottom: 80, width: '100%' }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <IconSymbol name="doc.text" size={64} color={theme.colors.primary + '55'} />
                  <ThemedText style={[styles.emptyText, { color: theme.colors.text }]}>No question sets yet</ThemedText>
                  <ThemedText style={[styles.emptySubtext, { color: theme.colors.text }]}>Upload a textbook to generate your first question set</ThemedText>
                </View>
              }
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            />
          ) : (
            <FlatList
              data={quizSessions}
              keyExtractor={item => item.id}
              renderItem={renderQuizSession}
              contentContainerStyle={{ paddingBottom: 80, width: '100%' }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <IconSymbol name="chart.bar" size={64} color={theme.colors.primary + '55'} />
                  <ThemedText style={[styles.emptyText, { color: theme.colors.text }]}>No quiz history yet</ThemedText>
                  <ThemedText style={[styles.emptySubtext, { color: theme.colors.text }]}>Complete a quiz to see your results here</ThemedText>
                </View>
              }
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            />
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#d11a2a',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1D3D47',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 24,
    marginTop: 8,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    alignSelf: 'center',
    width: '98%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  setCard: {
    width: '98%',
    alignSelf: 'center',
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  setCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  setCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  typeBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  typeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  setCardContent: {
    marginBottom: 12,
  },
  setCardSubtext: {
    fontSize: 15,
    marginBottom: 4,
  },
  setCardDate: {
    fontSize: 13,
  },
  setCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: '#FFF0F0',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  scoreBadge: {
    backgroundColor: '#f0f7fe',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardSubtext: {
    fontSize: 15,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 300,
  },
  quizHistoryCard: {
    width: '100%',
    marginHorizontal: 0,
    paddingHorizontal: 0,
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
}); 