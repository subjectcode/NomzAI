import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RecipeRecommendation } from '../types';
import { colors, radius, shadows, spacing } from '../theme';
import { getSavedRecipes, removeSavedRecipe } from '../services/savedStorage';

interface TersimpanScreenProps {
  isActive?: boolean;
  onSelectRecipe: (recipe: RecipeRecommendation) => void;
  onExplore: () => void;
}

export function TersimpanScreen({ isActive, onSelectRecipe, onExplore }: TersimpanScreenProps) {
  const [recipes, setRecipes] = useState<RecipeRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRecipes = async () => {
    setLoading(true);
    const data = await getSavedRecipes();
    setRecipes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, [isActive]);

  const handleRemove = async (id: string) => {
    await removeSavedRecipe(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <Text style={styles.topBarTitle}>Resep Tersimpan</Text>
          <Text style={styles.topBarSubtitle}>Koleksi masakan favoritmu</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadRecipes} activeOpacity={0.7}>
          <Feather name="refresh-cw" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat resep tersimpan...</Text>
          </View>
        ) : recipes.length === 0 ? (
          /* Empty State per DESIGN.md Section 36 */
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <Feather name="bookmark" size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Resep Tersimpan</Text>
            <Text style={styles.emptySubtitle}>
              Simpan resep inspiratif yang kamu sukai agar mudah dimasak kembali kapan saja.
            </Text>
            <TouchableOpacity style={styles.emptyActionBtn} onPress={onExplore} activeOpacity={0.85}>
              <Feather name="compass" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyActionBtnText}>Jelajahi Ide Masakan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listWrap}>
            <Text style={styles.countText}>{recipes.length} Masakan Tersimpan</Text>
            {recipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => onSelectRecipe(recipe)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.recipeTitle}>{recipe.nama}</Text>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => handleRemove(recipe.id)}
                    activeOpacity={0.7}
                    accessibilityLabel={`Hapus simpanan ${recipe.nama}`}
                  >
                    <Feather name="trash-2" size={15} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.recipeDesc} numberOfLines={2}>
                  {recipe.alasan_rekomendasi || recipe.deskripsi}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Feather name="clock" size={11} color={colors.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{recipe.estimasi_waktu}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Feather name="bar-chart-2" size={11} color={colors.success} style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{recipe.tingkat_kesulitan}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Feather name="check" size={11} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{recipe.bahan_tersedia.length} Bahan Ada</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>Buka Detail Resep</Text>
                  <Feather name="chevron-right" size={15} color={colors.primary} />
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
  brandWrap: {
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
    marginTop: 1,
  },
  refreshBtn: {
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
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 32,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.level1,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listWrap: {
    gap: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 10,
  },
  trashBtn: {
    padding: 4,
  },
  recipeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  metaPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cardFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
