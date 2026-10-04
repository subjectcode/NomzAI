import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { NomzLogo } from '../components/NomzLogo';
import { colors, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToWelcome?: () => void;
  onGoogleSignInSuccess?: () => void;
}

export function RegisterScreen({
  onNavigateToLogin,
  onNavigateToWelcome,
  onGoogleSignInSuccess,
}: RegisterScreenProps) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    setErrorMessage(null);
    const trimmedName = displayName.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Nama Lengkap
    if (!trimmedName) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return false;
    }

    // 2. Username
    if (!trimmedUsername) {
      setErrorMessage('Silakan masukkan username.');
      return false;
    }

    if (trimmedUsername.length < 4) {
      setErrorMessage('Username minimal 4 karakter.');
      return false;
    }

    if (trimmedUsername.length > 20) {
      setErrorMessage('Username maksimal 20 karakter.');
      return false;
    }

    const usernameRegex = /^[a-z0-9_]{4,20}$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setErrorMessage('Username hanya boleh berisi huruf, angka, dan underscore.');
      return false;
    }

    // 3. Email
    if (!trimmedEmail) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Format email tidak valid (contoh: nama@email.com).');
      return false;
    }

    // 4. Password
    if (!password || !password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi.');
      return false;
    }

    if (password.length < 8) {
      setErrorMessage('Password minimal 8 karakter.');
      return false;
    }

    // 5. Confirm Password
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await register({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err: any) {
      const message = err.message || '';
      const lower = message.toLowerCase();

      if (lower.includes('username sudah digunakan') || lower.includes('username already')) {
        setErrorMessage('Username sudah digunakan.');
      } else if (
        lower.includes('email sudah terdaftar') ||
        lower.includes('already registered') ||
        lower.includes('email already')
      ) {
        setErrorMessage('Email sudah terdaftar.');
      } else if (lower.includes('password minimal 8')) {
        setErrorMessage('Password minimal 8 karakter.');
      } else if (lower.includes('username hanya boleh')) {
        setErrorMessage('Username hanya boleh berisi huruf, angka, dan underscore.');
      } else if (
        lower.includes('network') ||
        lower.includes('failed to fetch') ||
        lower.includes('koneksi') ||
        lower.includes('abort')
      ) {
        setErrorMessage('Koneksi bermasalah. Coba lagi.');
      } else {
        setErrorMessage(message || 'Gagal mendaftar. Silakan periksa kembali data Anda.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 16) + 8,
              paddingBottom: Math.max(insets.bottom, 16) + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with NomzLogo */}
          <View style={styles.topBar}>
            {onNavigateToWelcome ? (
              <TouchableOpacity
                onPress={onNavigateToWelcome}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 20 }} />
            )}
            <NomzLogo size="sm" variant="compact" />
            <View style={{ width: 20 }} />
          </View>

          {/* Heading Section */}
          <View style={styles.headerSection}>
            <Text style={styles.screenHeading}>Daftar Akun Baru</Text>
            <Text style={styles.screenSubheading}>
              Mulai selamatkan bahan makanan dan hemat belanja harianmu bersama Nomz.
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={colors.error} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Field: Display Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nama Lengkap</Text>
              <View style={styles.inputWrap}>
                <Feather name="user" size={18} color={colors.primary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Ryan Pratama"
                  placeholderTextColor={colors.textMuted}
                  value={displayName}
                  onChangeText={(val) => {
                    setDisplayName(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Field: Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Username</Text>
              <View style={styles.inputWrap}>
                <Feather name="at-sign" size={18} color={colors.primary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: ryanfeb"
                  placeholderTextColor={colors.textMuted}
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val.toLowerCase());
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Field: Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Alamat Email</Text>
              <View style={styles.inputWrap}>
                <Feather name="mail" size={18} color={colors.primary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="nama@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Field: Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Kata Sandi</Text>
              <View style={styles.inputWrap}>
                <Feather name="lock" size={18} color={colors.primary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Minimal 8 karakter"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.eyeBtn}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Field: Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Konfirmasi Kata Sandi</Text>
              <View style={styles.inputWrap}>
                <Feather name="lock" size={18} color={colors.primary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ketik ulang kata sandi"
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((p) => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.eyeBtn}
                >
                  <Feather
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.primaryBtnDisabled]}
              onPress={handleRegister}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Daftar Sekarang</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Sign-In Section */}
          <View style={styles.socialSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau daftar dengan</Text>
              <View style={styles.dividerLine} />
            </View>

            <GoogleSignInButton
              disabled={isSubmitting}
              onSuccess={onGoogleSignInSuccess}
            />
          </View>

          {/* Footer: Sudah punya akun? */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Sudah memiliki akun Nomz? </Text>
            <TouchableOpacity onPress={onNavigateToLogin} disabled={isSubmitting}>
              <Text style={styles.footerLink}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerSection: {
    marginBottom: 18,
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  screenSubheading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 19,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
    ...shadows.level1,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  eyeBtn: {
    padding: 6,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 6,
    ...shadows.level1,
  },
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  socialSection: {
    marginBottom: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
