# Nomz — Live Demonstration Script

**Target Duration**: 3–5 Minutes  
**Demo Device**: Real Android Phone (or Release Emulator `emulator-5556`)  
**Backend**: Live Production Railway API (`https://nomz-backend-production.up.railway.app`)

---

## 1. Demo Preparation Checklist (Before Going on Stage)
- [ ] Install latest release APK (`Nomz-v1.0.0-android-universal.apk`).
- [ ] Confirm active internet connectivity (Wi-Fi or cellular).
- [ ] Verify test user login credentials (do NOT show sensitive passwords on presentation screen).
- [ ] Pre-load sample kitchen photo (`screenshots/demo_bahan_makanan_anak_kos.png`) in Android gallery as backup.
- [ ] Have physical ingredients or sample photos available for demonstration.

---

## 2. Step-by-Step Demonstration Flow

### Scene 1: Welcome & Fast Authentication (0:00 - 0:45)
- **Screen**: Splash Screen -> Welcome / Login Screen.
- **Action**:
  - Show clean Nomz branding with smooth splash transition.
  - Demonstrate one-tap Google Sign-In or quick email login with "Remember Me" toggle.
- **Speaker Dialogue**:
  > *"Nomz welcomes users with frictionless onboarding. We support native Google Sign-In with backend token validation as well as 6-digit OTP verification via Composio Gmail delivery. With encrypted session persistence, users stay logged in securely across sessions."*
- **Visual Highlight**: Point to smooth transition directly into the Home screen (`Beranda`).

---

### Scene 2: Home Screen & Pantry Overview (0:45 - 1:30)
- **Screen**: `Beranda` (Home Tab).
- **Action**:
  - Scroll through the Home screen.
  - Highlight the food waste impact card (*"Bahan Diselamatkan"*), quick scan prompt, and personalized meal recommendations.
  - Briefly tap `Profil` to show the active pantry inventory and saved waste metrics.
- **Speaker Dialogue**:
  > *"On the Beranda screen, Nomz immediately tells users their personal sustainability impact—how many kilograms of groceries they've saved from the landfill. Notice the intuitive five-tab bottom navigation, built natively for single-handed mobile use."*

---

### Scene 3: The Core Rescue Moment — Multimodal Scan & Ingredient Editor (1:30 - 2:45)
- **Screen**: `Scan` (Central Medallion Tab) -> Detection Confirmation (`Hasil Deteksi Bahan`).
- **Action**:
  - Tap the prominent central `Scan` button.
  - Aim camera at kitchen ingredients (or select bundled simulation photo `screenshots/demo_bahan_makanan_anak_kos.png` from gallery).
  - Tap "Deteksi Bahan".
  - Show the AI detecting items with confidence badge (e.g. `telur, tomat, bawang putih` with `95% yakin`).
  - Demonstrate the quantity stepper `[-] 2 butir [+]` to adjust portion or unit.
  - Show the "+ Tambah Bahan Manual" card for uncaptured items or seasonings.
  - Tap "Lihat Rekomendasi Resep ->".
- **Speaker Dialogue**:
  > *"Here is the magic moment. Instead of searching a recipe index, I tap the center Scan medallion and capture what's in front of me. Powered by Google Gemini multimodal vision, Nomz instantly structures raw photos into verified ingredients with confidence scores. Notice our human-in-the-loop design: home cooks can fine-tune quantities with the stepper, add extra condiments manually, or remove items before generating recommendations."*

---

### Scene 4: Langflow V2 Recommendation & Guided Cooking (2:45 - 4:00)
- **Screen**: Recipe Results -> `Detail Resep` (Cooking Flow).
- **Action**:
  - Show recommended recipes with match percentages (e.g., *Telur Balado*, *Omelet Tomat Spesial*).
  - Tap on the top-ranked food-rescue recipe.
  - Show the ingredient comparison: highlight on-hand items vs. pantry condiments.
  - Scroll down to step-by-step instructions.
  - Tap "Mulai Masak" and activate a step timer (e.g., 3-minute boiling countdown).
  - Scroll to the embedded YouTube tutorial video matching the recipe.
- **Speaker Dialogue**:
  > *"Langflow V2 orchestrates our recipe generation, prioritizing dishes that maximize what we already have. In the recipe detail, Nomz clearly separates our rescued ingredients from basic kitchen staples like salt and oil. When we start cooking, integrated timers guide every step so nothing burns, and curated YouTube video tutorials are right there if we need technique guidance."*

---

### Scene 5: Save Recipe & Wrap-up (4:00 - 4:30)
- **Screen**: Detail Resep -> `Tersimpan` Tab.
- **Action**:
  - Tap the bookmark heart icon (saved recipe).
  - Switch to the `Tersimpan` tab to show the recipe instantly bookmarked.
- **Speaker Dialogue**:
  > *"We can bookmark our favorite rescue meals for quick access later in the Tersimpan tab. Nomz turns kitchen panic into a sustainable, budget-friendly culinary habit. Thank you!"*

---

## 3. Live Demo Fallback Protocols

If unexpected edge cases occur during the presentation, execute these predefined fallbacks:

| Edge Case | Fallback Action | Speaker Pivot |
| :--- | :--- | :--- |
| **No Camera Access / Low Light** | Tap gallery icon -> Select bundled sample image (`screenshots/demo_bahan_makanan_anak_kos.png`). | *"Let me demonstrate using our standard kitchen simulation photo."* |
| **Slow Conference Wi-Fi / API Timeout** | The app's resilient multi-tier fallback automatically serves curated local recipe recommendations. | *"Nomz includes built-in offline resiliency to ensure users always receive recipes even on weak kitchen Wi-Fi."* |
| **Google Sign-In Account Prompt Cancelled** | Use pre-registered test email: `demo@nomz.app` with saved password. | *"Let's jump directly into our pre-configured demo account."* |
