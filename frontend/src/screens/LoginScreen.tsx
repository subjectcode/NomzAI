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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../context';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToWelcome?: () => void;
  onGoogleSignIn?: () => void;
}

export function LoginScreen({
  onNavigateToRegister,
  onNavigateToWelcome,
  onGoogleSignIn,
}: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      await login({
        email: email.trim(),
        password,
      });
      // AuthContext memperbarui isAuthenticated -> root router mengarahkan ke Home
    } catch (err: any) {
      const status = err.status;
      const message = err.message || '';

      if (status === 401 || message.includes('401') || message.toLowerCase().includes('credential')) {
        setErrorMessage('Email atau kata sandi tidak cocok. Silakan coba lagi.');
      } else if (
        message.toLowerCase().includes('network') ||
        message.toLowerCase().includes('failed to fetch') ||
        message.toLowerCase().includes('koneksi')
      ) {
        setErrorMessage('Tidak dapat terhubung ke server. Periksa jaringan Anda.');
      } else {
        setErrorMessage(message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler terisolasi untuk Google Sign-In (M5.2E)
  const handleGooglePress = () => {
    if (onGoogleSignIn) {
      onGoogleSignIn();
      return;
    }
    Alert.alert(
      'Masuk dengan Google',
      'Fitur masuk dengan akun Google akan segera tersedia pada pembaruan berikutnya.'
    );
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
          {/* Top Bar / Back button */}
          <View style={styles.topBar}>
            {onNavigateToWelcome ? (
              <TouchableOpacity
                onPress={onNavigateToWelcome}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 22 }} />
            )}
            <Text style={styles.brandTitle}>Nomz</Text>
            <View style={{ width: 22 }} />
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

          {/* Input Form */}
          <View style={styles.formContainer}>
            {/* Field: Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Alamat Email</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="nama@email.com"
                  placeholderTextColor="#9AA097"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Field: Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Kata Sandi</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan kata sandi"
                  placeholderTextColor="#9AA097"
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
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                  style={styles.eyeIconBtn}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Action Button: Masuk */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Masuk</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In Button (M5.2E isolation) */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGooglePress}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <View style={styles.googleIconPlaceholder}>
                <Text style={styles.googleGLetter}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Lanjutkan dengan Google</Text>
            </TouchableOpacity>
          </View>

          {/* Switch to Register */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity
              onPress={onNavigateToRegister}
              disabled={isSubmitting}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.footerLink}>Daftar</Text>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  headerSection: {
    marginTop: 18,
    marginBottom: 20,
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  screenSubheading: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEEEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5C2BC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  formContainer: {
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: colors.textPrimary,
  },
  eyeIconBtn: {
    padding: 4,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  googleBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleGLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  googleBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
