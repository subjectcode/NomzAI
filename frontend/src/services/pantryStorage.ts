import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveUserId } from './authStorage';

const PANTRY_STORAGE_BASE_KEY = '@nomz_pantry_items';

async function getPantryKey(userId?: string): Promise<string> {
  const uid = userId || (await getActiveUserId());
  return uid ? `${PANTRY_STORAGE_BASE_KEY}_${uid}` : `${PANTRY_STORAGE_BASE_KEY}_guest`;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity?: string;
  useFirst: boolean;
  expiryDate?: string;
  addedAt: string;
}

export async function getPantryItems(userId?: string): Promise<PantryItem[]> {
  try {
    const key = await getPantryKey(userId);
    const json = await AsyncStorage.getItem(key);
    if (!json) {
      return [];
    }
    const parsed = JSON.parse(json);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item === 'object' && item.id && item.name)
      : [];
  } catch (error) {
    console.error('Gagal membaca dapur pantry:', error);
    return [];
  }
}

export async function addPantryItem(
  name: string,
  quantity?: string,
  useFirst: boolean = false,
  expiryDate?: string,
  userId?: string
): Promise<PantryItem> {
  const newItem: PantryItem = {
    id: `pantry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    quantity: quantity ? quantity.trim() : undefined,
    useFirst,
    expiryDate: expiryDate ? expiryDate.trim() : undefined,
    addedAt: new Date().toISOString(),
  };

  try {
    const key = await getPantryKey(userId);
    const items = await getPantryItems(userId);
    const existingIndex = items.findIndex(
      (i) => i.name.toLowerCase() === newItem.name.toLowerCase()
    );
    let updated: PantryItem[];
    if (existingIndex >= 0) {
      updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newItem.quantity || updated[existingIndex].quantity,
        useFirst: newItem.useFirst || updated[existingIndex].useFirst,
        expiryDate: newItem.expiryDate || updated[existingIndex].expiryDate,
      };
    } else {
      updated = [newItem, ...items];
    }
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Gagal menambah bahan ke dapur:', error);
  }

  return newItem;
}

export async function removePantryItem(id: string, userId?: string): Promise<boolean> {
  try {
    const key = await getPantryKey(userId);
    const items = await getPantryItems(userId);
    const updated = items.filter((item) => item.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Gagal menghapus bahan pantry:', error);
    return false;
  }
}

export async function toggleUseFirst(id: string, userId?: string): Promise<boolean> {
  try {
    const key = await getPantryKey(userId);
    const items = await getPantryItems(userId);
    const updated = items.map((item) =>
      item.id === id ? { ...item, useFirst: !item.useFirst } : item
    );
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Gagal memperbarui status Gunakan Dulu:', error);
    return false;
  }
}

/**
 * Mengambil daftar nama bahan dapur yang diprioritaskan untuk Food Rescue.
 * Bahan dengan status 'Gunakan Dulu' ditempatkan di depan.
 */
export async function getPantryIngredientsForRescue(userId?: string): Promise<string[]> {
  const items = await getPantryItems(userId);
  const sorted = [...items].sort((a, b) => {
    if (a.useFirst && !b.useFirst) return -1;
    if (!a.useFirst && b.useFirst) return 1;
    return 0;
  });
  return sorted.map((i) => i.name.toLowerCase());
}

/**
 * Mengosongkan inventaris dapur (pantry).
 */
export async function clearPantryItems(userId?: string): Promise<void> {
  try {
    const key = await getPantryKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify([]));
  } catch (error) {
    console.error('Gagal mengosongkan dapur pantry:', error);
  }
}
