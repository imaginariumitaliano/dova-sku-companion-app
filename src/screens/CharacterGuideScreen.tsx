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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { CODEX_URL } from '../config';
import { useUnlock, UnlockCondition } from '../hooks/useUnlock';
import { useSpoiler } from '../context/SpoilerContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CharacterGuide'>;
};

type CharacterVersion = {
  unlockAfter: UnlockCondition;
  image: string | null;
  bio: string;
  nicknames?: string[];
};

export type StoryEvent = {
  unlockAfter: UnlockCondition;
  chapterTitle: string;
  event: string;
};

export type Character = {
  id: string;
  name: string;
  nicknames: string[];
  role: string;
  affiliation: string;
  image: string | null;
  bio: string;
  books: string[];
  unlockAfter: UnlockCondition;
  versions?: CharacterVersion[];
  storyEvents?: StoryEvent[];
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 1.25;

export default function CharacterGuideScreen({ navigation }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [spoilerModalVisible, setSpoilerModalVisible] = useState(false);
  const { isUnlocked } = useUnlock();
  const { spoilerMode, enableSpoilerMode } = useSpoiler();

  useEffect(() => {
    fetch(CODEX_URL, { headers: { 'Cache-Control': 'no-cache' } })
      .then((r) => r.json())
      .then((data) => {
        setCharacters(data.characters ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading characters...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load character data.</Text>
      </View>
    );
  }

  // Resolve the current display state for a character (highest unlocked version)
  const resolveCharacter = (char: Character): { image: string | null; bio: string; nicknames: string[] } => {
    if (!char.versions || char.versions.length === 0) {
      return { image: char.image, bio: char.bio, nicknames: char.nicknames };
    }
    let resolved = { image: char.image, bio: char.bio, nicknames: char.nicknames };
    for (const version of char.versions) {
      if (isUnlocked(version.unlockAfter)) {
        resolved = {
          image: version.image,
          bio: version.bio,
          nicknames: version.nicknames ?? resolved.nicknames,
        };
      }
    }
    return resolved;
  };

  const renderCharacter = ({ item }: { item: Character }) => {
    const unlocked = isUnlocked(item.unlockAfter);
    const resolved = resolveCharacter(item);

    if (!unlocked) {
      return (
        <View style={[styles.card, styles.cardLocked]}>
          <View style={[styles.cardImagePlaceholder, styles.cardImageLocked]}>
            <Text style={styles.mysteryIcon}>?</Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={[styles.cardName, styles.lockedText]}>???</Text>
            <Text style={[styles.cardRole, styles.lockedText]}>Keep reading to unlock</Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CharacterDetail', { characterId: item.id })}
        activeOpacity={0.75}
      >
        {resolved.image ? (
          <View style={styles.cardImageContainer}>
            <Image source={{ uri: resolved.image }} style={styles.cardImageInner} resizeMode="cover" />
          </View>
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.placeholderInitial}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.cardMeta}>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.cardRole} numberOfLines={1}>{item.role}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        renderItem={renderCharacter}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No characters found.</Text>}
        ListFooterComponent={
          !spoilerMode ? (
            <TouchableOpacity style={styles.spoilerButton} onPress={() => setSpoilerModalVisible(true)}>
              <Text style={styles.spoilerButtonText}>Reveal All Spoilers</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.spoilerActiveNote}>
              <Text style={styles.spoilerActiveText}>All content visible — spoiler mode on</Text>
            </View>
          )
        }
      />

      <Modal visible={spoilerModalVisible} transparent animationType="fade" onRequestClose={() => setSpoilerModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reveal All Spoilers?</Text>
            <Text style={styles.modalBody}>
              This will show all characters regardless of your reading progress. Character information may reveal major story events you haven't reached yet.{'\n\n'}Are you sure you want to continue?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setSpoilerModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={() => { enableSpoilerMode(); setSpoilerModalVisible(false); }}
              >
                <Text style={styles.modalConfirmText}>Yes, Show Spoilers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { color: colors.textMuted, marginTop: 12, fontSize: 16 },
  errorText: { color: colors.textMuted, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
  list: { padding: 16, paddingBottom: 32 },
  row: { justifyContent: 'space-between', marginBottom: 20 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardLocked: {
    borderColor: colors.cardBorder,
    opacity: 0.5,
  },
  cardImageContainer: { width: CARD_WIDTH, height: CARD_IMAGE_HEIGHT, overflow: 'hidden' },
  cardImageInner: { width: CARD_WIDTH, height: CARD_IMAGE_HEIGHT * 1.15, position: 'absolute', top: 20 },
  cardImagePlaceholder: {
    width: CARD_WIDTH,
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageLocked: {
    backgroundColor: colors.backgroundSecondary,
  },
  mysteryIcon: {
    color: colors.textMuted,
    fontSize: 48,
    fontWeight: '800',
    opacity: 0.4,
  },
  placeholderInitial: { color: colors.accent, fontSize: 40, fontWeight: '800' },
  cardMeta: { padding: 10 },
  cardName: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 3 },
  cardRole: { color: colors.textMuted, fontSize: 11 },
  lockedText: { color: colors.textMuted, opacity: 0.6 },
  emptyText: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: 40 },
  spoilerButton: {
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  spoilerButtonText: { color: colors.textMuted, fontSize: 13 },
  spoilerActiveNote: { marginTop: 8, marginBottom: 16, alignSelf: 'center' },
  spoilerActiveText: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic' },
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
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  modalBody: { color: colors.textPrimary, fontSize: 14, lineHeight: 22, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  modalCancelText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  modalConfirm: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  modalConfirmText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
