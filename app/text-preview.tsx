import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MlkitOcr from 'react-native-mlkit-ocr';
import { extractTextWithVercel } from '../services/documentExtract';
import { fireworksAIService, Question } from '../services/fireworksAI';
import { supabaseService } from '../services/supabase';
import { calculateWordCount, getMaxQuestionsForWordCount, API_CONFIG } from '../config/api';

const RAPID_API_KEY = 'a175b650d9msh0fba2b7a5b0316ap1e670bjsnd40b64f45dc7'; // Replace with your actual RapidAPI key

export default function TextPreviewScreen() {
  const { uri, type, name, text } = useLocalSearchParams<{ uri?: string; type?: string; name?: string; text?: string }>();
  const [extractedText, setExtractedText] = useState<string>('');
  const [showFullText, setShowFullText] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionLoading, setQuestionLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [questionType, setQuestionType] = useState<'objective' | 'theory'>('objective');
  const [questionCount, setQuestionCount] = useState<string>('5');
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false);
  const [saveTitle, setSaveTitle] = useState<string>('');
  const [savedQuestionSetId, setSavedQuestionSetId] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [maxQuestionsAllowed, setMaxQuestionsAllowed] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    const extractText = async () => {
      if (type === 'pasted' && text) {
        setExtractedText(text as string);
        setLoading(false);
        return;
      }
      if (!uri || !type) return;
      setLoading(true);
      if (type === 'image') {
        try {
          const result = await MlkitOcr.detectFromUri(uri as string);
          const text = result.map((block: { text: string }) => block.text).join('\n') || '(No text found in image)';
          setExtractedText(text);
        } catch (err) {
          setExtractedText('(Failed to extract text from image)');
        } finally {
          setLoading(false);
        }
      } else if (type === 'document') {
        try {
          let text = '';
          if (name) {
            text = await extractTextWithVercel(uri as string, name as string);
          }
          setExtractedText(text || '(No text found in document)');
        } catch (err: any) {
          setExtractedText('(Failed to extract text from document)');
        } finally {
          setLoading(false);
        }
      } else {
        setExtractedText('(Unsupported file type)');
        setLoading(false);
      }
    };
    extractText();
  }, [uri, type, name, text]);

  useEffect(() => {
    const count = calculateWordCount(extractedText);
    const maxQuestions = getMaxQuestionsForWordCount(count);
    setWordCount(count);
    setMaxQuestionsAllowed(maxQuestions);
    
    const currentCount = parseInt(questionCount, 10);
    if (currentCount > maxQuestions && maxQuestions > 0) {
      setQuestionCount(maxQuestions.toString());
    }
  }, [extractedText, questionCount]);

  const handleGenerateQuestions = () => {
    if (!extractedText || extractedText.startsWith('(')) {
      Alert.alert('No text', 'Please extract text first.');
      return;
    }
    
    if (wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS) {
      Alert.alert(
        'Text Too Short', 
        `Your text has ${wordCount} words, but you need at least ${API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS} words to generate questions.\n\nPlease add more content to your text.`
      );
      return;
    }
    
    setModalVisible(true);
  };

  const startGeneration = async () => {
    const count = parseInt(questionCount, 10);
    
    if (count > maxQuestionsAllowed) {
      Alert.alert('Too Many Questions', `Maximum ${maxQuestionsAllowed} questions allowed for ${wordCount} words.`);
      return;
    }
    
    setModalVisible(false);
    setQuestionLoading(true);
    setQuestions([]);
    try {
      const res = await fireworksAIService.generateQuestions({
        text: extractedText,
        questionType,
        count,
        difficulty,
      });
      if (res.success) {
        setQuestions(res.questions);
        setSaveModalVisible(true);
        setSaveTitle('My Question Set');
      } else {
        Alert.alert('Error', res.error || 'Failed to generate questions');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate questions');
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleSaveQuestionSet = async () => {
    setSaveModalVisible(false);
    try {
      const saved = await supabaseService.saveQuestionSet(
        saveTitle || 'My Question Set',
        questions,
        questionType,
        extractedText
      );
      if (saved) {
        setSavedQuestionSetId(saved.id);
        Alert.alert('Success', 'Question set saved!', [
          { text: 'OK' }
        ]);
      } else {
        Alert.alert('Error', 'Failed to save question set.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save question set.');
    }
  };

  const handleTakeQuiz = () => {
    if (savedQuestionSetId) {
      router.push({ pathname: '/quiz', params: { id: savedQuestionSetId } });
    } else {
      Alert.alert('Error', 'Please save the question set first before taking the quiz.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <ThemedText type="title" style={styles.title}>Preview Extracted Text</ThemedText>
        <View style={styles.fileInfo}>
          <ThemedText style={styles.label}>File Type:</ThemedText>
          <ThemedText style={styles.value}>{type}</ThemedText>
          {name && <><ThemedText style={styles.label}>File Name:</ThemedText><ThemedText style={styles.value}>{name}</ThemedText></>}
        </View>
        {type === 'image' && uri && (
          <Image source={{ uri: uri as string }} style={styles.imagePreview} resizeMode="contain" />
        )}
        <View style={styles.textPreviewBox}>
          {loading ? (
            <ActivityIndicator size="large" color="#1D3D47" />
          ) : (
            <>
              <View style={styles.textInfoRow}>
                <ThemedText style={styles.wordCountText}>
                  {wordCount} words • Max {maxQuestionsAllowed} questions
                </ThemedText>
              </View>
              {wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS && (
                <View style={styles.warningBox}>
                  <ThemedText style={styles.warningText}>
                    ⚠️ Add more text to generate questions (minimum {API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS} words)
                  </ThemedText>
                </View>
              )}
              <ThemedText style={styles.textPreview}>
                {showFullText || extractedText.length <= 400
                  ? extractedText
                  : `${extractedText.slice(0, 400)}...`}
              </ThemedText>
              {extractedText.length > 400 && (
                <TouchableOpacity onPress={() => setShowFullText((v) => !v)}>
                  <ThemedText style={styles.showMoreBtn}>
                    {showFullText ? 'Show Less' : 'Show Full Text'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.button, 
            (wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS) && styles.buttonDisabled
          ]} 
          onPress={handleGenerateQuestions} 
          disabled={loading || questionLoading || wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS}
        >
          <ThemedText style={styles.buttonText}>
            {questionLoading ? 'Generating...' : 'Generate Questions'}
          </ThemedText>
        </TouchableOpacity>
        {questions.length > 0 && (
          <View style={styles.questionsBox}>
            <ThemedText type="subtitle" style={styles.questionsTitle}>Generated Questions</ThemedText>
            {questions.map((q, idx) => (
              <View key={q.id} style={styles.questionItem}>
                <ThemedText style={styles.questionText}>{idx + 1}. {q.question}</ThemedText>
                {q.options && (
                  <View style={styles.optionsBox}>
                    {q.options.map((opt, i) => (
                      <ThemedText key={i} style={styles.optionText}>{String.fromCharCode(65 + i)}. {opt}</ThemedText>
                    ))}
                  </View>
                )}
                {q.answer && <ThemedText style={styles.answerText}>Answer: {q.answer}</ThemedText>}
              </View>
            ))}
            
            {/* Action buttons after questions */}
            <View style={styles.actionButtonsContainer}>
              {savedQuestionSetId ? (
                <TouchableOpacity style={[styles.button, styles.takeQuizButton]} onPress={handleTakeQuiz}>
                  <ThemedText style={styles.buttonText}>Take Quiz</ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.button} onPress={() => setSaveModalVisible(true)}>
                  <ThemedText style={styles.buttonText}>Save & Take Quiz</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Question Generation</ThemedText>
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.typeButton, questionType === 'objective' && styles.typeButtonActive]}
                onPress={() => setQuestionType('objective')}
              >
                <ThemedText style={[styles.typeButtonText, questionType === 'objective' && styles.typeButtonTextActive]}>Objective</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, questionType === 'theory' && styles.typeButtonActive]}
                onPress={() => setQuestionType('theory')}
              >
                <ThemedText style={[styles.typeButtonText, questionType === 'theory' && styles.typeButtonTextActive]}>Theory</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.typeButton, difficulty === 'easy' && styles.typeButtonActive]}
                onPress={() => setDifficulty('easy')}
              >
                <ThemedText style={[styles.typeButtonText, difficulty === 'easy' && styles.typeButtonTextActive]}>Easy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, difficulty === 'medium' && styles.typeButtonActive]}
                onPress={() => setDifficulty('medium')}
              >
                <ThemedText style={[styles.typeButtonText, difficulty === 'medium' && styles.typeButtonTextActive]}>Medium</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, difficulty === 'hard' && styles.typeButtonActive]}
                onPress={() => setDifficulty('hard')}
              >
                <ThemedText style={[styles.typeButtonText, difficulty === 'hard' && styles.typeButtonTextActive]}>Hard</ThemedText>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.input,
                parseInt(questionCount, 10) > maxQuestionsAllowed && styles.inputError
              ]}
              keyboardType="number-pad"
              value={questionCount}
              onChangeText={(value) => {
                const num = parseInt(value, 10);
                if (num <= maxQuestionsAllowed || value === '') {
                  setQuestionCount(value);
                }
              }}
              placeholder={`Number of questions (max: ${maxQuestionsAllowed})`}
              maxLength={2}
            />
            {parseInt(questionCount, 10) > maxQuestionsAllowed && (
              <ThemedText style={styles.errorText}>
                Maximum {maxQuestionsAllowed} questions allowed for {wordCount} words
              </ThemedText>
            )}
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={startGeneration}>
                <ThemedText style={styles.modalBtnText}>Generate</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setModalVisible(false)}>
                <ThemedText style={styles.modalBtnText}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={saveModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Save Question Set</ThemedText>
            <TextInput
              style={styles.input}
              value={saveTitle}
              onChangeText={setSaveTitle}
              placeholder="Enter a title for this set"
              maxLength={50}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleSaveQuestionSet}>
                <ThemedText style={styles.modalBtnText}>Save</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setSaveModalVisible(false)}>
                <ThemedText style={styles.modalBtnText}>Cancel</ThemedText>
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
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  fileInfo: {
    marginBottom: 16,
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    marginBottom: 4,
  },
  imagePreview: {
    width: 220,
    height: 160,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  textPreviewBox: {
    width: '100%',
    minHeight: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textPreview: {
    fontSize: 16,
    color: '#333',
  },
  showMoreBtn: {
    color: '#1D3D47',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#125ecf',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    marginBottom: 16,
    marginRight: 5,
    marginLeft: 5,
    shadowColor: '#1877F2',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  questionsBox: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1D3D47',
  },
  questionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1D3D47',
  },
  questionItem: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionsBox: {
    marginLeft: 12,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  answerText: {
    fontSize: 15,
    color: '#1D3D47',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 320,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1D3D47',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#0e4cb5',
  },
  typeButtonText: {
    color: '#1D3D47',
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  modalBtn: {
    backgroundColor: '#0e4cb5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  modalBtnCancel: {
    backgroundColor: '#aaa',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonsContainer: {
    marginTop: 16,
    width: '100%',
  },
  takeQuizButton: {
    backgroundColor: '#0e4cb5',
  },
  textInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  wordCountText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  maxQuestionsText: {
    fontSize: 15,
    color: '#333',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffd700',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  warningText: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
}); 