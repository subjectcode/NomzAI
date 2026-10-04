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
  Image,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  const currentUsername = (user as any)?.username || '';
  const email = user?.email || '';
  const authProvider = (user as any)?.auth_provider || 'email';
  const currentAvatarUrl = (user as any)?.avatar_url || (user as any)?.avatarUrl || null;

  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [username, setUsername] = useState(currentUsername);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initial = (displayName.trim() || currentDisplayName || 'U')
    .charAt(0)
    .toUpperCase();

  // 1. Ambil Foto dari Kamera
  const handleTakePhoto = async () => {
    setIsPhotoModalOpen(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Kamera Diperlukan',
          'Nomz memerlukan izin kamera untuk mengambil foto profil Anda.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const dataUrl = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setAvatarUrl(dataUrl);
      }
    } catch (err: any) {
      Alert.alert('Gagal Mengambil Foto', err?.message || 'Tidak dapat mengambil foto.');
    }
  };

  // 2. Pilih Foto dari Galeri
  const handlePickFromGallery = async () => {
    setIsPhotoModalOpen(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Galeri Diperlukan',
          'Nomz memerlukan izin galeri untuk memilih foto profil Anda.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const dataUrl = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setAvatarUrl(dataUrl);
      }
    } catch (err: any) {
      Alert.alert('Gagal Memilih Foto', err?.message || 'Tidak dapat memilih foto dari galeri.');
    }
  };

  // 3. Hapus Foto
  const handleDeletePhoto = () => {
    setIsPhotoModalOpen(false);
    setAvatarUrl(null);
  };

  // 4. Simpan Perubahan Profil
  const handleSave = async () => {
    const trimmedName = displayName.trim();
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage('Nama tampilan tidak boleh kosong.');
      return;
    }

    if (trimmedUsername) {
      if (trimmedUsername.length < 4) {
        setErrorMessage('Username minimal 4 karakter.');
        return;
      }
      if (trimmedUsername.length > 20) {
        setErrorMessage('Username maksimal 20 karakter.');
        return;
      }
      const usernameRegex = /^[a-z0-9_]{4,20}$/;
      if (!usernameRegex.test(trimmedUsername)) {
        setErrorMessage('Username hanya boleh berisi huruf, angka, dan underscore.');
        return;
      }
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await updateProfile({
        displayName: trimmedName,
        username: trimmedUsername || undefined,
        avatarUrl: avatarUrl === null ? '' : avatarUrl,
      });
      Alert.alert('Profil Diperbarui', 'Data profil Anda berhasil disimpan.', [
        {
          text: 'OK',
          onPress: () => {
            if (onProfileUpdated) onProfileUpdated();
            onBack();
          },
        },
      ]);
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.toLowerCase().includes('sudah digunakan')) {
        setErrorMessage('Username sudah digunakan.');
      } else {
        Alert.alert(
          'Gagal Menyimpan',
          msg || 'Terjadi kesalahan saat memperbarui profil. Coba lagi.'
        );
      }
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
          <Text style={styles.topBarSubtitle}>Perbarui foto dan informasi akun Anda</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 2. AVATAR CARD WITH EDIT PHOTO CTA */}
        <View style={styles.avatarCard}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => setIsPhotoModalOpen(true)}
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
            <View style={styles.cameraBadge}>
              <Feather name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsPhotoModalOpen(true)}
            activeOpacity={0.7}
            style={styles.changePhotoBtn}
          >
            <Text style={styles.changePhotoText}>Ubah Foto Profil</Text>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            Ketuk foto untuk mengambil foto langsung atau memilih dari galeri
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
          <Text style={styles.fieldLabel}>Nama Lengkap</Text>
          <View style={styles.inputWrap}>
            <Feather name="user" size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={(val) => {
                setDisplayName(val);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor={colors.textMuted}
              maxLength={60}
              autoCapitalize="words"
            />
          </View>

          {/* Username */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Username</Text>
          <View style={styles.inputWrap}>
            <Feather name="at-sign" size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={(val) => {
                setUsername(val.toLowerCase());
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="username (contoh: ryanfeb)"
              placeholderTextColor={colors.textMuted}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
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
            Email terikat secara permanen dengan akun untuk keamanan data.
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

      {/* 5. PHOTO ACTIONS MODAL */}
      <Modal
        visible={isPhotoModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPhotoModalOpen(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalSheetTitle}>Foto Profil</Text>

            <TouchableOpacity style={styles.modalOption} onPress={handleTakePhoto}>
              <Feather name="camera" size={20} color={colors.primary} style={styles.modalOptionIcon} />
              <Text style={styles.modalOptionText}>Ambil Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handlePickFromGallery}>
              <Feather name="image" size={20} color={colors.primary} style={styles.modalOptionIcon} />
              <Text style={styles.modalOptionText}>Pilih dari Galeri</Text>
            </TouchableOpacity>

            {avatarUrl ? (
              <TouchableOpacity style={styles.modalOption} onPress={handleDeletePhoto}>
                <Feather name="trash-2" size={20} color={colors.error} style={styles.modalOptionIcon} />
                <Text style={[styles.modalOptionText, { color: colors.error }]}>Hapus Foto</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelOption]}
              onPress={() => setIsPhotoModalOpen(false)}
            >
              <Text style={styles.modalCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    justifyContent: 'space-between',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.mintSoft,
    borderWidth: 2,
    borderColor: colors.lightMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  changePhotoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  avatarHint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  modalOptionIcon: {
    marginRight: 14,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalCancelOption: {
    borderBottomWidth: 0,
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: colors.background,
    borderRadius: radius.md,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
});
