import AsyncStorage from '@react-native-async-storage/async-storage';

const PANTRY_STORAGE_KEY = '@nomz_pantry_items';

export interface PantryItem {
  id: string;
  name: string;
  quantity?: string;
  useFirst: boolean;
  expiryDate?: string;
  addedAt: string;
}

const DEFAULT_PANTRY_ITEMS: PantryItem[] = [
  {
    id: 'pantry-1',
    name: 'Telur',
    quantity: '4 butir',
    useFirst: true,
    expiryDate: 'Besok',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-2',
    name: 'Tomat',
    quantity: '2 buah',
    useFirst: true,
    expiryDate: '2 hari lagi',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-3',
    name: 'Bawang Putih',
    quantity: '3 siung',
    useFirst: false,
    expiryDate: '1 minggu lagi',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-4',
    name: 'Bayam',
    quantity: '1 ikat',
    useFirst: true,
    expiryDate: 'Hari ini',
    addedAt: new Date().toISOString(),
  },
];

export async function getPantryItems(): Promise<PantryItem[]> {
  try {
    const json = await AsyncStorage.getItem(PANTRY_STORAGE_KEY);
    if (!json) {
      // Seed default items saat pertama kali
      await AsyncStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(DEFAULT_PANTRY_ITEMS));
      return DEFAULT_PANTRY_ITEMS;
    }
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Gagal membaca dapur pantry:', error);
    return DEFAULT_PANTRY_ITEMS;
  }
}

export async function addPantryItem(
  name: string,
  quantity?: string,
  useFirst: boolean = false,
  expiryDate?: string
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
    const items = await getPantryItems();
    const updated = [newItem, ...items];
    await AsyncStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Gagal menambah bahan ke dapur:', error);
  }

  return newItem;
}

export async function removePantryItem(id: string): Promise<boolean> {
  try {
    const items = await getPantryItems();
    const updated = items.filter((item) => item.id !== id);
    await AsyncStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Gagal menghapus bahan pantry:', error);
    return false;
  }
}

export async function toggleUseFirst(id: string): Promise<boolean> {
  try {
    const items = await getPantryItems();
    const updated = items.map((item) =>
      item.id === id ? { ...item, useFirst: !item.useFirst } : item
    );
    await AsyncStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(updated));
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
export async function getPantryIngredientsForRescue(): Promise<string[]> {
  const items = await getPantryItems();
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
export async function clearPantryItems(): Promise<void> {
  try {
    await AsyncStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Gagal mengosongkan dapur pantry:', error);
  }
}
