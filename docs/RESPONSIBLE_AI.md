# Nomz — Responsible AI & Food Safety Manifesto

## 1. Core Principles

At Nomz, artificial intelligence serves to assist, guide, and empower home cooks—never to replace critical human judgment, hygiene, or sensory inspection. Food safety is an uncompromising priority.

---

## 2. Food Safety Boundaries

### The "No-Smell" Limitation
- **Sensory Reality**: Multimodal computer vision models can identify the visual morphology of ingredients (e.g., tomato, chicken breast, egg). However, vision models **cannot smell, touch, or detect microbial activity**.
- **User Obligation**: Nomz explicitly warns users to discard any meat, poultry, seafood, or dairy exhibiting off-odors, abnormal textures, sourness, or slimy surfaces regardless of what the AI recommends.

### Safe Cooking Temperatures & Hygiene
- Every generated meat and poultry recipe includes standardized food safety reminders regarding safe internal cooking temperatures:
  - Poultry: minimum internal temperature of 74°C (165°F).
  - Minced meats: 71°C (160°F).
  - Fish & whole cuts: 63°C (145°F).
- Reminders to wash cutting boards and utensils between raw meat and raw produce handling to avoid cross-contamination.

---

## 3. Human-in-the-Loop: Ingredient Confirmation

Nomz rejects "black box" automated cooking pipelines. Our system enforces a mandatory human confirmation checkpoint:

1. **Multimodal Scan**: AI produces proposed ingredient labels with confidence tiers.
2. **Interactive Confirmation Screen**: The user reviews the recognized list before any recipe search initiates.
3. **Editable Tags**: Users can delete misidentified items, adjust quantities, or add uncaptured ingredients.
4. **Recipe Synthesis**: The recommendation engine acts solely on the verified user-confirmed ingredient list.

---

## 4. Allergen & Cross-Contamination Management
- Nomz displays prominent allergen notices on recipes containing common allergens (peanuts, tree nuts, eggs, dairy, shellfish, soy, wheat).
- The app advises users with severe medical allergies to thoroughly inspect packaged pantry staples for hidden traces.

---

## 5. Account Privacy & Data Isolation
- **No Training on Private Kitchen Photos**: User images sent for multimodal analysis are processed transiently in memory and are never retained for model retraining or third-party advertising.
- **Strict Tenant Isolation**: All personal pantry records, saved favorite recipes, and cooking logs are scoped strictly to the authenticated user ID in PostgreSQL with row-level integrity checks.

---

## 6. Summary of AI Disclaimers
> **Disclaimer**: *Nomz provides recipe suggestions for home food-waste reduction purposes. The application does not guarantee the microbiological freshness or edible safety of scanned ingredients. Always inspect ingredients visually and sensorially. When in doubt, throw it out.*
