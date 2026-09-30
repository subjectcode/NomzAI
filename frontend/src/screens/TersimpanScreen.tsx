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
import { colors } from '../theme';
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
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <Text style={styles.topBarTitle}>Resep Tersimpan</Text>
          <Text style={styles.topBarSubtitle}>Koleksi masakan favoritmu</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadRecipes} activeOpacity={0.7}>
          <Feather name="refresh-cw" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat resep tersimpan...</Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <Feather name="bookmark" size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Resep Tersimpan</Text>
            <Text style={styles.emptySubtitle}>
              Simpan resep inspiratif yang kamu temukan dari hasil pemindaian atau jelajahi dapur.
            </Text>
            <TouchableOpacity style={styles.emptyActionBtn} onPress={onExplore} activeOpacity={0.85}>
              <Feather name="compass" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
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
                  >
                    <Feather name="trash-2" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.recipeDesc} numberOfLines={2}>
                  {recipe.deskripsi}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Feather name="clock" size={12} color="#57534e" style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{recipe.estimasi_waktu}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Feather name="bar-chart-2" size={12} color="#16a34a" style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{recipe.tingkat_kesulitan}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Feather name="check" size={12} color="#2563eb" style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{recipe.bahan_tersedia.length} Bahan</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>Buka Detail Masakan</Text>
                  <Feather name="chevron-right" size={14} color={colors.primary} />
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
    backgroundColor: '#FAF8F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DE',
  },
  brandWrap: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listWrap: {
    gap: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  trashBtn: {
    padding: 4,
  },
  recipeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
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
    backgroundColor: '#FAF8F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E7E5DE',
  },
  metaPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f4',
    paddingTop: 8,
  },
  cardFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 4,
  },
});
