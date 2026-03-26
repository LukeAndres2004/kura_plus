import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  name?: string;
  county?: string;
  party?: string;
  partyColor?: string;
  avatarColor: string;
  initials?: string;
  bio?: string;
}

export interface FollowedLeader {
  id: string;
  initials: string;
  name: string;
  role?: string;
  location?: string;
  color: string;
  party?: string;
  partyColor?: string;
  followerCount: number;
}

export interface BookmarkedPost {
  id: string;
  initials: string;
  name: string;
  avatarColor: string;
  time: string;
  type: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
}

export interface UseProfileResult {
  profile: Profile | null;
  followedLeaders: FollowedLeader[];
  bookmarkedPosts: BookmarkedPost[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateProfile: (updates: Partial<Omit<Profile, 'id'>>) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toLeader(l: any): FollowedLeader {
  return {
    id: l.id,
    initials: l.initials,
    name: l.name,
    role: l.role ?? undefined,
    location: l.location ?? undefined,
    color: l.color,
    party: l.party ?? undefined,
    partyColor: l.party_color ?? undefined,
    followerCount: l.follower_count ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPost(p: any): BookmarkedPost {
  return {
    id: p.id,
    initials: p.initials,
    name: p.name,
    avatarColor: p.avatar_color,
    time: p.time,
    type: p.type,
    content: p.content,
    tags: p.tags ?? [],
    likes: p.likes ?? 0,
    comments: p.comments ?? 0,
    shares: p.shares ?? 0,
  };
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followedLeaders, setFollowedLeaders] = useState<FollowedLeader[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setProfile(null);
          setFollowedLeaders([]);
          setBookmarkedPosts([]);
          setLoading(false);
        }
        return;
      }

      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileErr) {
        if (!cancelled) {
          setError(profileErr.message);
          setLoading(false);
        }
        return;
      }

      const { data: followRows } = await supabase
        .from('follows')
        .select('leader_id, leaders(*)')
        .eq('user_id', user.id);

      const { data: bookmarkRows } = await supabase
        .from('bookmarks')
        .select('post_id, posts(*)')
        .eq('user_id', user.id);

      if (cancelled) return;

      setProfile({
        id: profileRow.id,
        name: profileRow.name ?? undefined,
        county: profileRow.county ?? undefined,
        party: profileRow.party ?? undefined,
        partyColor: profileRow.party_color ?? undefined,
        avatarColor: profileRow.avatar_color ?? '#1A8B3C',
        initials: profileRow.initials ?? undefined,
        bio: profileRow.bio ?? undefined,
      });

      setFollowedLeaders(
        (followRows ?? [])
          .map(r => r.leaders)
          .filter(Boolean)
          .map(toLeader)
      );

      setBookmarkedPosts(
        (bookmarkRows ?? [])
          .map(r => r.posts)
          .filter(Boolean)
          .map(toPost)
      );

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [tick]);

  const updateProfile = useCallback(
    async (updates: Partial<Omit<Profile, 'id'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snakeUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined)        snakeUpdates.name         = updates.name;
      if (updates.county !== undefined)      snakeUpdates.county       = updates.county;
      if (updates.party !== undefined)       snakeUpdates.party        = updates.party;
      if (updates.partyColor !== undefined)  snakeUpdates.party_color  = updates.partyColor;
      if (updates.avatarColor !== undefined) snakeUpdates.avatar_color = updates.avatarColor;
      if (updates.initials !== undefined)    snakeUpdates.initials     = updates.initials;
      if (updates.bio !== undefined)         snakeUpdates.bio          = updates.bio;

      const { error: updateErr } = await supabase
        .from('profiles')
        .update(snakeUpdates)
        .eq('id', user.id);

      if (!updateErr) refetch();
    },
    [refetch]
  );

  return { profile, followedLeaders, bookmarkedPosts, loading, error, refetch, updateProfile };
}