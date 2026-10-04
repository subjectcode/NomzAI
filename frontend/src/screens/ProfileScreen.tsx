import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';
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
    getImpactStats(user?.id).then(setStats);
  };

  useEffect(() => {
    loadStats();
  }, [user?.id]);

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

  const displayName = (user as any)?.display_name || (user as any)?.displayName || 'Pengguna Nomz';
  const username = (user as any)?.username || '';
  const email = user?.email || 'user@nomz.id';
  const avatarUrl = (user as any)?.avatar_url || (user as any)?.avatarUrl || null;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Profil Saya</Text>
          <Text style={styles.topBarSubtitle}>Nomz Food Rescue Assistant</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsHeaderBtn}
          onPress={onNavigateToSettings}
          activeOpacity={0.7}
          accessibilityLabel="Pengaturan"
        >
          <Feather name="settings" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. USER CARD */}
        <View style={styles.userCard}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={onNavigateToEditProfile}
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
            <View style={styles.avatarBadge}>
              <Feather name="camera" size={10} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.userInfoWrap}>
            <Text style={styles.userName}>{displayName}</Text>
            {username ? (
              <Text style={styles.userUsername}>@{username}</Text>
            ) : null}
            <Text style={styles.userEmail}>{email}</Text>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={onNavigateToEditProfile}
              activeOpacity={0.7}
            >
              <Feather name="edit-2" size={12} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={styles.editProfileBtnText}>Edit Profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. REAL FOOD RESCUE IMPACT */}
        <View style={styles.impactCard}>
          <View style={styles.impactHeaderRow}>
            <Feather name="award" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.impactTitle}>Dampak Penyelamatan Pangan</Text>
          </View>
          <View style={styles.impactRow}>
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{stats.ingredientsRescued}</Text>
              <Text style={styles.impactLbl}>Bahan Selamat</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{stats.recipesCooked}</Text>
              <Text style={styles.impactLbl}>Resep Dimasak</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{stats.mealsSaved}</Text>
              <Text style={styles.impactLbl}>Porsi Santapan</Text>
            </View>
          </View>
        </View>

        {/* 4. FEATURE MENU LIST */}
        <Text style={styles.menuHeading}>Fitur Dapur & Rencana</Text>

        <View style={styles.menuWrap}>
          {/* Pantry */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={onNavigateToPantry}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIconBox, { backgroundColor: colors.mintSoft }]}>
              <Feather name="archive" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>Dapur Saya (Pantry)</Text>
              <Text style={styles.menuSubtitle}>Kelola stok bahan & pantau tanggal kadaluarsa</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* History */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={onNavigateToHistory}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Feather name="clock" size={18} color={colors.success} />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>Riwayat Memasak</Text>
              <Text style={styles.menuSubtitle}>Catatan masakan yang berhasil kamu selesaikan</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Planner */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={onNavigateToPlanner}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F0F9FF' }]}>
              <Feather name="calendar" size={18} color="#0284C7" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>Rencana Menu</Text>
              <Text style={styles.menuSubtitle}>Jadwalkan menu harian dari bahan yang ada</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Saved */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={onNavigateToSaved}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Feather name="bookmark" size={18} color={colors.orangeDark} />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>Resep Tersimpan</Text>
              <Text style={styles.menuSubtitle}>Koleksi masakan favorit yang kamu simpan</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 5. ACCOUNT ACTIONS */}
        <Text style={styles.menuHeading}>Akun</Text>

        <View style={styles.menuWrap}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={onNavigateToSettings}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F3F4F6' }]}>
              <Feather name="sliders" size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>Pengaturan Aplikasi</Text>
              <Text style={styles.menuSubtitle}>Preferensi, preferensi data, & akun</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleLogout}
            activeOpacity={0.75}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="log-out" size={18} color={colors.error} />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={[styles.menuTitle, { color: colors.error }]}>Keluar dari Akun</Text>
              <Text style={styles.menuSubtitle}>Akhiri sesi masuk di perangkat ini</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  settingsHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...shadows.level1,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.mintSoft,
    borderWidth: 2,
    borderColor: colors.lightMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  userInfoWrap: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.mintSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  editProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  impactCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
    ...shadows.level1,
  },
  impactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  impactCol: {
    alignItems: 'center',
  },
  impactNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  impactLbl: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderSubtle,
  },
  menuHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
    overflow: 'hidden',
    ...shadows.level1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextBox: {
    flex: 1,
    marginRight: 8,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
