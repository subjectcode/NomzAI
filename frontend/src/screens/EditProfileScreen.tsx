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
import { colors } from '../theme';
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
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
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
        {/* Avatar Display Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.avatarHint}>
            Avatar otomatis disesuaikan dari inisial nama Anda
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formCard}>
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color="#dc2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Nama Tampilan */}
          <Text style={styles.fieldLabel}>Nama Tampilan</Text>
          <View style={styles.inputWrap}>
            <Feather name="user" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={(val) => {
                setDisplayName(val);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Masukkan nama tampilan"
              placeholderTextColor="#9ca3af"
              maxLength={60}
              autoCapitalize="words"
            />
          </View>

          {/* Email (Read Only) */}
          <View style={styles.emailHeaderRow}>
            <Text style={styles.fieldLabel}>Alamat Email</Text>
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={12} color="#16a34a" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedBadgeText}>Terdaftar</Text>
            </View>
          </View>
          <View style={[styles.inputWrap, styles.readOnlyInput]}>
            <Feather name="mail" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <Text style={styles.readOnlyText}>{email}</Text>
            <Feather name="lock" size={16} color="#9ca3af" />
          </View>
          <Text style={styles.readOnlyHelp}>
            Email terikat secara permanen dengan akun untuk keamanan autentikasi.
          </Text>

          {/* Metode Autentikasi */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Metode Masuk</Text>
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.8}
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
    backgroundColor: '#FAF8F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DE',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f4',
    marginRight: 12,
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
    color: colors.textSecondary,
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#b91c1c',
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F3',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  emailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f4',
    borderColor: '#e7e5e4',
  },
  readOnlyText: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#78716c',
  },
  readOnlyHelp: {
    fontSize: 11,
    color: '#78716c',
    marginTop: -8,
    marginBottom: 12,
    lineHeight: 16,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF3EF',
    padding: 12,
    borderRadius: 8,
  },
  providerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
