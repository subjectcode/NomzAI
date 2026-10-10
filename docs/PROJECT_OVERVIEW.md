# Nomz — Project Overview

## Elevator Pitch
Nomz is an intelligent mobile food-rescue assistant that prevents household food waste by transforming on-hand ingredients into practical, delicious meals through Google Gemini multimodal vision, Langflow V2 orchestration, and real-time cooking intelligence.

---

## 1. Problem Statement
Every year, millions of tons of edible food are discarded in households because families forget what is in their refrigerators or struggle to combine random leftovers into cohesive dishes. Consumers resort to costly food deliveries while perfectly usable perishables spoil, escalating grocery bills and contributing directly to municipal greenhouse gas emissions.

---

## 2. Solution
Nomz flips the traditional recipe discovery flow:
- **Traditional flow**: Decide a meal -> Buy a long list of missing ingredients -> Add surplus perishables to fridge -> Waste leftovers.
- **Nomz Food-Rescue flow**: Snap whatever is in your kitchen -> AI identifies on-hand ingredients -> Langflow prioritizes dishes maximizing your pantry inventory -> Step-by-step cooking with timers and curated YouTube tutorials.

---

## 3. Target Users
1. **Young Professionals & Students**: Busy schedules, limited cooking experience, frequently facing orphan ingredients in the fridge.
2. **Budget-Conscious Households**: Families seeking to reduce monthly grocery expenditure by utilizing 100% of purchased produce and groceries.
3. **Eco-Minded Consumers**: Individuals actively aiming to reduce their personal carbon and food-waste footprint.

---

## 4. Unique Value Proposition (UVP)
- **Zero Pantry Guesswork**: Snap counter tops or open fridge shelves; Gemini extracts structured ingredient lists in Indonesian.
- **True Food-Rescue Scoring**: Algorithms rank dishes that maximize current pantry usage and minimize external purchases.
- **Robust Multi-Engine Fallback**: Langflow orchestration bridges Gemini AI with deterministic recipe catalogs, guaranteeing response even under network or rate-limit constraints.
- **End-to-End Kitchen Companion**: From vision detection to step-by-step cooking timers, meal planning, pantry tracking, and video tutorials.

---

## 5. Core Features
- **Visual Ingredient Recognition**: Multimodal image processing identifying proteins, vegetables, herbs, and condiments.
- **Flexible Ingredient Confirmation**: Users add, remove, or adjust detected ingredients before recommendations generate.
- **Smart Recipe Matching**: Dishes tagged with match score, preparation time, difficulty, estimated cost, and required pantry staples.
- **Step-by-Step Guided Cooking**: Interactive instruction steps with built-in countdown timers.
- **YouTube Tutorial Discovery**: Curated cooking video integrations mapped to recommended recipes.
- **Five-Tab Bottom Navigation**:
  - `Beranda` (Home): Quick action, waste metrics, featured food rescue recipes.
  - `Jelajahi` (Explore): Browse categories (Ayam, Sapi, Sayur, Seafood, Tahu & Tempe, Sarapan).
  - `Scan`: Central medallion camera/gallery ingredient scanner.
  - `Tersimpan` (Saved): Bookmarked favorite rescue dishes.
  - `Profil` (Profile): Account settings, meal planner, pantry inventory, cooking history, waste analytics.
- **Hardened Authentication**: Google Sign-In (OAuth 2.0 with backend `id_token` verification), secure Email/Password with 6-digit OTP verification, encrypted session persistence.

---

## 6. User Journey
1. **Launch & Authenticate**: Open Nomz, log in via Google Sign-In or verified email OTP.
2. **Scan Kitchen**: Tap the central Scan button; photograph counter ingredients or fridge contents.
3. **Verify Ingredients**: Confirm detected ingredients (e.g., Telur, Tomat, Bawang Merah).
4. **Choose Recipe**: Review recommended recipes ranked by food-rescue score.
5. **Cook with Guidance**: Follow step-by-step cooking instructions with integrated timers and YouTube tutorials.
6. **Save & Track**: Bookmark dishes, log cooked meals, and monitor reduced food waste in user profile.

---

## 7. Impact Hypothesis & Metrics
- **Household Waste Reduction**: Target 30-40% reduction in discarded perishables per participating household.
- **Monthly Savings**: Estimated savings of IDR 200,000 - 500,000 per month on groceries and impulse food delivery.
- **Carbon Footprint**: Mitigating organic waste sent to landfills reduces methane emissions.

---

## 8. Business Model & Monetization Ideas
- **Freemium Core**: Unlimited vision scanning, staple pantry tracking, and basic recipe generation free for all users.
- **Nomz Pro (Subscription)**: Advanced weekly meal planning, nutritional calorie breakdown, grocery store discount integration, and custom dietary allergen filters.
- **Grocery & Retail Partnerships**: Affiliate links to local e-groceries for missing supplementary spices or staples.
- **B2B Sustainability Impact**: Anonymized food consumption trend data for FMCG and municipal waste-management programs.

---

## 9. Current Limitations
- Food safety evaluation relies on user inspection; the model cannot detect microbiological spoilage or sour milk.
- Image recognition accuracy decreases in low-light environments or with heavily mixed chopped containers.
- YouTube video availability depends on third-party API quotas.

---

## 10. Future Roadmap
- **Expiry Notification Engine**: Barcode scanner and automatic push notifications 2 days before ingredients expire.
- **Community Recipe Sharing**: User-submitted localized Indonesian regional recipes.
- **Offline Mode**: Lightweight on-device TensorFlow Lite model for basic ingredient recognition without internet.
- **Smart Fridge IoT Integration**: Direct sync with smart home inventory cameras.
