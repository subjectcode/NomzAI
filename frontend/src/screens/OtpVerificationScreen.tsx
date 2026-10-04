import React, { useState, useEffect } from 'react';
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
import { NomzLogo } from '../components/NomzLogo';
import { colors, radius, shadows } from '../theme';
import { sendOtp, verifyOtp } from '../services/authApi';

interface OtpVerificationScreenProps {
  email: string;
  onVerificationSuccess: () => void;
  onBackToRegister: () => void;
}

export function OtpVerificationScreen({
  email,
  onVerificationSuccess,
  onBackToRegister,
}: OtpVerificationScreenProps) {
  const insets = useSafeAreaInsets();
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(
    'Kode verifikasi telah dikirim ke email kamu.'
  );
  const [cooldown, setCooldown] = useState<number>(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMessage('Masukkan 6 digit kode verifikasi.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    try {
      await verifyOtp(email, cleanOtp);
      onVerificationSuccess();
    } catch (err: any) {
      const msg = err.message || '';
      const lower = msg.toLowerCase();
      if (lower.includes('kedaluwarsa') || lower.includes('expired')) {
        setErrorMessage('Kode OTP sudah kedaluwarsa. Silakan minta kode baru.');
      } else if (lower.includes('salah') || lower.includes('invalid')) {
        setErrorMessage('Kode OTP salah. Periksa kembali email Anda.');
      } else if (lower.includes('terlampaui') || lower.includes('attempts')) {
        setErrorMessage('Batas percobaan terlampaui. Harap kirim ulang kode.');
      } else {
        setErrorMessage(msg || 'Gagal memverifikasi OTP. Coba lagi.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    try {
      await sendOtp(email);
      setSuccessNotice('Kode baru berhasil dikirim ke email kamu.');
      setCooldown(60);
    } catch (err: any) {
      const msg = err.message || '';
      setErrorMessage(msg || 'Gagal mengirim ulang kode verifikasi.');
    } finally {
      setIsResending(false);
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
              paddingTop: Math.max(insets.top, 16) + 12,
              paddingBottom: Math.max(insets.bottom, 16) + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={onBackToRegister}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <NomzLogo size="sm" variant="compact" />
            <View style={{ width: 20 }} />
          </View>

          {/* Heading */}
          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <Feather name="mail" size={28} color={colors.primary} />
            </View>
            <Text style={styles.screenHeading}>Verifikasi Email</Text>
            <Text style={styles.screenSubheading}>
              Kami telah mengirimkan 6 digit kode verifikasi ke alamat email:
            </Text>
            <Text style={styles.emailBadge}>{email}</Text>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={colors.error} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Success Banner */}
          {successNotice && !errorMessage && (
            <View style={styles.successBanner}>
              <Feather name="check-circle" size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.successText}>{successNotice}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Kode Verifikasi (OTP)</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.otpInput}
                placeholder="123456"
                placeholderTextColor={colors.textMuted}
                value={otpCode}
                onChangeText={(val) => {
                  setOtpCode(val.replace(/[^0-9]/g, '').slice(0, 6));
                  if (errorMessage) setErrorMessage(null);
                  if (successNotice) setSuccessNotice(null);
                }}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                editable={!isVerifying}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (isVerifying || otpCode.length < 6) && styles.primaryBtnDisabled,
              ]}
              onPress={handleVerify}
              disabled={isVerifying || otpCode.length < 6}
              activeOpacity={0.85}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Verifikasi & Masuk</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>Tidak menerima email? </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={cooldown > 0 || isResending}
                activeOpacity={0.7}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text
                    style={[
                      styles.resendLink,
                      cooldown > 0 && styles.resendLinkDisabled,
                    ]}
                  >
                    {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim Ulang Kode'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.lightMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  screenSubheading: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  emailBadge: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  inputWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpInput: {
    width: '100%',
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    color: colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  primaryBtnDisabled: {
    backgroundColor: colors.primary + '60',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  resendLinkDisabled: {
    color: colors.textMuted,
  },
});
