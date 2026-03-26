import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import type { AuthMode } from '../hooks/useAuth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.78;

// ─────────────────────────────────────────────────────────────
// Input field
// ─────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, secureTextEntry, keyboardType, autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'words';
}) {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#BBB"
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShow(s => !s)} style={styles.eyeBtn}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#AAA" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Sign In form
// ─────────────────────────────────────────────────────────────

function SignInForm({
  onSwitch, loading, error, onClearError,
}: {
  onSwitch: () => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}) {
  const { signIn } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const valid = email.includes('@') && password.length >= 6;

  return (
    <View style={styles.form}>
      <View style={styles.iconCircle}>
        <Ionicons name="person-outline" size={28} color="#1A8B3C" />
      </View>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your KURA account</Text>

      <Field
        label="Email"
        value={email}
        onChange={v => { onClearError(); setEmail(v); }}
        placeholder="you@example.com"
        keyboardType="email-address"
      />

      <Field
        label="Password"
        value={password}
        onChange={v => { onClearError(); setPassword(v); }}
        placeholder="••••••••"
        secureTextEntry
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryBtn, (!valid || loading) && styles.primaryBtnDisabled]}
        onPress={() => valid && signIn(email, password)}
        disabled={!valid || loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryBtnText}>Sign In</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitch} style={styles.switchRow}>
        <Text style={styles.switchText}>
          Don't have an account?{' '}
          <Text style={styles.switchLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Sign Up form
// ─────────────────────────────────────────────────────────────

function SignUpForm({
  onSwitch, loading, error, onClearError,
}: {
  onSwitch: () => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}) {
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [done, setDone]         = useState(false);

  const passwordMatch = password === confirm;
  const valid = username.length >= 2 && email.includes('@') && password.length >= 6 && passwordMatch;

  const handleSignUp = async () => {
    if (!valid) return;
    await signUp(email, password, username);
    setDone(true);
  };

  if (done) {
    return (
      <View style={styles.form}>
        <View style={styles.successIconWrap}>
          <Ionicons name="mail-outline" size={32} color="#1A8B3C" />
        </View>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.verifyNote}>
          We sent a verification link to{'\n'}
          <Text style={{ fontWeight: '700', color: '#111' }}>{email}</Text>
          {'\n\n'}Click the link to verify your account, then sign in below.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onSwitch} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <View style={styles.iconCircle}>
        <Ionicons name="leaf-outline" size={28} color="#1A8B3C" />
      </View>

      <Text style={styles.title}>Join KURA</Text>
      <Text style={styles.subtitle}>Create your civic account</Text>

      <Field
        label="Username"
        value={username}
        onChange={v => { onClearError(); setUsername(v); }}
        placeholder="e.g. johndoe"
        autoCapitalize="none"
      />
      <Field
        label="Email"
        value={email}
        onChange={v => { onClearError(); setEmail(v); }}
        placeholder="you@example.com"
        keyboardType="email-address"
      />
      <Field
        label="Password"
        value={password}
        onChange={v => { onClearError(); setPassword(v); }}
        placeholder="Min. 6 characters"
        secureTextEntry
      />
      <Field
        label="Confirm Password"
        value={confirm}
        onChange={v => { onClearError(); setConfirm(v); }}
        placeholder="Repeat password"
        secureTextEntry
      />

      {confirm.length > 0 && !passwordMatch
        ? <Text style={styles.errorText}>Passwords don't match</Text>
        : null
      }
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryBtn, (!valid || loading) && styles.primaryBtnDisabled]}
        onPress={handleSignUp}
        disabled={!valid || loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryBtnText}>Create Account</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitch} style={styles.switchRow}>
        <Text style={styles.switchText}>
          Already have an account?{' '}
          <Text style={styles.switchLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export function AuthModal({ visible, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { step, error, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (step === 'done' && mode === 'signin') setTimeout(onClose, 300);
  }, [step]);

  useEffect(() => {
    if (!visible) { setMode(initialMode); clearError(); }
  }, [visible]);

  const switchMode = () => {
    clearError();
    setMode(m => m === 'signin' ? 'signup' : 'signin');
  };

  const isLoading = step === 'loading';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.kvContainer} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#888" />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            bounces={false}
          >
            {mode === 'signin' ? (
              <SignInForm
                onSwitch={switchMode}
                loading={isLoading}
                error={error}
                onClearError={clearError}
              />
            ) : (
              <SignUpForm
                onSwitch={switchMode}
                loading={isLoading}
                error={error}
                onClearError={clearError}
              />
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles — no gap prop anywhere
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  kvContainer: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: SHEET_HEIGHT,
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#E0E0E0',
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 6, zIndex: 10 },

  // Form
  form: { paddingHorizontal: 24, paddingTop: 20 },
  iconCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#F0FBF4',
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 14,
  },
  title: {
    fontSize: 22, fontWeight: '800', color: '#111',
    textAlign: 'center', marginBottom: 6,
  },
  subtitle: {
    fontSize: 14, color: '#777', textAlign: 'center',
    lineHeight: 20, marginBottom: 20,
  },

  // Field
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E0E0E0',
    borderRadius: 12, backgroundColor: '#FAFAFA',
  },
  fieldInput: {
    flex: 1, fontSize: 15, color: '#111',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  eyeBtn: { paddingHorizontal: 12 },

  // Error
  errorText: { fontSize: 13, color: '#E53935', marginBottom: 8 },

  // Button
  primaryBtn: {
    backgroundColor: '#1A8B3C', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  primaryBtnDisabled: { backgroundColor: '#A5D6B4' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Switch
  switchRow: { alignItems: 'center', paddingVertical: 4, marginBottom: 8 },
  switchText: { fontSize: 14, color: '#777' },
  switchLink: { color: '#1A8B3C', fontWeight: '700' },

  // Success
  successIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#F0FBF4',
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 14,
  },
  verifyNote: {
    fontSize: 14, color: '#666', textAlign: 'center',
    lineHeight: 22, marginBottom: 24, marginTop: 12,
  },
});