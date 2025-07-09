import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabaseService, QuestionSet } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializeQuiz = async () => {
      if (!id) {
        setError('Quiz ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch question set
        const set = await supabaseService.getQuestionSet(id as string);
        if (!set) {
          setError('Question set not found');
          setLoading(false);
          return;
        }

        setQuestionSet(set);
        
        // Initialize answers array
        setAnswers(new Array(set.questions.length).fill(''));
        
        // Create quiz session
        const session = await supabaseService.createQuizSession(set.id, set.questions.length);
        if (session && session.id) {
          setSessionId(session.id);
        }

      } catch (err: any) {
        console.error('Error initializing quiz:', err);
        setError(err.message || 'Failed to start quiz');
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [id]);

  useEffect(() => {
    // Complete quiz session when score is calculated
    if (score !== null && sessionId && questionSet) {
      completeQuiz();
    }
  }, [score, sessionId]);

  const completeQuiz = async () => {
    if (!sessionId || score === null) return;

    try {
      setSubmitting(true);
      await supabaseService.completeQuizSession(sessionId, score);
    } catch (err) {
      console.error('Error completing quiz session:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < (questionSet?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz finished - calculate score
      calculateScore(newAnswers);
    }
  };

  const calculateScore = (finalAnswers: string[]) => {
    if (!questionSet) return;

    if (questionSet.question_type === 'objective') {
      let correct = 0;
      questionSet.questions.forEach((question, index) => {
        if (question.answer && finalAnswers[index] === question.answer) {
          correct++;
        }
      });
      setScore(correct);
    } else {
      // For theory questions, just count answered questions
      const answered = finalAnswers.filter(answer => answer !== '').length;
      setScore(answered);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (questionSet && currentQuestion < questionSet.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleFinishQuiz = () => {
    Alert.alert(
      'Finish Quiz',
      'Are you sure you want to finish the quiz? You cannot change your answers after finishing.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Finish', style: 'destructive', onPress: () => calculateScore(answers) }
      ]
    );
  };

  const handleGoBack = () => {
    Alert.alert(
      'Leave Quiz',
      'Are you sure you want to leave? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D3D47" />
        <ThemedText style={styles.loadingText}>Loading quiz...</ThemedText>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Quiz completed screen
  if (score !== null) {
    const totalQuestions = questionSet.questions.length;
    const percentage = questionSet.question_type === 'objective' 
      ? Math.round((score / totalQuestions) * 100)
      : Math.round((score / totalQuestions) * 100);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.completedContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.completedHeader}>
            <Ionicons 
              name="checkmark-circle" 
              size={80} 
              color="#10B981" 
            />
            <ThemedText type="title" style={styles.completedTitle}>
              Quiz Completed!
            </ThemedText>
          </View>

          <View style={styles.scoreContainer}>
            <ThemedText style={styles.scoreText}>
              {`${score} / ${totalQuestions}`}
            </ThemedText>
            <ThemedText style={styles.percentageText}>
              {percentage}%
            </ThemedText>
            <ThemedText style={styles.scoreLabel}>
              {questionSet.question_type === 'objective' ? 'Correct Answers' : 'Questions Answered'}
            </ThemedText>
          </View>

          <View style={styles.completedActions}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => router.push('/questions')}
            >
              <ThemedText style={styles.primaryButtonText}>View All Questions</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => router.back()}
            >
              <ThemedText style={styles.secondaryButtonText}>Go Back</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQ = questionSet.questions[currentQuestion];
  const isObjective = questionSet.question_type === 'objective';
  const progress = ((currentQuestion + 1) / questionSet.questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#1D3D47" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <ThemedText style={styles.quizTitle}>{questionSet.title}</ThemedText>
          <ThemedText style={styles.progressText}>
            Question {currentQuestion + 1} of {questionSet.questions.length}
          </ThemedText>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinishQuiz}>
          <ThemedText style={styles.finishButtonText}>Finish</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.contentContainer}>
          <View style={styles.questionCard}>
            <ThemedText style={styles.questionText}>{currentQ.question}</ThemedText>
            
            {isObjective && currentQ.options && (
              <View style={styles.optionsContainer}>
                {currentQ.options.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index);
                  const isSelected = answers[currentQuestion] === optionLetter;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.optionButton, isSelected && styles.selectedOption]}
                      onPress={() => handleAnswer(optionLetter)}
                    >
                      <ThemedText style={[styles.optionLetter, isSelected && styles.selectedOptionText]}>
                        {optionLetter}
                      </ThemedText>
                      <ThemedText style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                        {option}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            
            {!isObjective && (
              <TouchableOpacity
                style={[styles.optionButton, answers[currentQuestion] === 'answered' && styles.selectedOption]}
                onPress={() => handleAnswer('answered')}
              >
                <ThemedText style={[styles.optionText, answers[currentQuestion] === 'answered' && styles.selectedOptionText]}>
                  Mark as Answered
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <Ionicons name="chevron-back" size={20} color={currentQuestion === 0 ? "#ccc" : "#1D3D47"} />
          <ThemedText style={[styles.navButtonText, currentQuestion === 0 && styles.navButtonTextDisabled]}>
            Previous
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, currentQuestion === questionSet.questions.length - 1 && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={currentQuestion === questionSet.questions.length - 1}
        >
          <ThemedText style={[styles.navButtonText, currentQuestion === questionSet.questions.length - 1 && styles.navButtonTextDisabled]}>
            Next
          </ThemedText>
          <Ionicons name="chevron-forward" size={20} color={currentQuestion === questionSet.questions.length - 1 ? "#ccc" : "#1D3D47"} />
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D3D47',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  finishButton: {
    backgroundColor: '#d11a2a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1D3D47',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    color: '#1D3D47',
    lineHeight: 26,
    marginBottom: 24,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#1D3D47',
    borderColor: '#1D3D47',
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginRight: 12,
    minWidth: 24,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#fff',
  },
  navigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  navButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D3D47',
    marginHorizontal: 8,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  completedContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  completedHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginTop: 16,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginBottom: 8,
    lineHeight: 54,
    textAlign: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  completedActions: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#1D3D47',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#A1CEDC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1D3D47',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonText: {
    color: '#1D3D47',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 