import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useContent } from '../context/ContentContext';
import { colors } from '../theme/colors';
import { Chapter } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChapterList'>;
  route: RouteProp<RootStackParamList, 'ChapterList'>;
};

export default function ChapterListScreen({ navigation, route }: Props) {
  const { bookId } = route.params;
  const { getBook, getFlatImages } = useContent();
  const book = getBook(bookId);

  if (!book) return null;

  const flatImages = getFlatImages(bookId);

  const getChapterStartIndex = (chapterNumber: number) =>
    flatImages.findIndex((img) => img.chapterNumber === chapterNumber);

  const renderChapter = ({ item }: { item: Chapter }) => {
    const startIndex = getChapterStartIndex(item.number);
    const thumbnail = item.images[0]?.url;

    return (
      <TouchableOpacity
        style={styles.chapterCard}
        onPress={() =>
          navigation.navigate('ImageViewer', { bookId, startIndex })
        }
        activeOpacity={0.8}
      >
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.chapterInfo}>
          <Text style={styles.chapterNumber}>Chapter {item.number}</Text>
          <Text style={styles.chapterTitle}>{item.title}</Text>
          <Text style={styles.imageCount}>
            {item.images.length} image{item.images.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.bookLabel}>{book.title}</Text>
      <FlatList
        data={book.chapters}
        keyExtractor={(item) => String(item.number)}
        renderItem={renderChapter}
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
  bookLabel: {
    color: colors.textMuted,
    fontSize: 13,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  list: {
    padding: 16,
  },
  chapterCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  chapterInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  chapterNumber: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  chapterTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  imageCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
