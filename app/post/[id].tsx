import React, { useState, useRef } from 'react';
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
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { usePost, Comment } from '../../hooks/Usepost';
 
const COLORS = {
  green: '#1a7a4a',
  greenLight: '#f0faf5',
  white: '#FFFFFF',
  bg: '#F7F7F7',
  border: '#F0F0F0',
  subtext: '#888888',
  red: '#E63946',
};
 
// ─────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────
 
function Avatar({ initials, color, size = 38 }: { initials: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.35 }}>{initials}</Text>
    </View>
  );
}
 
// ─────────────────────────────────────────────────────────────
// Comment card
// ─────────────────────────────────────────────────────────────
 
function CommentCard({ comment }: { comment: Comment }) {
  const date = new Date(comment.createdAt);
  const timeAgo = formatTime(date);
 
  return (
    <View style={styles.commentCard}>
      <Avatar initials={comment.initials} color={comment.avatarColor} size={34} />
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{comment.username}</Text>
          <Text style={styles.commentTime}>{timeAgo}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
  );
}
 
function formatTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
 
// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────
 
export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { post, comments, loading, error, userId, toggleLike, toggleBookmark, submitComment, sharePost } = usePost(id);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const scrollRef = useRef<ScrollView>(null);
 
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await submitComment(commentText);
    setCommentText('');
    setSubmitting(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  };
 
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.green} />
        </View>
      </SafeAreaView>
    );
  }
 
  if (error || !post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.red} />
          <Text style={styles.errorText}>{error ?? 'Post not found'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnLarge}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
 
  const isLoggedIn = !!userId;
 
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
 
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity onPress={isLoggedIn ? toggleBookmark : undefined}>
          <Ionicons
            name={post.bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={post.bookmarked ? COLORS.green : '#111'}
          />
        </TouchableOpacity>
      </View>
 
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: COLORS.bg }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Post content ── */}
          <View style={styles.postCard}>
            {/* Author */}
            <View style={styles.postHeader}>
              <View style={{ position: 'relative' }}>
                <Avatar initials={post.initials} color={post.avatarColor} size={44} />
                <View style={styles.onlineDot} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={styles.postName}>{post.name}</Text>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E', marginHorizontal: 4 }} />
                  {post.party ? (
                    <View style={{ backgroundColor: post.partyColor ?? '#888', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{post.party}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.postMeta}>{post.role} · {post.location} · {post.time}</Text>
              </View>
            </View>
 
            {/* Media */}
            {post.type === 'video' && (
              <View style={styles.videoContainer}>
                <View style={styles.playButton}>
                  <Ionicons name="play" size={24} color="#fff" />
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
                <Ionicons name="image-outline" size={36} color="#aaa" />
              </View>
            )}
 
            {/* Poll */}
            {post.type === 'poll' && post.pollOptions && (
              <View style={styles.pollContainer}>
                {post.pollOptions.map((option, i) => (
                  <TouchableOpacity key={i} style={styles.pollOption} disabled={!isLoggedIn}>
                    <View style={styles.pollBar}>
                      <View style={[styles.pollFill, { width: `${Math.floor(Math.random() * 60 + 10)}%` }]} />
                    </View>
                    <Text style={styles.pollOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
 
            {/* Content */}
            <Text style={styles.postContent}>{post.content}</Text>
 
            {/* Tags */}
            {post.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {post.tags.map(tag => (
                  <Text key={tag} style={styles.tag}>{tag}</Text>
                ))}
              </View>
            )}
 
            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={isLoggedIn ? toggleLike : undefined}
                style={styles.actionBtn}
              >
                <Ionicons
                  name={post.liked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={post.liked ? COLORS.red : COLORS.subtext}
                />
                <Text style={[styles.actionCount, post.liked && { color: COLORS.red }]}>
                  {post.likes.toLocaleString()}
                </Text>
              </TouchableOpacity>
 
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={20} color={COLORS.subtext} />
                <Text style={styles.actionCount}>{post.comments.toLocaleString()}</Text>
              </TouchableOpacity>
 
              <TouchableOpacity
                onPress={isLoggedIn ? sharePost : undefined}
                style={styles.actionBtn}
              >
                <Ionicons name="share-social-outline" size={20} color={COLORS.subtext} />
                <Text style={styles.actionCount}>{post.shares.toLocaleString()}</Text>
              </TouchableOpacity>
            </View>
          </View>
 
          {/* ── Comments ── */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({comments.length})
            </Text>
 
            {comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <Ionicons name="chatbubble-outline" size={32} color="#DDD" />
                <Text style={styles.emptyCommentsText}>No comments yet. Be the first!</Text>
              </View>
            ) : (
              comments.map(comment => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            )}
          </View>
 
          <View style={{ height: 80 }} />
        </ScrollView>
 
        {/* ── Comment input ── */}
        {isLoggedIn ? (
          <View style={styles.commentInputWrap}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor="#BBB"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
            >
              {submitting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send" size={18} color="#fff" />
              }
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Sign in to like, comment and share</Text>
          </View>
        )}
      </KeyboardAvoidingView>
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
 
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  backBtnLarge: { marginTop: 16, backgroundColor: COLORS.green, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
 
  // Post
  postCard: { backgroundColor: COLORS.white, padding: 16, marginBottom: 8 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', borderWidth: 2, borderColor: COLORS.white },
  postName: { fontSize: 14, fontWeight: '700', color: '#111' },
  postMeta: { fontSize: 12, color: '#888', marginTop: 2 },
 
  // Media
  videoContainer: { backgroundColor: '#1a1a2e', borderRadius: 12, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative' },
  playButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  durationBadge: { position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  durationText: { color: '#fff', fontSize: 11 },
  imageContainer: { backgroundColor: '#e8f5ee', borderRadius: 12, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
 
  // Poll
  pollContainer: { marginBottom: 12 },
  pollOption: { marginBottom: 8 },
  pollBar: { height: 36, backgroundColor: '#F0F0F0', borderRadius: 8, overflow: 'hidden', justifyContent: 'center' },
  pollFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: COLORS.greenLight, borderRadius: 8 },
  pollOptionText: { paddingHorizontal: 12, fontSize: 13, fontWeight: '600', color: '#111' },
 
  // Content
  postContent: { fontSize: 15, color: '#222', lineHeight: 22, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  tag: { color: COLORS.green, fontSize: 12, fontWeight: '600', marginRight: 8, marginBottom: 4 },
  actionsRow: { flexDirection: 'row', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  actionCount: { fontSize: 13, color: COLORS.subtext, marginLeft: 5 },
 
  // Comments
  commentsSection: { backgroundColor: COLORS.white, padding: 16 },
  commentsTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 14 },
  commentCard: { flexDirection: 'row', marginBottom: 16 },
  commentBody: { flex: 1, marginLeft: 10, backgroundColor: COLORS.bg, borderRadius: 12, padding: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentUser: { fontSize: 12, fontWeight: '700', color: '#111' },
  commentTime: { fontSize: 11, color: '#AAA' },
  commentText: { fontSize: 13, color: '#333', lineHeight: 19 },
  emptyComments: { alignItems: 'center', paddingVertical: 32 },
  emptyCommentsText: { fontSize: 13, color: '#BBB', marginTop: 8 },
 
  // Comment input
  commentInputWrap: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  commentInput: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111', maxHeight: 100, marginRight: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#A5D6B4' },
 
  // Login prompt
  loginPrompt: { padding: 14, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center' },
  loginPromptText: { fontSize: 13, color: '#888' },
});
 