import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeRecommendation } from '../types';

const PLANNER_STORAGE_KEY = '@nomz_meal_planner';

export interface MealPlan {
  id: string;
  dayKey: string;
  dayLabel: string;
  mealType: string;
  recipe: RecipeRecommendation;
  addedAt: string;
}

export const DAYS_OF_WEEK = [
  { key: 'senin', label: 'Senin' },
  { key: 'selasa', label: 'Selasa' },
  { key: 'rabu', label: 'Rabu' },
  { key: 'kamis', label: 'Kamis' },
  { key: 'jumat', label: 'Jumat' },
  { key: 'sabtu', label: 'Sabtu' },
  { key: 'minggu', label: 'Minggu' },
];

export async function getMealPlans(): Promise<MealPlan[]> {
  try {
    const json = await AsyncStorage.getItem(PLANNER_STORAGE_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Gagal membaca rencana masak:', error);
    return [];
  }
}

export async function addMealPlan(
  dayKey: string,
  dayLabel: string,
  recipe: RecipeRecommendation,
  mealType: string = 'Makan Siang'
): Promise<MealPlan> {
  const newPlan: MealPlan = {
    id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    dayKey,
    dayLabel,
    mealType,
    recipe,
    addedAt: new Date().toISOString(),
  };

  try {
    const plans = await getMealPlans();
    // Ganti jika sudah ada rencana untuk hari dan mealType yang sama, atau tambahkan
    const filtered = plans.filter(
      (p) => !(p.dayKey === dayKey && p.mealType === mealType)
    );
    const updated = [...filtered, newPlan];
    await AsyncStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Gagal menyimpan rencana makan:', error);
  }

  return newPlan;
}

export async function removeMealPlan(id: string): Promise<boolean> {
  try {
    const plans = await getMealPlans();
    const updated = plans.filter((p) => p.id !== id);
    await AsyncStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Gagal menghapus rencana makan:', error);
    return false;
  }
}
