import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContentProvider } from './src/context/ContentContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ContentProvider>
        <AppNavigator />
      </ContentProvider>
    </SafeAreaProvider>
  );
}
