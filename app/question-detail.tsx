import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  SafeAreaView 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabaseService, QuestionSet } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullSource, setShowFullSource] = useState(false);

  useEffect(() => {
    const fetchQuestionSet = async () => {
      if (!id) {
        setError('Question set ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const set = await supabaseService.getQuestionSet(id as string);
        if (!set) {
          setError('Question set not found');
        } else {
          setQuestionSet(set);
        }
      } catch (err: any) {
        console.error('Error fetching question set:', err);
        setError(err.message || 'Failed to load question set');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionSet();
  }, [id]);

  const handleStartQuiz = () => {
    if (questionSet) {
      router.push({ pathname: '/quiz', params: { id: questionSet.id } });
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D3D47" />
        <ThemedText style={styles.loadingText}>Loading question set...</ThemedText>
      </SafeAreaView>
    );
  }

  if (error || !questionSet) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#d11a2a" />
        <ThemedText style={styles.errorText}>
          {error || 'Question set not found'}
        </ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#1D3D47" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          {questionSet.title}
        </ThemedText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>Type:</ThemedText>
            <View style={[
              styles.typeBadge,
              { backgroundColor: questionSet.question_type === 'objective' ? '#1D3D47' : '#A1CEDC' }
            ]}>
              <ThemedText style={styles.typeText}>
                {questionSet.question_type === 'objective' ? 'Multiple Choice' : 'Theory'}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>Questions:</ThemedText>
            <ThemedText style={styles.metaValue}>{questionSet.questions.length}</ThemedText>
          </View>
          
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>Created:</ThemedText>
            <ThemedText style={styles.metaValue}>
              {new Date(questionSet.created_at).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.sourceSection}>
          <ThemedText style={styles.sectionTitle}>Source Text</ThemedText>
          <View style={styles.sourceTextContainer}>
            {showFullSource && (
              <TouchableOpacity onPress={() => setShowFullSource(false)} style={{ alignSelf: 'flex-end', marginBottom: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#E0F0F7' }}>
                <ThemedText style={{ color: '#0077B6', fontWeight: 'bold', fontSize: 15 }}>
                  Show less
                </ThemedText>
              </TouchableOpacity>
            )}
            <ThemedText style={styles.sourceText}>
              {showFullSource || questionSet.source_text.length <= 100
                ? questionSet.source_text
                : questionSet.source_text.slice(0, 100) + '...'}
            </ThemedText>
            {questionSet.source_text.length > 100 && (
              <TouchableOpacity onPress={() => setShowFullSource(v => !v)} style={{ alignSelf: 'flex-end', marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#E0F0F7' }}>
                <ThemedText style={{ color: '#0077B6', fontWeight: 'bold', fontSize: 15 }}>
                  {showFullSource ? 'Show less' : 'Show more'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.questionsSection}>
          <ThemedText style={styles.sectionTitle}>Questions</ThemedText>
          {questionSet.questions.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <ThemedText style={styles.questionNumber}>Question {index + 1}</ThemedText>
              </View>
              
              <ThemedText style={styles.questionText}>
                {question.question}
              </ThemedText>
              
              {question.options && question.options.length > 0 && (
                <View style={styles.optionsContainer}>
                  {question.options.map((option, optionIndex) => (
                    <View key={optionIndex} style={styles.optionItem}>
                      <ThemedText style={styles.optionLetter}>
                        {String.fromCharCode(65 + optionIndex)}.
                      </ThemedText>
                      <ThemedText style={styles.optionText}>{option}</ThemedText>
                    </View>
                  ))}
                </View>
              )}
              
              {question.answer && (
                <View style={styles.answerContainer}>
                  <ThemedText style={styles.answerLabel}>Answer:</ThemedText>
                  <ThemedText style={styles.answerText}>{question.answer}</ThemedText>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startQuizButton} onPress={handleStartQuiz}>
          <ThemedText style={styles.startQuizButtonText}>Start Quiz</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#061d52',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  metaSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 14,
    color: '#061d52',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: '#061d52',
    fontWeight: 'bold',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sourceSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#061d52',
    marginBottom: 12,
  },
  sourceTextContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  sourceText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  questionsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionCard: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  questionHeader: {
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#061d52',
  },
  questionText: {
    fontSize: 16,
    color: '#061d52',
    lineHeight: 22,
    marginBottom: 12,
  },
  optionsContainer: {
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#061d52',
    marginRight: 8,
    minWidth: 20,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  answerContainer: {
    backgroundColor: '#f0f7fe',
    borderRadius: 8,
    padding: 12,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#061d52',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#092e7e',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  startQuizButton: {
    backgroundColor: '#125ecf',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startQuizButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonText: {
    color: '#061d52',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 