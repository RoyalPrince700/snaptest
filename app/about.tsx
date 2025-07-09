import React from 'react';
import { StyleSheet, View, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.header}>
          <IconSymbol name="sparkles" size={60} color="#1D3D47" />
          <ThemedText type="title" style={styles.title}>About SnapTest</ThemedText>
          <ThemedText style={styles.version}>v1.0.0</ThemedText>
        </View>
        <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
        <ThemedText style={styles.body}>
          SnapTest empowers students to learn smarter by instantly generating practice questions from any textbook page, document, or pasted text. Our mission is to make exam prep accessible, interactive, and AI-powered for everyone.
        </ThemedText>
        <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>
        <View style={styles.featureList}>
          <ThemedText style={styles.featureItem}>• Snap a photo or upload a file to extract text</ThemedText>
          <ThemedText style={styles.featureItem}>• Generate objective (MCQ) and theory questions with AI</ThemedText>
          <ThemedText style={styles.featureItem}>• Take quizzes and track your scores</ThemedText>
          <ThemedText style={styles.featureItem}>• Save, review, and manage your question sets</ThemedText>
          <ThemedText style={styles.featureItem}>• Secure cloud storage with Supabase</ThemedText>
          <ThemedText style={styles.featureItem}>• Modern, intuitive mobile experience</ThemedText>
        </View>
        <ThemedText style={styles.sectionTitle}>Credits</ThemedText>
        <ThemedText style={styles.body}>
          SnapTest is built by passionate educators and developers. Powered by Fireworks AI for question generation and Supabase for secure data storage.
        </ThemedText>
        <ThemedText style={styles.sectionTitle}>Contact & Support</ThemedText>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@snaptest.app')} style={styles.contactRow}>
          <IconSymbol name="envelope.fill" size={20} color="#1D3D47" />
          <ThemedText style={styles.contactText}>support@snaptest.app</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/your-repo/snaptest')} style={styles.contactRow}>
          <IconSymbol name="link" size={20} color="#1D3D47" />
          <ThemedText style={styles.contactText}>GitHub Repository</ThemedText>
        </TouchableOpacity>
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>© 2024 SnapTest. All rights reserved.</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1D3D47',
  },
  version: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginTop: 18,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  body: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  featureList: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  contactText: {
    fontSize: 16,
    color: '#1D3D47',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#888',
  },
}); 