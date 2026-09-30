import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeRecommendation } from '../types';

const COOKING_HISTORY_KEY = '@nomz_cooking_history';

export interface HistoryItem {
  id: string;
  recipe: RecipeRecommendation;
  cookedAt: string;
  formattedDate: string;
  ingredientsRescuedCount: number;
}

export interface ImpactStats {
  ingredientsRescued: number;
  recipesCooked: number;
  mealsSaved: number;
}

function formatDateIndo(date: Date): string {
  const bulan = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const tgl = date.getDate();
  const bln = bulan[date.getMonth()];
  const thn = date.getFullYear();
  const jam = String(date.getHours()).padStart(2, '0');
  const mnt = String(date.getMinutes()).padStart(2, '0');
  return `${tgl} ${bln} ${thn}, ${jam}:${mnt}`;
}

export async function getCookingHistory(): Promise<HistoryItem[]> {
  try {
    const json = await AsyncStorage.getItem(COOKING_HISTORY_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Gagal membaca riwayat memasak:', error);
    return [];
  }
}

export async function addCookingHistory(recipe: RecipeRecommendation): Promise<HistoryItem> {
  const now = new Date();
  const newItem: HistoryItem = {
    id: `history-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recipe,
    cookedAt: now.toISOString(),
    formattedDate: formatDateIndo(now),
    ingredientsRescuedCount: recipe.bahan_tersedia.length,
  };

  try {
    const list = await getCookingHistory();
    const updated = [newItem, ...list];
    await AsyncStorage.setItem(COOKING_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Gagal menyimpan riwayat memasak:', error);
  }

  return newItem;
}

export async function getImpactStats(): Promise<ImpactStats> {
  const history = await getCookingHistory();
  const recipesCooked = history.length;
  const ingredientsRescued = history.reduce(
    (sum, item) => sum + (item.recipe?.bahan_tersedia?.length || 0),
    0
  );
  const mealsSaved = recipesCooked;

  return {
    ingredientsRescued,
    recipesCooked,
    mealsSaved,
  };
}

export async function clearCookingHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(COOKING_HISTORY_KEY);
  } catch (error) {
    console.error('Gagal menghapus riwayat memasak:', error);
  }
}
