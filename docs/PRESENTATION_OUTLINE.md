# Nomz — Pitch Deck Outline (12 Final Slides)

**Target Durasi**: 5–7 Menit  
**File Presentasi**: `submission/Nomz_Pitching_Deck.pdf`  
**Tema Utama**: Solusi Food Rescue Rumahan Berbasis Multi-Agent AI (Gemini, Langflow V2, IBM Bob / MCP)

---

### Slide 1: Judul & Visi (Title & Vision)
- **Judul**: Nomz — Masak Enak dari yang Ada Saja.
- **Pesan Kunci**: Mentransformasi bahan sisa di dapur menjadi hidangan lezat dan bergizi secara instan.
- **Visual**: Mockup smartphone Android menampilkan layar Beranda Nomz dengan navigasi 5-tab.
- **Speaker Notes**: *"Selamat pagi dewan juri. Berapa kali kita membuka kulkas, melihat beberapa bahan tersisa, bingung mau diolah apa, lalu menyerah dan memesan makanan online? Nomz hadir membalik alur tersebut: bukan mencari resep lalu belanja, tapi mulai dari apa yang ada di dapurmu saat ini."*

---

### Slide 2: Permasalahan (The Problem)
- **Judul**: 02 | Permasalahan: Bahan makanan tersisa, mau dimasak apa?
- **Poin Utama**:
  - **Berakhir terbuang**: Jutaan ton sampah organik menumpuk setiap tahun dari rumah tangga.
  - **Tidak tahu olahannya**: Konsumen bingung memadukan bahan yang serba sedikit.
  - **Akhirnya basi**: Sayuran dan bumbu membusuk dalam hitungan hari.
- **Visual**: Foto kulkas dengan berbagai bahan sisa yang menumpuk.
- **Speaker Notes**: *"Aplikasi resep konvensional biasanya menuntut pengguna membeli daftar belanja lengkap. Ketika kurang satu atau dua bahan, pengguna membatalkan niat memasak. Akibatnya, bahan makanan yang ada akhirnya basi dan terbuang."*

---

### Slide 3: Solusi Nomz (The Solution)
- **Judul**: 03 | Solusi Nomz
- **Poin Utama**:
  - **Ide Masakan Langsung Siap**: Rekomendasi resep yang presisi sesuai stok yang dimiliki.
  - **Mudah & Praktis**: Cukup foto bahan makanan, tanpa perlu mencari resep manual satu per satu.
  - **Mendukung Pola Makan Sehat**: Resep rumahan dengan bahan segar bernutrisi.
  - **Mengurangi Food Waste**: Memaksimalkan konsumsi bahan yang sudah dibeli agar lebih hemat dan ramah lingkungan.
- **Visual**: Mockup aplikasi dengan ilustrasi keranjang sayur dan ikon daun keberlanjutan.
- **Speaker Notes**: *"Nomz memangkas hambatan memasak di rumah dengan menghubungkan bahan yang ada di meja dapur ke hidangan siap saji dalam hitungan detik."*

---

### Slide 4: Cara Kerja Nomz (How It Works)
- **Judul**: 04 | Cara Kerja Nomz
- **Alur 4 Langkah**:
  1. **Scan Bahan**: Foto bahan makanan yang ada di meja dapur atau kulkas.
  2. **Deteksi Bahan**: AI multimodal mengenali bahan mentah secara otomatis dengan validasi Human-in-the-Loop.
  3. **Pilih Resep**: Rekomendasi masakan terkurasi berdasarkan persentase kecocokan stok (*Pantry Match*).
  4. **Masak dengan Mudah**: Ikuti langkah memasak terstruktur lengkap dengan takaran dan video tutorial.
- **Visual**: Diagram horizontal 4 tangkapan layar antarmuka aplikasi.
- **Speaker Notes**: *"Alur pengguna dirancang tanpa hambatan: Ambil foto -> Verifikasi bahan -> Pilih resep -> Mulai masak terpandu."*

---

### Slide 5: Fitur Utama Nomz (Core Features)
- **Judul**: 05 | Fitur Utama Nomz
- **5 Pilar Fitur**:
  - `01` **Scan Bahan**: Deteksi instan kamera & galeri foto dapur.
  - `02` **Deteksi Bahan**: Deteksi cerdas bahan pangan dengan quantity stepper & tambah manual.
  - `03` **Rekomendasi Resep**: Filter gaya masak (tumis, goreng, kukus) dan preferensi dapur.
  - `04` **Panduan Memasak**: Estimasi waktu, porsi, checklist bumbu, dan instruksi langkah demi langkah.
  - `05` **Dapur Saya & Riwayat**: Manajemen stok pantry, resep favorit tersimpan, dan riwayat masak.
- **Visual**: Kartu fitur dengan ikon dan cuplikan UI detail resep.
- **Speaker Notes**: *"Nomz mendampingi pengguna secara end-to-end: dari deteksi bahan mentah, kurasi resep, hingga proses memasak selesai."*

---

### Slide 6: Manfaat & Dampak (Benefits & Impact)
- **Judul**: 06 | Manfaat & Dampak Nomz
- **4 Dimensi Manfaat**:
  - **Untuk Pengguna**: Makan lebih praktis & hemat anggaran bulanan.
  - **Untuk Kesehatan**: Pola makan lebih baik dengan hidangan rumahan segar.
  - **Untuk Lingkungan**: Mengurangi timbulan sampah makanan (*food waste*) rumah tangga.
  - **Untuk Masyarakat**: Menumbuhkan kebiasaan konsumsi pangan yang lebih berkelanjutan.
- **Visual**: Ilustrasi hidangan sehat, tempat sampah kompos daur ulang, dan komunitas ramah lingkungan.
- **Speaker Notes**: *"Dampak Nomz terintegrasi: menghemat pengeluaran belanja harian sekaligus berkontribusi langsung pada pengurangan emisi metana dari sampah organik."*

---

### Slide 7: Target Pengguna (Target Audience)
- **Judul**: 07 | Target Pengguna Nomz
- **Segmen Utama**:
  - **Pelajar & Mahasiswa**: Masak sendiri lebih hemat dengan fasilitas kulkas bersama.
  - **Pekerja Muda**: Solusi praktis dan cepat di tengah kesibukan harian.
  - **Keluarga**: Variasi menu harian yang hemat dari bahan yang sudah ada.
  - **Pecinta Gaya Hidup Sehat**: Lebih bijak dan terencana dalam memanfaatkan bahan makanan.
- **Visual**: Ilustrasi representatif masing-masing segmen pengguna.
- **Speaker Notes**: *"Fokus awal kami menyasar generasi muda dan keluarga perkotaan yang menginginkan efisiensi dapur tanpa mengorbankan kualitas nutrisi."*

---

### Slide 8: Teknologi & AI Agent Nomz (Architecture)
- **Judul**: 08 | Teknologi & AI Agent Nomz
- **Komponen Arsitektur**:
  - **Frontend**: React Native + Expo (TypeScript) — Native Android Universal APK.
  - **Backend**: FastAPI (Python 3.11) — RESTful API, validasi Pydantic V2, auth JWT.
  - **AI Agent**: Langflow V2 (Workflow orchestration) + Google Gemini (Multimodal vision & reasoning) + IBM Bob (Agentic development partner).
  - **Database**: PostgreSQL (Cloud/Server) & SQLite (Local testing isolation).
- **Aliran Data Nyata**:
  - `Frontend` ──► `FastAPI`: Foto bahan & parameter preferensi.
  - `FastAPI` ──► `Langflow + Gemini`: Eksekusi prompt chaining anti-waste & normalisasi.
  - `Langflow` ──► `FastAPI`: Payload resep JSON terstruktur & link video YouTube.
  - `FastAPI` ──► `Database`: Penyimpanan histori, pantry, dan profil pengguna.
  - `IBM Bob` ──► `MCP Server`: Integrasi tools pendukung alur AI saat siklus rekayasa.
- **Visual**: Diagram aliran sistem terstruktur dari Frontend -> Backend -> AI Agent -> Database.
- **Speaker Notes**: *"Arsitektur kami menggabungkan performa tinggi FastAPI dengan fleksibilitas orkestrasi Langflow V2. Gemini menangani penalaran visual dan generasi resep, sementara IBM Bob bertindak sebagai mitra rekayasa developer melalui protokol MCP."*

---

### Slide 9: Bukti Implementasi AI Workflow (Langflow Evidence)
- **Judul**: 09 | Bukti Implementasi AI Workflow
- **Bukti 1**: **Workflow di Langflow** — Pipeline `find_meals_v2` aktif dengan 10 nodes (Normalizer -> Cooking Style -> Rescue Prompt -> Gemini LLM -> Validator -> YouTube Search Intent -> YouTube Tool -> Ranker -> Output).
- **Bukti 2**: **Hasil Eksekusi Workflow** — Eksekusi live Playground Langflow menghasilkan rekomendasi masakan terstruktur dan link tutorial YouTube Devina Hermawan.
- **Visual**: Tangkapan layar kanvas editor Langflow berdampingan dengan output panel Playground.
- **Speaker Notes**: *"Ini adalah bukti implementasi nyata di Langflow: 10 node aktif yang memproses input bahan, menyaring preferensi masak, memvalidasi bahan agar tidak halusinasi, dan mencari video memasak yang relevan secara live."*

---

### Slide 10: IBM Bob & MCP Integration (Tooling Evidence)
- **Judul**: 10 | IBM Bob & MCP Integration
- **Bukti 1**: **MCP Server pada IBM Bob** — Pengaturan IBM Bob v2.2.0 menampilkan server `nomz-food-assistant` berstatus **● Connected** pada workspace Nomz.
- **Bukti 2**: **IBM Bob Menggunakan MCP Tool** — Sesi chat live IBM Bob memanggil tool `Ran Find Meals V2 (nomz-food-assistant)` untuk bahan telur dan tomat, menghasilkan rekomendasi masakan lengkap.
- **Visual**: Tangkapan layar panel Settings MCP Bob berdampingan dengan sesi chat pemanggilan tool.
- **Speaker Notes**: *"Kami memanfaatkan IBM Bob dan Model Context Protocol secara nyata. Server MCP Langflow terhubung langsung ke Bob, memungkinkan agen memanggil tool find_meals_v2 untuk menguji dan memvalidasi alur rekomendasi resep."*

---

### Slide 11: Potensi Pengembangan Nomz (Future Roadmap)
- **Judul**: 11 | Potensi Pengembangan Nomz
- **Rencana Mendatang**:
  - `01` **Rekomendasi Lebih Personal**: Menyesuaikan alergen dan histori preferensi pengguna.
  - `02` **Pengelolaan Stok Dapur**: Pengingat tanggal kedaluwarsa bahan segar (*smart expiry reminder*).
  - `03` **Variasi Resep**: Memperluas katalog kuliner tradisional Nusantara lintas daerah.
  - `04` **Evaluasi Dampak**: Mengukur kg bahan yang berhasil dimanfaatkan melalui data penggunaan nyata.
- **Visual**: 4 kartu pilar pengembangan dengan ikon modern.
- **Speaker Notes**: *"Ke depan, Nomz akan memperdalam personalisasi nutrisi, integrasi pengingat kedaluwarsa pantry, dan pengukuran dampak lingkungan secara terukur."*

---

### Slide 12: Penutup (Closing)
- **Judul**: 12 | Terima Kasih
- **Visual**: Logo Nomz dengan latar belakang elemen daun segar.
- **Speaker Notes**: *"Mari selamatkan bahan makanan yang ada di dapur kita, satu masakan dalam satu waktu. Terima kasih, kami siap untuk sesi tanya jawab."*
