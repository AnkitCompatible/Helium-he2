/**
 * Helium Applications - Login Screen
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/components/LoginScreen';
import HomeScreen from './src/components/HomeScreen';
import BusinessSolutionsScreen from './src/components/BusinessSolutionsScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [displayName, setDisplayName] = React.useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = React.useState<'login' | 'business' | 'home'>('login');
  const [initialMessage, setInitialMessage] = React.useState<string>('');

  const handleAuthenticated = (name: string) => {
    setDisplayName(name);
    setCurrentScreen('business');
  };

  const handleNavigateToHome = (message?: string) => {
    if (message) {
      setInitialMessage(message);
    }
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setDisplayName(null);
    setCurrentScreen('login');
  };

  const handleBack = () => {
    setCurrentScreen('login');
  };

  const handleBackFromHome = () => {
    setCurrentScreen('business');
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {currentScreen === 'login' && (
        <LoginScreen onAuthenticated={handleAuthenticated} />
      )}
      {currentScreen === 'business' && displayName && (
        <BusinessSolutionsScreen 
          displayName={displayName} 
          onNavigateToHome={handleNavigateToHome}
          onLogout={handleLogout}
          onBack={handleBack}
        />
      )}
      {currentScreen === 'home' && displayName && (
        <HomeScreen 
          displayName={displayName} 
          onLogout={handleLogout} 
          onBack={handleBackFromHome}
          initialMessage={initialMessage}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
