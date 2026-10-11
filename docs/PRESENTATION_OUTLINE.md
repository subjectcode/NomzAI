# Nomz — Hackathon Pitch Deck Outline & Slide 8 Evidence Pack

**Target Pitch Duration**: 5–7 Minutes  
**Format**: 11 Slides (Concise, High Impact)  
**Canva Slide 8 Focus**: Technical Architecture, Real Evidence & Verified Orchestration

---

### Slide 1: Title & Vision
- **Title**: Nomz — The AI Food Rescue Assistant
- **Main Message**: Transforming pantry leftovers into delicious meals to eliminate household food waste.
- **On-Slide Bullets**:
  - Hacktiv8 × IBM Hackathon Finalist
  - Powered by Google Gemini, Langflow V2, and IBM Bob / MCP
  - Live Android Mobile Application
- **Suggested Visual**: Full-bleed hero screenshot of Nomz smartphone running live app with high-resolution food photo and logo.
- **Speaker Notes**: "Good morning judges. How many times have you opened your fridge, stared at a collection of random vegetables and leftovers, given up, and ordered takeout? Every week, Indonesian households discard tons of edible groceries simply because they don't know what to cook with what they have. Meet Nomz."
- **Transition**: "To understand why this happens at such scale, let's look at the underlying problem."

---

### Slide 2: The Real Household Problem
- **Title**: Why Food Gets Wasted Every Day
- **Main Message**: The traditional recipe workflow is broken for modern busy households.
- **On-Slide Bullets**:
  - Millions of tons of food waste generated yearly from households.
  - Average household loses IDR 300,000+ monthly on expired groceries.
  - Traditional recipe apps demand buying *more* ingredients, worsening fridge clutter.
- **Suggested Visual**: Visual split: Full trash bin of groceries vs. frustrated consumer ordering food delivery.
- **Speaker Notes**: "Traditional cooking apps ask you: 'What recipe do you want to cook?' and give you a grocery list of 12 items. That model generates more waste. Consumers end up buying a bunch of herbs for one meal, and the rest spoils."
- **Transition**: "Nomz completely reverses this dynamic."

---

### Slide 3: The Solution — Reverse Recipe Engine
- **Title**: Nomz: Cook What You Already Have
- **Main Message**: Start with the ingredients you have, not the ones you need to buy.
- **On-Slide Bullets**:
  - 📸 **Snap**: Photograph your counter or fridge in seconds.
  - 🧠 **Detect**: Multimodal AI extracts structured ingredients in natural Indonesian.
  - 🍳 **Rescue**: Recipes ranked by pantry utilization and zero-waste score.
- **Suggested Visual**: 3-step diagram showing phone camera -> AI detection pills -> Delicious Indonesian recipe card.
- **Speaker Notes**: "With Nomz, you don't start with a craving. You start with what is in your kitchen right now. Snap a photo, let AI identify your groceries, and receive tailored Indonesian recipes designed to rescue perishables before they spoil."
- **Transition**: "Let's walk through how this works in real life."

---

### Slide 4: Live Product Journey & Five-Tab Experience
- **Title**: Clean, Production-Grade Mobile Experience
- **Main Message**: Five intuitive tabs built for effortless daily kitchen utility.
- **On-Slide Bullets**:
  - **Beranda (Home)**: Impact stats, quick scan, recommended meals.
  - **Jelajahi (Explore)**: Categorized recipe catalog (Ayam, Sapi, Sayur, Seafood).
  - **Scan (Medallion)**: Instant camera & photo library ingredient analyzer.
  - **Tersimpan (Saved)**: Personal bookmarked food-rescue recipes.
  - **Profil (Profile)**: Pantry stock, cooking history, meal planner, waste score.
- **Suggested Visual**: Mockup showing the 5 mobile screens side-by-side highlighting the bottom navigation (`submission/screenshots/01-beranda.png` s.d. `05-profil-dampak.png`).
- **Speaker Notes**: "Nomz is engineered as a standalone native Android application. It features a modern 5-tab interface: Home for daily inspiration, Explore for browsing, the central Medallion Scan button for instant vision analysis, Saved for quick access, and Profile for tracking long-term pantry impact."
- **Transition**: "Underneath this smooth mobile client is a powerful, multi-layered cloud architecture."

---

### Slide 5: Technical System Architecture
- **Title**: Production-Grade Cloud & Mobile Architecture
- **Main Message**: Enterprise resilience combining FastAPI, PostgreSQL, and multi-model AI.
- **On-Slide Bullets**:
  - **Mobile Client**: React Native 0.86 + Expo SDK 57 with encrypted token persistence (`SecureStore`).
  - **Backend API**: High-throughput FastAPI on Railway PaaS & Uvicorn ASGI server.
  - **Database**: Production PostgreSQL with strict user-data isolation (SQLite for local test isolation).
  - **Security**: Google Sign-In JWKS verification & Composio 6-digit email OTP.
- **Suggested Visual**: Dual-ecosystem diagram distinguishing Mobile Runtime from Developer Tooling.
- **Speaker Notes**: "Our frontend runs React Native on Expo 57. All API traffic connects over secure HTTPS to our FastAPI backend hosted on Railway, backed by PostgreSQL. We enforce strict account isolation and multi-factor authentication via Google Sign-In and Composio Gmail OTP."
- **Transition**: "Now let's examine our AI orchestration and the role of IBM Bob."

---

### Slide 6: AI Orchestration — Langflow V2 & IBM Bob
- **Title**: Multi-Engine AI Orchestration & Tooling
- **Main Message**: Langflow as the runtime workflow engine; IBM Bob as the autonomous engineering partner.
- **On-Slide Bullets**:
  - **Langflow V2 Runtime**: 10-node culinary orchestration graph hosted on Docker (Port 7860).
  - **Google Gemini Multimodal**: Sub-second vision ingredient recognition (`gemini-3.8-flash`).
  - **IBM Bob & MCP**: Autonomous development toolchain connecting via Model Context Protocol SSE.
  - **Fallback Reliability**: Triple-layer fallback ensures 100% uptime even under API rate limits.
- **Suggested Visual**: Langflow V2 workflow canvas snippet showing ingredient input -> Gemini node -> ranking -> output.
- **Speaker Notes**: "Langflow V2 serves as our live AI runtime orchestrator, executing custom prompt builders, food rescue reasoning, and YouTube tutorial matching. IBM Bob acted as our agentic pair-programmer, using MCP tools to diagnose and harden the backend during sprint milestones."
- **Transition**: "Let's see what happens once the recipe is selected."

---

### Slide 7: Kitchen Companion — Timers & YouTube Video Discovery
- **Title**: Real Assistance in the Cooking Process
- **Main Message**: Guiding the user from raw ingredients all the way to a finished meal.
- **On-Slide Bullets**:
  - Step-by-step interactive cooking instructions.
  - Built-in multi-step timers so food never burns.
  - Curated YouTube cooking tutorial discovery matching Indonesian recipe titles.
- **Suggested Visual**: Screenshot of Detail Resep screen showing active cooking timer and embedded YouTube video preview.
- **Speaker Notes**: "Nomz doesn't abandon the user once they pick a recipe. Our guided cooking mode provides step-by-step instructions with integrated countdown timers and curated YouTube video tutorials so even novice cooks can execute the dish with confidence."
- **Transition**: "Let's inspect our verified technical evidence and engineering rigor."

---

### Slide 8: Technical Architecture & Real Engineering Evidence
*(Rekomendasi Konten Final untuk Canva — Bukti Teknis Terverifikasi)*

- **Title**: Arsitektur Nyata & Bukti Rekayasa Terverifikasi
- **Sub-judul**: Integrasi Multi-Layanan: Expo 57, FastAPI, Langflow V2, dan IBM Bob / MCP
- **Main Message**: Seluruh komponen bukan sekadar konsep atau mock UI, melainkan subsistem nyata yang terhubung dan lolos automated verification testing.

#### A. Tata Letak Visual Slide 8 (Canva Ready)
Bagi slide menjadi 3 kolom/kartu:
1. **Kartu Kiri (Diagram Arsitektur & Aliran Data Nyata)**:
   - Flow Runtime: `Mobile App (Expo 57)` ──► `FastAPI Backend` ──► `Langflow V2 (Port 7860)` ──► `Gemini AI + YouTube API`
   - Flow Storage: `FastAPI` ──► `PostgreSQL (Railway) / SQLite (Dev)`
   - Flow Dev/MCP: `IBM Bob (Agent)` ──► `.bob/mcp.json (SSE)` ──► `Langflow MCP Server (Port 7860)`
2. **Kartu Tengah (Bukti Langflow V2 Runtime)**:
   - Gambar: `submission/evidence/01_langflow_v2_canvas_workflow.png` (Canvas 10 node lengkap).
   - Inset kecil/badge: `submission/evidence/02_langflow_v2_playground_execution.png` (Hasil run playground live).
   - Caption: *"Langflow V2: 10 Nodes pipeline aktif (Normalizer -> Prompt Builder -> Gemini -> YouTube Tool -> Ranker)."*
3. **Kartu Kanan (Bukti Uji Otomatis & IBM Bob / MCP)**:
   - Terminal Test Badge: **8/8 PASSED (100% Green)**.
   - MCP Protocol Badge: `initialize` + `tools/list` (4 tools) + `tools/call find_meals` verified via Pytest `test_m4_mcp.py`.
   - Caption: *"IBM Bob MCP Client teruji via direct streamable-http JSON-RPC 2.0; backend unit & integration tests 100% PASS."*

#### B. Label & Panah Aliran Data (Data Flow Labels)
- `Expo Client -> FastAPI`: `HTTPS REST / JSON (Multipart JPEG)`
- `FastAPI -> Database`: `SQLAlchemy ORM (Connection Pool)`
- `FastAPI -> Langflow V2`: `REST POST /api/v1/run/{flow_id}` (Response Header: `x-recommendation-engine: langflow`)
- `Langflow -> External AI`: `Google Gemini 2.5 Flash + YouTube Data API v3`
- `IBM Bob -> Langflow MCP`: `JSON-RPC 2.0 via Streamable-HTTP SSE (Port 7860/sse)`

#### C. Caption Ringkas Tiap Bukti
- **Bukti 1 (Langflow Canvas)**: *"Workflow Langflow V2 aktif di Docker port 7860: memproses normalisasi bahan, mitigasi food waste, inferensi Gemini, hingga integrasi video YouTube."*
- **Bukti 2 (Playground Eksekusi)**: *"Hasil live eksekusi flow: menghasilkan rekomendasi masakan terstruktur dan link video YouTube Indonesia yang relevan."*
- **Bukti 3 (Koneksi MCP)**: *"Server MCP Langflow mengekspos 4 tools (find_meals, find_meals_v2, email_otp, meeting_summary) yang berhasil diverifikasi via automated test."*
- **Bukti 4 (Pytest Suite)**: *"8/8 automated integration tests lulus tanpa kegagalan pada health check, orkestrasi Langflow, dan protokol MCP."*

#### D. Klaim yang Aman vs. Klaim yang Harus Dihindari

| ✅ KLAIM AMAN & TERBUKTI | ❌ KLAIM YANG HARUS DIHINDARI |
| :--- | :--- |
| "Langflow V2 berfungsi sebagai AI workflow runtime yang dipanggil oleh backend FastAPI secara sinkron." | "IBM Bob adalah AI chatbot yang tertanam di dalam aplikasi mobile pengguna." |
| "IBM Bob digunakan sebagai agentic engineering tool untuk refactoring dan automated testing." | "Aplikasi mobile langsung terhubung ke IBM Bob secara real-time di produksi." |
| "Protokol MCP Langflow berhasil diverifikasi secara end-to-end melalui automated integration testing." | "Seluruh database cloud PostgreSQL sudah aktif 100% di server lokal." *(Jelaskan: PostgreSQL dikonfigurasi untuk produksi Railway, SQLite digunakan untuk testing lokal).* |
| "Deteksi bahan menggunakan Google Gemini Multimodal Vision dengan skema JSON terstruktur." | "Model AI kami melatih LLM sendiri dari nol (custom model training)." |

- **Speaker Notes**: "Pada Slide 8 ini, kami menyajikan bukti nyata keandalan teknis Nomz. Kami memisahkan peran runtime dan tooling secara jelas: Langflow V2 bertindak sebagai runtime workflow engine 10 node yang menjalankan reasoning penyelamatan makanan dan pencarian video YouTube. Sementara IBM Bob bertindak sebagai asisten rekayasa kami melalui protokol MCP. Seluruh pipeline telah lulus automated integration tests dengan hasil 100% green."
- **Transition**: "Selain keandalan teknis, kami juga menerapkan prinsip Responsible AI."

---

### Slide 9: Responsible AI & Food Safety
- **Title**: Food Safety First
- **Main Message**: AI assists discovery; humans make safety decisions.
- **On-Slide Bullets**:
  - **User Confirmation**: Detected ingredients must be confirmed by the user before recipe generation.
  - **Sensory Disclaimer**: Explicit reminders that AI cannot smell spoilage or detect invisible mold.
  - **Allergen & Hygiene Notices**: Safe cooking temperature warnings and cross-contamination advice.
- **Suggested Visual**: Callout box showing Nomz safety disclaimer and user-confirmation ingredient tag list.
- **Speaker Notes**: "We practice Responsible AI. Nomz never assumes 100% vision certainty: users always review detected ingredients. Crucially, the app includes clear food safety disclaimers reminding cooks to inspect perishables visually and by smell, respecting safe cooking temperatures."
- **Transition**: "How do we scale Nomz beyond a hackathon project?"

---

### Slide 10: Impact Model & Business Strategy
- **Title**: Sustainability Meets Sound Business
- **Main Message**: Massive market potential aligning consumer savings with commercial viability.
- **On-Slide Bullets**:
  - **Target Market**: 60M+ urban Indonesian smartphone households.
  - **Freemium Core**: Free camera scanning & basic recipe rescue.
  - **Nomz Pro (SaaS)**: Advanced weekly meal planning, nutritional macros, pantry barcode scanner.
  - **Affiliate Integration**: One-click ordering of missing spices via local e-grocery APIs.
- **Suggested Visual**: Freemium pricing tier card and market TAM/SAM/SOM infographic.
- **Speaker Notes**: "Our go-to-market is straightforward. The core rescue scanner is free. Power users can subscribe to Nomz Pro for personalized weekly meal planning and nutritional analytics. Furthermore, we can partner with local grocery deliveries to supply missing condiments."
- **Transition**: "To wrap up our presentation..."

---

### Slide 11: The Roadmap & Closing Call to Action
- **Title**: Rescuing Food, One Meal at a Time
- **Main Message**: Nomz transforms kitchen leftovers into sustainable daily impact.
- **On-Slide Bullets**:
  - **Q1**: Local community recipe contribution & pantry barcode scanning.
  - **Q2**: Offline on-device vision model & smart fridge IoT integrations.
  - **Q3**: FMCG partnership for sustainable food consumption tracking.
  - **Try Nomz**: Live demo & Universal Release APK available!
- **Suggested Visual**: App icon, GitHub QR code, team credits, and closing slogan: *"Jangan buang makananmu, Nomz aja!"*
- **Speaker Notes**: "Food waste is solvable when technology meets everyday kitchen reality. Nomz makes food rescue effortless, affordable, and delicious. Thank you, and we welcome your questions!"
