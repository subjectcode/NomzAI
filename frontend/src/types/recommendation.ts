export interface RecipeRecommendation {
  id: string;
  nama: string;
  deskripsi: string;
  bahan_tersedia: string[];
  bahan_tambahan: string[];
  estimasi_waktu: string;
  tingkat_kesulitan: string;
  alasan: string;
}

export interface RecommendationResponse {
  recommendations: Omit<RecipeRecommendation, 'id'>[];
}
