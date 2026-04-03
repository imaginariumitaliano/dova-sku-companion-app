import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { CODEX_URL } from '../config';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Glossary'>;
};

type GlossaryItem = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  category: string;
};

type FlatRow =
  | { type: 'header'; key: string; label: string; category: string }
  | { type: 'item'; key: string; item: GlossaryItem };

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

  const toggleSection = (category: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
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
            built.push({ type: 'item', key: `${cat}-${item.id}`, item: { ...item, category: cat } });
          }
        }
        setRows(built);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // When searching, expand all and filter by query
    if (q) {
      const keep = new Set<string>();
      for (const row of rows) {
        if (row.type === 'item') {
          if (
            row.item.name.toLowerCase().includes(q) ||
            row.item.description.toLowerCase().includes(q)
          ) {
            keep.add(row.key);
            keep.add(`header-${row.item.category}`);
          }
        }
      }
      return rows.filter((r) => keep.has(r.key));
    }
    // No query — respect collapsed state
    return rows.filter((r) => {
      if (r.type === 'header') return true;
      return !collapsed.has(r.item.category);
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
        renderItem={({ item: row }) => {
          if (row.type === 'header') {
            const isCollapsed = collapsed.has(row.category);
            return (
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(row.category)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionHeaderText}>{row.label}</Text>
                <Text style={styles.sectionChevron}>{isCollapsed ? '›' : '⌄'}</Text>
              </TouchableOpacity>
            );
          }
          const { item } = row;
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                navigation.navigate('GlossaryDetail', {
                  category: item.category,
                  itemId: item.id,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowSnippet} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        }}
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
  stateText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  list: {
    paddingBottom: 40,
  },
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
  sectionChevron: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  rowContent: {
    flex: 1,
    marginRight: 8,
  },
  rowName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  rowSnippet: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 22,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginLeft: 16,
  },
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
});
