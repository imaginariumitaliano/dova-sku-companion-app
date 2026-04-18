import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import BookSelectionScreen from '../screens/BookSelectionScreen';
import ChapterListScreen from '../screens/ChapterListScreen';
import ImageViewerScreen from '../screens/ImageViewerScreen';
import CharacterGuideScreen from '../screens/CharacterGuideScreen';
import CharacterDetailScreen from '../screens/CharacterDetailScreen';
import GlossaryScreen from '../screens/GlossaryScreen';
import GlossaryDetailScreen from '../screens/GlossaryDetailScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import AboutScreen from '../screens/AboutScreen';
import TimelineScreen from '../screens/TimelineScreen';
import WorldsScreen from '../screens/WorldsScreen';

export type RootStackParamList = {
  BookSelection: undefined;
  ChapterList: { bookId: string };
  ImageViewer: { bookId: string; startIndex: number };
  CharacterGuide: undefined;
  CharacterDetail: { characterId: string };
  Glossary: undefined;
  GlossaryDetail: { category: string; itemId: string };
  Bookmarks: undefined;
  About: undefined;
  Timeline: undefined;
  Worlds: undefined;
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
        <Stack.Screen
          name="CharacterGuide"
          component={CharacterGuideScreen}
          options={{ title: 'Character Guide' }}
        />
        <Stack.Screen
          name="CharacterDetail"
          component={CharacterDetailScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="Glossary"
          component={GlossaryScreen}
          options={{ title: 'Codex' }}
        />
        <Stack.Screen
          name="GlossaryDetail"
          component={GlossaryDetailScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{ title: 'Bookmarks' }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: 'About the Author' }}
        />
        <Stack.Screen
          name="Timeline"
          component={TimelineScreen}
          options={{ title: 'Series Timeline' }}
        />
        <Stack.Screen
          name="Worlds"
          component={WorldsScreen}
          options={{ title: 'Worlds' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
