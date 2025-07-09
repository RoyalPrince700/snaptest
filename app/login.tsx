import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { supabaseService } from '@/services/supabase';
import { Ionicons } from '@expo/vector-icons';

const BRAND_BLUE = '#1877F2';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabaseService.supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        Alert.alert('Error', error.message || 'Invalid credentials.');
        return;
      }
      router.replace('/');
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: BRAND_BLUE }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topSection}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>SnapTest</Text>
      </View>
      <View style={styles.formCard}>
        <Text style={styles.welcome}>Welcome back</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0AEC0"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#A0AEC0" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? 'Logging In...' : 'LOG IN'}</Text>
        </TouchableOpacity>
        <View style={styles.linksRow}>
          <Text style={styles.secondaryText}>Not registered? </Text>
          <Pressable onPress={() => router.push('/signup')}><Text style={styles.link}>Sign up</Text></Pressable>
        </View>
        <Pressable onPress={() => {/* forgot password logic */}}>
          <Text style={styles.link}>Forgot Password?</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  topSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: BRAND_BLUE,
    paddingTop: 80,
    paddingBottom: 32,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  appName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    flex: 1,
    alignItems: 'center',
    marginTop: -16,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    color: '#222',
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    maxWidth: 340,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F8FAFB',
    color: '#222',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    marginBottom: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  loginButton: {
    backgroundColor: BRAND_BLUE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    marginBottom: 18,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryText: {
    color: '#888',
    fontSize: 15,
  },
  link: {
    color: BRAND_BLUE,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 2,
    textDecorationLine: 'underline',
  },
}); 