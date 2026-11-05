import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useBookmarks, Bookmark } from '../context/BookmarkContext';
import { colors } from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Bookmarks'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 1.25;

export default function BookmarksScreen({ navigation }: Props) {
  const { bookmarks, removeBookmark } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>☆</Text>
        <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the star icon while viewing an image to save it here.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Bookmark }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ImageViewer', { bookId: item.bookId, startIndex: item.globalIndex })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
      </TouchableOpacity>
      <View style={styles.cardMeta}>
        <Text style={styles.cardBook} numberOfLines={1}>{item.bookTitle}</Text>
        <Text style={styles.cardChapter} numberOfLines={1}>
          Ch {item.chapterNumber} · {item.chapterTitle}
        </Text>
        {item.imageDescription ? (
          <Text style={styles.cardDescription} numberOfLines={2}>{item.imageDescription}</Text>
        ) : null}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => removeBookmark(item.id)}>
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.accent,
    marginBottom: 16,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_IMAGE_HEIGHT,
  },
  cardMeta: {
    padding: 8,
    paddingBottom: 4,
  },
  cardBook: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardChapter: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  deleteIcon: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
