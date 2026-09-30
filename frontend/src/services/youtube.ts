import { Linking, Alert } from 'react-native';

/**
 * Membentuk URL pencarian YouTube resmi yang valid untuk nama hidangan.
 * Tidak pernah memalsukan ID video statis atau link fiktif.
 */
export function getYouTubeSearchUrl(recipeName: string): string {
  const query = `resep ${recipeName} cara memasak`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/**
 * Membuka aplikasi YouTube resmi atau browser ke halaman hasil pencarian video tutorial.
 */
export async function openYouTubeTutorial(recipeName: string): Promise<boolean> {
  const url = getYouTubeSearchUrl(recipeName);
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert(
        'Buka Tutorial',
        `Silakan cari video dengan kata kunci: "resep ${recipeName} cara memasak" di aplikasi YouTube.`
      );
      return false;
    }
  } catch (error) {
    console.error('Gagal membuka link YouTube:', error);
    Alert.alert(
      'Gagal Membuka YouTube',
      `Tidak dapat membuka link langsung. Kamu dapat mencari "resep ${recipeName}" langsung di YouTube.`
    );
    return false;
  }
}
