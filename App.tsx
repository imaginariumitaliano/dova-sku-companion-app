import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContentProvider } from './src/context/ContentContext';
import { BookmarkProvider } from './src/context/BookmarkContext';
import { ProgressProvider } from './src/context/ProgressContext';
import { SpoilerProvider } from './src/context/SpoilerContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ContentProvider>
        <BookmarkProvider>
          <ProgressProvider>
            <SpoilerProvider>
              <AppNavigator />
            </SpoilerProvider>
          </ProgressProvider>
        </BookmarkProvider>
      </ContentProvider>
    </SafeAreaProvider>
  );
}
