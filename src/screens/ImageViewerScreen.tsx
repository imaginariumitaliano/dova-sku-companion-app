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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore — react-native-image-zoom-viewer lacks React 19 compatible types
import ImageViewer from 'react-native-image-zoom-viewer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useContent } from '../context/ContentContext';
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
  const { getFlatImages } = useContent();
  const flatImages = getFlatImages(bookId);

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [viewerKey, setViewerKey] = useState(0);
  const [viewerStartIndex, setViewerStartIndex] = useState(startIndex);
  const [menuVisible, setMenuVisible] = useState(false);

  const current = flatImages[currentIndex];
  const total = flatImages.length;

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

  const imageUrls = flatImages.map((img) => ({ url: img.url }));
  const activeChapterNumber = current.chapterNumber;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Chapter badge + jump button */}
      <View style={styles.chapterBadge}>
        <View style={styles.badgeRow}>
          <View style={styles.badgeMeta}>
            <Text style={styles.chapterLabel}>
              Chapter {current.chapterNumber} · {current.chapterTitle}
            </Text>
            {current.title && (
              <Text style={styles.imageTitle} numberOfLines={1}>
                {current.title}
              </Text>
            )}
            {current.description && (
              <Text style={styles.imageDescription} numberOfLines={2}>
                {current.description}
              </Text>
            )}
          </View>
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

      {/* Zoomable + swipeable image viewer — key forces remount on chapter jump */}
      <View key={viewerKey} style={styles.viewerContainer}>
        <ImageViewer
          imageUrls={imageUrls}
          index={viewerStartIndex}
          onChange={(index?: number) => setCurrentIndex(index ?? 0)}
          backgroundColor={colors.background}
          enableSwipeDown={false}
          renderIndicator={() => <View />}
          loadingRender={() => (
            <ActivityIndicator size="large" color={colors.accent} />
          )}
        />
      </View>

      {/* Progress footer */}
      <View style={styles.footer}>
        <Text style={styles.progress}>{currentIndex + 1} / {total}</Text>
        <Text style={styles.hint}>Swipe to navigate · Pinch to zoom</Text>
      </View>

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
  chapterBadge: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeMeta: {
    flex: 1,
    marginRight: 12,
  },
  chapterLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  imageTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  imageDescription: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  jumpButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 72,
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
  viewerContainer: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.backgroundSecondary,
    gap: 4,
  },
  progress: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
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
