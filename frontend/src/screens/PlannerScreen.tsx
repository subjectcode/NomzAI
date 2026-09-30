import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';
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
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>Rencana Menu Masak</Text>
          <Text style={styles.topBarSubtitle}>Atur menu harian dari bahan yang dimiliki</Text>
        </View>
      </View>

      {/* Days Horizontal Tab */}
      <View style={styles.daysScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Menu Hari {currentDayLabel}</Text>
          <TouchableOpacity style={styles.addPlanBtn} onPress={onExploreRecipes} activeOpacity={0.75}>
            <Feather name="plus" size={13} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.addPlanBtnText}>Tambah Menu</Text>
          </TouchableOpacity>
        </View>

        {dayPlans.length === 0 ? (
          <View style={styles.emptyDayBox}>
            <View style={styles.emptyIconBox}>
              <Feather name="calendar" size={28} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Menu untuk {currentDayLabel}</Text>
            <Text style={styles.emptySubtitle}>
              Pilih hidangan dari hasil rekomendasi atau jelajahi inspirasi resep untuk hari ini.
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
                  >
                    <Feather name="trash-2" size={15} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.recipeTitle}>{plan.recipe.nama}</Text>
                <Text style={styles.recipeDesc} numberOfLines={2}>
                  {plan.recipe.deskripsi}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Feather name="clock" size={11} color="#57534e" style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{plan.recipe.estimasi_waktu}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Feather name="bar-chart-2" size={11} color="#16a34a" style={{ marginRight: 4 }} />
                    <Text style={styles.metaPillText}>{plan.recipe.tingkat_kesulitan}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>Buka Resep & Langkah</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DE',
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
    color: colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  daysScrollWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DE',
    paddingVertical: 10,
  },
  daysContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FAF8F3',
    borderWidth: 1,
    borderColor: '#E7E5DE',
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  planDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 3,
  },
  planDotActive: {
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addPlanBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyDayBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    padding: 30,
    marginTop: 8,
  },
  emptyIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EFF3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  findRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  findRecipeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  planList: {
    gap: 12,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DE',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealTypeBadge: {
    backgroundColor: '#EFF3EF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mealTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
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
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F3',
    paddingHorizontal: 8,
    paddingVertical: 3,
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
