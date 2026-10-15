# UNIT_ADDITION.md

> Architecture, Progressive Disclosure Strategy, and Phased Execution Roadmap for Unit & Category Expansion in **ConvertThings**.

---

## 1. Operating Instructions & Maintenance Rules

> [!IMPORTANT]
> **Instructions for AI Agents and Developers Updating this File:**
> 1. **Track Progress**: As items are implemented, replace `[ ]` with `[x]` and record the completion date and relevant test suite count in the **Phase Progress Tracker** table below.
> 2. **Never Break Zero-Clutter Principle**: Every unit added must have a designated `tier` (`common` or `specialized`) and appropriate `subtitle` / disambiguation badge. Never dump specialized units into a raw flat list.
> 3. **Mathematical Precision**: All factors must strictly adhere to NIST / SI / ISO 80000 official definitions.
> 4. **Mandatory Verification Gate**: Before marking any checklist item or phase as fulfilled, run:
>    - Jest Test Suite: `$env:CI="true"; npm test -- --runInBand` (all tests passing)
>    - API & MCP Test Suite: `npm run test:api`
>    - Production Build & Prerender: `npm run build`
> 5. **Documentation Sync**: When a phase completes, update unit counts in `AGENTS.md`, `README.md`, and `public/llms.txt`.

---

## 2. Phase Progress Tracker

| Phase | Description | Status | Target Units / Cats | Completed Date | Verified By |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Two-Tier Progressive Disclosure & Disambiguation UI | ✅ Completed | N/A (UI Architecture) | 2026-10-09 | 279 Jest + 28 API Tests |
| **Phase 2** | Missing High-Impact Units in Existing Categories | ✅ Completed | +40 Units across 10 Cats | 2026-10-09 | 303 Jest + 28 API Tests (2,428 routes) |
| **Phase 2.5** | Omnibox & Search Parity (Colloquial Aliases & Semantic Discovery) | ✅ Completed | Engine & Parser Parity | 2026-10-10 | 306 Jest + 28 API Tests (2,428 routes) |
| **Phase 3** | Core SI Categories: Frequency & Torque | ✅ Completed | +2 Categories, +14 Units | 2026-10-10 | 313 Jest + 28 API Tests (2,516 routes) |
| **Phase 4** | Trade & Developer Categories (Force, Flow, Typography) | ✅ Completed | +3 Categories, +22 Units | 2026-10-10 | 321 Jest + 28 API Tests (2,663 routes) |
| **Phase 5** | Scientific & Electrical Domain Expansion | ✅ Completed | +2 Categories, +13 Units (22 Domains, 228 Units) | 2026-10-10 | 327 Jest + 28 API Tests (2,745 routes) |

*Status options: `⏳ Pending`, `🔄 In Progress`, `✅ Completed`*

---

## 3. Core Architectural Strategy: Progressive Disclosure

ConvertThings serves two distinct user archetypes:
1. **The Everyday User (80% of traffic)**: Students, home cooks, and travelers who want quick answers (e.g., pounds to kilograms, cups to milliliters, Fahrenheit to Celsius). They should experience zero decision fatigue, zero clutter, and clear, calm dropdowns.
2. **The Specialist & Trade Professional (20% of traffic, high SEO intent)**: Jewelers, machinists, engineers, HVAC technicians, electricians, and developers who need exact domain-specific units (e.g., troy ounces, mils, CFM, kW-to-BTU refrigeration tons, rem-to-px).

### The 4 Design Rules for Zero Clutter

1. **Two-Tier Unit Schema (`tier: 'common' | 'specialized'`)**:
   - `tier: 'common'`: Rendered by default in dropdowns, benchmark tables, and quick reference grids.
   - `tier: 'specialized'`: Filtered behind a clean section divider (`── Specialized & Trade Units ▾ ──`) or expandable drawer.
2. **Contextual Subtitles & Disambiguation Pills**:
   - Units with shared or ambiguous names (e.g. `Ounce`) must render with micro-subtitles and badges:
     - `Ounce (oz)` ── *Everyday weight (16 oz = 1 lb)*
     - `Troy Ounce (oz t)` ── *Gold, silver & bullion (31.1 g)* `[Jewelry]`
     - `Fluid Ounce (fl oz)` ── *Liquid volume* `[Volume]`
3. **Omnibox Semantic Routing & Search Parity**:
   - General queries like `"10 oz to g"` default to the `common` unit (Avoirdupois Ounce).
   - Contextual queries like `"10 oz gold to g"`, `"10 gold oz in grams"`, or `"10 troy oz to g"` automatically resolve to `Troy Ounce`.
   - Single-topic searches like `"gold"`, `"horse"`, `"astronomy"`, `"diamond"`, `"tire pressure"` search across unit subtitles and badges, returning 1-click recommendation chips.
   - Ambiguous queries display disambiguation cards in the suggestion palette.
4. **Category Clustering in Navigation**:
   - Top horizontal scroll rail prioritizes high-frequency daily categories (`Cooking`, `Length`, `Weight`, `Temperature`, `Volume`, `Speed`, `Area`, `Time`).
   - The expanded category grid (`[ ⊞ All Categories ]`) groups categories into clean thematic panels: **Daily & Living**, **Engineering & Trades**, and **Computing & Design**.

---

## 4. Phase 1: Two-Tier Progressive Disclosure Architecture

> **Goal**: Prepare the UI and engine so hundreds of units can be added with zero visual noise.

### Tasks
- [x] **1.1 Unit Metadata Extension (`src/engine/conversions.js`)**:
  - Add optional `tier: 'common' | 'specialized'` to unit objects in `UNIT_DEFINITIONS` (defaulting to `'common'` if omitted).
  - Add optional `subtitle: string` (e.g., `"Everyday weight"`, `"Precious metals"`) to clarify ambiguous or trade units.
  - Add optional `badge: string` (e.g., `"Gold"`, `"HVAC"`, `"Nautical"`, `"UK"`) for visual chips.
- [x] **1.2 Unit Dropdown Reorganization (`src/components/ConversionCard.jsx`)**:
  - Split dropdown list rendering into **Common Units** and **Specialized Units**.
  - When search input is empty, show Common Units first with a subtle, collapsible `Specialized & Trade Units` toggle.
  - When user types in search, search across ALL tiers instantly, displaying matching subtitles and badges.
  - Render subtle, accessible subtitle typography below unit names (`font-size: 0.75rem`, muted color).
- [x] **1.3 Benchmark Table Filtering (`src/components/ConversionTable.jsx`)**:
  - In the all-units equivalence grid, display Common units by default.
  - Provide a quiet pill toggle `[ Show specialized units ]` so the table remains compact.
- [x] **1.4 Verification**:
  - Run existing test suites: `$env:CI="true"; npm test -- --runInBand`.
  - Verify zero visual regression and zero layout shift (CLS = 0).

---

## 5. Phase 2: Missing High-Impact Units in Existing Categories

> **Goal**: Fill critical gaps in existing 15 categories with `tier: 'specialized'` (or `'common'` where universally used).

### Weight & Mass (`mass`)
- [x] `oz_t` — **Troy Ounce** (`0.0311034768 kg`, `tier: 'specialized'`, subtitle: `"Gold, silver & bullion (31.1 g)"`, badge: `"Jewelry"`)
- [x] `dwt` — **Pennyweight** (`0.00155517384 kg`, `tier: 'specialized'`, subtitle: `"Scrap gold & dental alloys (1.555 g)"`, badge: `"Jewelry"`)
- [x] `da` — **Dalton / Atomic Mass Unit** (`1.66053906660e-27 kg`, `tier: 'specialized'`, subtitle: `"Chemistry & molecular biology"`, badge: `"Science"`)
- [x] `slug` — **Slug** (`14.5939029 kg`, `tier: 'specialized'`, subtitle: `"Aerospace & mechanics (lbf·s²/ft)"`)
- [x] `q` — **Metric Quintal** (`100 kg`, `tier: 'specialized'`, subtitle: `"Agricultural grain standard (100 kg)"`, badge: `"Agri"`)

### Volume & Capacity (`volume`)
- [x] `cl` — **Centiliter** (`0.01 L`, `tier: 'common'`, subtitle: `"European beverage & wine bottles (75 cL)"`)
- [x] `dl` — **Deciliter** (`0.1 L`, `tier: 'common'`, subtitle: `"Nordic & European recipe standard (100 mL)"`)
- [x] `bbl_oil` — **Oil Barrel** (`158.987294928 L`, `tier: 'specialized'`, subtitle: `"42 US gallons (Crude oil benchmark)"`, badge: `"Commodities"`)
- [x] `pt_uk` — **Imperial Pint** (`0.56826125 L`, `tier: 'common'`, subtitle: `"20 fl oz (British pub pint)"`, badge: `"UK"`)
- [x] `qt_uk` — **Imperial Quart** (`1.1365225 L`, `tier: 'specialized'`, subtitle: `"40 fl oz (British imperial quart)"`, badge: `"UK"`)
- [x] `ul` — **Microliter** (`1e-6 L`, `tier: 'specialized'`, subtitle: `"Laboratory pipetting & biology (1 mm³)"`, badge: `"Lab"`)
- [x] `bu` — **Bushel (US Dry)** (`35.23907016688 L`, `tier: 'specialized'`, subtitle: `"Agricultural grain trade (wheat, corn)"`, badge: `"Agri"`)

### Kitchen Mode (`cooking`)
- [x] `cup_metric` — **Metric Cup** (`250 mL`, `tier: 'common'`, subtitle: `"Australia, NZ, UK, Canada (250 mL)"`, badge: `"Metric"`)
- [x] `tbsp_metric` — **Metric Tablespoon** (`15 mL`, `tier: 'common'`, subtitle: `"International metric tablespoon (15 mL)"`, badge: `"Metric"`)
- [x] `dsp` — **Dessertspoon** (`10 mL`, `tier: 'specialized'`, subtitle: `"British & Commonwealth recipes (2 tsp / 10 mL)"`, badge: `"UK"`)
- [x] `shot` — **Standard Shot / Jigger** (`44.360294 mL`, `tier: 'specialized'`, subtitle: `"1.5 US fl oz (Bartending & cocktails)"`, badge: `"Bar"`)
- [x] `smidgen` — **Smidgen** (`0.154028 mL`, `tier: 'specialized'`, subtitle: `"1/32 teaspoon (0.15 mL)"`)
- [x] `tad` — **Tad** (`1.23223 mL`, `tier: 'specialized'`, subtitle: `"1/4 teaspoon (1.23 mL)"`)

### Length & Distance (`length`)
- [x] `au` — **Astronomical Unit** (`149597870700 m`, `tier: 'specialized'`, subtitle: `"Earth-Sun distance (Solar system)"`, badge: `"Space"`)
- [x] `pc` — **Parsec** (`3.085677581e16 m`, `tier: 'specialized'`, subtitle: `"Astrophysics (~3.26 light-years)"`, badge: `"Space"`)
- [x] `angstrom` — **Ångström** (`1e-10 m`, `tier: 'specialized'`, subtitle: `"0.1 nm (Crystallography & semiconductors)"`)
- [x] `mil` — **Mil / Thou** (`0.0000254 m`, `tier: 'specialized'`, subtitle: `"0.001 in (PCB traces, sheet metal, paint)"`, badge: `"Machining"`)
- [x] `fathom` — **Fathom** (`1.8288 m`, `tier: 'specialized'`, subtitle: `"6 feet (Nautical depth)"`, badge: `"Maritime"`)
- [x] `hand` — **Hand** (`0.1016 m`, `tier: 'specialized'`, subtitle: `"4 inches (Equine horse height)"`, badge: `"Equestrian"`)

### Digital Storage & Data Rate (`digital`, `data_rate`)
- [x] `pib` — **Pebibyte (Binary)** (`8 * (1024 ** 5) bits`, `tier: 'specialized'`, subtitle: `"1,024 TiB (Binary IEC standard)"`)
- [x] `eb` — **Exabyte (Decimal)** (`8 * 1e18 bits`, `tier: 'specialized'`, subtitle: `"1,000 PB (Cloud & data center scale)"`)
- [x] `eib` — **Exbibyte (Binary)** (`8 * (1024 ** 6) bits`, `tier: 'specialized'`, subtitle: `"1,024 PiB (Binary IEC standard)"`)
- [x] `nibble` — **Nibble** (`4 bits`, `tier: 'specialized'`, subtitle: `"4 bits / 0.5 byte (Hexadecimal digit)"`)
- [x] `tbps` — **Terabit per Second** (`1e12 bps`, `tier: 'specialized'`, subtitle: `"Fiber optic & datacenter backbones"`)
- [x] `tbs` — **Terabyte per Second** (`8e12 bps`, `tier: 'specialized'`, subtitle: `"GPU memory bandwidth (HBM3e)"`)
- [x] `mibs` — **Mebibyte per Second** (`8 * 1048576 bps`, `tier: 'specialized'`, subtitle: `"File copy dialogs & torrent clients"`)

### Pressure, Energy, Power & Fuel
- [x] `inh2o` — **Inch of Water** in Pressure (`249.0889 Pa`, `tier: 'specialized'`, subtitle: `"HVAC duct & fan static pressure"`, badge: `"HVAC"`)
- [x] `cmh2o` — **Centimeter of Water** in Pressure (`98.0665 Pa`, `tier: 'specialized'`, subtitle: `"CPAP & medical respiratory pressure"`, badge: `"Medical"`)
- [x] `ksi` — **Kilopound per Square Inch** in Pressure (`6.894757e6 Pa`, `tier: 'specialized'`, subtitle: `"1,000 psi (Steel tensile strength)"`)
- [x] `therm` — **Therm** in Energy (`105505585.262 J`, `tier: 'specialized'`, subtitle: `"US natural gas utility billing (100,000 BTU)"`, badge: `"Utilities"`)
- [x] `mwh` — **Megawatt-hour** in Energy (`3.6e9 J`, `tier: 'specialized'`, subtitle: `"Commercial battery & grid storage (1,000 kWh)"`)
- [x] `ton_ref` — **Ton of Refrigeration** in Power (`3516.85284 W`, `tier: 'specialized'`, subtitle: `"12,000 BTU/h (AC & heat pump cooling capacity)"`, badge: `"HVAC"`)
- [x] `mw_milli` — **Milliwatt** in Power (`0.001 W`, `tier: 'specialized'`, subtitle: `"RF transmitters, Wi-Fi & laser output"`)
- [x] `mi_kwh` — **Miles per kWh** in Fuel Economy (`tier: 'common'`, subtitle: `"US electric vehicle efficiency"`, badge: `"EV"`)
- [x] `kwh_100km` — **kWh per 100 km** in Fuel Economy (`tier: 'common'`, subtitle: `"European electric vehicle consumption"`, badge: `"EV"`)

---

## 6. Phase 2.5: Omnibox & Search Parity (Colloquial Aliases & Semantic Unit Discovery)

> **Goal**: Eliminate the search gap between the unit dropdown search and the top Omnibox. Ensure users searching by trade colloquialisms, everyday phrases, or topic keywords (e.g., `"gold"`, `"gold oz"`, `"horse height"`, `"food calories"`, `"tire pressure"`) find the exact unit and convert instantly.

### Tasks
- [x] **2.5.1 Trade & Colloquial Aliases (`src/engine/conversions.js`)**:
  - `oz_t` (Troy Ounce): Add `'gold oz'`, `'gold ounce'`, `'gold ounces'`, `'silver ounce'`, `'bullion ounce'`
  - `dwt` (Pennyweight): Add `'scrap gold'`, `'gold dwt'`, `'dental alloy'`
  - `ct` (Carat): Add `'diamond carat'`, `'gemstone carat'`, `'diamond weight'`
  - `hand` (Hand): Add `'horse hand'`, `'hands high'`, `'equine hand'`
  - `mil` (Mil / Thou): Add `'thou'`, `'paint mil'`, `'coating mil'`, `'pcb mil'`
  - `fathom` (Fathom): Add `'water depth'`, `'nautical fathom'`
  - `au` (Astronomical Unit): Add `'earth sun distance'`, `'astronomical unit'`
  - `kcal` (Kilocalorie): Add `'food calorie'`, `'food calories'`, `'diet calorie'`, `'dietary calorie'`
  - `psi` (Pound per Square Inch): Add `'tire psi'`, `'tire pressure'`
  - `bbl_oil` (Oil Barrel): Add `'crude oil barrel'`, `'oil bbl'`, `'barrel of crude'`
  - `ton_ref` (Ton of Refrigeration): Add `'ac ton'`, `'cooling ton'`, `'refrigeration ton'`
  - `therm` (Therm): Add `'gas therm'`, `'natural gas therm'`, `'utility therm'`
  - `mi_kwh` / `kwh_100km`: Add `'ev efficiency'`, `'ev consumption'`, `'electric car mileage'`

- [x] **2.5.2 Omnibox Semantic Topic & Keyword Discovery (`src/engine/parser.js`)**:
  - In `getSearchSuggestions(query)`: When a query does not match a complete equation or category name, perform fallback search across unit `subtitle`, `badge`, and `name` across all 15 categories (mirroring `filterAndSortUnits`).
  - Return structured recommendation suggestions with badge, subtitle, and instant navigation payload (e.g., typing `"gold"` surfaces Troy Ounce and Pennyweight with 1-click conversion load).

- [x] **2.5.3 Natural Language Parser Support for Colloquial Aliases (`src/engine/parser.js`)**:
  - Ensure multi-word colloquial aliases like `"gold oz"`, `"food calorie"`, `"hands high"` resolve correctly in `findAllUnits()`, `findUnit()`, and `parseConversionQuery()`.
  - Validate equations like `"1 gold oz to grams"`, `"16 hands to feet"`, and `"2000 food calories to kj"` parse cleanly with numeric value and complementary units.

- [x] **2.5.4 Automated Test Suite Verification**:
  - Add unit tests in `src/engine/parser.test.js` covering topic keyword search (`"gold"`, `"horse"`, `"diamond"`, `"astronomy"`).
  - Add unit tests for natural query strings with colloquial aliases (`"10 gold oz in g"`, `"2000 food calories in kj"`).
  - Verify all existing and new tests pass: `$env:CI="true"; npm test -- --runInBand`.

---

## 7. Phase 3: Core SI & Trade New Categories (Frequency & Torque)

> **Goal**: Add the two highest-demand, 100% SI-compliant, zero-dependency measurement categories.

### Category 16: Frequency (`frequency`)
- **Category ID**: `frequency`
- **Icon**: `Waveform` or `Activity` (in `src/components/Icons.jsx`)
- **Theme Color**: `--cat-frequency: #06b6d4;` (Cyan)
- **Base Unit**: `hz` (Hertz, $\text{s}^{-1}$)
- **Units**:
  - [x] `hz` — Hertz (Hz, base factor: 1, common)
  - [x] `khz` — Kilohertz (kHz, factor: 1e3, common)
  - [x] `mhz` — Megahertz (MHz, factor: 1e6, common)
  - [x] `ghz` — Gigahertz (GHz, factor: 1e9, common)
  - [x] `thz` — Terahertz (THz, factor: 1e12, specialized)
  - [x] `rpm` — Revolutions per Minute (RPM, factor: 1/60, common, subtitle: `"Motor & engine rotation"`)
  - [x] `rad_s` — Radians per Second (rad/s, factor: 1 / (2 * Math.PI), specialized, subtitle: `"Angular velocity"`)
  - [x] `deg_s` — Degrees per Second (°/s, factor: 1 / 360, specialized)

### Category 17: Torque (`torque`)
- **Category ID**: `torque`
- **Icon**: `Wrench` or `Disc` (in `src/components/Icons.jsx`)
- **Theme Color**: `--cat-torque: #d97706;` (Amber Bronze)
- **Base Unit**: `nm` (Newton-meter, $\text{N}\cdot\text{m}$)
- **Units**:
  - [x] `nm` — Newton-meter (N·m, base factor: 1, common, subtitle: `"SI metric standard"`)
  - [x] `ftlb` — Pound-foot (lb-ft / lbf·ft, factor: 1.3558179483314, common, subtitle: `"US automotive lug nuts & engine specs"`)
  - [x] `inlb` — Pound-inch (lb-in / lbf·in, factor: 0.1129848290276, common, subtitle: `"Bicycle torque & small fasteners"`)
  - [x] `kgfm` — Kilogram-force Meter (kgf·m, factor: 9.80665, specialized)
  - [x] `knm` — Kilonewton-meter (kN·m, factor: 1000, specialized, subtitle: `"Heavy industrial & structural"`)
  - [x] `ozin` — Ounce-force Inch (oz-in, factor: 0.0070615518142, specialized, subtitle: `"Stepper motors & servo actuators"`)

---

## 8. Phase 4: Trade & Developer Categories (Force, Flow Rate, Typography)

> **Goal**: Expand into heavy engineering, HVAC trades, and developer/designer tooling.  
> **Status**: ✅ Completed (2026-10-10) — 22 units added across 3 new domains (Platform total: 20 domains, 215 standardized units).

### Category 18: Force (`force`)
- **Category ID**: `force` | **Icon**: `Crosshair` | **Theme Color**: `--cat-force: #e11d48;` (Rose Red) | **Base Unit**: `n` (Newton)
- **Units**:
  - [x] `n` — **Newton** (N, base factor: 1, common, subtitle: `"SI metric standard (1 kg⋅m/s²)"`)
  - [x] `kn` — **Kilonewton** (kN, factor: 1e3, common, subtitle: `"Climbing gear & aerospace rocketry"`, badge: `"Engineering"`)
  - [x] `mn` — **Meganewton** (MN, factor: 1e6, specialized, subtitle: `"Rocket thrust & mega-structures"`, badge: `"Aerospace"`)
  - [x] `lbf` — **Pound-force** (lbf, factor: 4.4482216152605, common, subtitle: `"US engineering standard (1 lb × g)"`)
  - [x] `kgf` — **Kilogram-force / Kilopond** (kgf, factor: 9.80665, common, subtitle: `"Metric technical unit (kilopond)"`)
  - [x] `dyn` — **Dyne** (dyn, factor: 1e-5, specialized, subtitle: `"CGS physics standard (1 g⋅cm/s²)"`)
  - [x] `kip` — **Kip** (kip, factor: 4448.2216152605, specialized, subtitle: `"1,000 lbf (Civil & structural engineering)"`, badge: `"Engineering"`)
  - [x] `ozf` — **Ounce-force** (ozf, factor: 0.27801385095378, specialized, subtitle: `"Precision small mechanisms & springs"`)

### Category 19: Volumetric Flow Rate (`flow_rate`)
- **Category ID**: `flow_rate` | **Icon**: `Waves` | **Theme Color**: `--cat-flow_rate: #0284c7;` (Ocean Sky Blue) | **Base Unit**: `m3_s` (Cubic Meters per Second)
- **Units**:
  - [x] `cfm` — **Cubic Feet per Minute** (CFM, factor: 0.0004719474432, common, subtitle: `"HVAC airflow & PC cooling fans"`, badge: `"HVAC"`)
  - [x] `l_s` — **Liter per Second** (L/s, factor: 0.001, common, subtitle: `"Plumbing & hydraulic flows"`)
  - [x] `l_min` — **Liter per Minute** (L/min, factor: 0.001 / 60, common, subtitle: `"Medical oxygen & tap water flow"`)
  - [x] `m3_h` — **Cubic Meter per Hour** (m³/h, factor: 1 / 3600, common, subtitle: `"Industrial ventilation & pumps"`)
  - [x] `m3_s` — **Cubic Meter per Second** (m³/s, factor: 1, specialized, subtitle: `"SI base unit (Hydroelectric & river discharge)"`)
  - [x] `gpm_us` — **US Gallon per Minute** (GPM, factor: 0.003785411784 / 60, common, subtitle: `"US plumbing, pumps & fire hydrants"`, badge: `"Plumbing"`)
  - [x] `gph_us` — **US Gallon per Hour** (GPH, factor: 0.003785411784 / 3600, specialized, subtitle: `"Fuel consumption & aquarium filtration"`)

### Category 20: Typography & Screen Resolution (`typography`)
- **Category ID**: `typography` | **Icon**: `Type` | **Theme Color**: `--cat-typography: #8b5cf6;` (Purple) | **Base Unit**: `px` (Pixel at standard 96 DPI CSS baseline)
- **Units**:
  - [x] `px` — **Pixel** (px, base factor: 1, common, subtitle: `"CSS digital display baseline (96 DPI)"`)
  - [x] `pt` — **Point** (pt, factor: 4/3, common, subtitle: `"1/72 inch (Print, typography & iOS font size)"`, badge: `"Print"`)
  - [x] `rem` — **Rem** (rem, factor: 16, common, subtitle: `"Root em (16 px browser standard)"`, badge: `"Web"`)
  - [x] `em` — **Em** (em, factor: 16, common, subtitle: `"Relative font size (16 px standard)"`, badge: `"Web"`)
  - [x] `pc` — **Pica** (pc, factor: 16, specialized, subtitle: `"12 points / 16 px (Book & editorial typesetting)"`, badge: `"Print"`)
  - [x] `in_css` — **CSS Inch** (in, factor: 96, specialized, subtitle: `"96 CSS pixels (CSS Print spec)"`)
  - [x] `mm_css` — **CSS Millimeter** (mm, factor: 96 / 25.4, specialized, subtitle: `"3.78 px (CSS Print spec)"`)

---

## 9. Phase 5: Scientific & Electrical Expansion

> **Goal**: Complete SI domain coverage for electronics, medical physics, and chemistry.  
> **Status**: ✅ Completed (2026-10-10) — 13 units added across 2 new domains (Platform total: 22 domains, 228 standardized units).

### Category 21: Electric Current & Charge (`current`)
- **Category ID**: `current` | **Icon**: `BatteryCharging` | **Theme Color**: `--cat-current-brand: #84cc16;` (Electric Lime) | **Base Unit**: `a` (Ampere)
- **Units**:
  - [x] `a` — **Ampere** (A, base factor: 1, common, subtitle: `"Base SI unit of electric current (1 C/s)"`)
  - [x] `ma` — **Milliampere** (mA, factor: 0.001, common, subtitle: `"Electronics & microcontroller circuits"`, badge: `"Electronics"`)
  - [x] `ua` — **Microampere** (µA, factor: 1e-6, specialized, subtitle: `"Low-power standby & IoT sensors (10⁻⁶ A)"`, badge: `"IoT"`)
  - [x] `ka` — **Kiloampere** (kA, factor: 1000, specialized, subtitle: `"Power grids & lightning discharges"`, badge: `"Power Grid"`)
  - [x] `ah` — **Ampere-hour** (Ah, factor: 1, common, subtitle: `"Battery capacity over 1 hour (3,600 C)"`, badge: `"Battery"`)
  - [x] `mah` — **Milliampere-hour** (mAh, factor: 0.001, common, subtitle: `"Phone, laptop & power bank battery capacity"`, badge: `"Battery"`)
  - [x] `ab_a` — **Abampere (Biot)** (abA, factor: 10, specialized, subtitle: `"10 Amperes (Electromagnetic CGS unit)"`)
  - [x] `stat_a` — **Statampere** (statA, factor: 1 / 2997924580, specialized, subtitle: `"Electrostatic CGS unit (~0.334 nA)"`)

### Category 22: Illuminance (`illuminance`)
- **Category ID**: `illuminance` | **Icon**: `Sun` | **Theme Color**: `--cat-illuminance: #f59e0b;` (Sunlight Gold) | **Base Unit**: `lx` (Lux)
- **Units**:
  - [x] `lx` — **Lux** (lx, base factor: 1, common, subtitle: `"SI standard illuminance (1 lumen/m²)"`)
  - [x] `fc` — **Foot-candle** (fc, factor: 1 / 0.09290304, common, subtitle: `"US architectural & photography lighting (1 lm/ft²)"`, badge: `"Lighting"`)
  - [x] `ph` — **Phot** (ph, factor: 10000, specialized, subtitle: `"CGS optical standard (10,000 lux / 1 lm/cm²)"`)
  - [x] `nox` — **Nox** (nox, factor: 0.001, specialized, subtitle: `"Night vision & astronomy optics (1 millilux)"`, badge: `"Optics"`)
  - [x] `klx` — **Kilolux** (klx, factor: 1000, specialized, subtitle: `"Direct sunlight & greenhouse horticulture"`, badge: `"Solar"`)

---

## 10. Full Technical Implementation Checklist for Every New Category

Whenever a new category is added, every layer of the platform must be updated and verified:

1. [x] **`src/engine/conversions.js`**:
   - Register category in `CATEGORIES` array with id, name, icon name, defaultFrom, defaultTo.
   - Register units in `UNIT_DEFINITIONS` with id, name, plural, symbol, factor (or toBase/fromBase), aliases, tier, and subtitle.
   - Add specialized formulas in `getFormulaDetails` if non-linear.
2. [x] **`src/engine/parser.js`**:
   - Add default complementary pairs to `COMPLEMENTARY_PAIRS`.
   - Add category search keywords and intent synonyms to `CATEGORY_SYNONYMS`.
   - Add popular conversion quick-picks to `POPULAR_CONVERSIONS`.
3. [x] **`src/components/Icons.jsx`**:
   - Ensure the SVG icon is implemented in `Icon` component switch.
4. [x] **`src/index.css` & `src/App.css`**:
   - Add category CSS color tokens (`--cat-<id>`, `--cat-<id>-light`, `--cat-<id>-glow`).
   - Add category switch active styles and footer signature hover animations.
5. [x] **`src/components/SeoContent.jsx`**:
   - Add rich educational guides, base unit definitions, common conversion tips, and FAQ schema questions in `CATEGORY_SEO_INFO`.
6. [x] **`scripts/generateSitemap.mjs` & `scripts/prerender.mjs`**:
   - Verify automated generation picks up all new routes cleanly.
7. [x] **`api/mcp.js` & `src/engine/mcpTools.js`**:
   - Update MCP tool descriptions and schemas to list the new domain.
8. [x] **Test Coverage**:
   - Add unit tests in `src/engine/conversions.test.js` verifying factor precision.
   - Add parser tests in `src/engine/parser.test.js`.
   - Run complete suite: `$env:CI="true"; npm test -- --runInBand`.
