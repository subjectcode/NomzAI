import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
import { RecipeRecommendation } from '../types';

interface BerandaScreenProps {
  onStartScan: () => void;
  // Handler & data yang disiapkan untuk ekspansi M5.2 / M5.3
  onOpenProfile?: () => void;
  onStartRescueMode?: () => void;
  onStartLeftoverRemix?: () => void;
  onStartManualInput?: () => void;
  onStartCookNow?: () => void;
  recentRecipes?: RecipeRecommendation[];
  onSelectRecentRecipe?: (recipe: RecipeRecommendation) => void;
}

export function BerandaScreen({
  onStartScan,
  onOpenProfile,
  recentRecipes = [],
  onSelectRecentRecipe,
}: BerandaScreenProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header: Brand di kiri, Avatar/Profile Affordance di kanan */}
      <View style={styles.topHeader}>
        <View style={styles.brandWrap}>
          <Text style={styles.brandTitle}>Nomz</Text>
          <Text style={styles.brandSubtitle}>AI Food Rescue Assistant</Text>
        </View>

        {/* Profile Affordance (M5.3 target) */}
        <TouchableOpacity
          style={styles.profileAvatar}
          onPress={onOpenProfile}
          activeOpacity={0.7}
          accessibilityLabel="Profil Pengguna"
        >
          <Feather name="user" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Hero Greeting */}
      <View style={styles.heroSection}>
        <Text style={styles.heroGreeting}>Mau masak apa hari ini?</Text>
        <Text style={styles.heroSubtext}>
          Selamatkan bahan makanan yang ada di dapurmu. Olah apa yang ada menjadi
          hidangan lezat dan praktis tanpa ada bahan yang terbuang.
        </Text>
      </View>

      {/* Primary Action Card: Pindai Bahan */}
      <View style={styles.primaryActionCard}>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>REKOMENDASI CEPAT</Text>
        </View>

        <Text style={styles.actionCardTitle}>Pindai Bahan Makanan</Text>
        <Text style={styles.actionCardDesc}>
          Ambil foto kulkas atau meja dapurmu. Nomz akan mengenali bahan secara
          otomatis dan meracik inspirasi resep masakan yang sesuai.
        </Text>

        <TouchableOpacity
          style={styles.primaryCtaButton}
          onPress={onStartScan}
          activeOpacity={0.85}
        >
          <Feather name="camera" size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryCtaText}>Mulai Pindai Sekarang</Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* Visual Area: Mulai Dari Mana? (Aksi fungsional saat ini) */}
      <View style={styles.entrySection}>
        <Text style={styles.sectionHeading}>Mulai Dari Mana?</Text>
        
        <TouchableOpacity
          style={styles.entryCard}
          onPress={onStartScan}
          activeOpacity={0.8}
        >
          <View style={styles.entryIconBox}>
            <Feather name="camera" size={20} color={colors.primary} />
          </View>
          <View style={styles.entryTextBox}>
            <Text style={styles.entryTitle}>Pindai Isi Dapur</Text>
            <Text style={styles.entrySubtitle}>
              Deteksi bahan dari foto dan temukan resep langsung
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Slot Struktur "Terakhir Dilihat" untuk M5.3 (Hanya tampil jika ada data riwayat nyata) */}
      {recentRecipes.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionHeading}>Terakhir Dilihat</Text>
          {recentRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recentCard}
              onPress={() => onSelectRecentRecipe?.(recipe)}
              activeOpacity={0.75}
            >
              <Text style={styles.recentRecipeName}>{recipe.nama}</Text>
              <Text style={styles.recentRecipeTime}>
                {recipe.estimasi_waktu} • {recipe.tingkat_kesulitan}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brandWrap: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF3EF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    marginTop: 18,
    marginBottom: 10,
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  heroSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 8,
  },
  primaryActionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginTop: 18,
  },
  cardBadge: {
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionCardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 6,
  },
  primaryCtaButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  entrySection: {
    marginTop: 24,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  entryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entryTextBox: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  entrySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recentSection: {
    marginTop: 24,
  },
  recentCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  recentRecipeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recentRecipeTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
