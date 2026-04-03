import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { CODEX_URL } from '../config';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GlossaryDetail'>;
  route: RouteProp<RootStackParamList, 'GlossaryDetail'>;
};

type GlossaryItem = {
  id: string;
  name: string;
  description: string;
  image: string | null;
};

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

export default function GlossaryDetailScreen({ route, navigation }: Props) {
  const { category, itemId } = route.params;
  const [item, setItem] = useState<GlossaryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(CODEX_URL)
      .then((r) => r.json())
      .then((data) => {
        const list: GlossaryItem[] = data[category] ?? [];
        const found = list.find((i) => i.id === itemId) ?? null;
        setItem(found);
        setLoading(false);
        if (found) {
          navigation.setOptions({ title: found.name });
        }
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [category, itemId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Entry not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.categoryLabel}>{CATEGORY_LABELS[category] ?? category}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.divider} />
      <Text style={styles.description}>{item.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  categoryLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginBottom: 20,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 26,
  },
});
