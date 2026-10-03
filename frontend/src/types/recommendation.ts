export interface RecipeRecommendation {
  id: string;
  nama: string;
  deskripsi: string;
  metode_masak?: string;
  bahan_tersedia: string[];
  bahan_tambahan: string[];
  estimasi_waktu: string;
  tingkat_kesulitan: string;
  alasan: string;
  alasan_rekomendasi?: string;
  langkah?: string[];
  langkah_memasak?: string[];
  porsi?: string;
}

export interface RecommendationResponse {
  recommendations: RecipeRecommendation[];
  source?: string;
  flow_id?: string | null;
}
