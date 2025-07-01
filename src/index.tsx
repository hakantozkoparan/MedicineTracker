import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation';
import { theme } from './styles/theme';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent={false} backgroundColor="#FFFFFF" />
      <PaperProvider theme={theme as any}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

// Ana uygulama bileşenini kaydet
registerRootComponent(App); 