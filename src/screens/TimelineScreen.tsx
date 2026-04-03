import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { TIMELINE_URL } from '../config';
import { useUnlock, UnlockCondition } from '../hooks/useUnlock';
import { useSpoiler } from '../context/SpoilerContext';

type TimelineEvent = {
  id: string;
  title: string;
  content: string;
  unlockAfter: UnlockCondition;
};

type Era = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  events: TimelineEvent[];
};

export default function TimelineScreen() {
  const [eras, setEras] = useState<Era[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [collapsedEras, setCollapsedEras] = useState<Set<string>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [spoilerModalVisible, setSpoilerModalVisible] = useState(false);
  const { isUnlocked } = useUnlock();
  const { spoilerMode, enableSpoilerMode } = useSpoiler();

  useEffect(() => {
    fetch(TIMELINE_URL, { headers: { 'Cache-Control': 'no-cache' } })
      .then((r) => r.json())
      .then((data) => {
        setEras(data.eras ?? []);
        setCollapsedEras(new Set((data.eras ?? []).map((e: Era) => e.id)));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const toggleEra = (id: string) => {
    setCollapsedEras((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleEvent = (id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.stateText}>Loading timeline...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.stateText}>Could not load timeline data.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {eras.map((era, eraIndex) => {
        const isLast = eraIndex === eras.length - 1;
        const isCollapsed = collapsedEras.has(era.id);

        return (
          <View key={era.id} style={styles.eraRow}>
            <View style={styles.lineColumn}>
              <View style={styles.eraDot} />
              {!isLast && <View style={styles.verticalLine} />}
            </View>

            <View style={styles.eraContent}>
              <TouchableOpacity style={styles.eraHeader} onPress={() => toggleEra(era.id)} activeOpacity={0.7}>
                <View style={styles.eraHeaderLeft}>
                  <Text style={styles.eraNumber}>Era {era.number}</Text>
                  <Text style={styles.eraTitle}>{era.title}</Text>
                  <Text style={styles.eraSubtitle}>{era.subtitle}</Text>
                </View>
                <Text style={styles.eraChevron}>{isCollapsed ? '›' : '⌄'}</Text>
              </TouchableOpacity>

              {!isCollapsed && (
                <View style={styles.eventsList}>
                  {era.events.map((event, eventIndex) => {
                    const unlocked = isUnlocked(event.unlockAfter);
                    const isExpanded = expandedEvents.has(event.id);
                    const isLastEvent = eventIndex === era.events.length - 1;

                    return (
                      <View key={event.id} style={[styles.eventRow, isLastEvent && styles.eventRowLast]}>
                        <View style={styles.eventDotCol}>
                          <View style={[styles.eventDot, !unlocked && styles.eventDotLocked]} />
                          {!isLastEvent && <View style={styles.eventLine} />}
                        </View>
                        <View style={styles.eventContent}>
                          {unlocked ? (
                            <TouchableOpacity
                              onPress={() => toggleEvent(event.id)}
                              activeOpacity={0.7}
                              style={styles.eventTitleRow}
                            >
                              <Text style={styles.eventTitle}>{event.title}</Text>
                              <Text style={styles.eventChevron}>{isExpanded ? '⌄' : '›'}</Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={[styles.eventTitleRow, styles.eventTitleLocked]}>
                              <Text style={[styles.eventTitle, styles.lockedText]}>???</Text>
                            </View>
                          )}
                          {unlocked && isExpanded && (
                            <Text style={styles.eventContentText}>{event.content}</Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        );
      })}

      {!spoilerMode ? (
        <TouchableOpacity style={styles.spoilerButton} onPress={() => setSpoilerModalVisible(true)}>
          <Text style={styles.spoilerButtonText}>Reveal All Spoilers</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spoilerActiveNote}>
          <Text style={styles.spoilerActiveText}>All content visible — spoiler mode on</Text>
        </View>
      )}

      <Modal visible={spoilerModalVisible} transparent animationType="fade" onRequestClose={() => setSpoilerModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reveal All Spoilers?</Text>
            <Text style={styles.modalBody}>
              This will show all timeline events regardless of your reading progress. Events may reveal major story moments you haven't reached yet.{'\n\n'}Are you sure you want to continue?
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
    </ScrollView>
  );
}

const DOT_SIZE = 14;
const EVENT_DOT_SIZE = 8;
const LINE_WIDTH = 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 24, paddingBottom: 48, paddingRight: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  stateText: { color: colors.textMuted, fontSize: 15, marginTop: 12 },

  eraRow: { flexDirection: 'row', marginBottom: 8 },
  lineColumn: { width: 40, alignItems: 'center' },
  eraDot: {
    width: DOT_SIZE, height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  verticalLine: {
    width: LINE_WIDTH, flex: 1,
    backgroundColor: colors.accent, opacity: 0.35,
    marginTop: 4, marginBottom: -8,
  },

  eraContent: { flex: 1, marginBottom: 16 },
  eraHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    backgroundColor: colors.card, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  eraHeaderLeft: { flex: 1, marginRight: 8 },
  eraNumber: { color: colors.accent, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 3 },
  eraTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 2 },
  eraSubtitle: { color: colors.textMuted, fontSize: 13 },
  eraChevron: { color: colors.accent, fontSize: 18, fontWeight: '700', marginTop: 2 },

  eventsList: { marginTop: 8, paddingLeft: 8 },
  eventRow: { flexDirection: 'row', marginBottom: 4 },
  eventRowLast: { marginBottom: 0 },
  eventDotCol: { width: 20, alignItems: 'center', paddingTop: 14 },
  eventDot: {
    width: EVENT_DOT_SIZE, height: EVENT_DOT_SIZE,
    borderRadius: EVENT_DOT_SIZE / 2,
    backgroundColor: colors.accentSecondary, opacity: 0.8,
  },
  eventDotLocked: { backgroundColor: colors.textMuted, opacity: 0.3 },
  eventLine: { width: LINE_WIDTH, flex: 1, backgroundColor: colors.accent, opacity: 0.2, marginTop: 4 },
  eventContent: { flex: 1, paddingBottom: 8 },
  eventTitleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8, borderWidth: 1, borderColor: colors.cardBorder,
  },
  eventTitleLocked: { opacity: 0.4 },
  eventTitle: { flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginRight: 8 },
  lockedText: { color: colors.textMuted },
  eventChevron: { color: colors.textMuted, fontSize: 16 },
  eventContentText: { color: colors.textPrimary, fontSize: 14, lineHeight: 23, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },

  spoilerButton: {
    marginTop: 8, marginBottom: 16, alignSelf: 'center',
    paddingVertical: 10, paddingHorizontal: 24,
    borderRadius: 8, borderWidth: 1, borderColor: colors.cardBorder,
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
