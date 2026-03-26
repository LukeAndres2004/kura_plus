import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
 
// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
 
export interface Comment {
  id: number;
  postId: number;
  userId: string;
  content: string;
  createdAt: string;
  username: string;
  avatarColor: string;
  initials: string;
}
 
export interface PostDetail {
  id: number;
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
  imageUrl?: string;
  pollOptions?: string[];
  liked: boolean;
  bookmarked: boolean;
}
 
export interface UsePostResult {
  post: PostDetail | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  userId: string | null;
  toggleLike: () => Promise<void>;
  toggleBookmark: () => Promise<void>;
  submitComment: (content: string) => Promise<void>;
  sharePost: () => Promise<void>;
  refetch: () => void;
}
 
// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
 
export function usePost(postId: string): UsePostResult {
  const [post, setPost]         = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [userId, setUserId]     = useState<string | null>(null);
  const [tick, setTick]         = useState(0);
 
  const refetch = useCallback(() => setTick(t => t + 1), []);
 
  useEffect(() => {
    let cancelled = false;
 
    async function load() {
      setLoading(true);
      setError(null);
 
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      if (!cancelled) setUserId(uid);
 
      // Liked?
      let liked = false;
      let bookmarked = false;
      if (uid) {
        const { data: likeRow } = await supabase
          .from('post_likes')
          .select('id')
          .eq('user_id', uid)
          .eq('post_id', postId)
          .maybeSingle();
        liked = !!likeRow;
 
        const { data: bmRow } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', uid)
          .eq('post_id', postId)
          .maybeSingle();
        bookmarked = !!bmRow;
      }
 
      // Post
      const { data: postRow, error: postErr } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
 
      if (postErr || !postRow) {
        if (!cancelled) { setError('Post not found'); setLoading(false); }
        return;
      }
 
      // Comments
      const { data: commentRows } = await supabase
        .from('comments')
        .select('*, profiles(name, avatar_color, initials)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
 
      if (cancelled) return;
 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPost({
        id: postRow.id,
        leaderId: postRow.leader_id ?? undefined,
        initials: postRow.initials,
        name: postRow.name,
        role: postRow.role ?? undefined,
        location: postRow.location ?? undefined,
        party: postRow.party ?? undefined,
        partyColor: postRow.party_color ?? undefined,
        avatarColor: postRow.avatar_color,
        time: postRow.time,
        postedAt: postRow.posted_at,
        type: postRow.type,
        content: postRow.content,
        tags: postRow.tags ?? [],
        likes: postRow.likes ?? 0,
        comments: postRow.comments ?? 0,
        shares: postRow.shares ?? 0,
        videoDuration: postRow.video_duration ?? undefined,
        imageUrl: postRow.image_url ?? undefined,
        pollOptions: postRow.poll_options ?? undefined,
        liked,
        bookmarked,
      });
 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setComments((commentRows ?? []).map((c: any) => ({
        id: c.id,
        postId: c.post_id,
        userId: c.user_id,
        content: c.content,
        createdAt: c.created_at,
        username: c.profiles?.name ?? 'User',
        avatarColor: c.profiles?.avatar_color ?? '#1A8B3C',
        initials: c.profiles?.initials ?? c.profiles?.name?.[0]?.toUpperCase() ?? 'U',
      })));
 
      setLoading(false);
    }
 
    load();
    return () => { cancelled = true; };
  }, [postId, tick]);
 
  // ── Toggle like ───────────────────────────────────────────
  const toggleLike = useCallback(async () => {
    if (!userId || !post) return;
    const wasLiked = post.liked;
 
    setPost(p => p ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p);
 
    if (wasLiked) {
      await supabase.from('post_likes').delete().eq('user_id', userId).eq('post_id', post.id);
      await supabase.from('posts').update({ likes: post.likes - 1 }).eq('id', post.id);
    } else {
      await supabase.from('post_likes').insert({ user_id: userId, post_id: post.id });
      await supabase.from('posts').update({ likes: post.likes + 1 }).eq('id', post.id);
    }
  }, [userId, post]);
 
  // ── Toggle bookmark ───────────────────────────────────────
  const toggleBookmark = useCallback(async () => {
    if (!userId || !post) return;
    const wasBookmarked = post.bookmarked;
 
    setPost(p => p ? { ...p, bookmarked: !p.bookmarked } : p);
 
    if (wasBookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', userId).eq('post_id', post.id);
    } else {
      await supabase.from('bookmarks').insert({ user_id: userId, post_id: post.id });
    }
  }, [userId, post]);
 
  // ── Submit comment ────────────────────────────────────────
  const submitComment = useCallback(async (content: string) => {
    if (!userId || !post || !content.trim()) return;
 
    const { error: insertErr } = await supabase.from('comments').insert({
      post_id: post.id,
      user_id: userId,
      content: content.trim(),
    });
 
    if (!insertErr) {
      await supabase.from('posts').update({ comments: post.comments + 1 }).eq('id', post.id);
      refetch();
    }
  }, [userId, post, refetch]);
 
  // ── Share ─────────────────────────────────────────────────
  const sharePost = useCallback(async () => {
    if (!userId || !post) return;
    await supabase.from('shares').insert({ post_id: post.id, user_id: userId });
    await supabase.from('posts').update({ shares: post.shares + 1 }).eq('id', post.id);
    setPost(p => p ? { ...p, shares: p.shares + 1 } : p);
  }, [userId, post]);
 
  return { post, comments, loading, error, userId, toggleLike, toggleBookmark, submitComment, sharePost, refetch };
}