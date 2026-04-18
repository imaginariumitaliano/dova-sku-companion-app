import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
// @ts-ignore
import ImageViewer from 'react-native-image-zoom-viewer';
import { colors } from '../theme/colors';
import { CODEX_URL } from '../config';
import { useUnlock, UnlockCondition } from '../hooks/useUnlock';
import { useSpoiler } from '../context/SpoilerContext';

type World = {
  id: string;
  name: string;
  system: string;
  image?: string;
  description: string;
  unlockAfter: UnlockCondition | null;
};

const WORLD_ORDER = ['earth', 'catora', 'tual', 'seutor', 'patchave'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.6;

export default function WorldsScreen() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoomWorld, setZoomWorld] = useState<World | null>(null);
  const { isUnlocked } = useUnlock();
  const { spoilerMode } = useSpoiler();

  useEffect(() => {
    fetch(CODEX_URL, { headers: { 'Cache-Control': 'no-cache' } })
      .then((r) => r.json())
      .then((data) => {
        const locations: World[] = data.locations ?? [];
        const ordered = WORLD_ORDER
          .map((id) => locations.find((l) => l.id === id))
          .filter((l): l is World => l !== undefined);
        setWorlds(ordered);
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
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load world data.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Worlds of the Dova Sku Universe</Text>

      {worlds.map((world) => {
        const unlocked = spoilerMode || isUnlocked(world.unlockAfter);

        if (!unlocked) {
          return (
            <View key={world.id} style={[styles.card, styles.cardLocked]}>
              <View style={styles.lockedImageBox}>
                <Text style={styles.mysteryIcon}>?</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.lockedName}>???</Text>
                <Text style={styles.lockedSub}>Keep reading to unlock</Text>
              </View>
            </View>
          );
        }

        return (
          <View key={world.id} style={styles.card}>
            {world.image ? (
              <>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setZoomWorld(world)}>
                  <Image source={{ uri: world.image }} style={styles.worldImage} resizeMode="cover" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderInitial}>{world.name.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.worldName}>{world.name}</Text>
              {world.system && (
                <Text style={styles.worldSystem}>{world.system} System</Text>
              )}
              <View style={styles.divider} />
              <Text style={styles.worldDescription}>{world.description}</Text>
            </View>
          </View>
        );
      })}

      {zoomWorld?.image && (
        <Modal
          visible={!!zoomWorld}
          transparent
          animationType="fade"
          onRequestClose={() => setZoomWorld(null)}
        >
          <ImageViewer
            imageUrls={[{ url: zoomWorld.image }]}
            enableSwipeDown
            onSwipeDown={() => setZoomWorld(null)}
            onCancel={() => setZoomWorld(null)}
            backgroundColor="rgba(0,0,0,0.95)"
            renderIndicator={() => <></>}
          />
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.textMuted, fontSize: 15 },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardLocked: {
    opacity: 0.5,
  },
  worldImage: {
    width: SCREEN_WIDTH - 32,
    height: IMAGE_HEIGHT,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH - 32,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInitial: { color: colors.accent, fontSize: 48, fontWeight: '800' },
  lockedImageBox: {
    width: SCREEN_WIDTH - 32,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mysteryIcon: { color: colors.textMuted, fontSize: 48, fontWeight: '800', opacity: 0.4 },
  cardBody: { padding: 16 },
  worldName: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 2 },
  worldSystem: { color: colors.accent, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  lockedName: { color: colors.textMuted, fontSize: 18, fontWeight: '800' },
  lockedSub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 12 },
  worldDescription: { color: colors.textPrimary, fontSize: 14, lineHeight: 22 },
});
