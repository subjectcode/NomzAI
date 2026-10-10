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

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToWelcome?: () => void;
  onGoogleSignInSuccess?: () => void;
}

export function LoginScreen({
  onNavigateToRegister,
  onNavigateToWelcome,
  onGoogleSignInSuccess,
}: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  const validate = (): boolean => {
    setErrorMessage(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Format email tidak valid (contoh: nama@email.com).');
      return false;
    }

    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(
        {
          email: email.trim(),
          password,
        },
        rememberMe
      );
    } catch (err: any) {
      const status = err.status;
      const message = err.message || '';
      const lower = message.toLowerCase();

      if (
        message.includes('GOOGLE_ACCOUNT_NO_PASSWORD') ||
        (lower.includes('google') && (lower.includes('password') || lower.includes('sandi')))
      ) {
        setIsGoogleAccount(true);
        setErrorMessage(
          'Akun ini terdaftar melalui Google Sign-In. Silakan gunakan tombol Masuk dengan Google di bawah.'
        );
      } else if (
        status === 401 ||
        message.includes('401') ||
        lower.includes('credential') ||
        lower.includes('salah') ||
        lower.includes('tidak cocok')
      ) {
        setIsGoogleAccount(false);
        setErrorMessage('Email atau kata sandi tidak cocok. Silakan coba lagi.');
      } else if (
        lower.includes('network') ||
        lower.includes('failed to fetch') ||
        lower.includes('koneksi') ||
        lower.includes('abort')
      ) {
        setIsGoogleAccount(false);
        setErrorMessage('Tidak dapat terhubung ke server. Periksa jaringan Anda.');
      } else {
        setIsGoogleAccount(false);
        setErrorMessage(message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.');
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
            <Text style={styles.screenHeading}>Selamat Datang</Text>
            <Text style={styles.screenSubheading}>
              Masuk untuk melanjutkan penyelamatan bahan makanan dan kreasi resepmu.
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
                  placeholder="Masukkan kata sandi"
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

            {/* Remember Me Checkbox */}
            <TouchableOpacity
              style={styles.rememberMeRow}
              onPress={() => setRememberMe((p) => !p)}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Feather name="check" size={12} color="#FFFFFF" />}
              </View>
              <Text style={styles.rememberMeText}>Ingat saya di perangkat ini</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.primaryBtnDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Masuk ke Akun</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Sign-In Section */}
          <View style={styles.socialSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau masuk dengan</Text>
              <View style={styles.dividerLine} />
            </View>

            <GoogleSignInButton
              disabled={isSubmitting}
              onSuccess={onGoogleSignInSuccess}
            />
          </View>

          {/* Footer: Belum punya akun? */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Belum memiliki akun Nomz? </Text>
            <TouchableOpacity onPress={onNavigateToRegister} disabled={isSubmitting}>
              <Text style={styles.footerLink}>Daftar sekarang</Text>
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
    marginBottom: 24,
  },
  headerSection: {
    marginBottom: 20,
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
    marginBottom: 16,
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
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: colors.surface,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberMeText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
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
