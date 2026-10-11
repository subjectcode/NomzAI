# Nomz — Slide 8 Technical Evidence Checklist

**Checklist Bukti Teknis untuk Presentasi Final Hacktiv8 × IBM Bob**  
*Status Pembaruan:* 11 Oktober 2026 — **STATUS: 100% COMPLETE & VERIFIED**

---

## 1. Bukti yang SUDAH TERSEDIA (Tersimpan & Terverifikasi di Repository)

Seluruh bukti fisik di bawah ini telah di-audit, bebas dari secret/API key, dan tersimpan di folder `submission/evidence/`:

| No | File Bukti | Kategori | Deskripsi / Nilai Teknis | Status |
| :---: | :--- | :--- | :--- | :---: |
| **1** | `01_langflow_v2_canvas_workflow.png` | **Langflow V2** | Tangkapan layar utuh kanvas workflow `find_meals_v2` (10 nodes) menampilkan topologi end-to-end: Input -> Normalizer -> Style -> Rescue Prompt -> Gemini AI -> Validator -> Video Intent -> YouTube Tool -> Ranker -> Output. | **READY & VERIFIED** |
| **2** | `02_langflow_v2_playground_execution.png` | **Langflow V2** | Tangkapan layar eksekusi real-time di Langflow Playground yang membuktikan orkestrasi berhasil mengembalikan JSON masakan dan link video YouTube Indonesia. | **READY & VERIFIED** |
| **3** | `03_langflow_v2_playground_modal.png` | **Langflow V2** | Tampilan sesi aktif pada Langflow Playground interface. | **READY & VERIFIED** |
| **4** | `04_backend_health_and_db_connected.png` | **Backend / DB** | Tangkapan layar status koneksi aplikasi mobile ke backend FastAPI (`nomz-api`) dengan status database `Connected`. | **READY & VERIFIED** |
| **5** | `05_release_apk_installed_live.png` | **Mobile App** | Bukti instalasi live release APK universal Nomz pada perangkat fisik Android. | **READY & VERIFIED** |
| **6** | `06_mobile_ingredient_detection_gemini.png` | **AI Vision** | UI editor deteksi bahan masakan multimodal Google Gemini di aplikasi mobile (pengguna memverifikasi bahan). | **READY & VERIFIED** |
| **7** | `07_mobile_recipe_recommendation_langflow.png` | **App Result** | UI kartu rekomendasi masakan hasil inferensi Langflow V2 di aplikasi mobile. | **READY & VERIFIED** |
| **8** | `08_mobile_home_dashboard.png` | **Mobile App** | UI beranda utama dengan navigasi 5-tab dan ringkasan bahan diselamatkan. | **READY & VERIFIED** |
| **9** | `09_mobile_cooking_guide_detail.png` | **Mobile App** | UI detail resep, estimasi waktu/biaya, langkah memasak, dan video YouTube. | **READY & VERIFIED** |
| **10** | `10_mobile_profile_impact_metrics.png` | **Mobile App** | UI profil pengguna dan pelacak dampak simulasi penghematan food waste. | **READY & VERIFIED** |
| **11** | `11_ibm_bob_mcp_connected_status.png` | **IBM Bob / MCP** | Status server MCP `nomz-food-assistant` berstatus **● Connected** di pengaturan IBM Bob v2.2.0. | **READY & VERIFIED** |
| **12** | `12_ibm_bob_chat_mcp_find_meals_v2.png` | **IBM Bob / MCP** | Sesi chat interaktif IBM Bob memanggil tool MCP `Ran Find Meals V2 (nomz-food-assistant)` untuk bahan telur dan tomat, menghasilkan resep dan video tutorial YouTube. | **READY & VERIFIED** |
| **13** | `13_langflow_v2_dark_canvas_40pct.png` | **Langflow V2** | Kanvas Langflow V2 dark theme zoom 40% memperlihatkan interkoneksi 10 nodes secara tajam. | **READY & VERIFIED** |
| **14** | Log Test Pytest (`docs/TECHNICAL_EVIDENCE.md`) | **QA / Tests** | Log eksekusi 8/8 automated integration test PASS (100% green) mencakup health check, Langflow REST execution, dan MCP protocol handshake & tool call. | **READY & VERIFIED** |

---

## 2. Bukti Opsional Tambahan (Jika Diperlukan Juri)

Semua bukti primer untuk presentasi Hacktiv8 kini **lengkap 100%**. Bukti opsional berikut hanya jika juri meminta bukti infrastruktur hosting cloud:
- **`manual_railway_cloud_deployment.png` (Opsional)**: Screenshot dashboard Railway jika juri ingin melihat container service cloud live.

---

## 3. Panduan Tata Letak Slide 8 di Canva

Saat menyusun Slide 8 di Canva, gunakan aset yang telah tersedia di `submission/evidence/`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              SLIDE 8: ARSITEKTUR NYATA & BUKTI REKAYASA TERVERIFIKASI       │
├───────────────────────────────┬─────────────────────────────┬───────────────┤
│          KOLOM KIRI           │         KOLOM TENGAH        │  KOLOM KANAN  │
│       Arsitektur Sistem       │     Langflow V2 Runtime     │ IBM Bob & MCP │
│                               │                             │               │
│ • Diagram Aliran Data Nyata   │ [Gambar:                    │ [Gambar:      │
│   (Mobile -> FastAPI ->       │  01_langflow_v2_canvas_     │  12_ibm_bob_  │
│    Langflow V2 -> Gemini)     │  workflow.png               │  chat_mcp_    │
│ • Pemisahan Runtime vs        │  atau                       │  find_meals_  │
│   Tooling                     │  13_langflow_v2_dark_       │  v2.png]      │
│ • Badge:                      │  canvas_40pct.png]          │               │
│   "8/8 Automated Tests PASS"  │                             │ [Badge:       │
│ • Badge:                      │ [Inset:                     │  11_ibm_bob_  │
│   "0 TypeScript Error"        │  02_langflow_v2_            │  mcp_status   │
│                               │  playground_execution.png]  │  ● Connected] │
│                               │                             │               │
│ Caption:                      │ Caption:                    │ Caption:      │
│ Integrasi backend asinkron    │ Pipeline 10 node aktif      │ IBM Bob agen  │
│ dengan validasi ketat.        │ memproses normalisasi       │ dev memanggil │
│                               │ hingga integrasi video.     │ MCP tool.     │
└───────────────────────────────┴─────────────────────────────┴───────────────┘
```

- **Klaim yang Aman**:
  - Langflow V2 = Runtime AI workflow rekomendasi resep.
  - IBM Bob = Developer tool & testing orchestrator via MCP.
  - MCP = Protokol standar tool integration yang telah teruji memanggil `find_meals_v2`.
- **Klaim yang Dihindari**:
  - Jangan menyebut Bob sebagai chatbot di HP pengguna.
  - Jangan mengklaim model AI dilatih dari nol (Nomz menggunakan multimodal Gemini + prompt engineering terstruktur).
