import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getRecipeRecommendations } from '../services/api';
import { RecipeRecommendation } from '../types';
import { colors } from '../theme';

interface RekomendasiScreenProps {
  ingredients: string[];
  onSelectRecipe: (recipe: RecipeRecommendation) => void;
  onBack: () => void;
}

interface ConstraintOption {
  id: string;
  label: string;
  mode: string;
  icon: keyof typeof Feather.glyphMap;
}

const CONSTRAINTS: ConstraintOption[] = [
  { id: 'rescue', label: 'Maksimalkan Bahan', mode: 'rescue', icon: 'shield' },
  { id: 'no_shopping', label: 'Tanpa Belanja', mode: 'no_shopping', icon: 'shopping-bag' },
  { id: 'quick', label: 'Lebih Cepat', mode: 'quick', icon: 'zap' },
  { id: 'simple', label: 'Lebih Sederhana', mode: 'simple', icon: 'check-circle' },
  { id: 'free', label: 'Bebas', mode: 'free', icon: 'compass' },
];

export function RekomendasiScreen({
  ingredients: initialIngredients,
  onSelectRecipe,
  onBack,
}: RekomendasiScreenProps) {
  const [currentIngredients, setCurrentIngredients] = useState<string[]>(initialIngredients);
  const [activeConstraint, setActiveConstraint] = useState<string>('rescue');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);

  // State untuk "Tambah 1 Bahan"
  const [showAddOneInput, setShowAddOneInput] = useState<boolean>(false);
  const [newIngredientInput, setNewIngredientInput] = useState<string>('');

  const fetchRecommendations = async (
    targetIngredients: string[] = currentIngredients,
    constraintId: string = activeConstraint
  ) => {
    setLoading(true);
    setError(null);
    try {
      const selected = CONSTRAINTS.find((c) => c.id === constraintId);
      const data = await getRecipeRecommendations(
        targetIngredients,
        selected?.mode || 'rescue',
        selected?.label
      );
      setRecommendations(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat rekomendasi masakan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(currentIngredients, activeConstraint);
  }, []);

  const handleSelectConstraint = (constraintId: string) => {
    setActiveConstraint(constraintId);
    fetchRecommendations(currentIngredients, constraintId);
  };

  const handleAddOneIngredient = () => {
    const trimmed = newIngredientInput.trim().toLowerCase();
    if (!trimmed) return;
    if (currentIngredients.includes(trimmed)) {
      setNewIngredientInput('');
      setShowAddOneInput(false);
      return;
    }

    const updated = [...currentIngredients, trimmed];
    setCurrentIngredients(updated);
    setNewIngredientInput('');
    setShowAddOneInput(false);
    fetchRecommendations(updated, activeConstraint);
  };

  const handleLeftoverRemix = () => {
    // Mode remix sisa bahan: beralih ke Tanpa Belanja / Maksimalkan Bahan
    const nextMode = activeConstraint === 'no_shopping' ? 'rescue' : 'no_shopping';
    setActiveConstraint(nextMode);
    fetchRecommendations(currentIngredients, nextMode);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar Navigasi */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Rekomendasi Masakan</Text>
          <Text style={styles.topBarSubtitle}>
            Food Rescue dari {currentIngredients.length} bahan yang kamu miliki
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ringkasan Bahan Tersedia */}
        <View style={styles.pantrySummaryCard}>
          <View style={styles.pantrySummaryHeader}>
            <Feather name="check-circle" size={14} color="#16a34a" style={{ marginRight: 6 }} />
            <Text style={styles.pantrySummaryTitle}>Bahan Siap Pakai:</Text>
          </View>
          <View style={styles.tagWrap}>
            {currentIngredients.map((ing, idx) => (
              <View key={idx} style={styles.ingredientPill}>
                <Text style={styles.ingredientPillText}>{ing}</Text>
              </View>
            ))}

            {/* Tombol Tambah 1 Bahan */}
            <TouchableOpacity
              style={styles.addOnePill}
              onPress={() => setShowAddOneInput((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Feather name={showAddOneInput ? "x" : "plus"} size={13} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.addOnePillText}>
                {showAddOneInput ? "Tutup" : "Tambah 1 Bahan"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Input Tambah 1 Bahan */}
          {showAddOneInput && (
            <View style={styles.addInputRow}>
              <TextInput
                style={styles.addInput}
                placeholder="Contoh: tahu, kecap manis, bayam..."
                placeholderTextColor="#a8a29e"
                value={newIngredientInput}
                onChangeText={setNewIngredientInput}
                onSubmitEditing={handleAddOneIngredient}
                returnKeyType="done"
                autoFocus
              />
              <TouchableOpacity
                style={styles.addInputBtn}
                onPress={handleAddOneIngredient}
                activeOpacity={0.8}
              >
                <Text style={styles.addInputBtnText}>Racik Ulang</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section Constraint / Mode Food Rescue */}
        <View style={styles.constraintSection}>
          <Text style={styles.constraintHeader}>Mode Food Rescue:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.constraintScroll}>
            {CONSTRAINTS.map((c) => {
              const isActive = activeConstraint === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.constraintChip, isActive && styles.constraintChipActive]}
                  onPress={() => handleSelectConstraint(c.id)}
                  activeOpacity={0.75}
                >
                  <Feather
                    name={c.icon}
                    size={13}
                    color={isActive ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.constraintChipText, isActive && styles.constraintChipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* State Memuat */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingTitle}>Meracik Rekomendasi Food Rescue...</Text>
            <Text style={styles.loadingSubtitle}>
              Menyelaraskan bahan dengan model AI Langflow sesuai mode pilihanmu.
            </Text>
          </View>
        )}

        {/* State Error */}
        {!loading && error && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={24} color="#dc2626" style={{ marginBottom: 8 }} />
            <Text style={styles.errorTitle}>Kendala Rekomendasi</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchRecommendations(currentIngredients, activeConstraint)}
            >
              <Feather name="refresh-cw" size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* State Daftar Rekomendasi */}
        {!loading && !error && recommendations.length > 0 && (
          <View style={styles.recommendationList}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.sectionHeader}>
                Pilihan Hidangan Untukmu ({recommendations.length})
              </Text>
              <TouchableOpacity
                style={styles.remixBtn}
                onPress={handleLeftoverRemix}
                activeOpacity={0.75}
              >
                <Feather name="shuffle" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.remixBtnText}>Remix Bahan Sisa</Text>
              </TouchableOpacity>
            </View>

            {recommendations.map((recipe) => {
              // Deterministic rescue / utilization score
              const availableUsed = recipe.bahan_tersedia.length;
              const totalConsidered = currentIngredients.length;
              const utilizationPct = totalConsidered > 0
                ? Math.min(100, Math.round((availableUsed / totalConsidered) * 100))
                : 100;

              return (
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

                  {/* Deterministic Rescue Score Badge */}
                  <View style={styles.rescueScoreBadge}>
                    <Feather name="shield" size={12} color="#15803d" style={{ marginRight: 5 }} />
                    <Text style={styles.rescueScoreText}>
                      {availableUsed} dari {totalConsidered} bahan kamu digunakan ({utilizationPct}%)
                    </Text>
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
                    <Text style={styles.cardFooterText}>Lihat Detail & Langkah Masak</Text>
                    <Feather name="chevron-right" size={16} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            })}
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
    marginBottom: 12,
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
  addOnePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF3EF',
    borderColor: colors.primary,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addOnePillText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#FAF8F3',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addInputBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addInputBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  constraintSection: {
    marginBottom: 14,
  },
  constraintHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  constraintScroll: {
    gap: 8,
    paddingRight: 8,
  },
  constraintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  constraintChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  constraintChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  constraintChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#44403c',
  },
  remixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  remixBtnText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
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
  rescueScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  rescueScoreText: {
    fontSize: 11,
    color: '#166534',
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
    color: colors.primary,
    marginRight: 4,
  },
});
