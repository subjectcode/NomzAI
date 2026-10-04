import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeRecommendation } from '../types';
import { getActiveUserId } from './authStorage';

const SAVED_RECIPES_BASE_KEY = '@nomz_saved_recipes';

async function getSavedKey(userId?: string): Promise<string> {
  const uid = userId || (await getActiveUserId());
  return uid ? `${SAVED_RECIPES_BASE_KEY}_${uid}` : `${SAVED_RECIPES_BASE_KEY}_guest`;
}

/**
 * Mengambil semua resep yang disimpan oleh pengguna secara persisten.
 */
export async function getSavedRecipes(userId?: string): Promise<RecipeRecommendation[]> {
  try {
    const key = await getSavedKey(userId);
    const json = await AsyncStorage.getItem(key);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed)
      ? parsed.filter((r) => r && typeof r === 'object' && r.id && r.nama)
      : [];
  } catch (error) {
    console.error('Gagal membaca resep tersimpan:', error);
    return [];
  }
}

/**
 * Menyimpan resep ke daftar tersimpan jika belum ada.
 */
export async function saveRecipe(
  recipe: RecipeRecommendation,
  userId?: string
): Promise<boolean> {
  try {
    const key = await getSavedKey(userId);
    const list = await getSavedRecipes(userId);
    const exists = list.some(
      (r) => r.id === recipe.id || r.nama.toLowerCase() === recipe.nama.toLowerCase()
    );
    if (exists) return false;

    const updated = [recipe, ...list];
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Gagal menyimpan resep:', error);
    return false;
  }
}

/**
 * Menghapus resep dari daftar tersimpan.
 */
export async function removeSavedRecipe(recipeId: string, userId?: string): Promise<boolean> {
  try {
    const key = await getSavedKey(userId);
    const list = await getSavedRecipes(userId);
    const updated = list.filter((r) => r.id !== recipeId);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Gagal menghapus resep tersimpan:', error);
    return false;
  }
}

/**
 * Memeriksa apakah resep sudah tersimpan.
 */
export async function isRecipeSaved(
  recipeId: string,
  recipeName?: string,
  userId?: string
): Promise<boolean> {
  try {
    const list = await getSavedRecipes(userId);
    return list.some(
      (r) => r.id === recipeId || (recipeName && r.nama.toLowerCase() === recipeName.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * Menghapus seluruh resep yang tersimpan.
 */
export async function clearSavedRecipes(userId?: string): Promise<void> {
  try {
    const key = await getSavedKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Gagal menghapus resep tersimpan:', error);
  }
}
