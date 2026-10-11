# Panduan & Checklist Demo Aplikasi Nomz (Hackathon Presentation)

Dokumen ini disusun untuk memandu jalannya sesi demonstrasi langsung (*live demo*) aplikasi **Nomz AI Food Rescue Assistant** di hadapan juri dan audiens.

---

## 1. Tautan Penting & Aset Resmi

- **GitHub Repository:** [https://github.com/subjectcode/NomzAI](https://github.com/subjectcode/NomzAI)
- **Official Release v1.0.0:** [https://github.com/subjectcode/NomzAI/releases/tag/v1.0.0](https://github.com/subjectcode/NomzAI/releases/tag/v1.0.0)
- **Direct Download Universal APK (38.9 MB):** [Nomz-v1.0.0-android-universal.apk](https://github.com/subjectcode/NomzAI/releases/download/v1.0.0/Nomz-v1.0.0-android-universal.apk)
- **Production Backend Endpoint:** `https://nomz-backend-production.up.railway.app`
- **Slide Pitching Deck (PPTX):** `submission/Nomz_Pitching_Deck.pptx` (1.24 MB)
- **5 Screenshot Unggulan:** `submission/screenshots/`

---

## 2. Checklist Persiapan Pra-Demo (H-1 Jam Sebelum Presentasi)

| Status | Item Checklist | Keterangan & Tindakan |
| :---: | :--- | :--- |
| [ ] | **Koneksi Internet HP / Laptop** | Pastikan perangkat terhubung internet stabil untuk akses Railway API & Gemini Vision. |
| [ ] | **Pemasangan APK di HP Android** | Pastikan file `Nomz-v1.0.0-android-universal.apk` terpasang di HP fisik atau emulator Android. |
| [ ] | **Akun Demo Siap Pakai** | Siapkan akun terverifikasi (misal: login Google 1-klik atau akun email tester) agar tidak membuang waktu registrasi ulang. |
| [ ] | **Foto Bahan Uji Siap di Galeri** | Simpan foto meja dapur (`submission/screenshots/demo_bahan_makanan_anak_kos.png` atau foto bahan fisik nyata) di galeri HP sebagai antisipasi pencahayaan ruangan presentasi yang kurang ideal. |
| [ ] | **Screen Mirroring / HDMI** | Uji mirroring layar ponsel (menggunakan scrcpy / kabel HDMI) ke proyektor presentasi. |

---

## 3. Urutan Langkah Live Demo (Alur 3 Menit)

### Tahap 1: Pembukaan & Tampilan Beranda (30 Detik)
1. **Buka Aplikasi Nomz:**
   - Aplikasi langsung masuk ke halaman utama (*Beranda*).
2. **Sorot Fitur Beranda:**
   - Tunjukkan kartu sapaan personal pengguna.
   - Sorot ringkasan metrik penyelamatan makanan (*Food Rescue Impact*): kg bahan yang diselamatkan dan rupiah yang dihemat.
   - Jelaskan struktur navigasi 5-tab yang intuitif: *Beranda, Jelajahi, Scan, Tersimpan, Profil*.
3. **Poin Narasi:**
   > *"Selamat pagi dewan juri, ini adalah Beranda Nomz. Di sini pengguna disambut dengan motivasi dampak lingkungan nyata dari kebiasaan memasak bahan sisa mereka."*

---

### Tahap 2: Pemindaian Bahan Dapur / Multimodal Scan (45 Detik)
1. **Masuk ke Tab Scan:**
   - Tekan tombol lingkaran hijau *Scan* di bagian tengah navigasi bawah.
2. **Pilih Bahan Dapur:**
   - Pilih tab *Galeri* lalu pilih foto bahan makanan nyata di meja dapur (menampilkan nasi dingin, potongan ayam mentah, tomat, wortel, selada, bawang merah, bawang putih, cabai).
   - Layar menampilkan *Konfirmasi Foto*. Tekan tombol hijau **Gunakan Foto**.
3. **Proses AI Vision:**
   - Modal loading *"Mengenali Bahan Makanan..."* muncul selama ~8–12 detik saat model multimodal Gemini AI menganalisis gambar.
4. **Poin Narasi:**
   > *"Sekarang bayangkan saya adalah anak kos yang punya sedikit bahan tersisa di kulkas. Saya cukup foto meja dapur saya, dan model multimodal vision Nomz akan mendeteksi seluruh bahan mentah secara otomatis."*

---

### Tahap 3: Validasi Interaktif (Human-in-the-Loop) (45 Detik)
1. **Layar Hasil Deteksi Bahan:**
   - Tunjukkan bahwa thumbnail foto asli tampil jelas di kartu atas (*8 bahan dikenali*).
   - Tunjukkan daftar kartu bahan yang terdeteksi lengkap dengan persentase kepastian (*95% yakin*):
     - `nasi` (1 mangkuk)
     - `bawang putih` (3 siung)
     - `bawang merah` (3 siung)
     - `daging ayam` (250 g)
     - `wortel` (1 buah), `tomat` (1 buah), dll.
2. **Interaksi Pengguna:**
   - Tekan tombol stepper `[+]` atau `[-]` pada kuantitas bahan untuk membuktikan antarmuka interaktif.
   - Sorot bahwa pengguna bisa menekan tombol `+ Tambah Bahan Manual` jika ada bumbu tambahan seperti kecap atau garam di dapur mereka.
3. **Poin Narasi:**
   > *"Nomz menerapkan prinsip Responsible AI: Human-in-the-Loop. AI tidak memaksakan asumsi; pengguna memegang kendali penuh untuk mengoreksi takaran porsi sebelum resep dicari."*

---

### Tahap 4: Kurasi Rekomendasi Resep (Langflow V2) (30 Detik)
1. **Panggil Rekomendasi:**
   - Tekan tombol besar **Lihat Rekomendasi Resep**.
2. **Tinjau Daftar Masakan:**
   - Aplikasi menampilkan kurasi hidangan lokal yang relevan, seperti:
     - *Nasi Goreng Sayur Rumahan* (Pantry Match: 4 bahan cocok, Waktu: 15 menit, Tingkat: Mudah).
     - *Tumis Tahu Brokoli Bawang*.
     - *Omelet Tomat Bayam Segar*.
3. **Filter Masakan:**
   - Tunjukkan filter gaya memasak (*Semua, Tumis, Goreng, Kukus*).
4. **Poin Narasi:**
   > *"Hanya dari bahan sisa tadi, Langflow V2 mengorkestrasi pencarian resep dan menghitung Pantry Match Score. Kita disarankan membuat Nasi Goreng Sayur Rumahan karena 100% bahan utamanya sudah kita miliki tanpa perlu belanja lagi!"*

---

### Tahap 5: Detail Resep & Panduan Memasak Terstruktur (30 Detik)
1. **Buka Kartu Resep:**
   - Klik kartu resep *Nasi Goreng Sayur Rumahan*.
2. **Sorot Konten Layar:**
   - Ringkasan metrik: Waktu memasak (15 menit), Tingkat kesulitan (Mudah), Estimasi porsi.
   - Checklist bumbu yang sudah dimiliki vs bumbu pelengkap umum.
   - Langkah instruksi memasak terstruktur (step 1 hingga selesai).
   - Video tutorial YouTube yang disematkan untuk referensi visual.
3. **Mulai Masak:**
   - Tekan tombol **Mulai Masak Terpandu**.
4. **Poin Narasi:**
   > *"Di halaman detail, pengguna mendapatkan estimasi porsi, bumbu pendukung, panduan memasak terperinci, hingga video tutorial. Memasak bahan sisa jadi pengalaman yang mudah, menyenangkan, dan menyelamatkan makanan dari tempat sampah."*

---

## 4. Rencana Kontinjensi (Troubleshooting Cepat)

| Skenario Darurat | Solusi Cepat Saat Presentasi |
| :--- | :--- |
| **Koneksi internet lambat / AI timeout** | Tunjukkan langsung resep dari tab *Jelajahi* atau riwayat tersimpan di tab *Tersimpan*, lalu jelaskan arsitektur caching lokal Nomz. |
| **Kamera ponsel buram di panggung** | Beralih ke opsi *Galeri* dan gunakan foto contoh bahan yang sudah dipersiapkan sebelumnya di folder galeri ponsel. |
| **Ponsel tidak terhubung ke proyektor** | Buka dokumen `submission/Nomz_Pitching_Deck.pptx` slide 4 yang telah memuat 5 screenshot tangkapan layar runtime asli secara lengkap. |
