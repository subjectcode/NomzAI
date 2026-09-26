# Nomz - Mobile AI Food Assistant 🍲

Nomz adalah aplikasi asisten kuliner berbasis mobile bertenaga AI yang dirancang untuk membantu pengguna mengelola bahan makanan, merencanakan masakan, dan menemukan resep yang dipersonalisasi.

## Project Status
**Status:** Hackathon Prototype  
**Current Phase:** Milestone 1 (Ingredient Vision) Completed

---

## Milestone Roadmap & Status

| Milestone | Deskripsi | Status |
| :--- | :--- | :--- |
| **Milestone 0** | **Foundation**: Setup React Native Expo frontend, FastAPI backend, SQLite DB, health check endpoint, configuration & testing | ✅ **COMPLETED** |
| **Milestone 1** | **Food Scanner & Ingredient Detection (AI Vision)**: Image upload, MIME/size validation, multimodal vision AI (Gemini Flash), structured ingredient JSON output, frontend gallery/sample picker, ingredient editor (edit/delete/add), & confirmation flow | ✅ **COMPLETED** |
| **Milestone 2** | Recipe Generation & AI Reasoning (Gemini / Langflow) | ⏳ Not Started |
| **Milestone 3** | Video & External Integration (YouTube API, etc.) | ⏳ Not Started |
| **Milestone 4** | Polish, UI/UX Refinement & Final Demo Preparation | ⏳ Not Started |

---

## Struktur Project

```text
Nomz/
├── frontend/             # React Native + Expo mobile application (TypeScript)
│   ├── src/
│   │   ├── config.ts     # Konfigurasi base URL dari environment
│   │   └── services/     # API service (health check call)
│   ├── App.tsx           # Entry screen dengan status checker
│   ├── app.json          # Konfigurasi Expo
│   ├── package.json
│   ├── .env.example
│   └── tsconfig.json
├── backend/              # Python FastAPI service
│   ├── app/
│   │   ├── main.py       # FastAPI application entry & CORS middleware
│   │   ├── core/
│   │   │   └── config.py # Settings & Pydantic configuration
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── health.py # GET /api/health endpoint
│   │   └── db/
│   │       ├── database.py   # SQLAlchemy engine & session maker
│   │       └── models.py     # Base model placeholder
│   ├── requirements.txt  # Python dependencies
│   ├── .env.example
│   └── nomz.db           # SQLite database runtime (git-ignored)
├── langflow/             # Placeholder untuk AI orchestration flows (Milestone 2)
├── tests/                # Automated tests (backend health & SQLite connection)
│   └── test_backend_health.py
├── docs/                 # Dokumentasi arsitektur dan milestone
│   └── milestone-0-foundation.md
├── screenshots/          # Dokumentasi visual prototype
├── .gitignore
├── .env.example          # Template environment variable root
└── README.md
```

---

## Persyaratan Sistem

- **Python**: 3.11+ (atau 3.10+)
- **Node.js**: 18+ (disarankan Node.js 20+)
- **npm** atau **yarn**
- **uv** (opsional, sangat direkomendasikan untuk manajemen Python yang cepat) atau `python -m venv`

---

## Cara Menjalankan Backend

1. Buka terminal dan masuk ke direktori `backend`:
   ```bash
   cd backend
   ```

2. Siapkan Python virtual environment:
   ```bash
   # Menggunakan uv (disarankan):
   uv venv .venv
   uv pip install -r requirements.txt --python .venv/Scripts/python.exe

   # ATAU menggunakan Python standard:
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   pip install -r requirements.txt
   # Linux/macOS:
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Salin environment configuration:
   ```bash
   copy .env.example .env   # Di Windows
   # atau: cp .env.example .env (Linux/macOS)
   ```

4. Jalankan FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. Verifikasi:
   - Root: [http://localhost:8000/](http://localhost:8000/)
   - Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
   - Interactive Docs (Swagger): [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## Cara Menjalankan Frontend

1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies (jika belum):
   ```bash
   npm install
   ```

3. Salin environment file:
   ```bash
   copy .env.example .env   # Di Windows
   # atau: cp .env.example .env (Linux/macOS)
   ```

4. Jalankan Expo:
   ```bash
   npx expo start
   ```

5. Membuka aplikasi:
   - **Web**: Tekan tombol `w` di terminal Expo untuk membuka browser di `http://localhost:8081`.
   - **Android Emulator**: Tekan `a` di terminal. Pastikan `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000`.
   - **Physical Device**: Buka aplikasi **Expo Go** pada smartphone dan scan QR code pada terminal. Ubah `EXPO_PUBLIC_API_URL` ke IP LAN komputer Anda (contoh: `http://192.168.1.50:8000`).

---

## Catatan Jaringan (Networking Notes)

Karena perbedaan arsitektur runtime, backend URL bervariasi tergantung client yang digunakan:

| Client | Backend Base URL | Keterangan |
| :--- | :--- | :--- |
| **Web Browser** | `http://localhost:8000` | Berjalan di mesin yang sama dengan backend. |
| **iOS Simulator** | `http://localhost:8000` | Berbagi interface loopback dengan host macOS. |
| **Android Emulator** | `http://10.0.2.2:8000` | `10.0.2.2` adalah alias default QEMU/Android untuk host loopback interface. |
| **Perangkat Fisik (Expo Go)** | `http://<LAN_IP>:8000` | Komputer dan smartphone harus berada di jaringan WiFi/LAN yang sama. |

Ubah variabel `EXPO_PUBLIC_API_URL` di `frontend/.env` sesuai target perangkat yang sedang diuji.

---

## Menjalankan Automated Test

Jalankan test suite dari root project:

```bash
# Menggunakan venv backend
backend\.venv\Scripts\pytest -v tests/test_backend_health.py
```

Test mencakup:
- Direct query execution ke SQLite (`SELECT 1`)
- Response schema validation dari endpoint `GET /api/health`
- Endpoint root API metadata dan dokumentasi
