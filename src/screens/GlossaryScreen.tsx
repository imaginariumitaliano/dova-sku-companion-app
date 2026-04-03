import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { CODEX_URL } from '../config';
import { useUnlock, UnlockCondition } from '../hooks/useUnlock';
import { useSpoiler } from '../context/SpoilerContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Glossary'>;
};

type GlossaryItem = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  category: string;
  unlockAfter: UnlockCondition;
};

type FlatRow =
  | { type: 'header'; key: string; label: string; category: string }
  | { type: 'item'; key: string; item: GlossaryItem }
  | { type: 'mystery'; key: string; category: string };

const CATEGORY_LABELS: Record<string, string> = {
  species: 'Species of the Galaxy',
  locations: 'Planets & Locations',
  ships: 'Ships & Vehicles',
  technology: 'Technology',
  weapons: 'Weapons & Armor',
  creatures: 'Creatures of the Series',
  concepts: 'Concepts & Lore',
  history: 'History',
  organizations: 'Organizations',
};

const CATEGORY_ORDER = ['species', 'locations', 'ships', 'technology', 'weapons', 'creatures', 'concepts', 'history', 'organizations'];

export default function GlossaryScreen({ navigation }: Props) {
  const [rows, setRows] = useState<FlatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(CATEGORY_ORDER as string[]));
  const [spoilerModalVisible, setSpoilerModalVisible] = useState(false);
  const { isUnlocked } = useUnlock();
  const { spoilerMode, enableSpoilerMode } = useSpoiler();

  const toggleSection = (category: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  useEffect(() => {
    fetch(CODEX_URL, { headers: { 'Cache-Control': 'no-cache' } })
      .then((r) => r.json())
      .then((data) => {
        const built: FlatRow[] = [];
        for (const cat of CATEGORY_ORDER) {
          const items: GlossaryItem[] = data[cat] ?? [];
          if (items.length === 0) continue;
          built.push({ type: 'header', key: `header-${cat}`, label: CATEGORY_LABELS[cat] ?? cat, category: cat });
          for (const item of items) {
            const withCat = { ...item, category: cat };
            if (isUnlocked(item.unlockAfter)) {
              built.push({ type: 'item', key: `${cat}-${item.id}`, item: withCat });
            } else {
              built.push({ type: 'mystery', key: `mystery-${cat}-${item.id}`, category: cat });
            }
          }
        }
        setRows(built);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [isUnlocked]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      const keep = new Set<string>();
      for (const row of rows) {
        if (row.type === 'item') {
          if (row.item.name.toLowerCase().includes(q) || row.item.description.toLowerCase().includes(q)) {
            keep.add(row.key);
            keep.add(`header-${row.item.category}`);
          }
        }
      }
      return rows.filter((r) => keep.has(r.key));
    }
    return rows.filter((r) => {
      if (r.type === 'header') return true;
      const cat = r.type === 'item' ? r.item.category : r.category;
      return !collapsed.has(cat);
    });
  }, [rows, query, collapsed]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading glossary...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>Could not load glossary data.</Text>
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>No glossary data found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search the codex..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />
      <FlatList
        data={filtered}
        keyExtractor={(row) => row.key}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
        renderItem={({ item: row }) => {
          if (row.type === 'header') {
            const isCollapsed = collapsed.has(row.category);
            return (
              <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(row.category)} activeOpacity={0.7}>
                <Text style={styles.sectionHeaderText}>{row.label}</Text>
                <Text style={styles.sectionChevron}>{isCollapsed ? '›' : '⌄'}</Text>
              </TouchableOpacity>
            );
          }

          if (row.type === 'mystery') {
            return (
              <View style={[styles.row, styles.rowLocked]}>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowName, styles.lockedText]}>???</Text>
                  <Text style={[styles.rowSnippet, styles.lockedText]}>Keep reading to unlock</Text>
                </View>
                <Text style={[styles.chevron, styles.lockedText]}>›</Text>
              </View>
            );
          }

          const { item } = row;
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('GlossaryDetail', { category: item.category, itemId: item.id })}
              activeOpacity={0.7}
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowSnippet} numberOfLines={2}>{item.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={spoilerModalVisible} transparent animationType="fade" onRequestClose={() => setSpoilerModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reveal All Spoilers?</Text>
            <Text style={styles.modalBody}>
              This will show all Codex entries regardless of your reading progress. Content may reveal major story events you haven't reached yet.{'\n\n'}Are you sure you want to continue?
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
  stateText: { color: colors.textMuted, fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
  list: { paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  sectionHeaderText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sectionChevron: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  rowLocked: { opacity: 0.4 },
  rowContent: { flex: 1, marginRight: 8 },
  rowName: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  rowSnippet: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  lockedText: { color: colors.textMuted },
  chevron: { color: colors.textMuted, fontSize: 22, lineHeight: 22 },
  separator: { height: 1, backgroundColor: colors.cardBorder, marginLeft: 16 },
  searchInput: {
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    color: colors.textPrimary,
    fontSize: 15,
  },
  spoilerButton: {
    marginTop: 16,
    marginBottom: 8,
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: colors.card, borderRadius: 12, padding: 24, width: '100%', borderWidth: 1, borderColor: colors.cardBorder },
  modalTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  modalBody: { color: colors.textPrimary, fontSize: 14, lineHeight: 22, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center' },
  modalCancelText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  modalConfirm: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
