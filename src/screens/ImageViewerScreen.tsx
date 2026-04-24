import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore — react-native-image-zoom-viewer lacks React 19 compatible types
import ImageViewer from 'react-native-image-zoom-viewer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useContent } from '../context/ContentContext';
import { useBookmarks } from '../context/BookmarkContext';
import { colors } from '../theme/colors';


type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ImageViewer'>;
  route: RouteProp<RootStackParamList, 'ImageViewer'>;
};

interface ChapterEntry {
  number: number;
  title: string;
  startIndex: number;
}

export default function ImageViewerScreen({ navigation, route }: Props) {
  const { bookId, startIndex } = route.params;
  const { getFlatImages, getBook } = useContent();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const flatImages = getFlatImages(bookId);
  const bookTitle = getBook(bookId)?.title ?? '';

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [viewerKey, setViewerKey] = useState(0);
  const [viewerStartIndex, setViewerStartIndex] = useState(startIndex);
  const [menuVisible, setMenuVisible] = useState(false);

  const current = flatImages[currentIndex];

  // Build chapter index once
  const chapters = useMemo<ChapterEntry[]>(() => {
    const result: ChapterEntry[] = [];
    flatImages.forEach((img, idx) => {
      if (result.length === 0 || result[result.length - 1].number !== img.chapterNumber) {
        result.push({ number: img.chapterNumber, title: img.chapterTitle, startIndex: idx });
      }
    });
    return result;
  }, [flatImages]);

  useEffect(() => {
    if (current) {
      navigation.setOptions({ title: `Chapter ${current.chapterNumber}` });
    }
  }, [current, navigation]);

  const jumpToChapter = (startIdx: number) => {
    setMenuVisible(false);
    setViewerStartIndex(startIdx);
    setCurrentIndex(startIdx);
    setViewerKey((k) => k + 1);
  };

  if (!current) return null;

  const bookmarkId = `${bookId}-${current.globalIndex}`;
  const bookmarked = isBookmarked(bookmarkId);

  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(bookmarkId);
    } else {
      addBookmark({
        id: bookmarkId,
        bookId,
        bookTitle,
        chapterNumber: current.chapterNumber,
        chapterTitle: current.chapterTitle,
        imageUrl: current.url,
        imageDescription: current.description,
        globalIndex: current.globalIndex,
        savedAt: Date.now(),
      });
    }
  };

  const imageUrls = flatImages.map((img) => ({ url: img.url }));
  const activeChapterNumber = current.chapterNumber;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen image viewer */}
      <View key={viewerKey} style={styles.viewerContainer}>
        <ImageViewer
          imageUrls={imageUrls}
          index={viewerStartIndex}
          onChange={(index?: number) => setCurrentIndex(index ?? 0)}
          backgroundColor={colors.background}
          enableSwipeDown={false}
          renderIndicator={() => <View />}
          renderImage={(props: any) => (
            <Image {...props} resizeMode="cover" />
          )}
          loadingRender={() => (
            <ActivityIndicator size="large" color={colors.accent} />
          )}
        />
      </View>

      {/* Header overlay */}
      <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
        <View style={styles.chapterBadge}>
          <View style={styles.badgeRow}>
            <Text style={styles.chapterLabel}>
              Chapter {current.chapterNumber} · {current.chapterTitle}
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.jumpButton}
                onPress={toggleBookmark}
                activeOpacity={0.75}
              >
                <Text style={[styles.jumpButtonIcon, bookmarked && styles.bookmarkedIcon]}>
                  {bookmarked ? '★' : '☆'}
                </Text>
                <Text style={styles.jumpButtonLabel}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.jumpButton}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.jumpButtonIcon}>☰</Text>
                <Text style={styles.jumpButtonLabel}>Chapters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Footer overlay */}
      <SafeAreaView style={styles.footerOverlay} pointerEvents="none">
        <View style={styles.footer}>
          {current.description && (
            <Text style={styles.imageDescription}>{current.description}</Text>
          )}
          <Text style={styles.hint}>Swipe to navigate · Pinch to zoom</Text>
        </View>
      </SafeAreaView>

      {/* Chapter jump modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <SafeAreaView style={styles.menuSheet}>
            <View style={styles.menuHandle} />
            <Text style={styles.menuTitle}>Jump to Chapter</Text>
            <FlatList
              data={chapters}
              keyExtractor={(item) => String(item.number)}
              renderItem={({ item }) => {
                const isActive = item.number === activeChapterNumber;
                return (
                  <TouchableOpacity
                    style={[styles.chapterRow, isActive && styles.chapterRowActive]}
                    onPress={() => jumpToChapter(item.startIndex)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chapterRowNumber, isActive && styles.chapterRowNumberActive]}>
                      Ch {item.number}
                    </Text>
                    <Text
                      style={[styles.chapterRowTitle, isActive && styles.chapterRowTitleActive]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {isActive && <Text style={styles.activeIndicator}>●</Text>}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  viewerContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  footerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  chapterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(5, 7, 16, 0.75)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chapterLabel: {
    flex: 1,
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginRight: 12,
  },
  imageDescription: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  jumpButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 62,
  },
  bookmarkedIcon: {
    color: colors.accent,
  },
  jumpButtonIcon: {
    color: colors.accent,
    fontSize: 16,
    marginBottom: 2,
  },
  jumpButtonLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: 'rgba(5, 7, 16, 0.75)',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  menuSheet: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: 8,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  menuTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  chapterRowActive: {
    backgroundColor: 'rgba(255, 107, 44, 0.08)',
  },
  chapterRowNumber: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    width: 44,
    textTransform: 'uppercase',
  },
  chapterRowNumberActive: {
    color: colors.accent,
  },
  chapterRowTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  chapterRowTitleActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  activeIndicator: {
    color: colors.accent,
    fontSize: 8,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginLeft: 20,
  },
});
