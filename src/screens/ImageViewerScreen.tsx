import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useContent } from '../context/ContentContext';
import { colors } from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ImageViewer'>;
  route: RouteProp<RootStackParamList, 'ImageViewer'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ImageViewerScreen({ navigation, route }: Props) {
  const { bookId, startIndex } = route.params;
  const { getFlatImages } = useContent();
  const flatImages = getFlatImages(bookId);

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [imageLoading, setImageLoading] = useState(true);

  const current = flatImages[currentIndex];
  const total = flatImages.length;

  useEffect(() => {
    if (current) {
      navigation.setOptions({
        title: `Chapter ${current.chapterNumber}`,
      });
    }
  }, [current, navigation]);

  // Reset loading state when image changes
  useEffect(() => {
    setImageLoading(true);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  if (!current) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

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

      {/* Image */}
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        )}
        <Image
          source={{ uri: current.url }}
          style={styles.image}
          resizeMode="contain"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navButton, isFirst && styles.navButtonDisabled]}
          onPress={goPrev}
          disabled={isFirst}
          activeOpacity={0.7}
        >
          <Text style={[styles.navButtonText, isFirst && styles.navButtonTextDisabled]}>
            Prev
          </Text>
        </TouchableOpacity>

        <Text style={styles.progress}>
          {currentIndex + 1} / {total}
        </Text>

        <TouchableOpacity
          style={[styles.navButton, isLast && styles.navButtonDisabled]}
          onPress={goNext}
          disabled={isLast}
          activeOpacity={0.7}
        >
          <Text style={[styles.navButtonText, isLast && styles.navButtonTextDisabled]}>
            Next
          </Text>
        </TouchableOpacity>
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
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.backgroundSecondary,
  },
  navButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: colors.card,
  },
  navButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  navButtonTextDisabled: {
    color: colors.textMuted,
  },
  progress: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
