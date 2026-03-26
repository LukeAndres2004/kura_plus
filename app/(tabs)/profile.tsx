import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { AuthModal } from '../../components/AuthModal';

// ─────────────────────────────────────────────────────────────
// Menu item
// ─────────────────────────────────────────────────────────────

function MenuItem({
  icon,
  iconBg,
  iconColor,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Logged-in profile
// ─────────────────────────────────────────────────────────────

function ProfileContent() {
  const { signOut } = useAuth();
  const { profile, followedLeaders } = useProfile();

  const initials = profile?.initials ||
    (profile?.name
      ? profile.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
      : 'K');

  const username = profile?.name
    ? `@${profile.name.toLowerCase().replace(/\s+/g, '')}2004`
    : '@kurauser';

  return (
    <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
      {/* ── Green header ── */}
      <View style={styles.header}>
        <StatusBar barStyle="light-content" backgroundColor="#1A8B3C" />
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.username}>{username}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.85)" />
              <Text style={styles.locationText}>{profile?.county ?? 'Kenya'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Stats ── */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{followedLeaders.length}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#1A8B3C' }]}>50</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      {/* ── KURA Points banner ── */}
      <View style={styles.pointsBanner}>
        <View style={styles.pointsCoin}>
          <Text style={{ fontSize: 22 }}>🏅</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pointsTitle}>50 KURA Points</Text>
          <Text style={styles.pointsSub}>≈ KSH 5 equivalent</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.convertLink}>Convert →</Text>
        </TouchableOpacity>
      </View>

      {/* ── Menu ── */}
      <View style={styles.menuCard}>
        <MenuItem icon="location-outline" iconBg="#EDF7F0" iconColor="#1A8B3C" label="My County"
          onPress={() => router.push('/(tabs)/mycounty')} />
        <View style={styles.menuDivider} />
        <MenuItem icon="bookmark-outline" iconBg="#FFF8EC" iconColor="#F59E0B" label="Watchlist" />
        <View style={styles.menuDivider} />
        <MenuItem icon="pulse-outline" iconBg="#EEF2FF" iconColor="#6366F1" label="Activity Log" />
        <View style={styles.menuDivider} />
        <MenuItem icon="library-outline" iconBg="#F3EEFF" iconColor="#8B5CF6" label="Civic Education" />
        <View style={styles.menuDivider} />
        <MenuItem icon="cash-outline" iconBg="#FFF0F0" iconColor="#E53935" label="Convert Points" />
        <View style={styles.menuDivider} />
        <MenuItem icon="settings-outline" iconBg="#F5F5F5" iconColor="#666" label="Settings" />
        <View style={styles.menuDivider} />
        <MenuItem icon="help-circle-outline" iconBg="#EDF7F0" iconColor="#1A8B3C" label="Help & Support" />
      </View>

      {/* ── Sign out ── */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#E53935" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// Logged-out state
// ─────────────────────────────────────────────────────────────

function SignedOutView({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View style={styles.signedOutContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F7" />
      <Ionicons name="person-circle-outline" size={80} color="#C8E6C9" />
      <Text style={styles.signedOutTitle}>Join KURA</Text>
      <Text style={styles.signedOutSub}>
        Sign in to follow leaders, track civic events, and earn KURA points
      </Text>
      <TouchableOpacity style={styles.signInBtn} onPress={onSignIn} activeOpacity={0.85}>
        <Ionicons name="phone-portrait-outline" size={18} color="#fff" />
        <Text style={styles.signInBtnText}>Continue with Phone</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A8B3C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, user ? styles.safeGreen : null]}>
      {user ? (
        <ProfileContent />
      ) : (
        <SignedOutView onSignIn={() => setShowAuth(true)} />
      )}
      <AuthModal visible={showAuth} onClose={() => setShowAuth(false)} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F7' },
  safeGreen: { backgroundColor: '#1A8B3C' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    backgroundColor: '#1A8B3C',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  settingsBtn: { padding: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  username: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#111' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },

  // Points
  pointsBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, padding: 14, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  pointsCoin: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF8EC',
    justifyContent: 'center', alignItems: 'center',
  },
  pointsTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  pointsSub: { fontSize: 12, color: '#999', marginTop: 2 },
  convertLink: { fontSize: 14, fontWeight: '700', color: '#1A8B3C' },

  // Menu
  menuCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 15, gap: 14,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, color: '#111', fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: '#F5F5F5', marginLeft: 66 },

  // Sign out
  signOutBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 12, marginBottom: 32,
    backgroundColor: '#FFF0F0', borderRadius: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: '#FFCDD2',
  },
  signOutText: { fontSize: 16, fontWeight: '700', color: '#E53935' },

  // Signed out
  signedOutContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32, gap: 12, backgroundColor: '#F2F4F7',
  },
  signedOutTitle: { fontSize: 26, fontWeight: '800', color: '#111' },
  signedOutSub: { fontSize: 15, color: '#777', textAlign: 'center', lineHeight: 22 },
  signInBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1A8B3C', paddingHorizontal: 32,
    paddingVertical: 16, borderRadius: 14, marginTop: 8,
  },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});