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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
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
  const { user, logout, deleteAccount } = useAuth();

  const [defaultMode, setDefaultMode] = useState<string>('rescue');
  const [defaultPortion, setDefaultPortion] = useState<string>('1-2 porsi');
  const [expiryReminderEnabled, setExpiryReminderEnabled] = useState<boolean>(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

  const displayName =
    (user as any)?.display_name || (user as any)?.displayName || 'Pengguna Nomz';
  const email = user?.email || 'user@nomz.id';

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
            } catch (error: any) {
              Alert.alert(
                'Gagal Menghapus Akun',
                error?.message || 'Terjadi kesalahan pada server saat menghapus akun.'
              );
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const handleShowAbout = () => {
    Alert.alert(
      'Tentang Nomz',
      'Nomz adalah Asisten Penyelamat Pangan (Food Rescue AI Assistant) yang didesain untuk meminimalkan limbah makanan rumah tangga dengan merekomendasikan masakan lezat dan praktis dari bahan-bahan yang sudah Anda miliki.'
    );
  };

  const handleShowTerms = () => {
    Alert.alert(
      'Ketentuan & Privasi',
      'Nomz menjamin privasi Anda. Kredensial dan token disimpan secara aman menggunakan enkripsi perangkat (SecureStore). Data bahan dan riwayat disimpan secara lokal dan aman.'
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Pengaturan</Text>
          <Text style={styles.topBarSubtitle}>Preferensi & Pengelolaan Data</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SECTION: AKUN */}
        <Text style={styles.sectionHeader}>AKUN</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.rowItem}
            onPress={onNavigateToEditProfile}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#EFF3EF' }]}>
              <Feather name="user" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Edit Profil</Text>
              <Text style={styles.rowSubtitle}>{displayName}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <View style={styles.rowItemStatic}>
            <View style={[styles.iconWrap, { backgroundColor: '#f5f5f4' }]}>
              <Feather name="mail" size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Email Akun</Text>
              <Text style={styles.rowSubtitle}>{email}</Text>
            </View>
          </View>
        </View>

        {/* SECTION: PREFERENSI MEMASAK */}
        <Text style={styles.sectionHeader}>PREFERENSI MEMASAK</Text>
        <View style={styles.sectionCard}>
          <Text style={styles.prefLabel}>Mode Rekomendasi Utama</Text>
          <View style={styles.chipsRow}>
            {[
              { id: 'rescue', label: 'Maksimalkan Bahan' },
              { id: 'no_shopping', label: 'Tanpa Belanja' },
              { id: 'quick', label: 'Lebih Cepat' },
              { id: 'simple', label: 'Lebih Sederhana' },
            ].map((item) => {
              const active = defaultMode === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setDefaultMode(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.rowDivider} />

          <Text style={styles.prefLabel}>Estimasi Porsi Standar</Text>
          <View style={styles.chipsRow}>
            {['1-2 porsi', '3-4 porsi', '5+ porsi'].map((item) => {
              const active = defaultPortion === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setDefaultPortion(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SECTION: NOTIFIKASI PENGINGAT BAHAN */}
        <Text style={styles.sectionHeader}>PENGINGAT BAHAN DAPUR</Text>
        <View style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextWrap}>
              <Text style={styles.rowTitle}>Prioritas "Gunakan Dulu"</Text>
              <Text style={styles.rowSubtitle}>
                Bahan yang mendekati batas simpan akan diutamakan dalam rekomendasi resep
              </Text>
            </View>
            <Switch
              value={expiryReminderEnabled}
              onValueChange={setExpiryReminderEnabled}
              trackColor={{ false: '#d1d5db', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SECTION: KELOLA DATA */}
        <Text style={styles.sectionHeader}>PENGELOLAAN DATA LOKAL</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleClearHistory}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={16} color="#dc2626" style={{ marginRight: 10 }} />
            <Text style={styles.dangerRowText}>Hapus Riwayat Memasak</Text>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleClearSaved}
            activeOpacity={0.7}
          >
            <Feather name="bookmark" size={16} color="#dc2626" style={{ marginRight: 10 }} />
            <Text style={styles.dangerRowText}>Hapus Resep Tersimpan</Text>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleClearPantry}
            activeOpacity={0.7}
          >
            <Feather name="archive" size={16} color="#dc2626" style={{ marginRight: 10 }} />
            <Text style={styles.dangerRowText}>Kosongkan Dapur (Pantry)</Text>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleClearPlanner}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={16} color="#dc2626" style={{ marginRight: 10 }} />
            <Text style={styles.dangerRowText}>Bersihkan Rencana Menu</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION: TENTANG */}
        <Text style={styles.sectionHeader}>TENTANG NOMZ</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.rowItem} onPress={handleShowAbout} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: '#fef3c7' }]}>
              <Feather name="info" size={18} color="#b45309" />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Tentang Aplikasi</Text>
              <Text style={styles.rowSubtitle}>Versi 1.0.0 (Hackathon MVP)</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity style={styles.rowItem} onPress={handleShowTerms} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: '#f5f5f4' }]}>
              <Feather name="shield" size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Kebijakan Privasi & Ketentuan</Text>
              <Text style={styles.rowSubtitle}>Keamanan data & privasi pengguna</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* SECTION: KEAMANAN & AKUN */}
        <Text style={styles.sectionHeader}>AKSI AKUN</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.rowItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#fee2e2' }]}>
              <Feather name="log-out" size={18} color="#dc2626" />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, { color: '#dc2626' }]}>Keluar dari Akun</Text>
              <Text style={styles.rowSubtitle}>Sesi login akan dihapus dari perangkat</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#fef2f2' }]}>
              {isDeletingAccount ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <Feather name="user-x" size={18} color="#b91c1c" />
              )}
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, { color: '#b91c1c' }]}>Hapus Akun Permanen</Text>
              <Text style={styles.rowSubtitle}>
                Hapus seluruh data akun secara permanen dari server
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    padding: 14,
    marginBottom: 10,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowItemStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f5f5f4',
    marginVertical: 10,
  },
  prefLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FAF8F3',
    borderWidth: 1,
    borderColor: '#E7E5DE',
  },
  chipActive: {
    backgroundColor: '#EFF3EF',
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextActive: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dangerRowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
});
