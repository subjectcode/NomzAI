import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';
import {
  MealPlan,
  DAYS_OF_WEEK,
  getMealPlans,
  removeMealPlan,
} from '../services/plannerStorage';
import { RecipeRecommendation } from '../types';

interface PlannerScreenProps {
  onBack: () => void;
  onSelectRecipe: (recipe: RecipeRecommendation) => void;
  onExploreRecipes: () => void;
}

export function PlannerScreen({
  onBack,
  onSelectRecipe,
  onExploreRecipes,
}: PlannerScreenProps) {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [activeDay, setActiveDay] = useState<string>('senin');

  const loadPlans = async () => {
    const list = await getMealPlans();
    setPlans(list);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleRemove = async (id: string) => {
    await removeMealPlan(id);
    await loadPlans();
  };

  const dayPlans = plans.filter((p) => p.dayKey === activeDay);
  const currentDayLabel = DAYS_OF_WEEK.find((d) => d.key === activeDay)?.label || 'Hari Ini';

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Rencana Menu Masak</Text>
          <Text style={styles.topBarSubtitle}>Atur jadwal santapan dari bahan kulkas</Text>
        </View>
      </View>

      {/* 2. DAYS HORIZONTAL BAR */}
      <View style={styles.daysScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >
          {DAYS_OF_WEEK.map((d) => {
            const isActive = activeDay === d.key;
            const hasPlan = plans.some((p) => p.dayKey === d.key);
            return (
              <TouchableOpacity
                key={d.key}
                style={[styles.dayTab, isActive && styles.dayTabActive]}
                onPress={() => setActiveDay(d.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{d.label}</Text>
                {hasPlan && <View style={[styles.planDot, isActive && styles.planDotActive]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Menu Hari {currentDayLabel}</Text>
          <TouchableOpacity style={styles.addPlanBtn} onPress={onExploreRecipes} activeOpacity={0.75}>
            <Feather name="plus" size={13} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.addPlanBtnText}>Tambah Menu</Text>
          </TouchableOpacity>
        </View>

        {dayPlans.length === 0 ? (
          /* Empty Day State */
          <View style={styles.emptyDayBox}>
            <View style={styles.emptyIconBox}>
              <Feather name="calendar" size={28} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Menu untuk {currentDayLabel}</Text>
            <Text style={styles.emptySubtitle}>
              Pilih hidangan dari hasil rekomendasi bahan dapurmu atau jelajahi inspirasi resep.
            </Text>
            <TouchableOpacity style={styles.findRecipeBtn} onPress={onExploreRecipes} activeOpacity={0.85}>
              <Feather name="compass" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.findRecipeBtnText}>Cari Menu Masakan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.planList}>
            {dayPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                onPress={() => onSelectRecipe(plan.recipe)}
                activeOpacity={0.85}
              >
                <View style={styles.planCardHeader}>
                  <View style={styles.mealTypeBadge}>
                    <Text style={styles.mealTypeBadgeText}>{plan.mealType}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleRemove(plan.id)}
                    activeOpacity={0.7}
                    accessibilityLabel={`Hapus rencana ${plan.recipe.nama}`}
                  >
                    <Feather name="trash-2" size={15} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.recipeTitle}>{plan.recipe.nama}</Text>
                <Text style={styles.recipeDesc} numberOfLines={2}>
                  {plan.recipe.alasan_rekomendasi || plan.recipe.deskripsi}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Feather name="clock" size={11} color={colors.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{plan.recipe.estimasi_waktu}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Feather name="bar-chart-2" size={11} color={colors.success} style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{plan.recipe.tingkat_kesulitan}</Text>
                  </View>
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
  daysScrollWrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingVertical: 10,
  },
  daysContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayTab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  planDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginLeft: 6,
  },
  planDotActive: {
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mintSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.lightMint,
  },
  addPlanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyDayBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  findRecipeBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 11,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.level1,
  },
  findRecipeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  planList: {
    gap: 12,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.level1,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeBadge: {
    backgroundColor: colors.mintSoft,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
  },
  mealTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  deleteBtn: {
    padding: 4,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  recipeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
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
});
