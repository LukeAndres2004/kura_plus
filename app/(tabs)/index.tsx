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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHomeFeed, FeedType, Leader, Post } from '../../hooks/useHomeFeed';
import { useCreatePost } from '../../hooks/Usecreatepost';
import { CreatePostModal } from '../../components/Createpostmodal';

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

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 38 }: { initials: string; color: string; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.35 }}>{initials}</Text>
    </View>
  );
}

function PartyBadge({ party, color }: { party: string; color: string }) {
  return (
    <View style={{ backgroundColor: color, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 }}>
      <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }}>{party}</Text>
    </View>
  );
}

function LeaderCard({ leader, onToggle, onPress }: {
  leader: Leader; onToggle: () => void; onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.leaderCard}>
      <View style={{ position: 'relative' }}>
        <Avatar initials={leader.initials} color={leader.color} size={48} />
        <View style={styles.onlineDot} />
      </View>
      <Text style={styles.leaderName} numberOfLines={1}>{leader.name.split(' ')[0]}</Text>
      <Text style={styles.leaderLocation} numberOfLines={1}>{leader.location}</Text>
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.followBtn, leader.following && styles.followingBtn]}
      >
        <Text style={[styles.followBtnText, leader.following && styles.followingBtnText]}>
          {leader.following ? '✓ Following' : '+ Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function PostCard({ post, onPress, onLike, isLoggedIn }: {
  post: Post; onPress: () => void; onLike: () => void; isLoggedIn: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={{ position: 'relative' }}>
          <Avatar initials={post.initials} color={post.avatarColor} size={40} />
          <View style={styles.onlineDot} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={styles.postName}>{post.name}</Text>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E', marginHorizontal: 4 }} />
            {post.party ? <PartyBadge party={post.party} color={post.partyColor ?? '#888'} /> : null}
          </View>
          <Text style={styles.postMeta}>{post.role} · {post.location} · {post.time}</Text>
        </View>
      </View>

      {post.type === 'video' && (
        <View style={styles.videoContainer}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={18} color="#fff" />
          </View>
          {post.videoDuration ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{post.videoDuration}</Text>
            </View>
          ) : null}
        </View>
      )}
      {post.type === 'image' && (
        <View style={styles.imageContainer}>
          <Ionicons name="image-outline" size={28} color="#aaa" />
        </View>
      )}

      <Text style={styles.postContent}>{post.content}</Text>

      {post.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {post.tags.map(tag => (
            <Text key={tag} style={styles.tag}>{tag}</Text>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={isLoggedIn ? onLike : undefined} style={styles.actionBtn}>
          <Ionicons
            name={post.liked ? 'heart' : 'heart-outline'}
            size={18}
            color={post.liked ? COLORS.red : COLORS.subtext}
          />
          <Text style={[styles.actionCount, post.liked && { color: COLORS.red }]}>
            {post.likes.toLocaleString()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={17} color={COLORS.subtext} />
          <Text style={styles.actionCount}>{post.comments.toLocaleString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={17} color={COLORS.subtext} />
          <Text style={styles.actionCount}>{post.shares.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function EmptyFollowing({ onExplore }: { onExplore: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="people-outline" size={48} color="#CCC" />
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptySub}>Follow leaders to see their posts here</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onExplore}>
        <Text style={styles.emptyBtnText}>Explore Leaders</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────

const TABS: FeedType[] = ['Following', 'Recommended', 'Explore'];

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FeedType>('Following');
  const [showCreate, setShowCreate] = useState(false);

  const {
    leaders, posts, loading, refreshing, error,
    userId, onRefresh, toggleFollow, toggleLike, refetch,
  } = useHomeFeed(activeTab);

  const { isLeader } = useCreatePost();
  const isLoggedIn = !!userId;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.logoKura}>KURA</Text>
            <Text style={styles.logoPlus}>+</Text>
          </View>
          <Text style={styles.logoSub}>Kenya's Civic Platform</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isLeader && (
            <TouchableOpacity onPress={() => setShowCreate(true)} style={{ marginRight: 12 }}>
              <Ionicons name="add-circle" size={28} color={COLORS.green} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={{ position: 'relative' }}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Feed ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.green} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.red} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.bg }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} />
          }
        >
          {/* Leaders */}
          <View style={styles.leadersSection}>
            <Text style={styles.sectionTitle}>Leaders to Follow</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
              {leaders.map((leader, i) => (
                <View key={leader.id} style={{ marginRight: i < leaders.length - 1 ? 16 : 0 }}>
                  <LeaderCard
                    leader={leader}
                    onToggle={() => isLoggedIn ? toggleFollow(leader.id) : router.push('/modal' as never)}
                    onPress={() => router.push(`/candidate/${leader.id}` as never)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Posts */}
          {posts.length === 0 && activeTab === 'Following' ? (
            <EmptyFollowing onExplore={() => setActiveTab('Explore')} />
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onPress={() => router.push(`/post/${post.id}` as never)}
                onLike={() => toggleLike(post.id)}
                isLoggedIn={isLoggedIn}
              />
            ))
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* ── Create Post Modal (leaders only) ── */}
      <CreatePostModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={refetch}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: COLORS.red, marginTop: 8, fontSize: 14, textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.white },
  logoKura: { fontSize: 22, fontWeight: '800', color: '#111', letterSpacing: -0.5 },
  logoPlus: { fontSize: 20, fontWeight: '800', color: COLORS.green },
  logoSub: { fontSize: 9, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginTop: 1 },
  notifDot: { position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.red, borderWidth: 1.5, borderColor: COLORS.white },
  tabsRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: COLORS.green },
  tabLabel: { fontSize: 13, fontWeight: '600', color: '#999' },
  tabLabelActive: { color: COLORS.green },
  leadersSection: { backgroundColor: COLORS.white, padding: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 12 },
  leaderCard: { alignItems: 'center', width: 72 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', borderWidth: 2, borderColor: COLORS.white },
  leaderName: { fontSize: 11, fontWeight: '700', color: '#111', marginTop: 5, textAlign: 'center' },
  leaderLocation: { fontSize: 9, color: '#999', textAlign: 'center', marginBottom: 5 },
  followBtn: { backgroundColor: COLORS.green, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  followingBtn: { backgroundColor: COLORS.greenLight, borderWidth: 1, borderColor: COLORS.green },
  followBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  followingBtnText: { color: COLORS.green },
  postCard: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, padding: 14 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  postName: { fontSize: 13, fontWeight: '700', color: '#111' },
  postMeta: { fontSize: 11, color: '#888', marginTop: 1 },
  videoContainer: { backgroundColor: '#1a1a2e', borderRadius: 10, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative' },
  playButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  durationBadge: { position: 'absolute', bottom: 8, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  durationText: { color: '#fff', fontSize: 10 },
  imageContainer: { backgroundColor: '#e8f5ee', borderRadius: 10, height: 130, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  postContent: { fontSize: 13, color: '#333', lineHeight: 20, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { color: COLORS.green, fontSize: 11, fontWeight: '600', marginRight: 8, marginBottom: 4 },
  actionsRow: { flexDirection: 'row', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionCount: { fontSize: 12, color: COLORS.subtext, marginLeft: 5 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 6, marginBottom: 20 },
  emptyBtn: { backgroundColor: COLORS.green, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});