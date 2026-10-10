# Nomz — Hackathon Pitch Deck Outline

**Target Pitch Duration**: 5–7 Minutes  
**Format**: 11 Slides (Concise, High Impact)

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
- **Suggested Visual**: Mockup showing the 5 mobile screens side-by-side highlighting the bottom navigation.
- **Speaker Notes**: "Nomz is engineered as a standalone native Android application. It features a modern 5-tab interface: Home for daily inspiration, Explore for browsing, the central Medallion Scan button for instant vision analysis, Saved for quick access, and Profile for tracking long-term pantry impact."
- **Transition**: "Underneath this smooth mobile client is a powerful, multi-layered cloud architecture."

---

### Slide 5: Technical System Architecture
- **Title**: Production-Grade Cloud & Mobile Architecture
- **Main Message**: Enterprise resilience combining FastAPI, PostgreSQL, and multi-model AI.
- **On-Slide Bullets**:
  - **Mobile Client**: React Native + Expo SDK 52 with offline token persistence.
  - **Backend API**: High-throughput FastAPI on Railway PaaS.
  - **Database**: Production PostgreSQL with strict user-data isolation.
  - **Security**: Google Sign-In JWKS verification & Composio 6-digit email OTP.
- **Suggested Visual**: Clear architectural diagram showing Mobile -> Railway FastAPI -> AI services.
- **Speaker Notes**: "Our frontend runs React Native on Expo 52. All API traffic connects over secure HTTPS to our FastAPI backend hosted on Railway, backed by PostgreSQL. We enforce strict account isolation and multi-factor authentication via Google Sign-In and Composio Gmail OTP."
- **Transition**: "Now let's examine our AI orchestration and the role of IBM Bob."

---

### Slide 6: AI Orchestration — Langflow V2 & IBM Bob
- **Title**: Multi-Engine AI Orchestration
- **Main Message**: Combining generative intelligence with deterministic safety guarantees.
- **On-Slide Bullets**:
  - **Google Gemini 2.5 Flash**: Sub-second multimodal vision recognition.
  - **Langflow V2 Workflow**: Visual prompt chaining, meal ranking, and rule-based fallback.
  - **IBM Bob & MCP**: Autonomous developer toolchain and diagnostics for rapid backend iteration.
  - **Fallback Reliability**: Triple-layer fallback ensures 100% uptime even under API rate limits.
- **Suggested Visual**: Langflow V2 workflow canvas snippet showing ingredient input -> Gemini node -> ranking -> output.
- **Speaker Notes**: "We use Google Gemini Flash for instant ingredient recognition. Langflow V2 orchestrates our prompt pipelines and ranks recipes based on ingredient overlap. If external AI services encounter rate limits, our system automatically falls back to deterministic local culinary rules. IBM Bob and MCP guided our diagnostics and rapid architecture evolution."
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
- **Transition**: "AI in the kitchen must also be responsible and trustworthy."

---

### Slide 8: Responsible AI & Food Safety
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

### Slide 9: Impact Model & Business Strategy
- **Title**: Sustainability Meets Sound Business
- **Main Message**: Massive market potential aligning consumer savings with commercial viability.
- **On-Slide Bullets**:
  - **Target Market**: 60M+ urban Indonesian smartphone households.
  - **Freemium Core**: Free camera scanning & basic recipe rescue.
  - **Nomz Pro (SaaS)**: Advanced weekly meal planning, nutritional macros, pantry barcode scanner.
  - **Affiliate Integration**: One-click ordering of missing spices via local e-grocery APIs.
- **Suggested Visual**: Freemium pricing tier card and market TAM/SAM/SOM infographic.
- **Speaker Notes**: "Our go-to-market is straightforward. The core rescue scanner is free. Power users can subscribe to Nomz Pro for personalized weekly meal planning and nutritional analytics. Furthermore, we can partner with local grocery deliveries to supply missing condiments."
- **Transition**: "Let's review our verification and production readiness."

---

### Slide 10: Testing, Quality Assurance & Production Readiness
- **Title**: Rigorously Tested & Verified
- **Main Message**: Production-hardened with high test coverage and verified release builds.
- **On-Slide Bullets**:
  - **Backend Tests**: 78/78 Pytest test suite PASS (100% green).
  - **Frontend Codebase**: Strict TypeScript type-check (`0 errors`).
  - **Live Backend**: Verified Railway HTTPS deployment with live health monitoring.
  - **Universal Android APK**: Standalone release build packaging ARM64, ARM32, and x86_64 architectures.
- **Suggested Visual**: Terminal test pass summary badge and GitHub release download screen.
- **Speaker Notes**: "Nomz is not a mock concept. Our backend passes 78 comprehensive automated tests, our frontend is 100% clean TypeScript, our API is deployed live on Railway, and our release APK is built with universal architecture support for real physical Android devices."
- **Transition**: "To wrap up our presentation..."

---

### Slide 11: The Roadmap & Closing Call to Action
- **Title**: Rescuing Food, One Meal at a Time
- **Main Message**: Nomz transforms kitchen leftovers into sustainable daily impact.
- **On-Slide Bullets**:
  - **Q1**: Local community recipe contribution & pantry barcode scanning.
  - **Q2**: Offline on-device vision model & smart fridge IoT integrations.
  - **Q3**: FMCG partnership for sustainable food consumption tracking.
  - **Try Nomz**: Live demo available on GitHub Release!
- **Suggested Visual**: App icon, GitHub QR code, team credits, and closing slogan: *"Jangan buang makananmu, Nomz aja!"*
- **Speaker Notes**: "Food waste is solvable when technology meets everyday kitchen reality. Nomz makes food rescue effortless, affordable, and delicious. Thank you, and we welcome your questions!"
