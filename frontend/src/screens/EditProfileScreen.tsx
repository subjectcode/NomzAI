import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';

interface EditProfileScreenProps {
  onBack: () => void;
  onProfileUpdated?: () => void;
}

export function EditProfileScreen({ onBack, onProfileUpdated }: EditProfileScreenProps) {
  const { user, updateProfile } = useAuth();

  const currentDisplayName =
    (user as any)?.display_name || (user as any)?.displayName || '';
  const email = user?.email || '';
  const authProvider = (user as any)?.auth_provider || 'email';

  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initial = (displayName.trim() || currentDisplayName || 'U')
    .charAt(0)
    .toUpperCase();

  const handleSave = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setErrorMessage('Nama tampilan tidak boleh kosong.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await updateProfile({ displayName: trimmed });
      Alert.alert('Profil Diperbarui', 'Nama profil Anda berhasil disimpan.', [
        {
          text: 'OK',
          onPress: () => {
            if (onProfileUpdated) onProfileUpdated();
            onBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Gagal Menyimpan',
        error?.message || 'Terjadi kesalahan saat memperbarui profil. Coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Edit Profil</Text>
          <Text style={styles.topBarSubtitle}>Perbarui informasi akun Anda</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 2. AVATAR DISPLAY CARD */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.avatarHint}>
            Avatar otomatis disesuaikan dari inisial nama Anda
          </Text>
        </View>

        {/* 3. FORM CARD */}
        <View style={styles.formCard}>
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={colors.error} style={{ marginRight: 6 }} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Nama Tampilan */}
          <Text style={styles.fieldLabel}>Nama Tampilan</Text>
          <View style={styles.inputWrap}>
            <Feather name="user" size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={(val) => {
                setDisplayName(val);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Masukkan nama tampilan"
              placeholderTextColor={colors.textMuted}
              maxLength={60}
              autoCapitalize="words"
            />
          </View>

          {/* Email (Read Only) */}
          <View style={styles.emailHeaderRow}>
            <Text style={styles.fieldLabel}>Alamat Email</Text>
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={11} color={colors.success} style={{ marginRight: 3 }} />
              <Text style={styles.verifiedBadgeText}>Terdaftar</Text>
            </View>
          </View>
          <View style={[styles.inputWrap, styles.readOnlyInput]}>
            <Feather name="mail" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <Text style={styles.readOnlyText}>{email}</Text>
            <Feather name="lock" size={15} color={colors.textMuted} />
          </View>
          <Text style={styles.readOnlyHelp}>
            Email terikat secara permanen dengan akun untuk keamanan autentikasi.
          </Text>

          {/* Metode Autentikasi */}
          <Text style={[styles.fieldLabel, { marginTop: 18 }]}>Metode Masuk</Text>
          <View style={styles.providerRow}>
            <Feather
              name={authProvider === 'google' ? 'chrome' : 'key'}
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.providerText}>
              {authProvider === 'google'
                ? 'Terhubung via Google Sign-In'
                : 'Email & Kata Sandi'}
            </Text>
          </View>
        </View>

        {/* 4. SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  topBarTextWrap: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  avatarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
    ...shadows.level1,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.mintSoft,
    borderWidth: 2,
    borderColor: colors.lightMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  avatarHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
    ...shadows.level1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
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
    minHeight: 46,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  emailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.xs,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    borderColor: colors.borderSubtle,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  readOnlyHelp: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  providerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...shadows.level1,
  },
  saveBtnDisabled: {
    opacity: 0.65,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
