import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { CODEX_URL } from '../config';
import { Character, StoryEvent } from './CharacterGuideScreen';
import { useUnlock } from '../hooks/useUnlock';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CharacterDetail'>;
  route: RouteProp<RootStackParamList, 'CharacterDetail'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.85;

export default function CharacterDetailScreen({ route, navigation }: Props) {
  const { characterId } = route.params;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isUnlocked } = useUnlock();

  useEffect(() => {
    fetch(CODEX_URL)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.characters ?? []).find((c: Character) => c.id === characterId);
        setCharacter(found ?? null);
        setLoading(false);
        if (found) {
          navigation.setOptions({ title: found.name.split(' ').slice(-1)[0] });
        }
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [characterId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !character) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Character not found.</Text>
      </View>
    );
  }

  // Resolve highest unlocked version
  let displayImage = character.image;
  let displayBio = character.bio;
  if (character.versions && character.versions.length > 0) {
    for (const version of character.versions) {
      if (isUnlocked(version.unlockAfter)) {
        displayImage = version.image;
        displayBio = version.bio;
      }
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {displayImage ? (
        <View style={styles.portraitContainer}>
          <Image source={{ uri: displayImage }} style={styles.portrait} resizeMode="cover" />
        </View>
      ) : (
        <View style={styles.portraitPlaceholder}>
          <Text style={styles.placeholderInitial}>{character.name.charAt(0)}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.name}>{character.name}</Text>

        {character.nicknames.length > 0 && (
          <Text style={styles.nicknames}>
            "{character.nicknames.join('" · "')}"
          </Text>
        )}

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Role</Text>
            <Text style={styles.metaValue}>{character.role}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Affiliation</Text>
            <Text style={styles.metaValue}>{character.affiliation}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.bioHeader}>Biography</Text>
        <Text style={styles.bio}>{displayBio}</Text>

        <View style={styles.divider} />

        <Text style={styles.metaLabel}>Appears In</Text>
        <View style={styles.bookTags}>
          {character.books.map((book) => (
            <View key={book} style={styles.bookTag}>
              <Text style={styles.bookTagText}>{book}</Text>
            </View>
          ))}
        </View>

        {character.storyEvents && character.storyEvents.filter((e: StoryEvent) => isUnlocked(e.unlockAfter)).length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.bioHeader}>Story Events</Text>
            {character.storyEvents
              .filter((e: StoryEvent) => isUnlocked(e.unlockAfter))
              .map((e: StoryEvent, i: number) => (
                <View key={i} style={styles.storyEvent}>
                  <Text style={styles.storyEventTitle}>{e.chapterTitle}</Text>
                  <Text style={styles.storyEventText}>{e.event}</Text>
                </View>
              ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.textMuted, fontSize: 15 },
  portraitContainer: { width: SCREEN_WIDTH, height: IMAGE_HEIGHT, overflow: 'hidden' },
  portrait: { width: SCREEN_WIDTH, height: IMAGE_HEIGHT * 1.5, position: 'absolute', top: 0 },
  portraitPlaceholder: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInitial: { color: colors.accent, fontSize: 72, fontWeight: '800' },
  body: { padding: 20 },
  name: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  nicknames: { color: colors.accent, fontSize: 14, fontStyle: 'italic', marginBottom: 4 },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 16 },
  metaRow: { flexDirection: 'row', gap: 20 },
  metaItem: { flex: 1 },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  metaValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  bioHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  bio: { color: colors.textPrimary, fontSize: 15, lineHeight: 24 },
  bookTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  bookTag: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.accent },
  bookTagText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  storyEvent: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  storyEventTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  storyEventText: { color: colors.textPrimary, fontSize: 14, lineHeight: 22 },
});
