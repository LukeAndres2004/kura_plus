import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCreatePost, PostType } from '../hooks/Usecreatepost';
 
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLORS = {
  green: '#1a7a4a',
  greenLight: '#f0faf5',
  white: '#FFFFFF',
  border: '#F0F0F0',
  bg: '#F7F7F7',
  red: '#E63946',
};
 
// ─────────────────────────────────────────────────────────────
// Post type selector
// ─────────────────────────────────────────────────────────────
 
const POST_TYPES: { type: PostType; icon: string; label: string }[] = [
  { type: 'text',  icon: 'document-text-outline', label: 'Text'  },
  { type: 'image', icon: 'image-outline',          label: 'Image' },
  { type: 'video', icon: 'videocam-outline',        label: 'Video' },
  { type: 'poll',  icon: 'bar-chart-outline',       label: 'Poll'  },
];
 
// ─────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────
 
interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
 
export function CreatePostModal({ visible, onClose, onSuccess }: CreatePostModalProps) {
  const { loading, error, leaderProfile, createPost, clearError } = useCreatePost();
 
  const [postType, setPostType]     = useState<PostType>('text');
  const [content, setContent]       = useState('');
  const [tagsInput, setTagsInput]   = useState('');
  const [imageUrl, setImageUrl]     = useState('');
  const [videoUrl, setVideoUrl]     = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [feedType, setFeedType]     = useState<'Following' | 'Recommended' | 'Explore'>('Recommended');
 
  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  const isValid = content.trim().length > 0 &&
    (postType !== 'poll' || pollOptions.filter(o => o.trim()).length >= 2);
 
  const handleSubmit = async () => {
    if (!isValid) return;
    clearError();
 
    const success = await createPost({
      type: postType,
      content: content.trim(),
      tags,
      imageUrl:      postType === 'image' ? imageUrl : undefined,
      videoUrl:      postType === 'video' ? videoUrl : undefined,
      videoDuration: postType === 'video' ? videoDuration : undefined,
      pollOptions:   postType === 'poll'  ? pollOptions.filter(o => o.trim()) : undefined,
      feedType,
    });
 
    if (success) {
      resetForm();
      onSuccess();
      onClose();
    }
  };
 
  const resetForm = () => {
    setContent('');
    setTagsInput('');
    setImageUrl('');
    setVideoUrl('');
    setVideoDuration('');
    setPollOptions(['', '']);
    setPostType('text');
    setFeedType('Recommended');
  };
 
  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };
 
  const addPollOption = () => {
    if (pollOptions.length < 4) setPollOptions([...pollOptions, '']);
  };
 
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { resetForm(); onClose(); }} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isValid || loading}
            style={[styles.postBtn, (!isValid || loading) && styles.postBtnDisabled]}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.postBtnText}>Post</Text>
            }
          </TouchableOpacity>
        </View>
 
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
 
          {/* Author row */}
          {leaderProfile && (
            <View style={styles.authorRow}>
              <View style={[styles.avatar, { backgroundColor: leaderProfile.avatarColor }]}>
                <Text style={styles.avatarText}>{leaderProfile.initials}</Text>
              </View>
              <View>
                <Text style={styles.authorName}>{leaderProfile.name}</Text>
                <Text style={styles.authorRole}>{leaderProfile.role} · {leaderProfile.location}</Text>
              </View>
            </View>
          )}
 
          {/* Post type selector */}
          <View style={styles.typeRow}>
            {POST_TYPES.map(pt => (
              <TouchableOpacity
                key={pt.type}
                onPress={() => setPostType(pt.type)}
                style={[styles.typeBtn, postType === pt.type && styles.typeBtnActive]}
              >
                <Ionicons
                  name={pt.icon as never}
                  size={18}
                  color={postType === pt.type ? COLORS.green : '#999'}
                />
                <Text style={[styles.typeLabel, postType === pt.type && styles.typeLabelActive]}>
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
 
          {/* Content */}
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind? Share your civic update..."
            placeholderTextColor="#BBB"
            value={content}
            onChangeText={v => { clearError(); setContent(v); }}
            multiline
            maxLength={1000}
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>
 
          {/* Image URL */}
          {postType === 'image' && (
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Image URL</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="https://..."
                placeholderTextColor="#BBB"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />
            </View>
          )}
 
          {/* Video fields */}
          {postType === 'video' && (
            <View>
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Video URL</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="https://..."
                  placeholderTextColor="#BBB"
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Duration (e.g. 4:32)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="0:00"
                  placeholderTextColor="#BBB"
                  value={videoDuration}
                  onChangeText={setVideoDuration}
                />
              </View>
            </View>
          )}
 
          {/* Poll options */}
          {postType === 'poll' && (
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Poll Options (min 2, max 4)</Text>
              {pollOptions.map((opt, i) => (
                <TextInput
                  key={i}
                  style={[styles.fieldInput, { marginBottom: 8 }]}
                  placeholder={`Option ${i + 1}`}
                  placeholderTextColor="#BBB"
                  value={opt}
                  onChangeText={v => updatePollOption(i, v)}
                />
              ))}
              {pollOptions.length < 4 && (
                <TouchableOpacity onPress={addPollOption} style={styles.addOptionBtn}>
                  <Ionicons name="add-circle-outline" size={18} color={COLORS.green} />
                  <Text style={styles.addOptionText}>Add option</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
 
          {/* Tags */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Tags (comma separated)</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Healthcare, Nairobi, Policy"
              placeholderTextColor="#BBB"
              value={tagsInput}
              onChangeText={setTagsInput}
            />
          </View>
 
          {/* Feed type */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Post to</Text>
            <View style={styles.feedTypeRow}>
              {(['Following', 'Recommended', 'Explore'] as const).map(ft => (
                <TouchableOpacity
                  key={ft}
                  onPress={() => setFeedType(ft)}
                  style={[styles.feedTypeBtn, feedType === ft && styles.feedTypeBtnActive]}
                >
                  <Text style={[styles.feedTypeText, feedType === ft && styles.feedTypeTextActive]}>
                    {ft}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
 
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
 
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}
 
// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
 
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 15, color: '#666' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  postBtn: { backgroundColor: COLORS.green, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7 },
  postBtnDisabled: { backgroundColor: '#A5D6B4' },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
 
  // Author
  authorRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  authorName: { fontSize: 15, fontWeight: '700', color: '#111' },
  authorRole: { fontSize: 12, color: '#888', marginTop: 2 },
 
  // Type selector
  typeRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  typeBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, marginRight: 6 },
  typeBtnActive: { backgroundColor: COLORS.greenLight },
  typeLabel: { fontSize: 11, color: '#999', marginTop: 3, fontWeight: '600' },
  typeLabelActive: { color: COLORS.green },
 
  // Content
  contentInput: { fontSize: 16, color: '#111', padding: 16, minHeight: 120, textAlignVertical: 'top', lineHeight: 24 },
  charCount: { fontSize: 11, color: '#BBB', textAlign: 'right', paddingRight: 16, marginBottom: 8 },
 
  // Fields
  fieldWrap: { paddingHorizontal: 16, marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111', borderWidth: 1, borderColor: COLORS.border },
 
  // Poll
  addOptionBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  addOptionText: { color: COLORS.green, fontWeight: '600', fontSize: 14, marginLeft: 6 },
 
  // Feed type
  feedTypeRow: { flexDirection: 'row' },
  feedTypeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginRight: 6 },
  feedTypeBtnActive: { borderColor: COLORS.green, backgroundColor: COLORS.greenLight },
  feedTypeText: { fontSize: 12, color: '#888', fontWeight: '600' },
  feedTypeTextActive: { color: COLORS.green },
 
  // Error
  errorText: { color: COLORS.red, fontSize: 13, paddingHorizontal: 16, marginBottom: 8 },
});
 