import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeRecommendation } from '../types';
import { getActiveUserId } from './authStorage';

const COOKING_HISTORY_BASE_KEY = '@nomz_cooking_history';

async function getHistoryKey(userId?: string): Promise<string> {
  const uid = userId || (await getActiveUserId());
  return uid ? `${COOKING_HISTORY_BASE_KEY}_${uid}` : `${COOKING_HISTORY_BASE_KEY}_guest`;
}

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

export async function getCookingHistory(userId?: string): Promise<HistoryItem[]> {
  try {
    const key = await getHistoryKey(userId);
    const json = await AsyncStorage.getItem(key);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item === 'object' && item.id && item.recipe)
      : [];
  } catch (error) {
    console.error('Gagal membaca riwayat memasak:', error);
    return [];
  }
}

export async function addCookingHistory(
  recipe: RecipeRecommendation,
  userId?: string
): Promise<HistoryItem> {
  const now = new Date();
  const newItem: HistoryItem = {
    id: `history-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recipe,
    cookedAt: now.toISOString(),
    formattedDate: formatDateIndo(now),
    ingredientsRescuedCount: recipe.bahan_tersedia.length,
  };

  try {
    const key = await getHistoryKey(userId);
    const list = await getCookingHistory(userId);
    // Cegah duplikasi jika resep yang sama baru saja tercatat dalam rentang 3 detik
    if (list.length > 0 && list[0].recipe?.id === recipe.id) {
      const lastCookedTime = new Date(list[0].cookedAt).getTime();
      if (now.getTime() - lastCookedTime < 3000) {
        return list[0];
      }
    }
    const updated = [newItem, ...list];
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Gagal menyimpan riwayat memasak:', error);
  }

  return newItem;
}

export async function getImpactStats(userId?: string): Promise<ImpactStats> {
  const history = await getCookingHistory(userId);
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

export async function clearCookingHistory(userId?: string): Promise<void> {
  try {
    const key = await getHistoryKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Gagal menghapus riwayat memasak:', error);
  }
}
