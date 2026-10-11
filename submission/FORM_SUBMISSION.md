# Formulir Pengajuan Hackathon (Submission Form Copy-Paste Material)

Dokumen ini berisi draf jawaban lengkap dan terstruktur untuk pengisian formulir pendaftaran hackathon. Bahasa yang digunakan adalah bahasa mahasiswa yang lugas, terstruktur, spesifik, dan merefleksikan kondisi teknis aktual aplikasi Nomz.

---

### 1. Judul Proyek
**Nomz — AI Food Rescue Assistant**

---

### 2. Tema / Kategori
**Healthcare & Wellbeing** *(Sub-fokus: Sustainable Nutrition, Food Waste Reduction, & Smart Living)*

---

### 3. Tagline / Slogan
> *"Ubah Bahan Dapur yang Tersisa Jadi Hidangan Lezat dan Bergizi."*

---

### 4. Deskripsi Singkat (Elevator Pitch — 100-150 Kata)
Nomz adalah asisten penyelamat bahan makanan berbasis kecerdasan buatan (AI) yang membantu anak kos dan keluarga muda mengolah sisa bahan makanan di kulkas menjadi masakan rumah tangga yang lezat, sehat, dan ekonomis. 

Cukup dengan memotret bahan makanan mentah yang ada di dapur, Nomz memanfaatkan model multimodal AI untuk mengenali bahan secara otomatis, memberikan antarmuka interaktif bagi pengguna untuk memvalidasi jumlah bahan, dan menyusun rekomendasi resep masakan Nusantara melalui mesin orkestrasi Langflow V2. Dengan Nomz, pengguna tidak hanya menghemat anggaran belanja bulanan, tetapi juga berperan aktif dalam mengurangi limbah pangan rumah tangga (*food waste*) secara menyenangkan.

---

### 5. Latar Belakang & Problem Statement
1. **Dilema 'Bingung Mau Masak Apa':** Banyak anak kos dan ibu rumah tangga sering kebingungan mengolah bahan masakan yang tersisa sedikit atau tidak lengkap di kulkas (misalnya hanya ada separuh wortel, sedikit daging ayam, dan sepiring nasi dingin).
2. **Tingginya Limbah Pangan Rumah Tangga (*Food Waste*):** Bahan mentah segar seperti sayuran hijau, cabai, dan bumbu dapur cepat layu dan membusuk dalam hitungan hari jika tidak segera diolah. Makanan yang membusuk berakhir di tempat sampah dan menambah beban lingkungan.
3. **Keterbatasan Aplikasi Resep Konvensional:** Sebagian besar platform memasak saat ini mengasumsikan pengguna memiliki daftar belanja lengkap. Ketika ada 1 atau 2 bumbu yang kurang, pengguna cenderung menyerah lalu beralih memesan makanan siap saji yang lebih mahal dan belum tentu sehat.

---

### 6. Target Pengguna
- **Anak Kos & Mahasiswa Rantau:** Memiliki bujet makan terbatas, fasilitas kulkas mini bersama, dan membutuhkan ide masakan cepat saji yang praktis tanpa ribet belanja banyak bahan.
- **Keluarga Muda / Pekerja Sibuk:** Ingin menjaga pengeluaran dapur tetap efisien sekaligus menyajikan makanan sehat untuk keluarga tanpa menyia-nyiakan sisa bahan mingguan.
- **Pecinta Lingkungan & Minimalis:** Individu yang peduli pada gaya hidup berkelanjutan (*mindful eating & zero food waste*).

---

### 7. Alasan Mengapa Solusi Ini Dibutuhkan
Banyak orang ingin hidup sehat dan hemat dengan memasak sendiri, tetapi terhambat oleh *friction* ketiadaan ide saat melihat bahan dapur yang tidak komplit. Nomz membalik paradigma dari *"Cari resep lalu beli bahannya"* menjadi *"Lihat bahan yang kamu punya, biarkan AI carikan resep terbaiknya"*. Hal ini langsung memotong *barrier to entry* memasak di rumah dan menyelamatkan bahan makanan sebelum basi.

---

### 8. Fitur Utama Aplikasi

#### A. Fitur yang Sudah Berfungsi Penuh (Production-Ready v1.0.0):
1. **Multimodal Ingredient Detection (Kamera & Galeri):** Memindai foto bahan makanan secara instan menggunakan AI vision, mengenali bahan mentah (sayuran, protein, bumbu lokal) lengkap dengan *confidence score*.
2. **Interactive Ingredient Editor (Human-in-the-Loop):** Pengguna dapat mengubah nama bahan, menyesuaikan takaran kuantitas (*stepper* +/-), menghapus bahan yang keliru terdeteksi, atau menambahkan bahan manual.
3. **AI Recipe Recommendation Engine (Langflow V2):** Rekomendasi resep masakan lokal yang diurutkan berdasarkan *Pantry Match Score* (persentase kecocokan dengan stok bahan pengguna).
4. **Resep Detail & Panduan Memasak:** Informasi estimasi waktu memasak, tingkat kesulitan, perkiraan biaya porsi, daftar bumbu pelengkap yang umum di dapur, serta langkah instruksi memasak terstruktur.
5. **Video Tutorial Integrasi:** Rekomendasi video memasak YouTube yang relevan langsung di dalam layar resep.
6. **Autentikasi Multi-Metode & Keamanan:** Registrasi email/password dengan OTP verifikasi email, login Google via backend token verification, dan proteksi JWT.
7. **Profil Dapur & Pelacak Dampak:** Menyimpan resep favorit dan mencatat metrik simulasi penyelamatan makanan (*kg makanan diselamatkan* dan *perkiraan biaya dihemat*).

#### B. Rencana Pengembangan (Roadmap Mendatang):
1. **Auto-Deduction Pantry Inventory:** Bahan makanan otomatis berkurang dari inventaris dapur digital setelah pengguna menekan tombol selesai memasak.
2. **Smart Expiry Reminder:** Notifikasi pengingat otomatis untuk bahan segar yang mendekati batas simpan aman (misal sayur bayam sudah 3 hari disimpan).
3. **Komunitas Berbagi Bahan (Food Sharing Hub):** Fitur berbagi atau barter bahan mentah berlebih antartetangga atau teman satu kos.

---

### 9. User Flow (Alur Pengguna)
1. **Buka Aplikasi & Masuk:** Pengguna masuk melalui akun Google atau Email/Password terverifikasi.
2. **Ambil/Pilih Foto:** Di tab *Scan*, pengguna mengambil foto bahan makanan di meja dapur atau memilih dari galeri.
3. **Verifikasi Bahan:** Layar *Hasil Deteksi Bahan* menampilkan thumbnail foto asli, bahan terdeteksi (misal: nasi, ayam, bawang merah, tomat), dan kuantitasnya. Pengguna memverifikasi atau menambahkan bahan pelengkap.
4. **Minta Rekomendasi:** Pengguna menekan *"Lihat Rekomendasi Resep"*. Backend memanggil pipeline Langflow V2 untuk mengurasi resep terbaik.
5. **Pilih & Masak:** Pengguna memilih resep (misal: *Nasi Goreng Sayur Rumahan*), meninjau bumbu yang diperlukan, dan mengikuti instruksi langkah demi langkah hingga hidangan siap santap.

---

### 10. Implementasi AI & Penggunaan Langflow
- **Multimodal Vision:** Menggunakan Google Gemini 2.5 Flash dengan *strict structured JSON prompt* agar model hanya mendeteksi bahan yang kasat mata dan tidak berhalusinasi mengarang bumbu tersembunyi.
- **Langflow V2 Workflow Engine:** 
  - Alur orkestrasi menghubungkan input bahan dari pengguna ke prompt rekomendasi resep terstruktur.
  - Mengimplementasikan logika perhitungan *Pantry Match Score* untuk membedakan antara bahan utama yang wajib ada vs bahan pelengkap umum (garam, minyak, kecap).
  - Dilengkapi mekanisme *fallback* cerdas: jika pipeline V2 mengalami latensi tinggi, backend secara otomatis melakukan fallback ke parser internal berkecepatan tinggi tanpa membuat aplikasi crash.

---

### 11. Peran Nyata IBM Bob & Model Context Protocol (MCP)
*Klarifikasi Arsitektur:* IBM Bob tidak difungsikan sebagai bot obrolan di antarmuka pengguna akhir, melainkan diintegrasikan ke dalam ekosistem rekayasa perangkat lunak tim sebagai **Agentic Development & Testing Assistant**:
- **MCP Context Inspection:** Menggunakan Model Context Protocol untuk membaca struktur basis kode fullstack (React Native & FastAPI), memvalidasi schema Pydantic, dan memastikan keselarasan tipe data API secara konsisten.
- **Automated Regression & Test Runner:** IBM Bob digunakan untuk mengotomatisasi pengujian regresi 83 endpoint backend, validasi skenario edge case autentikasi, serta audit kestabilan kompilasi APK lintas arsitektur CPU (ARM vs x86_64).
- **Prompt Safety Alignment:** Mengevaluasi keluaran alur rekomendasi resep agar aman dari instruksi memasak yang membahayakan atau kombinasi bahan yang tidak lazim.

---

### 12. Dampak Potensial (Healthcare & Wellbeing)
*(Catatan: Ditulis sebagai potensi dampak berdasarkan asumsi kebiasaan memasak rumahan, bukan klaim metrik absolut yang belum diuji skala massal)*
- **Potensi Pengurangan Food Waste:** Berpotensi membantu sebuah rumah tangga menyelamatkan sekitar 1–2 kg bahan makanan layak konsumsi per minggu yang biasanya terbuang karena lupa atau tidak tahu cara mengolahnya.
- **Penghematan Finansial:** Membantu menekan pengeluaran belanja makan luar hingga 30–40% per bulan dengan memaksimalkan konsumsi bahan yang sudah dibeli.
- **Gizi Sehat & Terjaga:** Memotivasi kebiasaan memasak bahan segar sendiri di rumah, mengurangi konsumsi makanan instan tinggi natrium dan makanan ultra-proses (*ultra-processed food*).

---

### 13. Pembeda dengan Solusi Lain
| Fitur / Aspek | Aplikasi Resep Biasa (Cookpad, dll.) | Nomz AI Food Rescue Assistant |
| :--- | :--- | :--- |
| **Titik Masuk Utama** | Pencarian berdasarkan nama masakan | Pemindaian visual bahan yang dimiliki saat ini |
| **Deteksi Bahan** | Input teks manual satu per satu | AI Multimodal Vision otomatis dari 1 foto |
| **Kesesuaian Stok** | Resep sering minta bahan yang belum ada | *Pantry Match Scoring* fokus pada bahan yang tersedia |
| **Transparansi AI** | "Black box" rekomendasi | *Human-in-the-Loop* (pengguna dapat mengoreksi takaran sebelum AI mencari resep) |
| **Kesiapan Rilis** | Web/Prototype | Native Android Universal APK (v1.0.0) siap pasang |

---

### 14. Skalabilitas & Model Keberlanjutan
- **Skalabilitas Teknis:** Backend FastAPI asinkron yang ringan dengan koneksi database pooling PostgreSQL di Railway, siap menangani lonjakan panggilan API secara stateless.
- **Efisiensi Biaya AI:** Menggunakan Gemini Flash berbiaya rendah dengan caching rekomendasi dan validasi lokal di sisi client untuk meminimalisasi konsumsi token.
- **Model Monetisasi / Kemitraan Mendatang:**
  - Kemitraan dengan platform *grocery delivery* lokal untuk pembelian bahan pelengkap yang kurang dalam 1 klik.
  - Akun premium untuk analisis nutrisi kalori harian keluarga.

---

### 15. Teknologi yang Digunakan (Tech Stack)
- **Frontend Mobile:** React Native 0.86.3, Expo SDK 57.0.25, React 19.2.3, TypeScript ~6.0.3, React Navigation (5 tabs), Expo Camera & ImagePicker native, Expo SecureStore.
- **Backend API:** Python 3.11, FastAPI, Pydantic V2, Uvicorn ASGI, SQLAlchemy 2.0.
- **Database & Hosting:** PostgreSQL (Production config di Railway Cloud), SQLite (Local Test Isolation), GitHub Actions.
- **AI & Integrasi:** Google Gemini Multimodal Vision (`gemini-3.8-flash`), Langflow V2 Orchestration (`find_meals_v2` 10-node flow), YouTube Data API v3.
- **Engineering Tools:** IBM Bob Agentic Environment (v2.2.0), Model Context Protocol (MCP direct streamable-http SSE), Pytest.

---

### 16. Pengujian & Keandalan Rekayasa
- **Backend Unit & Integration Testing:** 83 dari 83 test suite lulus (`83 passed in pytest`), mencakup modul auth, vision, recipes, videos, pantry, isolasi akun, dan fallback Langflow.
- **MCP Tool Integration Testing:** Handshake `initialize`, discovery 4 tools, dan pemanggilan tool `find_meals` teruji 100% via Pytest `test_m4_mcp.py` serta live chat session di IBM Bob.
- **Frontend Static Analysis:** TypeScript strict mode lulus 0 error (`tsc --noEmit`).
- **Android Compatibility:** Build Universal Release APK (38.9 MB) mendukung arsitektur `armeabi-v7a`, `arm64-v8a`, dan `x86_64` (Min SDK 24 / Android 7.0 hingga Android 16/API 36).
- **Physical/Emulator Verification:** Alur pemindaian foto dapur nyata, inferensi kuantitas cerdas, dan navigasi berhasil diverifikasi di Android environment.

---

### 17. Tautan Proyek Publik
- **GitHub Repository:** [https://github.com/subjectcode/NomzAI](https://github.com/subjectcode/NomzAI)
- **Official GitHub Release v1.0.0:** [https://github.com/subjectcode/NomzAI/releases/tag/v1.0.0](https://github.com/subjectcode/NomzAI/releases/tag/v1.0.0)
- **Direct APK Download:** [Nomz-v1.0.0-android-universal.apk](https://github.com/subjectcode/NomzAI/releases/download/v1.0.0/Nomz-v1.0.0-android-universal.apk)
- **Production API URL:** [https://nomz-backend-production.up.railway.app](https://nomz-backend-production.up.railway.app)
- **Evidence & Technical Proof Index:** `submission/evidence/README.md`

---

### 18. Rekomendasi 5 Screenshot Terbaik untuk Upload Formulir

Jika formulir submission meminta unggahan berkas gambar (biasanya maksimal 5 file), gunakan file berikut dari folder `submission/evidence/`:

1. **`06_mobile_ingredient_detection_gemini.png`** (UI deteksi bahan multimodal Gemini + Human-in-the-Loop editor).
2. **`07_mobile_recipe_recommendation_langflow.png`** (UI rekomendasi resep masakan Nusantara dengan Pantry Match Score).
3. **`01_langflow_v2_canvas_workflow.png`** (Visual kanvas 10 node workflow Langflow V2 di port 7860).
4. **`12_ibm_bob_chat_mcp_find_meals_v2.png`** (Bukti sesi IBM Bob Chat memanggil MCP tool `Ran Find Meals V2`).
5. **`05_release_apk_installed_live.png`** (Bukti live aplikasi APK universal telah terpasang di perangkat Android).
