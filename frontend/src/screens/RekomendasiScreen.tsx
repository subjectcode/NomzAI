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
import { colors, radius, shadows, spacing } from '../theme';

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
  { id: 'simple', label: 'Sederhana', mode: 'simple', icon: 'check-circle' },
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
    const nextMode = activeConstraint === 'no_shopping' ? 'rescue' : 'no_shopping';
    setActiveConstraint(nextMode);
    fetchRecommendations(currentIngredients, nextMode);
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Rekomendasi Masakan</Text>
          <Text style={styles.topBarSubtitle}>
            {currentIngredients.length} bahan dapur siap diselamatkan
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. RINGKASAN BAHAN BERSIH */}
        <View style={styles.pantrySummaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryTitleRow}>
              <Feather name="check-circle" size={14} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={styles.summaryTitle}>Bahan Kamu:</Text>
            </View>

            <TouchableOpacity
              style={styles.addOnePill}
              onPress={() => setShowAddOneInput((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Feather
                name={showAddOneInput ? 'x' : 'plus'}
                size={12}
                color={colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.addOnePillText}>
                {showAddOneInput ? 'Tutup' : 'Tambah Bahan'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ingredientChipsWrap}>
            {currentIngredients.map((ing, idx) => (
              <View key={idx} style={styles.ingredientChip}>
                <Text style={styles.ingredientChipText}>{ing}</Text>
              </View>
            ))}
          </View>

          {/* Form Input Tambah 1 Bahan */}
          {showAddOneInput && (
            <View style={styles.addInputRow}>
              <TextInput
                style={styles.addInput}
                placeholder="Contoh: tahu, kecap manis..."
                placeholderTextColor={colors.textMuted}
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

        {/* 3. MODE FOOD RESCUE / CONSTRAINTS (DESIGN.md Section 27) */}
        <View style={styles.constraintSection}>
          <Text style={styles.constraintSectionLabel}>Pilih Gaya Masak:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.constraintScroll}
          >
            {CONSTRAINTS.map((c) => {
              const isActive = activeConstraint === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.constraintChip, isActive && styles.constraintChipActive]}
                  onPress={() => handleSelectConstraint(c.id)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={c.icon}
                    size={13}
                    color={isActive ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.constraintChipText,
                      isActive && styles.constraintChipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. LOADING STATE (DESIGN.md Section 37 — Calm & Food-First) */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingTitle}>Mencari resep dari bahanmu...</Text>
            <Text style={styles.loadingSubtitle}>
              Memilih masakan rumahan yang paling praktis dan memaksimalkan bahan yang ada.
            </Text>
          </View>
        )}

        {/* 5. ERROR STATE */}
        {!loading && error && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={24} color={colors.error} style={{ marginBottom: 8 }} />
            <Text style={styles.errorTitle}>Belum Dapat Menemukan Resep</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchRecommendations(currentIngredients, activeConstraint)}
              activeOpacity={0.8}
            >
              <Feather name="refresh-cw" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. DAFTAR REKOMENDASI (DESIGN.md Section 28 & 22) */}
        {!loading && !error && recommendations.length > 0 && (
          <View style={styles.recommendationList}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultHeaderTitle}>
                Inspirasi Menu ({recommendations.length})
              </Text>
              <TouchableOpacity
                style={styles.remixBtn}
                onPress={handleLeftoverRemix}
                activeOpacity={0.75}
              >
                <Feather name="shuffle" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.remixBtnText}>Remix Sisa</Text>
              </TouchableOpacity>
            </View>

            {recommendations.map((recipe) => {
              const availableUsed = recipe.bahan_tersedia.length;
              const totalConsidered = currentIngredients.length;
              const utilizationPct =
                totalConsidered > 0
                  ? Math.min(100, Math.round((availableUsed / totalConsidered) * 100))
                  : 100;

              return (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => onSelectRecipe(recipe)}
                  activeOpacity={0.88}
                >
                  {/* Card Title & Meta Info */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.recipeTitle}>{recipe.nama}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Feather name="clock" size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                        <Text style={styles.metaText}>{recipe.estimasi_waktu}</Text>
                      </View>
                      <Text style={styles.metaDot}>•</Text>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>{recipe.tingkat_kesulitan}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Human Rescue Utilization Badge */}
                  <View style={styles.rescueBadge}>
                    <Feather name="check" size={12} color={colors.success} style={{ marginRight: 5 }} />
                    <Text style={styles.rescueBadgeText}>
                      {availableUsed} dari {totalConsidered} bahan kamu terpakai ({utilizationPct}%)
                    </Text>
                  </View>

                  {/* Alasan Rekomendasi (Human explanation per DESIGN.md Section 28) */}
                  <Text style={styles.recipeRationale}>
                    {recipe.alasan_rekomendasi || recipe.alasan || recipe.deskripsi}
                  </Text>

                  {/* Breakdown Bahan Tersedia vs Tambahan */}
                  <View style={styles.ingredientsBox}>
                    <View style={styles.ingredientGroup}>
                      <Text style={styles.ingredientGroupLabel}>Bahan yang digunakan:</Text>
                      <View style={styles.tagWrap}>
                        {recipe.bahan_tersedia.map((b, i) => (
                          <View key={i} style={styles.availableTag}>
                            <Feather name="check" size={10} color={colors.success} style={{ marginRight: 3 }} />
                            <Text style={styles.availableTagText}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {recipe.bahan_tambahan && recipe.bahan_tambahan.length > 0 && (
                      <View style={[styles.ingredientGroup, { marginTop: 8 }]}>
                        <Text style={styles.ingredientGroupLabelSecondary}>Bumbu pelengkap:</Text>
                        <View style={styles.tagWrap}>
                          {recipe.bahan_tambahan.map((b, i) => (
                            <View key={i} style={styles.additionalTag}>
                              <Feather name="plus" size={10} color={colors.textMuted} style={{ marginRight: 3 }} />
                              <Text style={styles.additionalTagText}>{b}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Card CTA Footer */}
                  <View style={styles.cardFooterRow}>
                    <Text style={styles.cardFooterCta}>Lihat Resep & Cara Masak</Text>
                    <View style={styles.cardFooterCircle}>
                      <Feather name="arrow-right" size={14} color="#FFFFFF" />
                    </View>
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
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  pantrySummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 18,
    ...shadows.level1,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addOnePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mintSoft,
    borderWidth: 1,
    borderColor: colors.lightMint,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  addOnePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  ingredientChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  ingredientChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  addInputRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addInputBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addInputBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  constraintSection: {
    marginBottom: 20,
  },
  constraintSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  constraintScroll: {
    gap: 8,
    paddingRight: 10,
  },
  constraintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    minHeight: 38,
  },
  constraintChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  constraintChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  constraintChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  centerBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.full,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  recommendationList: {
    gap: 16,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  remixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  remixBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  recipeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  cardHeader: {
    marginBottom: 10,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  metaDot: {
    marginHorizontal: 6,
    color: colors.textMuted,
    fontSize: 12,
  },
  difficultyBadge: {
    backgroundColor: colors.mintSoft,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  rescueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  rescueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  recipeRationale: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  ingredientsBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 14,
  },
  ingredientGroup: {},
  ingredientGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 5,
  },
  ingredientGroupLabelSecondary: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 5,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  availableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
  },
  availableTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
    textTransform: 'capitalize',
  },
  additionalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
  },
  additionalTagText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cardFooterCta: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  cardFooterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
