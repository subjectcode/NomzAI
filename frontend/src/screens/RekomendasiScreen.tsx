import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getRecipeRecommendations } from '../services/api';
import { RecipeRecommendation } from '../types';

interface RekomendasiScreenProps {
  ingredients: string[];
  onSelectRecipe: (recipe: RecipeRecommendation) => void;
  onBack: () => void;
}

export function RekomendasiScreen({
  ingredients,
  onSelectRecipe,
  onBack,
}: RekomendasiScreenProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipeRecommendations(ingredients);
      setRecommendations(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat rekomendasi masakan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Bar Navigasi */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Rekomendasi Masakan</Text>
          <Text style={styles.topBarSubtitle}>
            Dari {ingredients.length} bahan yang kamu miliki
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ringkasan Bahan Tersedia */}
        <View style={styles.pantrySummaryCard}>
          <View style={styles.pantrySummaryHeader}>
            <Feather name="check-circle" size={14} color="#16a34a" style={{ marginRight: 6 }} />
            <Text style={styles.pantrySummaryTitle}>Bahan Siap Pakai:</Text>
          </View>
          <View style={styles.tagWrap}>
            {ingredients.map((ing, idx) => (
              <View key={idx} style={styles.ingredientPill}>
                <Text style={styles.ingredientPillText}>{ing}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* State Memuat */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#ea580c" />
            <Text style={styles.loadingTitle}>Meracik Ide Masakan...</Text>
            <Text style={styles.loadingSubtitle}>
              Menyelaraskan bahan masakanmu dengan ide hidangan rumahan terbaik.
            </Text>
          </View>
        )}

        {/* State Error */}
        {!loading && error && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={24} color="#dc2626" style={{ marginBottom: 8 }} />
            <Text style={styles.errorTitle}>Kendala Rekomendasi</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchRecommendations}>
              <Feather name="refresh-cw" size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* State Daftar Rekomendasi */}
        {!loading && !error && recommendations.length > 0 && (
          <View style={styles.recommendationList}>
            <Text style={styles.sectionHeader}>
              Pilihan Hidangan Untukmu ({recommendations.length})
            </Text>

            {recommendations.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => onSelectRecipe(recipe)}
                activeOpacity={0.88}
              >
                {/* Header Kartu */}
                <View style={styles.cardHeader}>
                  <Text style={styles.recipeTitle}>{recipe.nama}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Feather name="clock" size={12} color="#64748b" style={{ marginRight: 4 }} />
                      <Text style={styles.metaText}>{recipe.estimasi_waktu}</Text>
                    </View>
                    <View
                      style={[
                        styles.difficultyBadge,
                        recipe.tingkat_kesulitan.toLowerCase() === 'mudah'
                          ? styles.difficultyEasy
                          : styles.difficultyMedium,
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyText,
                          recipe.tingkat_kesulitan.toLowerCase() === 'mudah'
                            ? styles.difficultyEasyText
                            : styles.difficultyMediumText,
                        ]}
                      >
                        {recipe.tingkat_kesulitan}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Deskripsi Masakan */}
                <Text style={styles.recipeDesc}>{recipe.deskripsi}</Text>

                {/* Perbandingan Bahan */}
                <View style={styles.ingredientsBox}>
                  {/* Bahan Milik User */}
                  <View style={styles.ingredientGroup}>
                    <Text style={styles.ingredientGroupTitle}>
                      Bahan Tersedia ({recipe.bahan_tersedia.length}):
                    </Text>
                    <View style={styles.tagWrap}>
                      {recipe.bahan_tersedia.map((b, i) => (
                        <View key={i} style={styles.availableTag}>
                          <Feather name="check" size={10} color="#15803d" style={{ marginRight: 3 }} />
                          <Text style={styles.availableTagText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Bahan Tambahan */}
                  {recipe.bahan_tambahan && recipe.bahan_tambahan.length > 0 && (
                    <View style={[styles.ingredientGroup, { marginTop: 8 }]}>
                      <Text style={styles.ingredientGroupTitleSecondary}>
                        Bahan Tambahan / Bumbu ({recipe.bahan_tambahan.length}):
                      </Text>
                      <View style={styles.tagWrap}>
                        {recipe.bahan_tambahan.map((b, i) => (
                          <View key={i} style={styles.additionalTag}>
                            <Feather name="plus" size={10} color="#64748b" style={{ marginRight: 3 }} />
                            <Text style={styles.additionalTagText}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* Mengapa Cocok */}
                <View style={styles.rationaleBox}>
                  <Text style={styles.rationaleLabel}>Kecocokan:</Text>
                  <Text style={styles.rationaleText}>{recipe.alasan}</Text>
                </View>

                {/* Tombol Lihat Detail */}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>Lihat Detail Masakan</Text>
                  <Feather name="chevron-right" size={16} color="#ea580c" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
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
    color: '#1c1917',
  },
  topBarSubtitle: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pantrySummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  pantrySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pantrySummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#44403c',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientPill: {
    backgroundColor: '#f5f5f4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  ingredientPillText: {
    fontSize: 12,
    color: '#292524',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#78716c',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ea580c',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#44403c',
    marginBottom: 12,
  },
  recommendationList: {
    gap: 14,
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#57534e',
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  difficultyEasy: {
    backgroundColor: '#f0fdf4',
  },
  difficultyEasyText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '600',
  },
  difficultyMedium: {
    backgroundColor: '#fefce8',
  },
  difficultyMediumText: {
    color: '#a16207',
    fontSize: 11,
    fontWeight: '600',
  },
  recipeDesc: {
    fontSize: 13,
    color: '#57534e',
    lineHeight: 19,
    marginBottom: 14,
  },
  ingredientsBox: {
    backgroundColor: '#fafaf9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f5f5f4',
  },
  ingredientGroup: {},
  ingredientGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  ingredientGroupTitleSecondary: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78716c',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  availableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  availableTagText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  additionalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f4',
    borderColor: '#e7e5e4',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  additionalTagText: {
    fontSize: 11,
    color: '#57534e',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  rationaleBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  rationaleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
    marginBottom: 2,
  },
  rationaleText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f4',
    paddingTop: 10,
  },
  cardFooterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ea580c',
    marginRight: 4,
  },
});
