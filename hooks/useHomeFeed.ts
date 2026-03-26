import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
 
// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
 
export type FeedType = 'Following' | 'Recommended' | 'Explore';
 
export interface Leader {
  id: string;
  initials: string;
  name: string;
  location?: string;
  color: string;
  party?: string;
  partyColor?: string;
  followerCount: number;
  following: boolean;
}
 
export interface Post {
  id: string;
  leaderId?: string;
  initials: string;
  name: string;
  role?: string;
  location?: string;
  party?: string;
  partyColor?: string;
  avatarColor: string;
  time: string;
  postedAt: string;
  type: 'text' | 'video' | 'image' | 'poll';
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  videoDuration?: string;
  feedType: FeedType;
  liked: boolean;
}
 
// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLeader(row: any, followedIds: Set<string>): Leader {
  return {
    id: row.id,
    initials: row.initials,
    name: row.name,
    location: row.location ?? undefined,
    color: row.color,
    party: row.party ?? undefined,
    partyColor: row.party_color ?? undefined,
    followerCount: row.follower_count ?? 0,
    following: followedIds.has(row.id),
  };
}
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(row: any, likedIds: Set<string>): Post {
  return {
    id: row.id,
    leaderId: row.leader_id ?? undefined,
    initials: row.initials,
    name: row.name,
    role: row.role ?? undefined,
    location: row.location ?? undefined,
    party: row.party ?? undefined,
    partyColor: row.party_color ?? undefined,
    avatarColor: row.avatar_color,
    time: row.time,
    postedAt: row.posted_at,
    type: row.type,
    content: row.content,
    tags: row.tags ?? [],
    likes: row.likes ?? 0,
    comments: row.comments ?? 0,
    shares: row.shares ?? 0,
    videoDuration: row.video_duration ?? undefined,
    feedType: row.feed_type,
    liked: likedIds.has(row.id),
  };
}
 
// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
 
export function useHomeFeed(feedType: FeedType) {
  const [leaders, setLeaders]   = useState<Leader[]>([]);
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [userId, setUserId]     = useState<string | null>(null);
  const [tick, setTick]         = useState(0);
 
  const refetch = useCallback(() => setTick(t => t + 1), []);
 
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTick(t => t + 1);
    setTimeout(() => setRefreshing(false), 800);
  }, []);
 
  useEffect(() => {
    let cancelled = false;
 
    async function load() {
      if (!refreshing) setLoading(true);
      setError(null);
 
      // ── Auth user ─────────────────────────────────────────
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      if (!cancelled) setUserId(uid);
 
      // ── Fetch followed leader IDs ─────────────────────────
      let followedIds = new Set<string>();
      if (uid) {
        const { data: followRows } = await supabase
          .from('follows')
          .select('leader_id')
          .eq('user_id', uid);
        followedIds = new Set((followRows ?? []).map(r => r.leader_id));
      }
 
      // ── Fetch liked post IDs ──────────────────────────────
      let likedIds = new Set<string>();
      if (uid) {
        const { data: likeRows } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', uid);
        likedIds = new Set((likeRows ?? []).map(r => r.post_id));
      }
 
      // ── Fetch leaders ─────────────────────────────────────
      const { data: leaderRows, error: leaderErr } = await supabase
        .from('leaders')
        .select('*')
        .order('follower_count', { ascending: false })
        .limit(10);
 
      if (leaderErr && !cancelled) {
        setError(leaderErr.message);
        setLoading(false);
        return;
      }
 
      // ── Fetch posts ───────────────────────────────────────
      let postRows: unknown[] = [];
 
      if (feedType === 'Following' && uid && followedIds.size > 0) {
        // Personalised: posts from leaders the user follows
        const { data } = await supabase
          .from('posts')
          .select('*')
          .in('leader_id', Array.from(followedIds))
          .order('posted_at', { ascending: false })
          .limit(20);
        postRows = data ?? [];
      } else if (feedType === 'Following' && (!uid || followedIds.size === 0)) {
        // Not logged in or not following anyone — show Recommended as fallback
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('feed_type', 'Recommended')
          .order('posted_at', { ascending: false })
          .limit(20);
        postRows = data ?? [];
      } else {
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('feed_type', feedType)
          .order('posted_at', { ascending: false })
          .limit(20);
        postRows = data ?? [];
      }
 
      if (cancelled) return;
 
      setLeaders((leaderRows ?? []).map(r => mapLeader(r, followedIds)));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPosts(postRows.map((r: any) => mapPost(r, likedIds)));
      setLoading(false);
      setRefreshing(false);
    }
 
    load();
    return () => { cancelled = true; };
  }, [feedType, tick]);
 
  // ── Toggle follow ─────────────────────────────────────────
  const toggleFollow = useCallback(async (leaderId: string) => {
    if (!userId) return;
 
    const leader = leaders.find(l => l.id === leaderId);
    if (!leader) return;
 
    // Optimistic update
    setLeaders(prev => prev.map(l =>
      l.id === leaderId
        ? { ...l, following: !l.following, followerCount: l.followerCount + (l.following ? -1 : 1) }
        : l
    ));
 
    if (leader.following) {
      await supabase.from('follows').delete()
        .eq('user_id', userId).eq('leader_id', leaderId);
    } else {
      await supabase.from('follows').insert({ user_id: userId, leader_id: leaderId });
    }
 
    // Refresh if on Following tab so feed updates
    if (feedType === 'Following') refetch();
  }, [userId, leaders, feedType, refetch]);
 
  // ── Toggle like ───────────────────────────────────────────
  const toggleLike = useCallback(async (postId: string) => {
    if (!userId) return;
 
    const post = posts.find(p => p.id === postId);
    if (!post) return;
 
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
        : p
    ));
 
    if (post.liked) {
      await supabase.from('post_likes').delete()
        .eq('user_id', userId).eq('post_id', postId);
      await supabase.from('posts').update({ likes: post.likes - 1 }).eq('id', postId);
    } else {
      await supabase.from('post_likes').insert({ user_id: userId, post_id: postId });
      await supabase.from('posts').update({ likes: post.likes + 1 }).eq('id', postId);
    }
  }, [userId, posts]);
 
  return {
    leaders,
    posts,
    loading,
    refreshing,
    error,
    userId,
    refetch,
    onRefresh,
    toggleFollow,
    toggleLike,
  };
}
 