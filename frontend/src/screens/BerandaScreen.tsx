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
  /**
   * Slot struktur riwayat resep yang disiapkan untuk M5.3.
   * Hanya dirender jika data riwayat nyata tersedia (tidak menampilkan data palsu).
   */
  recentRecipes?: RecipeRecommendation[];
  onSelectRecentRecipe?: (recipe: RecipeRecommendation) => void;
}

export function BerandaScreen({
  onStartScan,
  recentRecipes = [],
  onSelectRecentRecipe,
}: BerandaScreenProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <Text style={styles.brandTitle}>Nomz</Text>
        <Text style={styles.brandSubtitle}>Asisten Memasak Dapur Anda</Text>
      </View>

      {/* Greeting & Headline */}
      <View style={styles.headlineWrap}>
        <Text style={styles.headline}>Mau masak apa hari ini?</Text>
        <Text style={styles.supportingCopy}>
          Pindai bahan makanan yang tersedia di dapurmu, dan temukan rekomendasi
          hidangan lezat tanpa bahan terbuang.
        </Text>
      </View>

      {/* Primary Action Hero Card: Pindai Bahan */}
      <View style={styles.heroCard}>
        <View style={styles.heroIconBox}>
          <Feather name="camera" size={24} color={colors.primary} />
        </View>

        <Text style={styles.heroCardTitle}>Pindai Bahan Makanan</Text>
        <Text style={styles.heroCardDesc}>
          Foto bahan makanan di kulkas atau meja dapurmu untuk mendapatkan
          inspirasi resep masakan secara otomatis.
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onStartScan}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaButtonText}>Mulai Pindai Bahan</Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Slot Struktur "Terakhir Dilihat" untuk M5.3 (hanya tampil jika ada data nyata) */}
      {recentRecipes.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Terakhir Dilihat</Text>
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
    paddingTop: 16,
    paddingBottom: 32,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeader: {
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  headlineWrap: {
    marginTop: 20,
    marginBottom: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  supportingCopy: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 8,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginTop: 24,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF3EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  heroCardDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 6,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  recentSection: {
    marginTop: 28,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  recentCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  recentRecipeName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recentRecipeTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
