/**
 * Helium Applications - Login Screen
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/components/LoginScreen';
import HomeScreen from './src/components/HomeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [displayName, setDisplayName] = React.useState<string | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {displayName ? (
        
      <HomeScreen displayName={displayName} onLogout={() => setDisplayName(null)} />
        
      ) : (
        <LoginScreen onAuthenticated={setDisplayName} />
        // 
      )}
    </SafeAreaProvider>
  );
}

export default App;
