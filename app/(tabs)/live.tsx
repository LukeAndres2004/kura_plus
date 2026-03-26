import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const COLORS = {
  green: '#1a7a4a',
  white: '#FFFFFF',
  bg: '#F7F7F7',
  border: '#F0F0F0',
  text: '#111111',
  subtext: '#888888',
  red: '#E63946',
  dark: '#1a1a2e',
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LIVE_SESSION = {
  id: 'live1',
  name: 'Grace Wanjiru',
  initials: 'GW',
  avatarColor: '#E76F51',
  title: "Women's Healthcare Town Hall",
  viewers: 1423,
  comments: [
    { id: '1', user: 'Wanjiku_K', text: 'Great session! 👏👏' },
    { id: '2', user: 'Ahmed_H', text: 'Question: What about healthcare in rural areas?' },
    { id: '3', user: 'Mary_N', text: 'This is exactly what Kenya needs xr' },
  ],
};

const UPCOMING_SESSIONS = [
  {
    id: 'u1',
    title: 'Kiambu Infrastructure Masterplan',
    name: 'James Mwangi',
    role: 'Governor',
    location: 'Kiambu',
    time: 'Tomorrow, 3:00 PM',
    avatarColor: '#2D6A4F',
    notified: false,
  },
  {
    id: 'u2',
    title: 'Blue Economy Q&A Session',
    name: 'Aisha Mohamed',
    role: 'Senator',
    location: 'Mombasa',
    time: 'Friday, 6:00 PM',
    avatarColor: '#457B9D',
    notified: false,
  },
  {
    id: 'u3',
    title: 'Green Energy for Nakuru',
    name: 'David Rotich',
    role: 'Governor',
    location: 'Nakuru',
    time: 'Saturday, 10:00 AM',
    avatarColor: '#5C6BC0',
    notified: false,
  },
];

// ─── Fullscreen Live View ─────────────────────────────────────────────────────

function FullscreenLive({ onClose }: { onClose: () => void }) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.fullscreen}>
      <StatusBar barStyle="light-content" />

      {/* Dark video background */}
      <View style={styles.videoBackground}>

        {/* Top bar */}
        <View style={styles.liveTopBar}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <View style={styles.viewersBadge}>
            <Ionicons name="eye-outline" size={12} color="#fff" />
            <Text style={styles.viewersText}>{LIVE_SESSION.viewers.toLocaleString()}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Host info */}
        <View style={styles.hostRow}>
          <View style={[styles.hostAvatar, { backgroundColor: LIVE_SESSION.avatarColor }]}>
            <Text style={styles.hostAvatarText}>{LIVE_SESSION.initials}</Text>
          </View>
          <View>
            <Text style={styles.hostName}>{LIVE_SESSION.name}</Text>
            <Text style={styles.hostTitle}>{LIVE_SESSION.title}</Text>
          </View>
        </View>

        {/* Right actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.actionIcon}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? COLORS.red : '#fff'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="mic-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Comments overlay */}
        <View style={styles.commentsOverlay}>
          {LIVE_SESSION.comments.map(comment => (
            <View key={comment.id} style={styles.commentRow}>
              <Text style={styles.commentUser}>{comment.user}: </Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Sessions List ────────────────────────────────────────────────────────────

function SessionsList({ onJoinLive }: { onJoinLive: () => void }) {
  const [upcoming, setUpcoming] = useState(UPCOMING_SESSIONS);

  const toggleNotify = (id: string) => {
    setUpcoming(prev => prev.map(s => s.id === id ? { ...s, notified: !s.notified } : s));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Sessions</Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.bg }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Currently Live section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.liveDotSmall} />
            <Text style={styles.sectionTitle}>Currently Live</Text>
            <View style={styles.liveCountBadge}>
              <Text style={styles.liveCountText}>1</Text>
            </View>
          </View>

          {/* Live card */}
          <TouchableOpacity onPress={onJoinLive} activeOpacity={0.9}>
            <View style={styles.liveCard}>
              {/* Simulated dark video thumbnail */}
              <View style={styles.liveThumbnail}>
                <View style={styles.liveThumbnailOverlay} />

                {/* LIVE + viewers badges */}
                <View style={styles.liveCardTopRow}>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                  <View style={styles.viewersBadge}>
                    <Ionicons name="eye-outline" size={11} color="#fff" />
                    <Text style={styles.viewersText}>{LIVE_SESSION.viewers.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Host name + title at bottom */}
                <View style={styles.liveCardBottom}>
                  <Text style={styles.liveCardName}>{LIVE_SESSION.name}</Text>
                  <Text style={styles.liveCardTitle}>{LIVE_SESSION.title}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming Sessions section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.text} />
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          </View>

          <View style={styles.upcomingList}>
            {upcoming.map(session => (
              <View key={session.id} style={styles.upcomingCard}>
                {/* Thumbnail */}
                <View style={[styles.upcomingThumb, { backgroundColor: session.avatarColor }]}>
                  <Ionicons name="play-circle" size={22} color="rgba(255,255,255,0.8)" />
                </View>

                {/* Info */}
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTitle}>{session.title}</Text>
                  <Text style={styles.upcomingMeta}>
                    {session.name} · {session.role} · {session.location}
                  </Text>
                  <View style={styles.upcomingTimeRow}>
                    <Ionicons name="calendar-outline" size={10} color={COLORS.green} />
                    <Text style={styles.upcomingTime}>{session.time}</Text>
                  </View>
                </View>

                {/* Notify bell */}
                <TouchableOpacity onPress={() => toggleNotify(session.id)}>
                  <Ionicons
                    name={session.notified ? 'notifications' : 'notifications-outline'}
                    size={20}
                    color={session.notified ? COLORS.green : COLORS.subtext}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LiveScreen() {
  const [watching, setWatching] = useState(false);

  if (watching) {
    return <FullscreenLive onClose={() => setWatching(false)} />;
  }

  return <SessionsList onJoinLive={() => setWatching(true)} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  liveDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },
  liveCountBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // Live card
  liveCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  liveThumbnail: {
    height: 160,
    backgroundColor: '#2a2a3e',
    justifyContent: 'space-between',
    padding: 10,
  },
  liveThumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  liveCardTopRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.red,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  viewersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  viewersText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  liveCardBottom: {
    gap: 2,
  },
  liveCardName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  liveCardTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },

  // Upcoming
  upcomingList: {
    gap: 14,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upcomingThumb: {
    width: 72,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  upcomingInfo: {
    flex: 1,
    gap: 3,
  },
  upcomingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 17,
  },
  upcomingMeta: {
    fontSize: 10,
    color: COLORS.subtext,
  },
  upcomingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upcomingTime: {
    fontSize: 10,
    color: COLORS.green,
    fontWeight: '600',
  },

  // Fullscreen live
  fullscreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoBackground: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'space-between',
  },
  liveTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 54,
  },
  closeBtn: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  hostName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  hostTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    top: '40%',
    gap: 20,
  },
  actionIcon: {
    alignItems: 'center',
  },
  commentsOverlay: {
    padding: 16,
    gap: 6,
    paddingBottom: 24,
  },
  commentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commentUser: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  commentText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
});