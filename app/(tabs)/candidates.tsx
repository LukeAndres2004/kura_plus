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
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const COLORS = {
  green: '#1a7a4a',
  greenLight: '#f0faf5',
  white: '#FFFFFF',
  bg: '#F7F7F7',
  border: '#F0F0F0',
  text: '#111111',
  subtext: '#888888',
  red: '#E63946',
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ALL_CANDIDATES = {
  Following: [
    {
      id: '4',
      initials: 'GW',
      name: 'Grace Wanjiru',
      role: 'Woman Representative',
      party: 'Wiper',
      partyColor: '#264653',
      location: 'Nairobi',
      avatarColor: '#E76F51',
      avatarBg: '#e8f0ff',
      rating: 4.7,
      bio: 'Doctor and public health specialist. Former WHO consultant....',
      followers: 23100,
      following: true,
    },
  ],
  Recommended: [
    {
      id: '1',
      initials: 'JM',
      name: 'James Mwangi',
      role: 'Governor',
      party: 'UDA',
      partyColor: '#E63946',
      location: 'Kiambu',
      avatarColor: '#2D6A4F',
      avatarBg: '#e8f5ee',
      rating: 4.5,
      bio: 'Former County Secretary with 15 years of public service. Com...',
      followers: 12450,
      following: false,
    },
    {
      id: '2',
      initials: 'AM',
      name: 'Aisha Mohamed',
      role: 'Senator',
      party: 'ODM',
      partyColor: '#F4A261',
      location: 'Mombasa',
      avatarColor: '#457B9D',
      avatarBg: '#fff3e8',
      rating: 4.2,
      bio: 'Human rights lawyer and women\'s rights activist. 10 years in...',
      followers: 8920,
      following: false,
    },
    {
      id: '3',
      initials: 'PO',
      name: 'Peter Odhiambo',
      role: 'Member of Parliament',
      party: 'Jubilee',
      partyColor: '#2A9D8F',
      location: 'Kisumu',
      avatarColor: '#6D4C8B',
      avatarBg: '#f0ece8',
      rating: 3.8,
      bio: 'Businessman and philanthropist. Founded 3 community schools ...',
      followers: 5870,
      following: false,
    },
    {
      id: '5',
      initials: 'DR',
      name: 'David Rotich',
      role: 'Governor',
      party: 'UDA',
      partyColor: '#E63946',
      location: 'Nakuru',
      avatarColor: '#5C6BC0',
      avatarBg: '#fce8e8',
      rating: 4.0,
      bio: 'Engineer and entrepreneur. Built Nakuru\'s largest solar farm...',
      followers: 9870,
      following: false,
    },
    {
      id: '6',
      initials: 'FH',
      name: 'Fatuma Hassan',
      role: 'Member of County Assembly',
      party: 'ODM',
      partyColor: '#F4A261',
      location: 'Garissa',
      avatarColor: '#388E3C',
      avatarBg: '#fff8e8',
      rating: 3.5,
      bio: 'Teacher and community leader. Passionate about pastoral comm...',
      followers: 2340,
      following: false,
    },
  ],
  Explore: [
    {
      id: '3',
      initials: 'PO',
      name: 'Peter Odhiambo',
      role: 'Member of Parliament',
      party: 'Jubilee',
      partyColor: '#2A9D8F',
      location: 'Kisumu',
      avatarColor: '#6D4C8B',
      avatarBg: '#f0ece8',
      rating: 3.8,
      bio: 'Businessman and philanthropist. Founded 3 community schools ...',
      followers: 5870,
      following: false,
    },
    {
      id: '4',
      initials: 'GW',
      name: 'Grace Wanjiru',
      role: 'Woman Representative',
      party: 'Wiper',
      partyColor: '#264653',
      location: 'Nairobi',
      avatarColor: '#E76F51',
      avatarBg: '#e8f0ff',
      rating: 4.7,
      bio: 'Doctor and public health specialist. Former WHO consultant....',
      followers: 23100,
      following: true,
    },
    {
      id: '5',
      initials: 'DR',
      name: 'David Rotich',
      role: 'Governor',
      party: 'UDA',
      partyColor: '#E63946',
      location: 'Nakuru',
      avatarColor: '#5C6BC0',
      avatarBg: '#fce8e8',
      rating: 4.0,
      bio: 'Engineer and entrepreneur. Built Nakuru\'s largest solar farm...',
      followers: 9870,
      following: false,
    },
    {
      id: '6',
      initials: 'FH',
      name: 'Fatuma Hassan',
      role: 'Member of County Assembly',
      party: 'ODM',
      partyColor: '#F4A261',
      location: 'Garissa',
      avatarColor: '#388E3C',
      avatarBg: '#fff8e8',
      rating: 3.5,
      bio: 'Teacher and community leader. Passionate about pastoral comm...',
      followers: 2340,
      following: false,
    },
  ],
};

type Tab = 'Following' | 'Recommended' | 'Explore';
type Candidate = typeof ALL_CANDIDATES.Recommended[0];

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.floor(rating) ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={11}
          color="#F4A261"
        />
      ))}
      <Text style={{ fontSize: 11, color: COLORS.subtext, marginLeft: 3 }}>{rating}</Text>
    </View>
  );
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  onViewProfile,
  onToggleFollow,
}: {
  candidate: Candidate;
  onViewProfile: () => void;
  onToggleFollow: () => void;
}) {
  return (
    <View style={[styles.card, { backgroundColor: COLORS.white }]}>
      {/* Avatar banner area */}
      <View style={[styles.avatarBanner, { backgroundColor: candidate.avatarBg }]}>
        <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
          <View style={[styles.avatar, { backgroundColor: candidate.avatarColor }]}>
            <Text style={styles.avatarText}>{candidate.initials}</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        <StarRating rating={candidate.rating} />

        <Text style={styles.candidateName}>{candidate.name}</Text>
        <Text style={styles.candidateRole}>{candidate.role}</Text>

        {/* Party + Location */}
        <View style={styles.metaRow}>
          <View style={[styles.partyDot, { backgroundColor: candidate.partyColor }]} />
          <Text style={styles.partyText}>{candidate.party}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.locationText}>{candidate.location}</Text>
        </View>

        <Text style={styles.bio}>{candidate.bio}</Text>

        <Text style={styles.followers}>
          {candidate.followers.toLocaleString()} followers
        </Text>

        {/* View Profile button */}
        <TouchableOpacity style={styles.viewProfileBtn} onPress={onViewProfile}>
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>

        {/* Follow + Notification row */}
        <View style={styles.followRow}>
          <TouchableOpacity
            style={[styles.followBtn, candidate.following && styles.followingBtn]}
            onPress={onToggleFollow}
          >
            {candidate.following && (
              <Ionicons name="checkmark" size={12} color={COLORS.green} style={{ marginRight: 3 }} />
            )}
            <Text style={[styles.followBtnText, candidate.following && styles.followingBtnText]}>
              {candidate.following ? 'Following' : '+ Follow'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={14} color={COLORS.subtext} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CandidatesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Recommended');
  const [candidateData, setCandidateData] = useState(ALL_CANDIDATES);

  const toggleFollow = (tab: Tab, id: string) => {
    setCandidateData(prev => ({
      ...prev,
      [tab]: prev[tab].map(c => c.id === id ? { ...c, following: !c.following } : c),
    }));
  };

  const candidates = candidateData[activeTab];

  // 2-column grid
  const rows: Candidate[][] = [];
  for (let i = 0; i < candidates.length; i += 2) {
    rows.push(candidates.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Candidates</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['Following', 'Recommended', 'Explore'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.bg }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      >
        {/* Count */}
        <Text style={styles.countText}>{candidates.length} candidates</Text>

        {/* Grid */}
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(candidate => (
              <View key={candidate.id} style={styles.cardWrapper}>
                <CandidateCard
                  candidate={candidate}
                  onViewProfile={() => router.push(`/candidate/${candidate.id}` as any)}
                  onToggleFollow={() => toggleFollow(activeTab, candidate.id)}
                />
              </View>
            ))}
            {/* Fill empty slot if odd number */}
            {row.length === 1 && <View style={styles.cardWrapper} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.green,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  tabLabelActive: {
    color: COLORS.green,
  },
  countText: {
    fontSize: 12,
    color: COLORS.subtext,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarBanner: {
    padding: 10,
    paddingBottom: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cardBody: {
    padding: 10,
    gap: 4,
  },
  candidateName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  candidateRole: {
    fontSize: 10,
    color: COLORS.subtext,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  partyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  partyText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
  },
  dot: {
    fontSize: 10,
    color: COLORS.subtext,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.subtext,
  },
  bio: {
    fontSize: 10,
    color: COLORS.subtext,
    lineHeight: 14,
    marginTop: 4,
  },
  followers: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  viewProfileBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  viewProfileText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
  },
  followingBtn: {
    backgroundColor: COLORS.greenLight,
    borderColor: COLORS.green,
  },
  followBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  followingBtnText: {
    color: COLORS.green,
  },
  notifBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});