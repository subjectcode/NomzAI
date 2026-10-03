import { Linking } from 'react-native';

export interface VideoRecommendation {
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
  duration?: string;
  url: string;
}

export interface VideoSearchResponse {
  videos: VideoRecommendation[];
  source: string;
  total?: number;
  offset?: number;
  limit?: number;
}

/**
 * Mendapatkan pool rekomendasi video dari backend.
 */
export async function fetchVideoRecommendations(
  recipeName: string,
  offset: number = 0,
  limit: number = 50
): Promise<VideoRecommendation[]> {
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
  const query = `resep ${recipeName} cara memasak`;

  try {
    const url = `${API_URL}/api/videos/search?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: VideoSearchResponse = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error('Gagal mengambil rekomendasi video:', error);
    return [];
  }
}

/**
 * Membuka video langsung di aplikasi YouTube atau browser sebagai fallback.
 */
export async function openVideoInYouTube(videoId: string): Promise<boolean> {
  const appUrl = `vnd.youtube://${videoId}`;
  const webUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const supported = await Linking.canOpenURL(appUrl);
    if (supported) {
      await Linking.openURL(appUrl);
      return true;
    } else {
      await Linking.openURL(webUrl);
      return true;
    }
  } catch (error) {
    console.error('Gagal membuka video YouTube:', error);
    try {
      await Linking.openURL(webUrl);
      return true;
    } catch {
      return false;
    }
  }
}
