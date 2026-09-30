---
name: Nomz Mobile Design System
version: 1.0
product: Nomz AI Food Rescue Assistant
platform: React Native / Expo
---

# Nomz Mobile Design System

Nomz is a mobile-first AI Food Rescue Assistant that helps people
identify ingredients, discover recipes from what they already have,
prioritize food that should be used soon, cook guided meals, manage
their pantry, and reduce avoidable food waste.

The interface should feel like a thoughtful modern food/lifestyle
product that happens to use AI, rather than an AI product that
happens to talk about food.

---

# 1. Brand & Product Philosophy

## Product Personality

Nomz should consistently feel:

- Fresh
- Modern
- Warm
- Friendly
- Resourceful
- Smart
- Sustainable
- Human
- Practical
- Food-first
- Calm
- Premium but approachable

Nomz should communicate intelligence through useful product behavior,
not through futuristic visual decoration.

The user should feel:

> "Nomz membantu gue memanfaatkan makanan yang sudah ada."

rather than:

> "Gue sedang memakai aplikasi AI."

## Brand Promise

Nomz helps give existing food another chance.

Primary brand tagline:

> "Good Food Still Has a Chance."

Supporting product messaging may be written naturally in Bahasa Indonesia.

Examples:

- "Masak Enak dari yang Ada Saja."
- "Manfaatkan yang Ada."
- "Bahan di kulkasmu masih bisa jadi makanan enak."
- "Gunakan dulu sebelum terbuang."
- "Masak dari yang kamu punya."

Avoid exaggerated AI language.

---

# 2. Brand Identity

## Primary Logo

The selected Nomz logo consists of:

1. An abstract botanical / food-rescue symbol
2. The "Nomz" wordmark
3. Optional "AI Food Rescue Assistant" descriptor

The symbol is intentionally abstract rather than literal.

It communicates:

- Leaf forms → freshness, ingredients, natural food
- Flowing forms → food rescue and the cycle of using leftover food
- Orange dot → food, energy, life, warmth
- Organic curves → human, approachable, natural
- Overall silhouette → simplicity, modernity, intelligence, resourcefulness

The logo should remain visually simple and recognizable.

Do not add literal robots, chef mascots, AI brains, circuit boards,
or generic AI symbols to the Nomz logo.

## Logo Personality

The logo should feel:

- Organic
- Contemporary
- Distinctive
- Friendly
- Minimal
- Food-adjacent
- Intelligent without looking technological

Avoid making the logo:

- Futuristic
- Corporate
- Clinical
- Mechanical
- Gaming-oriented
- Cartoonish
- Overly decorative

## Logo Variants

Supported brand variants:

- Primary light-background logo
- Dark-background logo
- Colored app icon
- Monochrome logo
- Monochrome dark
- Monochrome light
- Symbol-only mark

Use the variant that maintains the strongest contrast against its
background.

Do not invent additional logo variants without a functional reason.

## Logo Usage

Use the full wordmark when:

- introducing the brand
- onboarding
- splash / launch moments
- marketing or presentation surfaces
- large profile or brand contexts

Use the symbol-only mark when:

- app icon
- compact navigation
- small toolbar contexts
- camera interface
- small cards
- constrained spaces

Do not force the full wordmark into narrow mobile UI areas.

## Logo Clear Space

Maintain visual breathing room around the logo.

Do not:

- place text directly against the symbol
- overlap the logo with UI controls
- place decorative graphics through the logo
- crop the logo
- stretch or distort the logo
- rotate the logo
- apply arbitrary gradients
- add glow effects

---

# 3. App Icon

## Primary App Icon

The Nomz app icon uses the abstract botanical / food-rescue symbol
without requiring the full wordmark.

The icon should use the established Nomz palette:

- Deep Teal
- Fresh Mint
- Light Mint
- Warm Yellow / Soft Orange accents where appropriate
- Cream / White supporting surfaces

The app icon should remain recognizable at small sizes.

## App Icon Variants

Supported variants:

- Light
- Dark
- Colored
- Monochrome
- Mono Dark
- Mono Light

Do not create a separate visual identity for the app icon.

The app icon must clearly belong to the same Nomz brand system.

---

# 4. Brand Tagline

Primary English tagline:

> Good Food Still Has a Chance.

This is a brand statement, not a UI headline that needs to appear
on every screen.

Use it primarily for:

- onboarding
- splash / brand moments
- marketing
- presentation
- brand introduction

Do not repeatedly display the tagline throughout the application.

---

# 5. Colors

The palette derives from kitchen botanicals, fresh ingredients,
pantry staples, and natural harvest tones.

Color should support food imagery rather than compete with it.

## Primary Palette

- Deep Teal: `#0F766E`
- Fresh Mint: `#34D399`
- Light Mint: `#A7F3D0`
- Warm Cream: `#F8FAF5`
- Warm Yellow: `#FFE7B3`
- Soft Orange: `#FFB373`

## Existing Semantic Color Tokens

```yaml
colors:
  surface: '#f8faf5'
  surface-dim: '#d8dbd6'
  surface-bright: '#f8faf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4ef'
  surface-container: '#ecefea'
  surface-container-high: '#e7e9e4'
  surface-container-highest: '#e1e3de'

  on-surface: '#191c1a'
  on-surface-variant: '#3e4947'
  inverse-surface: '#2e312e'
  inverse-on-surface: '#eff1ec'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'

  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'

  secondary: '#006c4b'
  on-secondary: '#ffffff'
  secondary-container: '#64f9bc'
  on-secondary-container: '#00714e'

  tertiary: '#7a440c'
  on-tertiary: '#ffffff'
  tertiary-container: '#975b23'
  on-tertiary-container: '#ffe5d4'

  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'

  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'

  secondary-fixed: '#68fcbf'
  secondary-fixed-dim: '#45dfa4'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'

  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#ffb77c'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6d3a01'

  background: '#f8faf5'
  on-background: '#191c1a'
  surface-variant: '#e1e3de'
```

## Palette Architecture

### Deep Teal `#0F766E`

Primary brand anchor.

Use for:

- primary CTA
- active navigation
- selected states
- important headings
- core icons
- primary actions
- rescue actions
- confirmation actions

### Fresh Mint `#34D399`

Use for:

- positive states
- successful detection
- fresh ingredient states
- active secondary states
- positive highlights

Do not use it as the default background for everything.

### Light Mint `#A7F3D0`

Use for:

- secondary action surfaces
- soft success states
- ingredient confirmation
- supporting rescue UI
- low-priority selected states

### Warm Yellow `#FFE7B3`

Use sparingly for:

- food urgency
- "Gunakan Segera"
- expiry attention
- subtle impact / energy highlights

### Soft Orange `#FFB373`

Use sparingly for:

- urgency
- culinary accents
- expiry warnings
- food-related highlights

Orange should never overpower the teal/mint identity.

### Warm Cream `#F8FAF5`

Primary application canvas.

It should make the application feel:

- warm
- breathable
- fresh
- less clinical
- less sterile than pure white

### White `#FFFFFF`

Use for:

- elevated cards
- important surfaces
- forms
- modal surfaces
- recipe surfaces
- floating controls

---

# 6. Typography

Nomz uses:

> Plus Jakarta Sans

across the product.

Its proportions and open counters support mobile readability while
maintaining a modern and approachable identity.

## Typography Tokens

```yaml
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px

  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px

  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px

  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px

  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px

  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px

  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px

  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px

  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px

  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
```

## Editorial Rules

Use sentence case.

Prefer:

> Rekomendasi Resep Hari Ini

over:

> REKOMENDASI RESEP HARI INI

Avoid robotic all-caps UI.

Use natural Bahasa Indonesia.

Examples:

- "Masak Sekarang"
- "Gunakan Dulu"
- "Tambah Bahan"
- "Ambil Foto"
- "Pilih dari Galeri"
- "Lihat Resep"
- "Resep Penyelamat"
- "Bahan Terdeteksi"

Avoid unnecessary AI terminology.

Prefer:

> "Bahan Terdeteksi"

instead of:

> "AI Vision Detection Result"

---

# 7. Copywriting Personality

Nomz speaks like a helpful cooking companion.

The tone is:

- direct
- warm
- encouraging
- practical
- concise
- non-judgmental

Food waste should never be framed in a guilt-heavy way.

Prefer:

> "Bayam kamu sebaiknya dipakai hari ini."

Instead of:

> "Kamu akan membuang makanan kalau tidak segera memasaknya."

Prefer:

> "Bahan yang ada masih bisa jadi menu enak."

Instead of:

> "AI menemukan solusi optimal dari inventory kamu."

---

# 8. Design Movement

The visual movement combines:

> Modern Soft-Minimalism

with:

> Tactile Organic Warmth

The interface should combine:

- clean hierarchy
- generous whitespace
- organic curves
- natural food imagery
- tactile controls
- subtle ambient depth
- botanical visual cues
- restrained color accents

The result should feel designed, not generated.

---

# 9. Anti AI-Slop Rules

This section is mandatory.

Nomz MUST NOT become visually recognizable as a generic AI application.

## Never use

- robot mascots
- humanoid AI characters
- brains
- circuit boards
- glowing AI brains
- excessive sparkle icons
- "magic" decorations everywhere
- futuristic holographic interfaces
- neon gradients
- excessive glassmorphism
- generic AI dashboard layouts
- excessive floating cards
- excessive pills
- excessive badges
- excessive gradient backgrounds
- giant AI illustrations
- generic chatbot bubbles as primary UI
- unnecessary technical terminology

## AI should be communicated through behavior

The intelligence of Nomz should be demonstrated by:

- recognizing ingredients
- prioritizing ingredients
- finding relevant recipes
- adapting to constraints
- explaining why a recipe fits
- guiding cooking
- remembering pantry state

Do not add visual decoration simply to tell the user:

> "This is AI."

---

# 10. Illustration Direction

Illustration is allowed as a supporting brand language.

Illustrations should feel:

- fresh
- organic
- soft
- optimistic
- friendly
- lightweight
- food-oriented

Use simplified food and botanical shapes.

## Approved Visual Themes

The brand board establishes four useful visual themes:

### 1. Makanan Instant

Represents:

- quick meals
- practical cooking
- fast solutions

### 2. Sisaan Makanan

Represents:

- leftovers
- food rescue
- using what already exists

### 3. Resep Kreatif

Represents:

- creative recipes
- remixing ingredients
- discovering new possibilities

### 4. Lebih Sehat dan Hemat

Represents:

- practical sustainability
- better utilization
- saving food and money

These themes may appear in:

- onboarding
- empty states
- educational moments
- Explore categories
- feature explanations

Do not turn every screen into an illustrated screen.

Food content and interaction always have priority.

---

# 11. Photography Direction

Food photography is a major part of Nomz's visual identity.

Photography should feel:

- natural
- appetizing
- realistic
- warm
- fresh
- ingredient-focused
- casually premium
- believable

Prefer:

- real-looking food
- visible ingredients
- natural kitchen surfaces
- soft natural lighting
- realistic textures
- approachable plating
- everyday home-cooking context

Avoid:

- overly glossy commercial food renders
- synthetic-looking AI food
- unrealistic ingredients
- excessive cinematic grading
- dark futuristic compositions
- excessive blur
- overly staged luxury restaurant imagery

Food imagery should make the user want to cook.

---

# 12. Brand Visual Motifs

Recurring visual motifs may include:

- leaves
- ingredients
- botanical curves
- flowing forms
- circular cycles
- bowls
- food textures
- natural organic shapes

These motifs should remain subtle.

They should support the Nomz identity without becoming decorative noise.

Do not place leaves on every card.

Do not add botanical graphics where they do not improve the experience.

---

# 13. Layout & Spacing

The layout is mobile-first and optimized for one-handed interaction.

## Mobile Grid

- Canvas: 360dp–412dp
- Base margin: 16px
- Viewports above 400dp: approximately 20px margin
- Standard gutter: 16px
- Use 4-column fluid grid where useful

## Spacing Scale

```yaml
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
```

Meaning:

- 4px → micro spacing
- 8px → compact internal spacing
- 16px → standard component spacing
- 24px → section separation
- 32px → major hierarchy separation

Avoid arbitrary spacing values unless required by the platform.

---

# 14. Thumb Reachability

Interactive elements should be easy to reach with one hand.

Prioritize the lower portion of the screen for:

- primary actions
- camera controls
- action sheets
- bottom navigation
- cooking controls

Minimum interactive target:

> 48x48dp

Do not create tiny tap targets merely for visual compactness.

---

# 15. Elevation & Depth

Depth should come from:

- soft ambient shadows
- surface layering
- whitespace
- subtle contrast

Avoid hard mechanical borders.

## Levels

### Level 0 — Canvas

`#F8FAF5`

### Level 1 — Resting Surface

`#FFFFFF`

Suggested shadow:

```text
0 4px 16px -2px rgba(15, 118, 110, 0.06),
0 2px 6px -1px rgba(0, 0, 0, 0.03)
```

### Level 2 — Raised Action

Used for:

- floating navigation
- important action surfaces
- scanner controls
- elevated recipe surfaces

Suggested shadow:

```text
0 8px 24px -4px rgba(15, 118, 110, 0.12),
0 4px 10px -2px rgba(0, 0, 0, 0.04)
```

### Level 3 — Overlay / Viewfinder

Used for:

- camera overlays
- modal surfaces
- bottom sheets

Suggested shadow:

```text
0 16px 36px -6px rgba(0, 0, 0, 0.25)
```

---

# 16. Shapes

Nomz uses soft organic geometry.

Avoid sharp 90-degree consumer-facing surfaces.

## Radius Scale

```yaml
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
```

### 8–12px

Use for:

- small thumbnails
- badges
- compact controls
- internal media

### 16px

Use for:

- standard cards
- recipe surfaces
- form fields
- pantry items

### 24px

Use for:

- hero surfaces
- camera frames
- major feature sections
- modal surfaces

### Full Pill

Use selectively for:

- primary CTA
- search
- compact filters
- selected states

Do not make every component a pill.

---

# 17. Buttons

## Primary Action

Deep Teal:

`#0F766E`

White text.

Characteristics:

- minimum 48px height
- horizontal padding approximately 24px
- rounded-full
- clear hierarchy
- strong but not aggressive

Examples:

- "Masak Sekarang"
- "Temukan Resep"
- "Lihat Rekomendasi"
- "Deteksi Bahan"

## Secondary Action

Light Mint:

`#A7F3D0`

Deep Teal text.

Examples:

- "Tambah Bahan"
- "Tambah Manual"

## Tertiary Action

Use text/icon treatment when a filled button is unnecessary.

Do not turn every action into a prominent button.

---

# 18. Iconography

Nomz uses a modern rounded line-icon system inspired by the organic
geometry of the logo.

Icons should:

- have consistent stroke weight
- use rounded terminals
- remain recognizable at small sizes
- feel lightweight
- feel tactile
- use simple silhouettes
- align visually with the Nomz symbol

Avoid:

- inconsistent icon families
- overly detailed icons
- mechanical technical icons
- random emoji as UI icons
- generic AI sparkles as navigation
- mixing multiple icon styles on one screen

## Navigation Icon Direction

Core navigation concepts:

- Home / Beranda
- Scan
- Explore / Jelajahi
- Saved / Tersimpan
- Pantry
- Planner
- History
- Profile

Navigation icons should be visually related.

---

# 19. Bottom Navigation

Primary mobile navigation:

- Beranda
- Jelajahi
- Scan
- Tersimpan

Profile can remain accessible from the top header or relevant account
surface.

## Scan

Scan is the primary action of Nomz.

The scan control may use a central elevated circular treatment.

Recommended:

- Deep Teal medallion
- Mint/cream ring
- camera icon
- elevated shadow

Do not make the scan button visually disconnected from the brand.

---

# 20. Search

Search uses a soft capsule.

Characteristics:

- white surface
- approximately 48px height
- rounded-full
- subtle border
- Deep Teal search icon
- secondary slate placeholder

Example:

> "Cari resep sisa bayam, tahu, telur..."

Search should feel like a natural food search field,
not an AI command prompt.

---

# 21. Chips & Filter Pills

State badges may use rounded-full geometry.

Recommended height:

> approximately 32px

Selected:

- Deep Teal + white
- or Light Mint + Deep Teal for lower-priority states

Unselected:

- white / transparent
- subtle border
- slate text

Do not use pills excessively.

Only use them when they communicate a state, filter,
category, or compact metadata.

---

# 22. Recipe Cards

Recipe cards prioritize food imagery.

## Horizontal Recipe Card

Recommended structure:

```text
[food image] [recipe title]
             [ingredient state]
             [time] [difficulty]
             [match / rescue information]
```

Image:

- approximately 1:1
- 12px radius
- realistic food photography

Metadata should remain compact.

Examples:

- "15 menit"
- "Mudah"
- "3 dari 4 bahan ada"
- "Tanpa belanja"
- "95% bahan terpakai"

Do not overload cards with badges.

---

# 23. Ingredient Cards

Ingredient cards should make the detected ingredient easy to scan.

Include:

- ingredient image
- name
- quantity
- state
- optional expiry / urgency indicator
- edit/remove action where applicable

Examples:

- "Tomat"
- "2 buah"
- "Segar"
- "Gunakan Dulu"

Ingredient information is more important than decorative treatment.

---

# 24. Home Screen Principles

The Home screen should answer:

1. What should I cook?
2. What ingredients need attention?
3. How can I start immediately?

Recommended hierarchy:

```text
Greeting
↓
Urgent / rescue ingredients
↓
Primary cooking action
↓
Scan ingredients
↓
Recipe recommendations
↓
Impact / progress
```

The home screen should not become a dashboard.

Avoid:

- analytics-heavy layouts
- large statistics grids
- excessive widgets
- unnecessary charts
- multiple competing hero cards

The user's food should remain the main content.

---

# 25. Scan Screen

Scan is one of the most important Nomz experiences.

## Primary Principle

Camera-first.

Primary action:

> "Ambil Foto"

Secondary action:

> "Pilih dari Galeri"

Manual ingredient entry remains available as a secondary path.

Do NOT present camera and gallery as two equal giant feature cards.

## Camera UI

The camera view should:

- dominate the screen
- provide clear framing
- show subtle scanning guidance
- preserve food visibility
- use restrained overlays
- maintain strong contrast

Avoid excessive futuristic scanning effects.

Do not turn the camera into a sci-fi scanner.

## Detection

Detected ingredients may appear as lightweight contextual labels.

Example:

- Tomat
- Bayam Hijau
- Bawang Putih

Detection indicators should remain subtle and readable.

---

# 26. Ingredient Confirmation

After scanning:

```text
Bahan Terdeteksi

Tomat
2 buah

Telur
3 butir

Bayam
1 ikat

[ Tambah Bahan Manual ]

[ Temukan Resep ]
```

Users must be able to:

- edit
- remove
- add
- confirm

Do not hide ingredient correction behind complicated interactions.

---

# 27. Cooking Mode Selection

Cooking mode should help users express constraints.

Existing Nomz modes include:

### Tanpa Belanja

Prioritize recipes that use existing ingredients
without requiring additional purchases.

### Maksimalkan Bahan

Prioritize recipes that use as many available ingredients as practical.

### Lebih Cepat

Prioritize practical recipes with shorter preparation/cooking time.

Do not invent additional modes unless the product actually supports them.

---

# 28. Rescue Recommendation

The recommendation screen should clearly communicate:

> Why this recipe is useful for the ingredients currently available.

Useful information includes:

- ingredient utilization
- missing ingredients
- time
- difficulty
- portions
- rescue context
- reason for recommendation

Example:

> "Mengolah bayam sebelum layu dan menghabiskan stok tahu
> di kulkasmu secara praktis."

The explanation should feel helpful rather than technical.

Avoid:

> "AI confidence score: 97.4%"

unless a real product metric requires it.

Prefer user-oriented information:

> "95% bahanmu terpakai."

---

# 29. Recipe Detail

Recipe detail should prioritize:

1. food image
2. recipe name
3. short description
4. time
5. difficulty
6. portions
7. available ingredients
8. missing ingredients
9. steps
10. primary cooking action

Do not bury the recipe behind excessive UI decoration.

---

# 30. Guided Cooking

Guided Cooking should feel calm and focused.

Prioritize:

- current step
- progress
- timer
- clear next action
- completion

The interface should minimize distraction.

During cooking, secondary navigation and unrelated information
should become visually quieter.

---

# 31. Pantry

Pantry is a utility feature.

It should communicate:

- ingredients currently available
- quantities
- freshness
- urgency
- use-first status

Do not make Pantry look like an inventory management SaaS dashboard.

Food remains the visual focus.

---

# 32. Use First / Expiry

Urgency should use the warm yellow / orange family.

Examples:

- "Gunakan Hari Ini"
- "Sebaiknya Dipakai"
- "Segera Olah"

Use orange/yellow selectively.

Do not use red for ordinary food urgency.

Reserve error red for actual errors or critical states.

---

# 33. Saved & History

Saved:

Focus on recipes the user intentionally kept.

History:

Focus on meals the user actually cooked or completed.

These screens should be content-first.

Avoid unnecessary statistics unless real data exists.

---

# 34. Explore

Explore should feel like food discovery.

Possible categories:

- resep cepat
- resep dari sisa makanan
- bahan yang perlu segera dipakai
- resep hemat
- resep kreatif

Use food imagery and simple category treatment.

Do not turn Explore into an AI prompt marketplace.

---

# 35. Impact

Impact should communicate positive food-rescue behavior.

Examples of legitimate metrics:

- ingredients saved
- meals cooked
- food rescued
- estimated savings

Only display values that are backed by actual Nomz data.

Never invent environmental, financial, or food-waste numbers
merely to make the UI look impressive.

---

# 36. Empty States

Empty states should be helpful and warm.

Examples:

Saved:

> "Belum ada resep tersimpan."

History:

> "Belum ada masakan yang selesai."

Pantry:

> "Kulkasmu masih kosong."

Follow with an appropriate action.

Do not use giant generic AI illustrations.

---

# 37. Loading States

Loading should feel calm.

Prefer:

- subtle skeletons
- restrained activity indicators
- short contextual messages

Examples:

> "Mengenali bahan..."

> "Mencari resep dari bahanmu..."

Avoid:

> "AI IS THINKING..."

or decorative AI animations.

---

# 38. Error States

Errors should be:

- concise
- understandable
- actionable
- non-technical

Prefer:

> "Bahan belum bisa dikenali. Coba foto lagi dengan pencahayaan
> yang lebih terang."

Instead of:

> "Vision inference failed with status 500."

Technical errors belong in logs, not user-facing copy.

---

# 39. Accessibility

Maintain:

- minimum 48dp touch targets
- readable text contrast
- clear state differences
- sufficient spacing
- accessible labels
- semantic buttons
- screen-reader-friendly actions

Do not rely only on color to communicate:

- urgency
- success
- selection
- errors

Icons and text should support important states.

---

# 40. Motion

Motion should be subtle and purposeful.

Good uses:

- button press feedback
- navigation transitions
- recipe completion
- scan result appearance
- timer transitions
- bottom-sheet transitions

Avoid:

- constant floating animations
- excessive bouncing
- particle effects
- sparkle animations
- futuristic scanning animations
- decorative motion with no UX purpose

Motion should reinforce tactility.

---

# 41. Surface & Card Discipline

Cards are useful but should not dominate the entire product.

Use a card when it:

- groups related content
- establishes hierarchy
- separates interactive content
- protects important food imagery
- creates meaningful elevation

Do not create a card simply because the component library contains a card.

Prefer:

```text
spacing
+
typography
+
imagery
```

when a container is unnecessary.

Avoid deeply nested cards.

---

# 42. Visual Hierarchy

Every screen should have:

1. one primary purpose
2. one dominant action
3. clear content hierarchy
4. restrained secondary actions

Do not make every element visually important.

Primary actions should clearly dominate secondary actions.

---

# 43. Header Principles

Headers should remain lightweight.

Avoid unnecessarily repeating the brand.

For example, do not use:

```text
[Nomz logo] [large Nomz wordmark] [bell] [profile]
```

if the logo and wordmark visually duplicate one another.

Choose the most appropriate representation for the context.

Headers should prioritize:

- navigation
- screen identity
- account access
- important status

---

# 44. Mobile Consumer Product Principle

Nomz should feel like a real consumer food application.

It should NOT feel like:

- admin software
- enterprise software
- analytics software
- developer tooling
- chatbot UI
- AI demo
- design-system showcase

The user should interact primarily with:

- food
- ingredients
- recipes
- actions
- cooking

AI is infrastructure behind the experience.

---

# 45. Design Priority Order

When making design decisions, use this priority:

1. User task clarity
2. Food / ingredient content
3. Information hierarchy
4. Accessibility
5. Thumb-friendly interaction
6. Brand consistency
7. Visual polish
8. Decoration

If decoration conflicts with usability:

> remove the decoration.

If a card does not improve hierarchy:

> remove the card.

If spacing and typography can communicate hierarchy:

> prefer spacing and typography over another container.

---

# 46. Do / Don't

## DO

- Use warm cream backgrounds
- Use deep teal for important actions
- Use fresh mint for positive states
- Use realistic food photography
- Use organic shapes
- Use clean rounded icons
- Use generous whitespace
- Use natural Bahasa Indonesia
- Keep AI behind the experience
- Make the camera experience camera-first
- Keep food imagery prominent
- Use orange/yellow sparingly for urgency
- Use real data for metrics
- Keep interactions obvious
- Preserve a consumer food/lifestyle feeling

## DON'T

- Don't use robot mascots
- Don't use AI brains
- Don't use generic AI sparkles everywhere
- Don't use neon gradients
- Don't use futuristic holographic UI
- Don't make a generic AI dashboard
- Don't overuse cards
- Don't overuse pills
- Don't overuse badges
- Don't make every screen visually busy
- Don't use fake statistics
- Don't invent unsupported features
- Don't turn the app into a healthcare interface
- Don't make it look like enterprise software
- Don't use decorative graphics that compete with food
- Don't expose technical implementation details to users

---

# 47. Existing Product Navigation

Primary bottom navigation:

```text
Beranda
Jelajahi
Scan
Tersimpan
```

Profile / account remains accessible from the header or account context.

Additional product destinations include:

- Pantry
- Planner
- History
- Profile / Settings

Navigation should remain simple.

Do not expose every product feature as a primary navigation destination.

---

# 48. Core Nomz User Journey

The primary experience should follow:

```text
Open Nomz
↓
See useful ingredients / rescue opportunities
↓
Scan ingredients
↓
AI detects ingredients
↓
User confirms / edits ingredients
↓
Choose cooking mode
↓
Nomz recommends rescue recipes
↓
User opens recipe
↓
User starts cooking
↓
Guided Cooking
↓
Meal completed
↓
History / Pantry updated
↓
Impact reflected from real data
```

This journey should feel continuous rather than like a sequence
of disconnected tools.

---

# 49. Core Product Features

The design system must support the existing Nomz feature set:

- Authentication
- Google Sign-In
- Remember Me
- Ingredient Vision
- Camera capture
- Gallery selection
- Manual ingredient entry
- Ingredient confirmation
- Ingredient editing/removal
- Rescue recommendations
- Cooking constraints
- Recipe detail
- Guided Cooking
- Cooking timer
- Saved recipes
- Cooking history
- Pantry
- Use First / expiry awareness
- Meal Planner
- Explore
- Food Rescue Impact
- YouTube recipe discovery
- Profile
- Settings

Do not visually redesign these as separate unrelated products.

They should all feel like one Nomz ecosystem.

---

# 50. Design Consistency Rule

Every new screen must answer:

> "Does this look like it belongs to Nomz?"

A screen is considered visually inconsistent if it introduces:

- a different typography system
- unrelated colors
- unrelated iconography
- different radius language
- unrelated illustration style
- excessive AI decoration
- a different visual personality

New UI must inherit this design system.

---

# 51. Implementation Guidance

This document is a design authority, not a request to rewrite product
architecture.

When implementing the design:

- preserve existing functionality
- preserve existing API contracts
- preserve existing backend behavior
- preserve existing authentication behavior
- preserve existing Langflow integration
- preserve existing IBM Bob / MCP integration
- preserve working camera behavior
- preserve working storage behavior
- preserve current feature completeness

Visual refactoring should not silently remove or fake functionality.

If a visual concept from a design mockup conflicts with an existing
working feature, adapt the visual design to the real feature.

Do not implement fake interactions merely to match a screenshot.

---

# 52. Data Integrity in UI

All displayed values must come from actual application state or
legitimate deterministic calculations.

Do not hardcode:

- rescue percentages
- saved money
- ingredients saved
- meals cooked
- food rescued
- pantry quantities
- expiry dates
- recommendation scores

unless the value is explicitly a static example in a design prototype.

The production implementation must map these values to real data.

---

# 53. Reference Screen Principles

The desired visual direction is represented by the Nomz reference
screens showing:

- Home
- Scan
- Ingredient confirmation
- Rescue recommendations
- Recipe content

These references demonstrate:

- warm cream canvas
- deep teal primary actions
- fresh mint highlights
- organic rounded surfaces
- food-first photography
- strong whitespace
- compact metadata
- clear CTA hierarchy
- camera-first scanning
- natural Indonesian copy
- restrained AI presence

These screenshots should be treated as UX/UI references,
while this DESIGN.md remains the design-system authority.

---

# 54. Stitch / AI Design Generation Rules

When using Google Stitch or another AI design tool:

Treat this DESIGN.md as the PRIMARY design authority.

Reference images are secondary visual references.

Do not reinterpret Nomz into a generic AI design language.

Preserve:

- brand colors
- logo language
- typography
- organic geometry
- food-first content
- warm consumer-product personality
- camera-first scan experience
- clear hierarchy
- restrained AI visual language

Do not generate:

- robot assistants
- AI brains
- futuristic dashboards
- excessive sparkle effects
- generic SaaS cards
- excessive glassmorphism
- excessive gradients
- unnecessary floating containers
- visual elements without UX purpose

The AI should understand:

> Nomz is a food/lifestyle product powered by AI.

Not:

> Nomz is an AI product with food content.

---

# 55. Final Design Principle

The most important principle of Nomz:

> **Nomz should look like a thoughtful food/lifestyle product that
> happens to use AI, not an AI product that happens to talk about food.**

The interface should make users want to:

- open their fridge
- scan ingredients
- discover something to cook
- rescue food before it goes bad
- cook immediately
- feel good about using what they already have

The design should feel:

**Fresh. Human. Useful. Warm. Smart. Food-first.**
