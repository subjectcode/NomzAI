import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { clearCookingHistory } from '../services/historyStorage';
import { clearSavedRecipes } from '../services/savedStorage';
import { clearPantryItems } from '../services/pantryStorage';
import { clearMealPlans } from '../services/plannerStorage';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigateToEditProfile: () => void;
  onDataCleared?: () => void;
}

export function SettingsScreen({
  onBack,
  onNavigateToEditProfile,
  onDataCleared,
}: SettingsScreenProps) {
  const { user, logout, deleteAccount, setPassword } = useAuth();

  const [defaultMode, setDefaultMode] = useState<string>('rescue');
  const [defaultPortion, setDefaultPortion] = useState<string>('1-2 porsi');
  const [expiryReminderEnabled, setExpiryReminderEnabled] = useState<boolean>(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

  // State pembuatan/pengubahan kata sandi (Google users)
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const displayName =
    (user as any)?.display_name || (user as any)?.displayName || 'Pengguna Nomz';
  const email = user?.email || 'user@nomz.id';

  const handleSavePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError('Password minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.');
      return;
    }
    setIsSubmittingPassword(true);
    setPasswordError(null);
    try {
      await setPassword(newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert(
        'Kata Sandi Berhasil Disimpan',
        'Akun Anda kini dapat digunakan untuk masuk menggunakan email dan password.'
      );
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal menyimpan kata sandi. Coba lagi.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Handler: Clear History
  const handleClearHistory = () => {
    Alert.alert(
      'Hapus Riwayat Memasak',
      'Apakah Anda yakin ingin menghapus seluruh catatan riwayat memasak? Statistik dampak akan direset.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await clearCookingHistory();
            if (onDataCleared) onDataCleared();
            Alert.alert('Selesai', 'Riwayat memasak berhasil dibersihkan.');
          },
        },
      ]
    );
  };

  // Handler: Clear Saved
  const handleClearSaved = () => {
    Alert.alert(
      'Hapus Resep Tersimpan',
      'Seluruh koleksi resep yang Anda tandai akan dihapus dari perangkat.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await clearSavedRecipes();
            if (onDataCleared) onDataCleared();
            Alert.alert('Selesai', 'Daftar resep tersimpan berhasil dibersihkan.');
          },
        },
      ]
    );
  };

  // Handler: Clear Pantry
  const handleClearPantry = () => {
    Alert.alert(
      'Kosongkan Dapur (Pantry)',
      'Semua bahan makanan yang tercatat di dapur Anda akan dikosongkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kosongkan',
          style: 'destructive',
          onPress: async () => {
            await clearPantryItems();
            if (onDataCleared) onDataCleared();
            Alert.alert('Selesai', 'Inventaris dapur berhasil dikosongkan.');
          },
        },
      ]
    );
  };

  // Handler: Clear Planner
  const handleClearPlanner = () => {
    Alert.alert(
      'Bersihkan Rencana Menu',
      'Semua jadwal rencana masakan mingguan akan dihapus.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bersihkan',
          style: 'destructive',
          onPress: async () => {
            await clearMealPlans();
            if (onDataCleared) onDataCleared();
            Alert.alert('Selesai', 'Rencana menu mingguan berhasil dibersihkan.');
          },
        },
      ]
    );
  };

  // Handler: Logout
  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin keluar dari akun Nomz Anda?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  // Handler: Delete Account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Hapus Akun Permanen',
      'PERINGATAN: Tindakan ini akan menghapus akun dan seluruh data Anda dari server Nomz secara permanen. Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Akun',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              await deleteAccount();
            } catch (err: any) {
              Alert.alert('Gagal Menghapus Akun', err.message || 'Coba lagi beberapa saat lagi.');
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Pengaturan</Text>
          <Text style={styles.topBarSubtitle}>Preferensi & Pengelolaan Data</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. SECTION: PREFERENSI MEMASAK */}
        <Text style={styles.sectionHeading}>Preferensi Memasak</Text>
        <View style={styles.card}>
          {/* Mode Rekomendasi Default */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Mode Penyelamatan Utama</Text>
              <Text style={styles.settingSubtitle}>
                {defaultMode === 'rescue' ? 'Maksimalkan Bahan' : 'Tanpa Belanja'}
              </Text>
            </View>
            <View style={styles.pillToggleRow}>
              <TouchableOpacity
                style={[styles.pillOption, defaultMode === 'rescue' && styles.pillOptionActive]}
                onPress={() => setDefaultMode('rescue')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillOptionText,
                    defaultMode === 'rescue' && styles.pillOptionTextActive,
                  ]}
                >
                  Maksimal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pillOption, defaultMode === 'no_shopping' && styles.pillOptionActive]}
                onPress={() => setDefaultMode('no_shopping')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillOptionText,
                    defaultMode === 'no_shopping' && styles.pillOptionTextActive,
                  ]}
                >
                  Tanpa Belanja
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pengingat Kadaluarsa */}
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Prioritas "Gunakan Dulu"</Text>
              <Text style={styles.settingSubtitle}>
                Otomatis tandai bahan cepat busuk di rekomendasi
              </Text>
            </View>
            <Switch
              value={expiryReminderEnabled}
              onValueChange={setExpiryReminderEnabled}
              trackColor={{ false: '#d1d5db', true: colors.lightMint }}
              thumbColor={expiryReminderEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* 3. SECTION: KELOLA DATA LOKAL */}
        <Text style={styles.sectionHeading}>Pengelolaan Data Lokal</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearHistory} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: '#F3F4F6' }]}>
              <Feather name="clock" size={17} color={colors.textSecondary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Hapus Riwayat Memasak</Text>
              <Text style={styles.actionSubtitle}>Reset catatan masakan dan statistik dampak</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleClearSaved} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: '#F3F4F6' }]}>
              <Feather name="bookmark" size={17} color={colors.textSecondary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Hapus Resep Tersimpan</Text>
              <Text style={styles.actionSubtitle}>Kosongkan seluruh daftar resep favorit</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleClearPantry} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: '#F3F4F6' }]}>
              <Feather name="archive" size={17} color={colors.textSecondary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Kosongkan Dapur (Pantry)</Text>
              <Text style={styles.actionSubtitle}>Hapus semua daftar bahan makanan di kulkas</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomWidth: 0 }]}
            onPress={handleClearPlanner}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F3F4F6' }]}>
              <Feather name="calendar" size={17} color={colors.textSecondary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Bersihkan Rencana Menu</Text>
              <Text style={styles.actionSubtitle}>Hapus semua rencana masakan mingguan</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 4. SECTION: AKUN & KEAMANAN */}
        <Text style={styles.sectionHeading}>Akun & Keamanan</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={onNavigateToEditProfile} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.mintSoft }]}>
              <Feather name="user" size={17} color={colors.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Ubah Profil</Text>
              <Text style={styles.actionSubtitle}>{displayName} • {email}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Kata Sandi Akun (Bisa dibuat oleh user Google atau diubah oleh user password) */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              setPasswordError(null);
              setShowPasswordModal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="lock" size={17} color="#4F46E5" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>
                {user?.has_password ? 'Ubah Kata Sandi' : 'Buat Kata Sandi'}
              </Text>
              <Text style={styles.actionSubtitle}>
                {user?.has_password
                  ? 'Kata sandi aktif untuk login email'
                  : 'Aktifkan login email untuk akun Google ini'}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="log-out" size={17} color={colors.error} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: colors.error }]}>Keluar dari Akun</Text>
              <Text style={styles.actionSubtitle}>Akhiri sesi login di perangkat ini</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={[styles.actionRow, { borderBottomWidth: 0 }]}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
              {isDeletingAccount ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Feather name="user-x" size={17} color={colors.error} />
              )}
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: colors.error }]}>Hapus Akun Permanen</Text>
              <Text style={styles.actionSubtitle}>Hapus akun dan seluruh data dari database</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Versi App */}
        <View style={styles.versionWrap}>
          <Text style={styles.versionText}>Nomz v1.0.0 (Hackathon MVP)</Text>
          <Text style={styles.versionSubtext}>AI Food Rescue Assistant • Built with IBM Bob & Langflow</Text>
        </View>
      </ScrollView>

      {/* MODAL: Buat / Ubah Kata Sandi */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {user?.has_password ? 'Ubah Kata Sandi' : 'Buat Kata Sandi Akun'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              {user?.has_password
                ? 'Masukkan kata sandi baru untuk akun Anda (minimal 8 karakter).'
                : 'Tambahkan kata sandi agar Anda dapat masuk menggunakan email dan password selain menggunakan Google.'}
            </Text>

            {passwordError && (
              <View style={styles.modalErrorBox}>
                <Feather name="alert-circle" size={14} color={colors.error} style={{ marginRight: 6 }} />
                <Text style={styles.modalErrorText}>{passwordError}</Text>
              </View>
            )}

            <View style={styles.modalInputWrap}>
              <Feather name="lock" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalInput}
                placeholder="Kata sandi baru (min 8 karakter)"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={true}
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  if (passwordError) setPasswordError(null);
                }}
              />
            </View>

            <View style={styles.modalInputWrap}>
              <Feather name="check" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalInput}
                placeholder="Konfirmasi kata sandi baru"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (passwordError) setPasswordError(null);
                }}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowPasswordModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSavePassword}
                disabled={isSubmittingPassword}
                activeOpacity={0.8}
              >
                {isSubmittingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Simpan Kata Sandi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
    overflow: 'hidden',
    ...shadows.level1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  pillToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pillOption: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  pillOptionActive: {
    backgroundColor: colors.primary,
  },
  pillOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
    marginRight: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  versionWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  versionSubtext: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    ...shadows.level3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  modalErrorText: {
    fontSize: 12,
    color: colors.error,
    flex: 1,
  },
  modalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48,
  },
  modalInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
