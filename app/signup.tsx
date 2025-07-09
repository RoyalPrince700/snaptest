import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { supabaseService } from '@/services/supabase';
import { Ionicons } from '@expo/vector-icons';

const BRAND_BLUE = '#1877F2';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const { data: userData } = await supabaseService.supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();
      if (userData) {
        setLoading(false);
        Alert.alert('Error', 'Username already taken.');
        return;
      }
      const { data, error } = await supabaseService.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
      if (error) {
        setLoading(false);
        if (error.message.includes('already registered')) {
          Alert.alert('Error', 'Email already registered.');
        } else {
          Alert.alert('Error', error.message);
        }
        return;
      }
      const user = data.user;
      if (user) {
        await supabaseService.supabase
          .from('user_profiles')
          .insert({ id: user.id, username, email });
        Alert.alert('Welcome', `Welcome, ${username}!`, [
          { text: 'Continue', onPress: () => router.replace('/') }
        ]);
        setLoading(false);
        return;
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Signup failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: BRAND_BLUE }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topSection}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>SnapTest</Text>
      </View>
      <View style={styles.formCard}>
        <Text style={styles.welcome}>Create your account</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0AEC0"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#A0AEC0"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
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
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
          <Text style={styles.signupButtonText}>{loading ? 'Signing Up...' : 'SIGN UP'}</Text>
        </TouchableOpacity>
        <View style={styles.linksRow}>
          <Text style={styles.secondaryText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/login')}><Text style={styles.link}>Log In</Text></Pressable>
        </View>
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
  signupButton: {
    backgroundColor: BRAND_BLUE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    marginBottom: 18,
  },
  signupButtonText: {
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