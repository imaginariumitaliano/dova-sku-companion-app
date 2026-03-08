import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import BookSelectionScreen from '../screens/BookSelectionScreen';
import ChapterListScreen from '../screens/ChapterListScreen';
import ImageViewerScreen from '../screens/ImageViewerScreen';

export type RootStackParamList = {
  BookSelection: undefined;
  ChapterList: { bookId: string };
  ImageViewer: { bookId: string; startIndex: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.backgroundSecondary },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="BookSelection"
          component={BookSelectionScreen}
          options={{ title: 'Book Companion' }}
        />
        <Stack.Screen
          name="ChapterList"
          component={ChapterListScreen}
          options={{ title: 'Chapters' }}
        />
        <Stack.Screen
          name="ImageViewer"
          component={ImageViewerScreen}
          options={{ title: '' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
