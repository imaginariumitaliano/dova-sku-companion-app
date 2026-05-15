import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';

// ── Social links ── update these when handles/URLs are confirmed ──────────────
const SOCIALS: { label: string; url: string }[] = [
  { label: 'Facebook',  url: 'https://www.facebook.com/paisanitaliano/' },
  { label: 'Instagram', url: 'https://www.instagram.com/paisanitaliano/' },
  { label: 'TikTok',    url: 'https://www.tiktok.com/@paisanitaliano' },
];
// ─────────────────────────────────────────────────────────────────────────────

const HEADSHOT_URL =
  'https://raw.githubusercontent.com/imaginariumitaliano/dova-sku-companion-content/main/images/headshot.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = SCREEN_WIDTH * 0.42;

const BIO_PARAGRAPHS = [
  'Corey Italiano grew up on a lakeshore outside Idaho Falls, Idaho, where his childhood was equal parts dirt bikes, rifles, camping trips, and dreaming about being a spy or a ninja. School was secondary to anything involving speed, risk, or a good story, but a Nintendo NES at six years old and a lifelong love of video games hard-wired his imagination for science fiction.',
  'As an adult, Corey bounced across five states and several countries, worked for years in real estate like his mother, and eventually shifted into life as a smart home and security technician — squeezing writing time into the cracks. An unapologetic adrenaline junkie, he\'s broken more bones than he cares to count and now carries titanium in both shoulders thanks to motorcycle and snowboarding accidents… which haven\'t slowed him down on the slopes or on his Harley.',
  'A lifelong sci-fi addict, Corey has read or listened to hundreds of books about space, aliens, and strange new worlds. One afternoon, intending to write a song, he instead wrote the prologue to what became Transync, his debut novel and the opening salvo of The Dova Sku Series. Two and a half years later, that "happy accident" became a full-blown career pivot. He has no plans to stop telling stories about dangerous planets, stubborn humans, and the mysteries of the universe.',
  'Not only is he a writer, but in the process of self-publishing his books, he has had to learn how to be a digital audio engineer for editing the audiobooks, a website designer, a social media publicist, and an app designer — and he has also spent hundreds of hours diligently working on creating every image used in this app.',
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroRow}>
        <Image
          source={{ uri: HEADSHOT_URL }}
          style={styles.headshot}
          resizeMode="cover"
        />
        <View style={styles.heroText}>
          <Text style={styles.authorName}>Corey{'\n'}Italiano</Text>
          <Text style={styles.authorTagline}>Author of{'\n'}The Dova Sku Series</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {BIO_PARAGRAPHS.map((para, i) => (
        <Text key={i} style={styles.bio}>{para}</Text>
      ))}

      {SOCIALS.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.connectLabel}>Connect</Text>
          <View style={styles.socialsGrid}>
            {SOCIALS.map(({ label, url }) => (
              <TouchableOpacity
                key={label}
                style={styles.socialButton}
                onPress={() => Linking.openURL(url)}
                activeOpacity={0.75}
              >
                <Text style={styles.socialButtonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      <Text style={styles.copyright}>© 2026 Corey Italiano. All Rights Reserved.</Text>
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
  copyright: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: 24,
    opacity: 0.6,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  headshot: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  heroText: {
    flex: 1,
  },
  authorName: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 8,
  },
  authorTagline: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginBottom: 20,
  },
  bio: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 26,
    marginBottom: 18,
  },
  connectLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  socialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  socialButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  socialButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
