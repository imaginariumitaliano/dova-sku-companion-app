import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useContent } from '../context/ContentContext';
import { colors } from '../theme/colors';
import { Book } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookSelection'>;
};

export default function BookSelectionScreen({ navigation }: Props) {
  const { content, loading, error } = useContent();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate('ChapterList', { bookId: item.id })}
      activeOpacity={0.8}
    >
      {item.coverImage ? (
        <Image
          source={{ uri: item.coverImage }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverPlaceholderIcon}>Book</Text>
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.bookSubtitle}>{item.subtitle}</Text>
        )}
        <Text style={styles.chapterCount}>
          {item.chapters.length} chapter{item.chapters.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Book</Text>
      {error && (
        <Text style={styles.errorText}>Using offline content</Text>
      )}
      <FlatList
        data={content?.books ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderBook}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    padding: 20,
    paddingBottom: 8,
  },
  errorText: {
    color: colors.amber,
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  coverImage: {
    width: 90,
    height: 130,
  },
  coverPlaceholder: {
    width: 90,
    height: 130,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderIcon: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  bookInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  bookTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  chapterCount: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
