import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { ImpactStats, getImpactStats } from '../services/historyStorage';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToPantry: () => void;
  onNavigateToHistory: () => void;
  onNavigateToPlanner: () => void;
  onNavigateToSaved: () => void;
  onNavigateToSettings: () => void;
}

export function ProfileScreen({
  onBack,
  onNavigateToEditProfile,
  onNavigateToPantry,
  onNavigateToHistory,
  onNavigateToPlanner,
  onNavigateToSaved,
  onNavigateToSettings,
}: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<ImpactStats>({
    ingredientsRescued: 0,
    recipesCooked: 0,
    mealsSaved: 0,
  });

  const loadStats = () => {
    getImpactStats().then(setStats);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun Nomz?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      'Tentang Nomz',
      'Nomz v1.0.0 (Hackathon MVP)\n\nNomz adalah Asisten Penyelamat Pangan cerdas bertenaga AI yang membantu Anda mengidentifikasi bahan makanan yang ada, memaksimalkan penggunaan bahan tanpa perlu belanja berlebih, dan memasak langkah demi langkah untuk mengurangi limbah makanan rumah tangga.'
    );
  };

  const displayName = (user as any)?.display_name || (user as any)?.displayName || 'Pengguna Nomz';
  const email = user?.email || 'user@nomz.id';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Profil Pengguna</Text>
          <Text style={styles.topBarSubtitle}>Nomz Food Rescue Assistant</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsHeaderBtn}
          onPress={onNavigateToSettings}
          activeOpacity={0.7}
        >
          <Feather name="settings" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userInfoWrap}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={onNavigateToEditProfile}
              activeOpacity={0.7}
            >
              <Feather name="edit-2" size={13} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.editProfileBtnText}>Edit Profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Impact Section */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>Dampak Penyelamatan Pangan</Text>
          <Text style={styles.impactDesc}>
            Statistik nyata dari setiap resep yang berhasil kamu selesaikan.
          </Text>

          <View style={styles.impactRow}>
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{stats.ingredientsRescued}</Text>
              <Text style={styles.impactLbl}>Bahan Diselamatkan</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{stats.recipesCooked}</Text>
              <Text style={styles.impactLbl}>Resep Dimasak</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{stats.mealsSaved}</Text>
              <Text style={styles.impactLbl}>Porsi Dihidangkan</Text>
            </View>
          </View>
        </View>

        {/* Feature Menu List */}
        <Text style={styles.menuHeading}>Fitur Dapur & Rencana</Text>

        <View style={styles.menuWrap}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNavigateToPantry}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#EFF3EF' }]}>
              <Feather name="archive" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Dapur Saya (Pantry)</Text>
              <Text style={styles.menuSubtitle}>Inventaris bahan & prioritasi "Gunakan Dulu"</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNavigateToHistory}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
              <Feather name="clock" size={18} color="#b45309" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Riwayat Memasak</Text>
              <Text style={styles.menuSubtitle}>Catatan masakan yang telah selesai dimasak</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNavigateToPlanner}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#e0f2fe' }]}>
              <Feather name="calendar" size={18} color="#0284c7" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Rencana Menu Mingguan</Text>
              <Text style={styles.menuSubtitle}>Jadwalkan masakan untuk hari Senin - Minggu</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNavigateToSaved}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#fdf2f8' }]}>
              <Feather name="bookmark" size={18} color="#db2777" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Resep Tersimpan</Text>
              <Text style={styles.menuSubtitle}>Koleksi masakan yang Anda simpan</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Settings & Info Menu List */}
        <Text style={styles.menuHeading}>Preferensi & Informasi</Text>

        <View style={styles.menuWrap}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNavigateToSettings}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#f3f4f6' }]}>
              <Feather name="sliders" size={18} color={colors.textPrimary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Pengaturan Aplikasi</Text>
              <Text style={styles.menuSubtitle}>Preferensi resep, kelola data, dan akun</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleAbout}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
              <Feather name="info" size={18} color="#b45309" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Tentang Nomz</Text>
              <Text style={styles.menuSubtitle}>Versi 1.0.0 (Hackathon MVP)</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={16} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    padding: 18,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  settingsHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f4',
    marginRight: 60,
  },
  userInfoWrap: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    padding: 18,
    marginBottom: 20,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  impactDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FAF8F3',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E7E5DE',
  },
  impactCol: {
    alignItems: 'center',
    flex: 1,
  },
  impactNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  impactLbl: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#E7E5DE',
  },
  menuHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  menuWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF8F3',
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fee2e2',
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
