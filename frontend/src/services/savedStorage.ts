import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeRecommendation } from '../types';

const SAVED_RECIPES_KEY = '@nomz_saved_recipes';

/**
 * Mengambil semua resep yang disimpan oleh pengguna secara persisten.
 */
export async function getSavedRecipes(): Promise<RecipeRecommendation[]> {
  try {
    const json = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
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
export async function saveRecipe(recipe: RecipeRecommendation): Promise<boolean> {
  try {
    const list = await getSavedRecipes();
    const exists = list.some((r) => r.id === recipe.id || r.nama.toLowerCase() === recipe.nama.toLowerCase());
    if (exists) return false;

    const updated = [recipe, ...list];
    await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Gagal menyimpan resep:', error);
    return false;
  }
}

/**
 * Menghapus resep dari daftar tersimpan.
 */
export async function removeSavedRecipe(recipeId: string): Promise<boolean> {
  try {
    const list = await getSavedRecipes();
    const updated = list.filter((r) => r.id !== recipeId);
    await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Gagal menghapus resep tersimpan:', error);
    return false;
  }
}

/**
 * Memeriksa apakah resep sudah tersimpan.
 */
export async function isRecipeSaved(recipeId: string, recipeName?: string): Promise<boolean> {
  try {
    const list = await getSavedRecipes();
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
export async function clearSavedRecipes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVED_RECIPES_KEY);
  } catch (error) {
    console.error('Gagal menghapus resep tersimpan:', error);
  }
}
