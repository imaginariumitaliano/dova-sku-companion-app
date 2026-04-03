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
import { useProgress } from '../context/ProgressContext';
import { colors } from '../theme/colors';
import { Chapter } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChapterList'>;
  route: RouteProp<RootStackParamList, 'ChapterList'>;
};

export default function ChapterListScreen({ navigation, route }: Props) {
  const { bookId } = route.params;
  const { getBook, getFlatImages } = useContent();
  const { isRead, toggleRead, canMarkRead, canMarkUnread } = useProgress();
  const book = getBook(bookId);

  if (!book) return null;

  const flatImages = getFlatImages(bookId);
  const totalChapters = book.chapters.length;
  const readCount = book.chapters.filter((c) => isRead(bookId, c.number)).length;
  const progressPct = totalChapters > 0 ? readCount / totalChapters : 0;

  const getChapterStartIndex = (chapterNumber: number) =>
    flatImages.findIndex((img) => img.chapterNumber === chapterNumber);

  const renderChapter = ({ item }: { item: Chapter }) => {
    const startIndex = getChapterStartIndex(item.number);
    const thumbnail = item.images[0]?.url;
    const read = isRead(bookId, item.number);
    const canRead = canMarkRead(bookId, item.number);
    const canUnread = canMarkUnread(bookId, item.number);
    const checkDisabled = read ? !canUnread : !canRead;

    return (
      <TouchableOpacity
        style={[styles.chapterCard, read && styles.chapterCardRead]}
        onPress={() => navigation.navigate('ImageViewer', { bookId, startIndex })}
        activeOpacity={0.8}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} resizeMode="cover" />
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
        <TouchableOpacity
          style={[styles.checkButton, read && styles.checkButtonRead, checkDisabled && styles.checkButtonDisabled]}
          onPress={() => toggleRead(bookId, item.number)}
          disabled={checkDisabled}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.checkIcon, read && styles.checkIconRead, checkDisabled && styles.checkIconDisabled]}>
            {read ? '✓' : '○'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressHeader}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.bookLabel}>{book.title}</Text>
          <Text style={styles.progressCount}>{readCount} / {totalChapters} chapters read</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
        </View>
      </View>
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
  progressHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  progressCount: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  list: {
    padding: 16,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chapterCardRead: {
    borderColor: 'rgba(255, 107, 44, 0.3)',
    backgroundColor: 'rgba(255, 107, 44, 0.04)',
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
  checkButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 12,
  },
  checkButtonRead: {},
  checkButtonDisabled: {
    opacity: 0.3,
  },
  checkIcon: {
    fontSize: 22,
    color: colors.textMuted,
  },
  checkIconRead: {
    color: colors.accent,
  },
  checkIconDisabled: {
    color: colors.textMuted,
  },
});
