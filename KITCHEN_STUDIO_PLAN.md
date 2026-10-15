# Kitchen Studio: Global Architecture & Refactor Plan

> **ConvertThings Refactor Blueprint**: Elevating Kitchen Studio from an overloaded category into an equal, first-class, top-level peer mode alongside the Standard Engineering Converter — powered by a **Data-Driven Dataset Swap**, 100% component reuse, and zero secondary subordination.

---

## 1. Core Architectural Principle: Data-Driven Dataset Swap

The entire application operates as **two equal, peer top-level modes**:
1. **Mode 1: Standard Converter** (Hosted at `/` or programmatic `/convert/...`)
2. **Mode 2: Kitchen Studio** (Hosted at `/kitchen`)

Neither mode is subordinate, nested, or "second-class." Instead of hacky `if (isKitchen)` branching inside components, **switching modes simply swaps the dataset that the identical component tree consumes**.

```
                                  CONVERTTHINGS
                                        │
                         Is URL /kitchen (Kitchen Mode)?
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
      [ STANDARD DATASET ]                            [ KITCHEN DATASET ]
      Route: / or /convert/...                        Route: /kitchen
      ─────────────────────────                       ───────────────────
      • 21 Physical Measurement Domains               • 15+ Culinary Pantry Staples
      • Shelf = Engineering Domains                   • Shelf = Baking Staples & Pantry Groups
      • Workbench = Unit-to-unit physics              • Workbench = Volume ⇄ Scale Weight
      • Table = Physical benchmark grid               • Table = Baking scale equivalents
      • Header = Equal Peer Mode Switcher             • Header = Equal Peer Mode Switcher
```

---

## 2. The Data Structure Specification

Both modes consume the **exact same data shape**, allowing `<CategoryNav />`, `<ConversionCard />`, and `<ConversionTable />` to function identically with zero custom props.

### 2.1 Standard Dataset Schema (`src/engine/conversions.js`)
```js
// Categories List (Standard Engineering Domains)
export const CATEGORIES = [
  {
    id: 'length',
    name: 'Length & Distance',
    shortName: 'Length',
    icon: 'Ruler',
    defaultFrom: 'm',
    defaultTo: 'ft',
  },
  // ... 20 other physical domains (mass, temperature, area, volume, speed, etc.)
];

// Unit Definitions & Exact Factors (relative to domain SI base unit)
export const UNIT_DEFINITIONS = {
  length: {
    name: 'Length & Distance',
    baseUnit: 'm',
    units: [
      { id: 'm', name: 'Meter', plural: 'Meters', symbol: 'm', factor: 1, tier: 'common', aliases: ['meter', 'meters', 'm'] },
      { id: 'km', name: 'Kilometer', plural: 'Kilometers', symbol: 'km', factor: 1000, tier: 'common', aliases: ['kilometer', 'kilometers', 'km'] },
      { id: 'ft', name: 'Foot', plural: 'Feet', symbol: 'ft', factor: 0.3048, tier: 'common', aliases: ['foot', 'feet', 'ft'] },
      { id: 'in', name: 'Inch', plural: 'Inches', symbol: 'in', factor: 0.0254, tier: 'common', aliases: ['inch', 'inches', 'in'] },
    ],
  },
  // ... mass, temperature, area, volume, etc.
};
```

---

### 2.2 Kitchen Dataset Schema (`src/engine/kitchenDataset.js`)

In Kitchen Studio, **every baking ingredient is modeled as its own category**. Because each ingredient has a known mass density (grams per US cup from USDA FoodData Central & King Arthur Baking standards), **all volume and weight units have exact linear factors relative to grams (`baseUnit = 'g'`, factor = 1)**.

#### 1. Kitchen Categories Array (`KITCHEN_CATEGORIES`)
Each entry mirrors the `CATEGORIES` schema 1:1, adding `group` for the shelf pantry expansion and `gPerCup` density:

```js
export const KITCHEN_CATEGORIES = [
  {
    id: 'flour_ap',
    name: 'All-Purpose Flour',
    shortName: 'Flour (AP)',
    icon: 'Wheat',
    group: 'Flours & Grains',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 120.0, // USDA spooned & leveled standard: 1 cup = 120g (~4.23 oz)
  },
  {
    id: 'flour_bread',
    name: 'Bread Flour',
    shortName: 'Bread Flour',
    icon: 'Wheat',
    group: 'Flours & Grains',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 127.0,
  },
  {
    id: 'flour_whole_wheat',
    name: 'Whole Wheat Flour',
    shortName: 'Whole Wheat',
    icon: 'Wheat',
    group: 'Flours & Grains',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 120.0,
  },
  {
    id: 'sugar_granulated',
    name: 'Granulated Sugar',
    shortName: 'White Sugar',
    icon: 'Sparkles',
    group: 'Sugars & Sweeteners',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 200.0,
  },
  {
    id: 'sugar_brown',
    name: 'Packed Brown Sugar',
    shortName: 'Brown Sugar',
    icon: 'Sparkles',
    group: 'Sugars & Sweeteners',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 220.0,
  },
  {
    id: 'sugar_powdered',
    name: 'Powdered Sugar',
    shortName: 'Powdered Sugar',
    icon: 'Sparkles',
    group: 'Sugars & Sweeteners',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 120.0,
  },
  {
    id: 'butter',
    name: 'Butter',
    shortName: 'Butter',
    icon: 'Box',
    group: 'Dairy & Fats',
    defaultFrom: 'stick_butter',
    defaultTo: 'g',
    gPerCup: 226.796185, // 1 stick = 1/2 cup = 113.398g
  },
  {
    id: 'milk',
    name: 'Whole Milk',
    shortName: 'Milk',
    icon: 'Droplet',
    group: 'Dairy & Fats',
    defaultFrom: 'cup_us',
    defaultTo: 'ml',
    gPerCup: 244.0,
  },
  {
    id: 'oil_cooking',
    name: 'Cooking Oil',
    shortName: 'Cooking Oil',
    icon: 'Droplet',
    group: 'Liquids & Syrups',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 216.0,
  },
  {
    id: 'honey',
    name: 'Honey & Molasses',
    shortName: 'Honey',
    icon: 'Droplet',
    group: 'Liquids & Syrups',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 340.0,
  },
  {
    id: 'cocoa_powder',
    name: 'Cocoa Powder',
    shortName: 'Cocoa Powder',
    icon: 'Sparkles',
    group: 'Baking Essentials',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 100.0,
  },
  {
    id: 'rolled_oats',
    name: 'Rolled Oats',
    shortName: 'Rolled Oats',
    icon: 'Wheat',
    group: 'Flours & Grains',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 90.0,
  },
  {
    id: 'chocolate_chips',
    name: 'Chocolate Chips',
    shortName: 'Choc Chips',
    icon: 'Sparkles',
    group: 'Baking Essentials',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 170.0,
  },
  {
    id: 'water',
    name: 'Water & Clear Liquids',
    shortName: 'Water',
    icon: 'Droplet',
    group: 'Liquids & Syrups',
    defaultFrom: 'cup_us',
    defaultTo: 'ml',
    gPerCup: 236.5882365,
  },
];
```

#### 2. Pantry Groups Breakdown
When the user clicks "All" on the shelf in Kitchen Studio, ingredients are presented by their culinary groups:
- **Flours & Grains**: All-Purpose, Bread Flour, Whole Wheat, Rolled Oats
- **Sugars & Sweeteners**: Granulated White, Packed Brown, Powdered Sugar
- **Dairy & Fats**: Butter, Whole Milk
- **Liquids & Syrups**: Cooking Oil, Honey & Molasses, Water
- **Baking Essentials**: Cocoa Powder, Chocolate Chips

#### 3. Kitchen Unit Definitions (`KITCHEN_UNIT_DEFINITIONS`)
For every ingredient category, `KITCHEN_UNIT_DEFINITIONS[catId]` has `baseUnit: 'g'` and contains both weight and volume units with exact gram-linear factors:

```js
// Unit Object Schema (exact match with UNIT_DEFINITIONS):
// {
//   id: string,
//   name: string,
//   plural: string,
//   symbol: string,
//   factor: number,  // Grams per 1 unit of this measurement
//   tier: 'common' | 'specialized',
//   aliases: string[],
// }

export function buildIngredientUnits(gPerCup, isButter = false) {
  const CUP_ML = 236.5882365;
  const gPerMl = gPerCup / CUP_ML;

  const units = [
    // --- Scale Weights (baseUnit = g, factor = 1) ---
    { id: 'g', name: 'Gram', plural: 'Grams', symbol: 'g', factor: 1.0, tier: 'common', aliases: ['gram', 'grams', 'g'] },
    { id: 'oz', name: 'Ounce', plural: 'Ounces', symbol: 'oz', factor: 28.349523125, tier: 'common', aliases: ['ounce', 'ounces', 'oz'] },
    { id: 'lb', name: 'Pound', plural: 'Pounds', symbol: 'lb', factor: 453.59237, tier: 'common', aliases: ['pound', 'pounds', 'lb', 'lbs'] },
    { id: 'kg', name: 'Kilogram', plural: 'Kilograms', symbol: 'kg', factor: 1000.0, tier: 'specialized', aliases: ['kilogram', 'kilograms', 'kg'] },

    // --- Volume Measures (factor = grams per 1 volume unit) ---
    { id: 'cup_us', name: 'US Cup', plural: 'US Cups', symbol: 'cup', factor: gPerCup, tier: 'common', aliases: ['cup', 'cups', 'c'] },
    { id: 'tbsp_us', name: 'US Tablespoon', plural: 'US Tablespoons', symbol: 'tbsp', factor: gPerCup / 16, tier: 'common', aliases: ['tablespoon', 'tablespoons', 'tbsp', 'tbs'] },
    { id: 'tsp_us', name: 'US Teaspoon', plural: 'US Teaspoons', symbol: 'tsp', factor: gPerCup / 48, tier: 'common', aliases: ['teaspoon', 'teaspoons', 'tsp'] },
    { id: 'floz_us', name: 'Fluid Ounce', plural: 'Fluid Ounces', symbol: 'fl oz', factor: gPerCup / 8, tier: 'common', aliases: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz'] },
    { id: 'ml', name: 'Milliliter', plural: 'Milliliters', symbol: 'mL', factor: gPerMl, tier: 'common', aliases: ['milliliter', 'milliliters', 'ml', 'mL'] },
    { id: 'cup_metric', name: 'Metric Cup (250 mL)', plural: 'Metric Cups', symbol: 'metric cup', factor: gPerMl * 250.0, tier: 'specialized', aliases: ['metric cup', 'metric cups'] },
    { id: 'tbsp_metric', name: 'Metric Tablespoon (15 mL)', plural: 'Metric Tablespoons', symbol: 'metric tbsp', factor: gPerMl * 15.0, tier: 'specialized', aliases: ['metric tbsp', 'metric tablespoon'] },
    { id: 'l', name: 'Liter', plural: 'Liters', symbol: 'L', factor: gPerMl * 1000.0, tier: 'specialized', aliases: ['liter', 'liters', 'l', 'L'] },
  ];

  if (isButter) {
    // 1 stick = 1/2 cup = 113.398g (4 oz)
    units.push({
      id: 'stick_butter',
      name: 'Stick of Butter',
      plural: 'Sticks of Butter',
      symbol: 'stick',
      factor: 113.3980925,
      tier: 'common',
      aliases: ['stick', 'sticks', 'stick of butter', 'sticks of butter'],
    });
  }

  return units;
}

export const KITCHEN_UNIT_DEFINITIONS = Object.fromEntries(
  KITCHEN_CATEGORIES.map((cat) => [
    cat.id,
    {
      name: cat.name,
      baseUnit: 'g',
      units: buildIngredientUnits(cat.gPerCup, cat.id === 'butter'),
    },
  ])
);
```

#### Exact Gram-Factor Formula for Kitchen Units:
For any ingredient with density $D$ (grams per US cup):
- **Grams (`g`)**: `factor = 1`
- **Ounces (`oz`)**: `factor = 28.349523125`
- **Pounds (`lb`)**: `factor = 453.59237`
- **US Cups (`cup_us`)**: `factor = D`
- **Metric Cups (`cup_metric`, 250mL)**: `factor = D * (250 / 236.5882365)`
- **Tablespoons (`tbsp_us`)**: `factor = D / 16`
- **Teaspoons (`tsp_us`)**: `factor = D / 48`
- **Milliliters (`ml`)**: `factor = D / 236.5882365`
- **Sticks of Butter (`stick_butter`)**: `factor = D / 2` (or fixed 113.398g)

> **Why this is revolutionary**: The existing core NIST engine `convertUnits(val, categoryId, fromUnit, toUnit)` **automatically works with 100% exact scientific precision for all kitchen conversions with ZERO custom branching!**
> - $1\text{ cup flour} \rightarrow 120\text{ g}$
> - $240\text{ g flour} \rightarrow 2\text{ cups}$
> - $1\text{ cup flour} \rightarrow 16\text{ tbsp}$
> - $1\text{ stick butter} \rightarrow 113.4\text{ g} \rightarrow 8\text{ tbsp}$

---

### 2.3 Dataset Swap Wiring in Root (`App.jsx`)

```jsx
// Determine mode from active URL route
const isKitchenMode = currentRoute.mode === 'kitchen';

// Active dataset is cleanly swapped:
const activeCategories = isKitchenMode ? KITCHEN_CATEGORIES : CATEGORIES;
const activeCategory = isKitchenMode
  ? (currentRoute.ingredient || 'flour_ap')
  : (currentRoute.category || 'length');

// Components receive standard props - zero divergent component branches!
<Header mode={isKitchenMode ? 'kitchen' : 'standard'} onSelectMode={handleSelectMode} />
<CategoryNav
  categories={activeCategories}
  activeCategory={activeCategory}
  onSelectCategory={handleSelectCategory}
  isKitchenMode={isKitchenMode}
/>
<ConversionCard
  categoryId={activeCategory}
  isKitchenMode={isKitchenMode}
  ...
/>
<ConversionTable
  categoryId={activeCategory}
  ...
/>
```

---

## 3. Component Symmetry & Reuse Matrix

| Component | Standard Mode (`/`) | Kitchen Studio Mode (`/kitchen`) | Implementation & Reuse |
| :--- | :--- | :--- | :--- |
| **Top Nav / Header** | Mode switcher: `[ 📐 Standard ] [ 🍳 Kitchen ]` | Mode switcher: `[ 📐 Standard ] [ 🍳 Kitchen ]` | Reuses `.ct-header-actions` with an equal 2-segment switcher. Neither mode is hidden. |
| **Category Shelf Component** | Reuses `<CategoryNav />` with `categories={CATEGORIES}` | Reuses `<CategoryNav />` with `categories={KITCHEN_CATEGORIES}` | **100% same component**: identical horizontal scroll track, mouse-wheel translation, FLIP animations. |
| **Shelf Collapsed View** | 21 physical domain chips | Pinned `[ ← Standard Converters ]` escape chip + Top baking staples | Identical chip geometry (`--radius-chip: 14px`, 38px height). |
| **Shelf "All" Expansion** | Clicking "All" expands all 21 engineering domains | Clicking "All" expands all **Pantry Groups** (Flours, Sugars, Dairy & Fats, Essentials) | Reuses expanding grid animation. **Never** dumps engineering domains into the kitchen! |
| **Workbench Component** | Reuses `<ConversionCard />` | Reuses `<ConversionCard />` | **100% same component**: identical `.ct-card` concentric geometry, identical soft workstation pods. |
| **Left Workstation Pod** | Input value + Unit selector chip (`[ Meter  m  ▾ ]`) | Input value + Volume unit chip (`[ US Cup  cup  ▾ ]`) | Identical interactive unit selector chip and numeric input canvas. |
| **Center Dial Button** | Circular swap dial (`.ct-swap-btn`) | Circular swap dial (`.ct-swap-btn`) | Flips calculation: volume-to-weight $\rightleftharpoons$ weight-to-volume. |
| **Right Workstation Pod** | Calculated answer + Target unit chip (`[ Foot  ft  ▾ ]`) | Calculated answer + Weight unit chip (`[ Gram  g  ▾ ]`) | Identical hero accent copy button (`.ct-num-copy-btn`). |
| **Inner Card Controls** | Clean workbench: NO extra category dropdown (shelf already selected it!) | **Clean workbench: NO duplicate ingredient dropdown, NO "Kitchen Mode ON/OFF" toggle!** (Shelf already selected it!) | **Completely eliminates the double selector confusion.** |
| **Lower Reference Area** | Hero equation + Educational formula caption | Hero equation + Integrated Kitchen Drawer spoons (`16 tbsp = 48 tsp = 236.6 mL`) | Reuses borderless `.ct-footnote-card` lower container. |
| **Equivalence Table** | Reuses `<ConversionTable />` for physical steps (1 to 1,000) | Reuses `<ConversionTable />` for culinary increments ($1/8, 1/4, 1/3, 1/2, 3/4, 1, 2\text{ cups}$ to grams & oz) | **100% same table component** with identical diagonal `<Fraction />` formatting. |

---

## 4. Phased Implementation Roadmap

### Phase 1: Define `KITCHEN_DATASET` & Pure Gram-Factor Ratios
- [x] Create `src/engine/kitchenDataset.js` defining `KITCHEN_CATEGORIES` and `KITCHEN_UNIT_DEFINITIONS` with exact gram-density factors.
- [x] Connect `kitchenDataset` into `conversions.js` so `getUnit()` and `convertUnits()` resolve kitchen categories natively.
- [x] Verify unit tests for kitchen dataset conversion ratios.

### Phase 2: Symmetrize `<ConversionCard />` (De-cluttering)
- [x] Remove `ct-kitchen-mode-toggle` button ("Kitchen Mode ON/OFF") from `ConversionCard.jsx`.
- [x] Remove duplicate ingredient dropdown from `ConversionCard` header — the top category shelf is the single, authoritative ingredient selector!
- [x] Clean up CSS styles associated with the legacy inner toggle.
- [x] In Kitchen Mode, render the Kitchen Drawer spoon equivalents cleanly in the lower footnote area.

### Phase 3: Symmetrize `<CategoryNav />` & Equal Header Mode Switcher
- [x] Update `CategoryNav.jsx` to dynamically consume `categories`:
  - When in Standard Mode: Consumes `CATEGORIES` (21 domains).
  - When in Kitchen Mode: Consumes `KITCHEN_CATEGORIES` (Baking staples).
  - When expanded in Kitchen Mode: Groups ingredients by Pantry Sections (Flours, Sugars, Dairy & Fats, Essentials).
  - Pinned escape hatch `[ ← Standard Converters ]` returns instantly to `/`.
- [x] In `Header.jsx`, implement the equal peer mode switcher:
  `[ 📐 Standard ]  [ 🍳 Kitchen ]`

### Phase 4: Route & Omnibox Unification
- [x] Ensure `/kitchen` is the canonical route for Kitchen Studio.
- [x] Ensure legacy `/cooking` cleanly aliases/redirects to `/kitchen`.
- [x] Support clean deep-linking: `/kitchen?ing=butter`, `/kitchen?ing=sugar_brown`, `/kitchen?v=2`.
- [x] Omnibox intelligence: Baking queries (`"1 cup flour to grams"`) open in Kitchen Mode; physical queries (`"100 km to miles"`) open in Standard Mode.

### Phase 5: Verification, Pre-Rendering & Testing
- [x] Add unit tests verifying dataset swap, shelf expansion, and equal mode switching.
- [x] Run full test suite: Ensure all 388 Jest tests pass with 0 failures (14/14 test suites).
- [x] Run API test suite: Ensure all 28 API assertions pass.
- [x] Run production build and pre-render script: Verify `build/kitchen/index.html` static pre-rendering with 0 CLS (2,675 static routes).
- [x] Verify responsiveness across mobile (360px, 390px) and desktop viewports.

---

## 5. Execution Prompts (For Sequential Implementation)

### Prompt 1: Phase 1 (Define Kitchen Dataset)
```
Proceed with Phase 1 of KITCHEN_STUDIO_PLAN.md:
1. Create src/engine/kitchenDataset.js with KITCHEN_CATEGORIES and KITCHEN_UNIT_DEFINITIONS using exact gram factors.
2. Integrate kitchenDataset into conversions.js so getUnit and convertUnits natively resolve kitchen ingredients.
3. Verify test suite passes.
```

### Prompt 2: Phase 2 (Card Cleanup & De-duplication)
```
Proceed with Phase 2 of KITCHEN_STUDIO_PLAN.md:
1. In ConversionCard.jsx, remove the redundant "Kitchen Mode ON/OFF" toggle.
2. Remove the duplicate ingredient selector dropdown inside the card header.
3. Show the kitchen drawer equivalents cleanly in the lower footnote section.
4. Remove legacy toggle CSS from App.css.
5. Verify test suite passes.
```

### Prompt 3: Phase 3 (Symmetrical CategoryNav & Equal Header Switcher)
```
Proceed with Phase 3 of KITCHEN_STUDIO_PLAN.md:
1. In CategoryNav.jsx, consume active categories dynamically based on mode.
2. Implement categorized pantry groups when expanded in kitchen mode.
3. In Header.jsx, implement the equal peer mode switcher [ 📐 Standard ] [ 🍳 Kitchen ].
4. Verify test suite passes.
```

### Prompt 4: Phase 4 & 5 (Routing, Omnibox Sync & Final Verification)
```
Proceed with Phase 4 & 5 of KITCHEN_STUDIO_PLAN.md:
1. Unify /kitchen routing, /cooking alias, and Omnibox cross-mode routing.
2. Run full test suite (`npm test -- --watchAll=false`) and API suite (`npm run test:api`).
3. Run `npm run build` and verify `build/kitchen/index.html` pre-rendering.
4. Update KITCHEN_STUDIO_PLAN.md with completed checkboxes.
```
