import React, { useState, useEffect } from 'react';
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
import { getCookingHistory, HistoryItem, getImpactStats, ImpactStats } from '../services/historyStorage';

interface BerandaScreenProps {
  onStartScan: () => void;
  onOpenProfile?: () => void;
  onOpenPantry?: () => void;
  onOpenExplore?: () => void;
  onSelectRecipe?: (recipe: RecipeRecommendation) => void;
}

export function BerandaScreen({
  onStartScan,
  onOpenProfile,
  onOpenPantry,
  onOpenExplore,
  onSelectRecipe,
}: BerandaScreenProps) {
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const [impact, setImpact] = useState<ImpactStats>({
    ingredientsRescued: 0,
    recipesCooked: 0,
    mealsSaved: 0,
  });

  useEffect(() => {
    getCookingHistory().then((list) => setRecentHistory(list.slice(0, 3)));
    getImpactStats().then(setImpact);
  }, []);

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

        {/* Profile Affordance */}
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

      {/* Real Impact Summary Card */}
      {impact.recipesCooked > 0 && (
        <View style={styles.impactCard}>
          <View style={styles.impactCardHeader}>
            <Feather name="shield" size={14} color="#15803d" style={{ marginRight: 6 }} />
            <Text style={styles.impactCardTitle}>Dampak Penyelamatan Pangan Kamu</Text>
          </View>
          <View style={styles.impactRow}>
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{impact.ingredientsRescued}</Text>
              <Text style={styles.impactLabel}>Bahan Diselamatkan</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{impact.recipesCooked}</Text>
              <Text style={styles.impactLabel}>Masakan Selesai</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactCol}>
              <Text style={styles.impactNum}>{impact.mealsSaved}</Text>
              <Text style={styles.impactLabel}>Santapan Tercipta</Text>
            </View>
          </View>
        </View>
      )}

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

      {/* Visual Area: Aksi Pintas Masak */}
      <View style={styles.entrySection}>
        <Text style={styles.sectionHeading}>Akses Cepat Dapur</Text>

        <TouchableOpacity
          style={styles.entryCard}
          onPress={onOpenPantry}
          activeOpacity={0.8}
        >
          <View style={styles.entryIconBox}>
            <Feather name="archive" size={20} color={colors.primary} />
          </View>
          <View style={styles.entryTextBox}>
            <Text style={styles.entryTitle}>Dapur Saya (Pantry)</Text>
            <Text style={styles.entrySubtitle}>
              Kelola stok bahan & pantau prioritas "Gunakan Dulu"
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.entryCard, { marginTop: 10 }]}
          onPress={onOpenExplore}
          activeOpacity={0.8}
        >
          <View style={[styles.entryIconBox, { backgroundColor: '#e0f2fe' }]}>
            <Feather name="compass" size={20} color="#0284c7" />
          </View>
          <View style={styles.entryTextBox}>
            <Text style={styles.entryTitle}>Jelajahi Inspirasi Food Rescue</Text>
            <Text style={styles.entrySubtitle}>
              Kategori olahan telur, kilat &lt; 15 menit, dan sisa kulkas
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Terakhir Dimasak (Real Cooking History) */}
      {recentHistory.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionHeading}>Terakhir Dimasak</Text>
          {recentHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentCard}
              onPress={() => onSelectRecipe?.(item.recipe)}
              activeOpacity={0.75}
            >
              <View style={styles.recentCardHeader}>
                <Text style={styles.recentRecipeName}>{item.recipe.nama}</Text>
                <Text style={styles.recentRecipeDate}>{item.formattedDate}</Text>
              </View>
              <Text style={styles.recentRecipeTime}>
                {item.recipe.estimasi_waktu} • {item.recipe.tingkat_kesulitan} • {item.ingredientsRescuedCount} bahan diselamatkan
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
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    padding: 14,
    marginTop: 14,
  },
  impactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  impactCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
    textTransform: 'uppercase',
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  impactCol: {
    alignItems: 'center',
    flex: 1,
  },
  impactNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  impactLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  impactDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E7E5DE',
  },
  primaryActionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginTop: 16,
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
    marginTop: 22,
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
    marginTop: 22,
  },
  recentCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  recentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentRecipeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  recentRecipeDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  recentRecipeTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
