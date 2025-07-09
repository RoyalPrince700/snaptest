import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';
import { supabaseService } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext } from 'react';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

export type ThemePreference = 'light' | 'dark' | 'system';
interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}
const ThemeContext = createContext<ThemeContextType>({ theme: 'system', setTheme: () => {} });
export const useThemePreference = () => useContext(ThemeContext);

export const CustomDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: '#181A20', // not pure black
    card: '#23262F',       // lighter than background for cards
    primary: '#4F8EF7',    // accent color
    text: '#F3F6FA',       // off-white for text
    border: '#23262F',
    notification: '#4F8EF7',
  },
};

export const CustomLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    // You can customize light theme here if desired
  },
};

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const user = await supabaseService.getCurrentUser();
      setIsAuthenticated(!!user);
      // Load theme preference
      const stored = await AsyncStorage.getItem('themePreference');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setTheme(stored);
      }
    })();
  }, [pathname]);

  const handleSetTheme = async (t: ThemePreference) => {
    setTheme(t);
    await AsyncStorage.setItem('themePreference', t);
  };

  if (!loaded) {
    return null;
  }

  // Only show TabBar on main app screens and if authenticated
  // (No longer needed, handled by Expo Tabs)

  // Determine which theme to use
  const effectiveColorScheme = theme === 'system' ? systemColorScheme : theme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      <ThemeProvider value={effectiveColorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false
              }} 
            />
            <Stack.Screen 
              name="upload" 
              options={{ 
                title: 'Upload Content',
                headerShown: true,
                headerBackTitle: 'Back'
              }} 
            />
            <Stack.Screen 
              name="questions" 
              options={{ 
                title: 'My Questions',
                headerShown: true,
                headerBackTitle: 'Back'
              }} 
            />
            <Stack.Screen 
              name="question-detail" 
              options={{ 
                title: 'Question Details',
                headerShown: true,
                headerBackTitle: 'Back'
              }} 
            />
            <Stack.Screen 
              name="quiz" 
              options={{ 
                title: 'Quiz',
                headerShown: false
              }} 
            />
            <Stack.Screen name="signup" options={{ title: 'Sign Up', headerShown: true, headerBackTitle: 'Back' }} />
            <Stack.Screen name="login" options={{ title: 'Log In', headerShown: true, headerBackTitle: 'Back' }} />
            <Stack.Screen name="settings" options={{ title: 'Settings', headerShown: true, headerBackTitle: 'Back' }} />
            <Stack.Screen name="about" options={{ title: 'About SnapTest', headerShown: true, headerBackTitle: 'Back' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
