import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
 
export type PostType = 'text' | 'image' | 'video' | 'poll';
 
export interface CreatePostData {
  type: PostType;
  content: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
  videoDuration?: string;
  pollOptions?: string[];
  feedType: 'Following' | 'Recommended' | 'Explore';
}
 
export interface UseCreatePostResult {
  loading: boolean;
  error: string | null;
  isLeader: boolean;
  leaderProfile: {
    id: string;
    name: string;
    initials: string;
    role?: string;
    location?: string;
    party?: string;
    partyColor?: string;
    avatarColor: string;
    leaderId?: string;
  } | null;
  createPost: (data: CreatePostData) => Promise<boolean>;
  clearError: () => void;
}
 
export function useCreatePost(): UseCreatePostResult {
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [isLeader, setIsLeader]           = useState(false);
  const [leaderProfile, setLeaderProfile] = useState<UseCreatePostResult['leaderProfile']>(null);
  const [checked, setChecked]             = useState(false);
 
  // Check role on first use
  const checkRole = useCallback(async () => {
    if (checked) return;
    setChecked(true);
 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
 
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
 
    if (!profile || profile.role !== 'leader') return;
 
    // Find matching leader row
    const { data: leaderRow } = await supabase
      .from('leaders')
      .select('*')
      .eq('name', profile.name)
      .maybeSingle();
 
    setIsLeader(true);
    setLeaderProfile({
      id: user.id,
      name: profile.name ?? 'Leader',
      initials: profile.initials ?? profile.name?.[0]?.toUpperCase() ?? 'L',
      role: profile.role,
      location: profile.county ?? undefined,
      party: profile.party ?? undefined,
      partyColor: profile.party_color ?? undefined,
      avatarColor: profile.avatar_color ?? '#1A8B3C',
      leaderId: leaderRow?.id ?? undefined,
    });
  }, [checked]);
 
  // Call checkRole lazily
  if (!checked) checkRole();
 
  const createPost = useCallback(async (data: CreatePostData): Promise<boolean> => {
    if (!leaderProfile) { setError('Not authorized'); return false; }
    setLoading(true);
    setError(null);
 
    const now = new Date();
    const timeAgo = 'Just now';
 
    const { error: insertErr } = await supabase.from('posts').insert({
      leader_id:      leaderProfile.leaderId ?? null,
      initials:       leaderProfile.initials,
      name:           leaderProfile.name,
      role:           leaderProfile.role,
      location:       leaderProfile.location,
      party:          leaderProfile.party,
      party_color:    leaderProfile.partyColor,
      avatar_color:   leaderProfile.avatarColor,
      time:           timeAgo,
      posted_at:      now.toISOString(),
      type:           data.type,
      content:        data.content,
      tags:           data.tags,
      image_url:      data.imageUrl ?? null,
      video_duration: data.videoDuration ?? null,
      poll_options:   data.pollOptions ?? null,
      feed_type:      data.feedType,
      likes:          0,
      comments:       0,
      shares:         0,
    });
 
    setLoading(false);
 
    if (insertErr) {
      setError(insertErr.message);
      return false;
    }
 
    return true;
  }, [leaderProfile]);
 
  const clearError = useCallback(() => setError(null), []);
 
  return { loading, error, isLeader, leaderProfile, createPost, clearError };
}
 