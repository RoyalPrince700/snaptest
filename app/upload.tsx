import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, ScrollView, ActivityIndicator, Modal, TextInput, Image, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { calculateWordCount, getMaxQuestionsForWordCount, API_CONFIG } from '../config/api';
import { supabaseService, User } from '../services/supabase';
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

const BRAND_BLUE_GRADIENT = ['#1877F2', '#3399ff'] as const;

export default function UploadScreen() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [pasteModalVisible, setPasteModalVisible] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [pasting, setPasting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [maxQuestionsAllowed, setMaxQuestionsAllowed] = useState(10);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState<number | null>(null);

  const fetchUserAndScore = async () => {
    const u = await supabaseService.getCurrentUser();
    setUser(u);
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
    const sessions = await supabaseService.getUserQuizSessions();
    let scoreSum = 0;
    sessions.forEach(s => {
      if (s.score) scoreSum += s.score;
    });
    setTotalScore(scoreSum);
  };

  useEffect(() => {
    fetchUserAndScore();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserAndScore();
    }, [])
  );

  useEffect(() => {
    const count = calculateWordCount(pastedText);
    const maxQuestions = getMaxQuestionsForWordCount(count);
    setWordCount(count);
    setMaxQuestionsAllowed(maxQuestions);
  }, [pastedText]);

  const disableAll = isLoading;
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Permission', 'Please grant camera permission to take photos.');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library permissions to select images.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (disableAll) return;
    setIsLoading(true);
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      setIsLoading(false);
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
          Alert.alert('File Too Large', `Please select an image smaller than ${MAX_FILE_SIZE_MB} MB.`);
          setIsLoading(false);
          return;
        }
        router.push({
          pathname: '/text-preview',
          params: { uri: asset.uri, type: 'image', name: asset.fileName || '' }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    if (disableAll) return;
    setIsLoading(true);
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      setIsLoading(false);
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
          Alert.alert('File Too Large', `Please select an image smaller than ${MAX_FILE_SIZE_MB} MB.`);
          setIsLoading(false);
          return;
        }
        router.push({
          pathname: '/text-preview',
          params: { uri: asset.uri, type: 'image', name: asset.fileName || '' }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error('Image picker error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickDocument = async () => {
    if (disableAll) return;
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
          Alert.alert('File Too Large', `Please select a document smaller than ${MAX_FILE_SIZE_MB} MB.`);
          setIsLoading(false);
          return;
        }
        router.push({
          pathname: '/text-preview',
          params: { uri: asset.uri, type: 'document', name: asset.name || '' }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
      console.error('Document picker error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteText = () => {
    setPasteModalVisible(true);
    setPastedText('');
  };

  const submitPastedText = () => {
    if (!pastedText.trim()) {
      Alert.alert('No Text', 'Please paste or type some text.');
      return;
    }
    if (wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS) {
      Alert.alert(
        'Text Too Short',
        `Your text has ${wordCount} words, but you need at least ${API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS} words to generate questions.\n\nPlease add more content to your text.`
      );
      return;
    }
    setPasting(true);
    setPasteModalVisible(false);
    router.push({ pathname: '/text-preview', params: { text: pastedText, type: 'pasted', name: 'Pasted Text' } });
    setPasting(false);
  };

  // MVP UI
  const actions = [
    {
      label: 'Paste Text',
      icon: require('../assets/images/paste.png'),
      onPress: handlePasteText,
    },
    {
      label: 'Take Photo',
      icon: require('../assets/images/camera.png'),
      onPress: takePhoto,
    },
    {
      label: 'Upload Document',
      icon: require('../assets/images/upload_doc.png'),
      onPress: pickDocument,
    },
    {
      label: 'Upload Image',
      icon: require('../assets/images/upload_image.png'),
      onPress: pickImage,
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}>
        {/* Blue themed header with avatar, username, and score */}
        <LinearGradient colors={BRAND_BLUE_GRADIENT} style={styles.headerGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
          <View style={styles.headerBox}>
            <View style={styles.avatarOutline}>
              <Image
                source={avatarIndex !== null ? avatarSources[avatarIndex] : avatarSources[0]}
                style={styles.avatar}
              />
            </View>
            <View style={{ marginLeft: 16 }}>
              <ThemedText style={[styles.username, { color: '#fff' }]}>{username || 'User'}</ThemedText>
              <ThemedText style={[styles.scoreLabel, { color: '#fff' }]}>Total Score: <ThemedText style={styles.scoreValue}>{totalScore}</ThemedText></ThemedText>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.cardWrap}>
          <ThemedText type="title" style={[styles.title, { color: '#1D3D47' }]}>Upload Content</ThemedText>
          <ThemedText style={[styles.description, { color: '#555' }]}>Choose how you want to upload your textbook content for question generation</ThemedText>
          {/* Grid of 4 options */}
          <View style={styles.gridWrap}>
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.card, disableAll && styles.disabledButton]}
                onPress={action.onPress}
                disabled={disableAll}
                activeOpacity={disableAll ? 1 : 0.7}
              >
                <Image source={action.icon} style={styles.cardIcon} />
                <ThemedText style={[styles.cardLabel, { color: '#1D3D47' }]}>{action.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1D3D47" />
            <ThemedText style={styles.loadingText}>Processing...</ThemedText>
          </View>
        )}
        <Modal visible={pasteModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Paste or Type Text</ThemedText>
              {/* Word count info */}
              <View style={styles.wordCountInfo}>
                <ThemedText style={styles.wordCountText}>
                  {wordCount} words • Max {maxQuestionsAllowed} questions
                </ThemedText>
              </View>
              {/* Warning if text is too short */}
              {wordCount > 0 && wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS && (
                <View style={styles.warningBox}>
                  <ThemedText style={styles.warningText}>
                    ⚠️ Add more text to generate questions (minimum {API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS} words)
                  </ThemedText>
                </View>
              )}
              <TextInput
                style={styles.textInput}
                value={pastedText}
                onChangeText={setPastedText}
                placeholder="Paste or type your textbook content here"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <View style={styles.modalRow}>
                <TouchableOpacity 
                  style={[
                    styles.modalBtn, 
                    wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS && styles.modalBtnDisabled
                  ]} 
                  onPress={submitPastedText}
                  disabled={wordCount < API_CONFIG.APP.MIN_WORDS_FOR_QUESTIONS}
                >
                  <ThemedText style={styles.modalBtnText}>Continue</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setPasteModalVisible(false)}>
                  <ThemedText style={styles.modalBtnText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {pasting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1D3D47" />
            <ThemedText style={styles.loadingText}>Processing...</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
    alignItems: 'center',
  },
  headerGradient: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 0,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 0,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 8,
  },
  avatarOutline: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F7FA',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 2,
  },
  scoreValue: {
    fontWeight: 'bold',
    color: '#fff',
  },
  cardWrap: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginTop: -24,
    padding: 24,
    width: '92%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1D3D47',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 300,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 16,
  },
  card: {
    width: '47%',
    backgroundColor: '#F8FAFB',
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
  cardIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D3D47',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textInput: {
    height: 120,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalBtn: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#1D3D47',
  },
  modalBtnCancel: {
    backgroundColor: '#A1CEDC',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  wordCountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wordCountText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  warningBox: {
    backgroundColor: '#FFD700',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  modalBtnDisabled: {
    opacity: 0.5,
  },
}); 