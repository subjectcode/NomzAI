# Nomz — Evidence & Technical Proof Index

Direktori ini memuat seluruh artefak tangkapan layar asli (*original evidence*) yang mendokumentasikan implementasi teknis, eksekusi alur AI, antarmuka aplikasi, dan integrasi IBM Bob / MCP untuk penilaian reviewer Hacktiv8.

---

## 1. Daftar Bukti yang Tersedia di Repository

| No | Nama File | Kategori | Deskripsi & Apa yang Dibuktikan | Status Verifikasi |
| :---: | :--- | :--- | :--- | :---: |
| **01** | `01_langflow_v2_canvas_workflow.png` | **Langflow V2** | Kanvas visual lengkap workflow `find_meals_v2` (10 nodes aktif) di Langflow port 7860. Membuktikan alur: Normalizer -> Style Interpreter -> Prompt Builder -> Gemini LLM -> Validator -> Video Search -> YouTube Tool -> Ranker -> Output. | **VERIFIED** |
| **02** | `02_langflow_v2_playground_execution.png` | **Langflow V2** | Eksekusi langsung di Langflow Playground dengan input bahan mentah riil. Membuktikan pipeline menghasilkan JSON rekomendasi terstruktur dan video tutorial YouTube. | **VERIFIED** |
| **03** | `03_langflow_v2_playground_modal.png` | **Langflow V2** | Antarmuka sesi aktif Playground Langflow untuk pengetesan interaktif. | **VERIFIED** |
| **04** | `04_backend_health_and_db_connected.png` | **Backend & DB** | Verifikasi konektivitas client-ke-backend FastAPI (`nomz-api`) dengan status database `Connected`. | **VERIFIED** |
| **05** | `05_release_apk_installed_live.png` | **Mobile App** | Bukti rilis Universal APK v1.0.0 (38.9 MB) terpasang dan berjalan live pada perangkat Android. | **VERIFIED** |
| **06** | `06_mobile_ingredient_detection_gemini.png` | **AI Vision** | Antarmuka *Hasil Deteksi Bahan* multimodal Google Gemini dengan fitur interaktif *Human-in-the-Loop* (stepper kuantitas & tambah manual). | **VERIFIED** |
| **07** | `07_mobile_recipe_recommendation_langflow.png` | **Mobile App** | Antarmuka rekomendasi resep masakan berbasis stok bahan pengguna (*Pantry Match Score*) hasil orkestrasi Langflow. | **VERIFIED** |
| **08** | `08_mobile_home_dashboard.png` | **Mobile App** | Antarmuka beranda utama dengan navigasi 5-tab, ringkasan penyelamatan bahan, dan aksi pemindaian cepat. | **VERIFIED** |
| **09** | `09_mobile_cooking_guide_detail.png` | **Mobile App** | Halaman detail resep lengkap dengan estimasi waktu/biaya, checklist bumbu, langkah memasak terstruktur, dan video. | **VERIFIED** |
| **10** | `10_mobile_profile_impact_metrics.png` | **Mobile App** | Halaman profil dan pelacak dampak simulasi food waste (*kg diselamatkan & estimasi biaya dihemat*). | **VERIFIED** |
| **11** | `11_ibm_bob_mcp_connected_status.png` | **IBM Bob & MCP** | Layar Bob Settings pada tab MCP: server `nomz-food-assistant` berstatus **● Connected** pada scope Workspace (Bob v2.2.0). | **VERIFIED** |
| **12** | `12_ibm_bob_chat_mcp_find_meals_v2.png` | **IBM Bob & MCP** | Sesi chat live IBM Bob mengeksekusi tool `Ran Find Meals V2 (nomz-food-assistant)` untuk bahan telur & tomat, menghasilkan rekomendasi masakan lengkap dengan video tutorial YouTube Devina Hermawan. | **VERIFIED** |
| **13** | `13_langflow_v2_dark_canvas_40pct.png` | **Langflow V2** | Kanvas Langflow V2 dalam dark theme pada zoom 40% menampilkan 10 nodes dan koneksi edge yang presisi. | **VERIFIED** |

---

## 2. Rekomendasi 5 Screenshot Terbaik untuk Upload Formulir Submission

1. **`06_mobile_ingredient_detection_gemini.png`**: Membuktikan keunggulan AI Vision dan validasi Human-in-the-Loop (pengguna memverifikasi bahan).
2. **`07_mobile_recipe_recommendation_langflow.png`**: Membuktikan solusi inti resep berbasis bahan sisa (*Food Rescue & Pantry Match*).
3. **`01_langflow_v2_canvas_workflow.png`**: Membuktikan arsitektur workflow multi-node Langflow V2 yang terorkestrasi.
4. **`12_ibm_bob_chat_mcp_find_meals_v2.png`**: Membuktikan integrasi IBM Bob memanggil MCP tool `find_meals_v2` secara nyata.
5. **`05_release_apk_installed_live.png`**: Membuktikan aplikasi adalah produk rilis Android APK universal yang nyata dan dapat dipasang.

---

## 3. Kebijakan Keamanan & Integritas Bukti
- Seluruh screenshot merupakan rekaman layar asli dari lingkungan pengujian dan kompilasi nyata.
- Tidak ada mock artifisial atau rekayasa grafis.
- Seluruh rahasia, token akses, password, dan kunci API disamarkan (*redacted*) dari tampilan publik.
