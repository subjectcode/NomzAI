/**
 * Definisi tipe rute dan parameter navigasi Nomz.
 * Disiapkan untuk Milestone mendatang (Beranda, Scan Bahan, Rekomendasi, Detail Resep, Asisten Nomz).
 * Catatan: Fitur/layar selain ScanBahan belum diimplementasikan pada Milestone 1.
 */
export type NomzRootStackParamList = {
  /**
   * Beranda / Home Screen:
   * Menampilkan ringkasan bahan makanan pengguna, riwayat resep, dan tombol cepat scan.
   */
  Beranda: undefined;

  /**
   * Scan Bahan (Milestone 1):
   * Layar pemindaian bahan makanan berbasis AI multimodal vision.
   */
  ScanBahan: {
    autoOpenGallery?: boolean;
  } | undefined;

  /**
   * Rekomendasi Resep (Milestone 2):
   * Menampilkan daftar rekomendasi resep berdasarkan bahan yang telah dikonfirmasi.
   */
  Rekomendasi: {
    confirmedIngredients: string[];
  };

  /**
   * Detail Resep (Milestone 2 & 3):
   * Panduan langkah memasak, estimasi waktu, kalori, dan integrasi video.
   */
  DetailResep: {
    recipeId: string;
    recipeTitle: string;
  };

  /**
   * Asisten Nomz (Milestone 2+):
   * Chat AI interaktif untuk konsultasi memasak, substitusi bahan, dan tanya jawab gizi.
   */
  AsistenNomz: {
    initialQuery?: string;
  } | undefined;
};
