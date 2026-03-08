import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useContent } from '../context/ContentContext';
import { colors } from '../theme/colors';
import { Book } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookSelection'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_WIDTH = (SCREEN_WIDTH - 48) / 2;
const COVER_HEIGHT = COVER_WIDTH * 1.5;

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
      activeOpacity={0.75}
    >
      {item.coverImage ? (
        <Image
          source={{ uri: item.coverImage }}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.placeholderLabel}>No Cover</Text>
        </View>
      )}
      <View style={styles.bookMeta}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.bookSubtitle} numberOfLines={2}>{item.subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const books = content?.books ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.seriesLabel}>The Dova Sku Series</Text>
        <Text style={styles.headerTitle}>Book Companion</Text>
        {error && (
          <Text style={styles.offlineNote}>Offline mode</Text>
        )}
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderBook}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No books available.</Text>
        }
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  seriesLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  offlineNote: {
    color: colors.amber,
    fontSize: 12,
    marginTop: 6,
  },
  list: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bookCard: {
    width: COVER_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
  },
  coverPlaceholder: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  bookMeta: {
    padding: 10,
  },
  bookTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  bookSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
  },
});
