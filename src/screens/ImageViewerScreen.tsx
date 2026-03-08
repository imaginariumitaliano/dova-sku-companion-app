import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
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

export default function ImageViewerScreen({ navigation, route }: Props) {
  const { bookId, startIndex } = route.params;
  const { getFlatImages } = useContent();
  const flatImages = getFlatImages(bookId);

  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const current = flatImages[currentIndex];
  const total = flatImages.length;

  useEffect(() => {
    if (current) {
      navigation.setOptions({
        title: `Chapter ${current.chapterNumber}`,
      });
    }
  }, [current, navigation]);

  if (!current) return null;

  const imageUrls = flatImages.map((img) => ({ url: img.url }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Chapter label */}
      <View style={styles.chapterBadge}>
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

      {/* Zoomable + swipeable image viewer */}
      <View style={styles.viewerContainer}>
        <ImageViewer
          imageUrls={imageUrls}
          index={startIndex}
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
        <Text style={styles.progress}>
          {currentIndex + 1} / {total}
        </Text>
        <Text style={styles.hint}>Swipe to navigate · Pinch to zoom</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chapterBadge: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
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
});
