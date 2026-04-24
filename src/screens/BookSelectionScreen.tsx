import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useContent } from '../context/ContentContext';
import { useProgress } from '../context/ProgressContext';
import { colors } from '../theme/colors';
import { Book } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookSelection'>;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COVER_WIDTH = (SCREEN_WIDTH - 48) / 2;
const COVER_HEIGHT = COVER_WIDTH * 1.5;

export default function BookSelectionScreen({ navigation }: Props) {
  const { content, loading, error } = useContent();
  const { getReadChapters } = useProgress();
  const [howToVisible, setHowToVisible] = useState(false);
  const [bgWidth, setBgWidth] = useState(SCREEN_WIDTH);
  const insets = useSafeAreaInsets();

  const BG_URL = 'https://raw.githubusercontent.com/imaginariumitaliano/dova-sku-companion-content/main/images/companion_app_background.png';

  useEffect(() => {
    Image.getSize(BG_URL, (w, h) => {
      setBgWidth(SCREEN_HEIGHT * (w / h));
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const renderBook = ({ item }: { item: Book }) => {
    const totalChapters = item.chapters.length;
    const readCount = getReadChapters(item.id).length;
    const progressPct = totalChapters > 0 ? readCount / totalChapters : 0;

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate('ChapterList', { bookId: item.id })}
        activeOpacity={0.75}
      >
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.cover} resizeMode="cover" />
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
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{readCount} / {totalChapters} ch</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const books = content?.books ?? [];

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: BG_URL }}
        style={{ position: 'absolute', top: 0, left: 0, height: SCREEN_HEIGHT, width: bgWidth }}
      />
      <View style={styles.header}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.headerTitleLine}>
          <Text style={styles.seriesLabel}>The Dova Sku Series </Text>
          <Text style={styles.headerTitle}>Book Companion</Text>
        </Text>
        {error && (
          <Text style={styles.offlineNote}>Offline mode</Text>
        )}
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.howToButton} onPress={() => setHowToVisible(true)}>
            <Text style={styles.howToButtonText}>How To Use</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.howToButton}
            onPress={() => navigation.navigate('Bookmarks')}
          >
            <Text style={styles.howToButtonText}>Bookmarks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.characterGuideButton}
            onPress={() => navigation.navigate('CharacterGuide')}
          >
            <Text style={styles.characterGuideButtonText}>Character Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.howToButton}
            onPress={() => navigation.navigate('Timeline')}
          >
            <Text style={styles.howToButtonText}>Timeline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.howToButton}
            onPress={() => navigation.navigate('Worlds')}
          >
            <Text style={styles.howToButtonText}>Worlds</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.howToButton}
            onPress={() => navigation.navigate('Glossary')}
          >
            <Text style={styles.howToButtonText}>Codex</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.howToButton}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={styles.howToButtonText}>The Author</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={howToVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHowToVisible(false)}
      >
        <View style={[styles.modalOverlay, { paddingTop: insets.top + 16 }]}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalText}>
                This app is designed to be used alongside the books or audiobooks of The Dova Sku Series. Select the book you are currently reading, then browse its chapters to view companion artwork and imagery.
              </Text>
              <Text style={styles.modalText}>
                📖  Viewing Images{'\n'}Swipe left and right to move between images within a chapter. Pinch to zoom in on any image for a closer look. Tap the Chapters button to jump directly to any chapter.
              </Text>
              <Text style={styles.modalText}>
                ★  Bookmarks{'\n'}While viewing any image, tap the star button to save it to your Bookmarks. Access all saved images anytime from the Bookmarks button on the home screen.
              </Text>
              <Text style={styles.modalText}>
                ✓  Reading Progress{'\n'}On the chapter list for any book, tap the circle on the right side of a chapter to mark it as read. Chapters must be completed in order — you can only mark a chapter as read after finishing the one before it, and unmark it if the next chapter hasn't been read yet. Your overall progress is tracked with a bar at the top of the chapter list and on each book card.
              </Text>
              <Text style={styles.modalText}>
                🔒  Unlocking Content{'\n'}As you mark chapters complete, hidden entries in the Character Guide, Codex, and Timeline are automatically revealed. Characters, lore entries, and timeline events are unlocked at the chapter where they become relevant — so the app grows with your reading progress and avoids spoilers. Entries you haven't reached yet appear as "???" placeholders.
              </Text>
              <Text style={styles.modalText}>
                Character Guide{'\n'}Browse profiles for every major character in the series — including their role, affiliation, biography, and which books they appear in. New characters unlock as you reach them in the story.
              </Text>
              <Text style={styles.modalText}>
                Codex{'\n'}Explore the universe of The Dova Sku Series. The Codex covers Species, Planets & Locations, Ships & Vehicles, Technology, Weapons & Armor, Creatures, Concepts, History, and Organizations. Tap any section header to expand it, or use the search bar to find a specific entry. Entries unlock as you read.
              </Text>
              <Text style={styles.modalText}>
                Timeline{'\n'}Follow the full chronological history of the series — from the ancient galaxy to the present conflict. Timeline events unlock as you reach the relevant chapters.
              </Text>
              <Text style={styles.modalText}>
                Reveal All Spoilers{'\n'}At the bottom of the Character Guide, Codex, and Timeline screens, you'll find a "Reveal All Spoilers" button. Tapping it will unlock all hidden content regardless of your reading progress. This cannot be undone, so use it only if you don't mind seeing content from chapters you haven't read yet.
              </Text>
              <Text style={styles.modalText}>
                Disclaimer: All images were created using a combination of paid digital artwork, artificially generated images, and editing in Photoshop.
              </Text>
              <Text style={styles.modalText}>
                Check back often for more updates!
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setHowToVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
        ListFooterComponent={
          <View style={styles.row}>
            <View style={[styles.bookCard, styles.comingSoonCard]}>
              <View style={styles.comingSoonCover}>
                <View style={styles.comingSoonBannerWrap}>
                  <Text style={styles.comingSoonBannerText}>Coming Soon</Text>
                </View>
              </View>
              <View style={styles.bookMeta}>
                <Text style={styles.bookTitle} numberOfLines={2}>TBD The Dova Sku Series - Book 3</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '0%' }]} />
                </View>
                <Text style={styles.progressLabel}>0 / TBD ch</Text>
              </View>
            </View>
            <View style={{ width: COVER_WIDTH }} />
          </View>
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
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerTitleLine: {
    fontSize: 26,
    fontWeight: '800',
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
  headerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    justifyContent: 'center',
  },
  howToButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  howToButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  characterGuideButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  characterGuideButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  closeButton: {
    marginTop: 4,
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  comingSoonCard: {
    opacity: 0.85,
  },
  comingSoonCover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    backgroundColor: '#3a3a3a',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonBannerWrap: {
    position: 'absolute',
    top: COVER_HEIGHT * 0.28,
    left: -COVER_WIDTH * 0.2,
    width: COVER_WIDTH * 1.4,
    backgroundColor: colors.accent,
    paddingVertical: 8,
    alignItems: 'center',
    transform: [{ rotate: '-35deg' }],
  },
  comingSoonBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
