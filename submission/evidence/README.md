# Nomz — Bukti Teknis & Bukti Implementasi (Evidence Index)

Indeks artefak bukti teknis resmi untuk penilaian Hacktiv8. Seluruh berkas adalah tangkapan layar asli dari lingkungan pengembangan, build Android, dan eksekusi AI aktif.

---

## 1. Bukti Alur AI & Integrasi Tooling (Sesuai Slide 9 & 10 Pitch Deck)

| No | Berkas | Kategori | Penjelasan Teknis & Relevansi Slide |
| :---: | :--- | :--- | :--- |
| **01** | `01_langflow_v2_canvas_workflow.png` | **Langflow V2** | **Slide 09 (Bukti 1)**: Kanvas 10 nodes pipeline `find_meals_v2` di Langflow (Normalizer -> Style Interpreter -> Rescue Prompt -> Gemini LLM -> Validator -> YouTube Search Intent -> YouTube Tool -> Ranker -> Output). |
| **02** | `02_langflow_v2_playground_execution.png` | **Langflow V2** | **Slide 09 (Bukti 2)**: Eksekusi real-time di Langflow Playground menghasilkan payload JSON rekomendasi masakan terstruktur dan link video memasak YouTube (Devina Hermawan). |
| **03** | `11_ibm_bob_mcp_connected_status.png` | **IBM Bob / MCP** | **Slide 10 (Bukti 1)**: Layar pengaturan IBM Bob (v2.2.0) pada tab MCP yang menunjukkan server `nomz-food-assistant` berstatus **● Connected** di workspace Nomz. |
| **04** | `12_ibm_bob_chat_mcp_find_meals_v2.png` | **IBM Bob / MCP** | **Slide 10 (Bukti 2)**: Sesi chat interaktif IBM Bob memanggil tool MCP `Ran Find Meals V2 (nomz-food-assistant)` untuk bahan telur dan tomat, menghasilkan rekomendasi resep masakan Nusantara. |

---

## 2. Bukti Antarmuka Aplikasi & Kesiapan Rilis (Sesuai Slide 4, 5 & Arsitektur)

| No | Berkas | Kategori | Penjelasan Teknis & Fitur |
| :---: | :--- | :--- | :--- |
| **05** | `06_mobile_ingredient_detection_gemini.png` | **AI Vision (Mobile)** | **Slide 04 & 05**: Antarmuka *Hasil Deteksi Bahan* multimodal Google Gemini dengan Human-in-the-Loop editor (stepper kuantitas +/- dan tombol tambah manual). |
| **06** | `07_mobile_recipe_recommendation_langflow.png` | **Rekomendasi (Mobile)** | **Slide 04 & 05**: Antarmuka kurasi resep masakan berbasis bahan yang dimiliki dengan *Pantry Match Score* hasil orkestrasi Langflow V2. |
| **07** | `08_mobile_home_dashboard.png` | **Antarmuka Utama** | **Slide 01, 04, 05**: Beranda utama aplikasi dengan navigasi 5-tab, kartu dampak penyelamatan bahan, dan akses cepat pemindaian. |
| **08** | `09_mobile_cooking_guide_detail.png` | **Panduan Memasak** | **Slide 04 & 05**: Halaman detail resep lengkap dengan estimasi waktu, porsi, checklist bumbu, langkah memasak bertahap, dan video tutorial. |
| **09** | `10_mobile_profile_impact_metrics.png` | **Profil & Dampak** | **Slide 05 & 06**: Layar profil pengguna, pelacak metrik dampak food waste, dan inventaris stok dapur (*pantry*). |
| **10** | `04_backend_health_and_db_connected.png` | **Backend & Database** | Verifikasi konektivitas client-ke-backend FastAPI (`nomz-api`) dengan status database `Connected`. |
| **11** | `05_release_apk_installed_live.png` | **Android Release APK** | Bukti pemasangan live Universal Release APK v1.0.0 (38.9 MB) pada sistem operasi Android fisik. |

---

## 3. Kebijakan Privasi & Keamanan
- Seluruh rahasia, token akses, password, dan kunci API disamarkan (*redacted*) dari tampilan publik.
- Berkas gambar merupakan tangkapan layar asli tanpa rekayasa grafis tiruan.
