# AGENTS.md

> Developer and AI Agent Guide for **ConvertThings** (Rebuilt & Modernized)

---

## 1. Project Overview

**ConvertThings** is a modern, high-precision, real-time unit conversion web platform built with React 18, Vercel Serverless Functions, and native Model Context Protocol (MCP) server integration. It provides instantaneous bidirectional unit conversion across 22 physical and computational measurement domains with 228 standardized units, universal natural language query parsing, compound measurement resolution (e.g., `5 ft 10 in`, `2 lbs 4 oz`), tape measure tolerances (`1/16″ ± 1/32″`), zero cumulative layout shift (CLS), dark/light mode, dynamic SEO metadata, Schema.org rich snippet schemas, a public REST API (GET & POST), an LLM discovery manifest (`/llms.txt`), and native AI agent tooling over MCP.

- **Repository:** [https://github.com/ashtonsprunger/convertthings.git](https://github.com/ashtonsprunger/convertthings.git)
- **Production URL / Homepage:** [https://www.convertthings.com](https://www.convertthings.com)
- **Remote MCP Endpoint:** `https://www.convertthings.com/api/mcp`
- **Public REST API:** `https://www.convertthings.com/api/convert`
- **LLM Manifest:** `https://www.convertthings.com/llms.txt`
- **Deployment Platform:** Vercel (Edge serverless functions + React SPA) & GitHub Pages (`gh-pages` branch)

---

## 2. Core Architecture & Highlights

1. **High-Precision Custom Conversion Engine (`src/engine/conversions.js`)**:
   - Zero-dependency, exact NIST/SI factor calculation engine across 228 standardized units.
   - Eliminates IEEE 754 floating-point artifacts (e.g., `0.30000000000000004` -> `0.3`).
   - Supports non-linear transformations (Celsius, Fahrenheit, Kelvin, Rankine) and reciprocal transformations (e.g. US mpg, Imperial mpg, L/100km, km/L).
   - **Fraction & Tape Measure Precision Modes (`toTapeMeasureFraction`, `toFraction`)**:
     - Carpenter tape measure fraction tolerance (`1/16″ ± 1/32″`, e.g. `"3 3/8 +1/32"`, `"4 -1/32"`, `"1/32"`).
     - Mixed fraction parsing and formatting (`formatFractionForDisplay`, `parseFractionString`) supporting ASCII, hyphenated (`1-13/16`), and Unicode vulgar fractions (`½`, `¼`, `¾`, `⅝`, etc.).
     - Improper fraction mode (`fraction_improper`: `11/8`, `3/2`).
     - Smart culinary fraction formatting (`formatCulinaryFraction`).
   - **Compound Measurement Resolution (`parseCompoundValue`, `isCompoundLike`)**:
     - Mixed length expressions: `"5 ft 10 in"`, `"5'11"`, `"5' 11\""`.
     - Mixed weight/mass expressions: `"2 lbs 4 oz"`, `"5 lb 8 oz"`.
     - Mixed time expressions: `"1 hr 30 min 15 sec"`.
     - Kitchen measuring drawer breakdowns (`getKitchenDrawerBreakdown`): converts odd fractional measures into practical real-world drawer tools (e.g., `34 mL` -> `"2 tbsp + 1 tsp"`, `13/16 cup` -> `"3/4 cup + 1 tbsp"`).
   - **Smart Equation Display (`getSmartEquationDisplay`)**: Formats clean hero equivalence equations with fraction and operator awareness.
   - Dynamic step-by-step formula generation for every unit pair (`getFormulaString`, `getFormulaDetails`).
   - Generates instant comparison benchmark tables (1 to 1,000) and all-units equivalence grids (`getQuickReferenceTable`).

2. **Model Context Protocol (MCP) Server (`src/engine/mcpTools.js`, `api/mcp.js`, `bin/mcp.mjs`)**:
   - Full MCP implementation supporting 4 AI agent tools: `convert_units`, `parse_and_convert`, `list_units`, `get_reference_table`.
   - Dual transport support:
     - **Stdio transport** (`bin/mcp.mjs`) for local desktop environments (Claude Desktop, Cursor, Antigravity).
     - **HTTP JSON-RPC 2.0 transport** (`api/mcp.js`) on Vercel Serverless Functions for remote web agents and microservices.
   - Exposes comprehensive server metadata (`MCP_SERVER_INFO`) and tool schemas for LLM tool calling.

3. **Public Serverless REST API (`api/convert.js`, `api/units.js`)**:
   - Free, CORS-enabled endpoints on Vercel.
   - Natural language queries: `GET /api/convert?q=100+km+to+miles`.
   - Structured unit queries: `GET /api/convert?from=km&to=mi&val=100`.
   - Direct JSON body POST queries: `POST /api/convert` (`{ "from": "km", "to": "mi", "value": 100 }`).
   - Compound unit resolution payload: returns `isCompound: true` and `compoundDisplay` (e.g. `5 ft 10 in = ~177.8 cm`).
   - Unit directory: `GET /api/units?cat=temperature`.

4. **Universal Omnibox & Natural Language Query Parser (`src/engine/parser.js`)**:
   - Parses natural queries on the fly: `"100 km to miles"`, `"72 f in c"`, `"150 lbs into kg"`, `"1 cup to ml"`, `"500 sq ft to m²"`.
   - Compound measurement parsing: `"5'11 to cm"`, `"5 ft 10 in to cm"`, `"2 lbs 4 oz to g"`, `"1 hr 30 min in seconds"`.
   - Word numbers and fractional amounts: `"half a cup to tbsp"`, `"quarter cup to ml"`, `"a mile in feet"`.
   - Typo-tolerant unit matching and conversational questions: `"what is 100 km in miles"`, `"celcius to fahrenheit"`.
   - Colloquial trade phrase parsing: `"1 gold oz to grams"`, `"10 gold oz in kg"`, `"16 hands to feet"`, `"2000 food calories to kj"`, `"32 tire psi to bar"`, `"10 thou to mm"`, `"5 crude oil barrels to gal"`.
   - Semantic topic & keyword discovery (`findTopicUnits`): Searching topic keywords (e.g. `"gold"`, `"jewelry"`, `"astronomy"`, `"space"`, `"diamond"`, `"tire pressure"`, `"hvac"`, `"ev"`) matches unit subtitles, badges, and roots, returning 1-click unit recommendation cards directly in the Omnibox.
   - Single-unit exploration with sensible complementary defaults (`COMPLEMENTARY_PAIRS`: e.g. `"50 mph"` -> km/h, `"miles"` -> km, `"gold oz"` -> g).
   - Category navigation keywords (`CATEGORY_SYNONYMS`) and multi-result suggestion palette (`getSearchSuggestions`).
   - Omnibox with hotkey (`/`) focus, live preview match banner, and clear keyboard navigation.

5. **SEO, Clean Route Architecture & AI Discoverability (`src/engine/urlRouter.js`, `src/engine/seo.js`, `scripts/generateSitemap.mjs`, `scripts/prerender.mjs`, `public/llms.txt`)**:
   - Dynamic high-CTR SEO and SERP metadata generator (`src/engine/seo.js`: `getSeoMetadata`).
   - Programmatic unit-pair URLs (`/convert/:from-to-:to`, `/convert/:val-:from-to-:to`).
   - **Semantic Default & Cross-Domain Disambiguation (`getDefaultCategoryForPair`, `parseRoute`, `formatRoutePath`)**:
     - Resolves the single category pair collision across all 22 domains (`cooking` vs `volume` sharing 9 liquid units).
     - Pairs involving culinary measuring tools (`cup_us`, `tbsp_us`, `tsp_us`, `stick_butter`, `pinch`, `dash`, etc.) default cleanly to **Cooking** (`/convert/cup-to-tbsp`).
     - Pure fluid and bulk measures (`l`, `ml`, `gal_us`, `qt_us`, `pt_us`, `floz_us`) default cleanly to **Volume** (`/convert/l-to-gal_us`).
     - Cross-domain exceptions retain 100% state precision via explicit query params (`?cat=cooking`, `?cat=volume`, or `?kitchen=1`).
     - Deduplicates the 72 shared pairs in `getAllUnitPairs()` ensuring zero duplicate paths in `sitemap.xml` and pre-rendered builds.
   - Automated sitemap generator indexing **2,648 unique canonical URLs** in `public/sitemap.xml`.
   - Pre-rendered static HTML generator creating **2,673 static routes** (including dedicated high-volume aliases like `lbs-to-kg`, `miles-to-km`, `cups-to-ml`).
   - Structured JSON-LD schema (`WebApplication` and `FAQPage`) dynamically injected for Google rich snippets.
   - Machine-readable LLM manifest (`public/llms.txt`) detailing developer endpoints, supported categories, and popular conversions for AI web crawlers.

6. **Google Material 3 Rounded Design System (`src/App.css`, `src/index.css`)**:
   - **Full Pill & Floating Capsule Geometry**:
     - Main inputs (`.ct-integrated-input-box`) and Omnibox search bar use `border-radius: var(--radius-full)` (9999px) capsules.
     - Interactive full-name unit selector chips (`.ct-unit-selector-chip`: `[ Millimeter  mm  ▾ ]`) sit inside the pod header as clean Material pills with surface contrast and zero resting shadow, elevating on hover.
     - Primary cards (`.ct-card`, `.ct-table-card`, `.ct-history-section`, modals, SEO guides) use `--radius-card: 38px`.
     - Secondary nested surfaces and cards use `--radius-surface: 18px`.
     - Strict **Concentric Geometry** formula: $R_{\text{outer}} (38\text{px}) = R_{\text{inner}} (18\text{px}) + \text{Padding} (20\text{px} / 1.25\text{rem})$.
     - Filter tags and dropdown results use `--radius-chip: 14px`.
   - **Unified Unit Pod Architecture (`.ct-unit-block`)**:
     - Organizes the "From" and "To" sides into two distinct, soft surface workstations (`background-color: var(--bg-card-subtle)`, `border-radius: var(--radius-card)`, `border: 1px solid transparent;`) without harsh border lines.
     - Leverages Gestalt *Law of Common Region*: enclosing both the unit selector dropdown chip and the numeric input directly inside the unified pod surface establishes an unmistakable, immediate visual connection between each unit and its value.
     - The pod itself serves as the interactive workstation: the interactive unit selector chip (`[ Millimeter  mm  ▾ ]`) sits at the top as a clean Material pill, while the numeric input renders seamlessly onto the pod canvas without an inner floating capsule box, completely eliminating nested "Russian doll" pill-on-pill clunkiness.
     - The circular swap button (`.ct-swap-btn`) rests as a flat, soft-gray dial (`background: var(--bg-card-subtle)`) bridging the pods, blooming with responsive lift on hover.
   - **Seamless Interactive Inputs with Ambient Pod Elevation**:
     - Zero hard outline borders (`border: 1px solid transparent`).
     - Numeric input renders directly onto the pod canvas (`background: transparent; border: none;`).
     - Crisp floating focus state: focusing the input gently elevates the entire pod workstation (`transform: translateY(-1.5px)` with ambient soft blur `var(--shadow-google-sm)`), giving users clear tactile focus feedback with zero border rings or jarring outline strokes.
   - **Single Hero Accent in Workbenches**:
     - The converted result pill (`.ct-num-copy-btn`) is the **sole vibrant, category-colored hero element inside the conversion card** (`background: var(--cat-current-light); color: var(--cat-current)`).
     - All surrounding controls—unit selector chips, center swap button, input borders, carets, precision dropdown, kitchen toggle, and educational formulas—are calm, refined monochrome.
     - Commands 100% of the user's visual attention directly to the calculated answer.
   - **Zero-Divider & Zero-Box Lower Section (`.ct-footnote-card`)**:
     - The lower portion is completely free of enclosing boxes and dividing lines (`background: transparent; border: none; box-shadow: none; border-top: none`).
     - Replaces artificial hairline divider rules with natural, generous vertical whitespace (`0.2rem`–`0.35rem`).
     - The hero equation (`[ 0.03937 in ] ≈ [ 1 mm 📋 ]`) floats freely on the card canvas.
     - The educational formula and instructions sit below as a quiet, borderless typographic caption strip with soft subtle hover capsules.
   - **Expanded 7-Tier Precision Selector**:
     - Supports `auto` (Smart auto-precision), `2` (2 Decimals), `4` (4 Decimals), `exact` (Full floating precision), `fraction_tape` (Tape measure `1/16″ ± 1/32″`), `fraction` (Mixed fractions `1 ⅜`), and `fraction_improper` (Improper fractions `11/8`).
   - **Typographic `<Fraction />` Component (`src/components/Fraction.jsx`)**:
     - Standalone typography component rendering true diagonal fractions with balanced numerator and denominator proportions across both the workbench, tape measure results, and the benchmark table.
   - **Vector `<BrandLogo />` Component (`src/components/BrandLogo.jsx`)**:
     - Custom SVG dual-arrow emblem with independent arrow groups enabling category transitions and interactive animations.
   - **Dual-Arrow Conveyor Handoff Animation**:
     - When changing categories in `Header.jsx`, a 720ms conveyor animation smoothly rolls the outgoing arrow out down-right into the nav pill mask while the incoming category arrow rolls in up-left.
   - **Brand Turbine Easter Egg**:
     - Rapid repeated clicks on the brand logo trigger an animated 360-degree turbine spin.
   - **Footer Signature Hover Gestures & Dynamic Illumination**:
     - Footer category links feature custom keyframe animations (ruler wobble, scale rock, thermometer rise, compass spin) with dynamic category brand color illumination on hover.
   - **Smart Responsive Navigation with Smart Headroom**:
     - **Responsive Hybrid**: Floats as an ambient Material 3 capsule pill on desktop (`border-radius: var(--radius-full)`, `box-shadow: var(--shadow-google-md), var(--shadow-specular)`) and docks flush edge-to-edge on mobile to maximize touch targets and Omnibox input width.
     - **Smart Headroom Dynamics**: Gracefully glides up out of view on scroll down (`translateY(-135%)`), granting 100% immersive reading space for tables and guides, and immediately glides back down on scroll up (`translateY(0)`). Always stays visible at top of page or when search has keyboard focus.
   - **Zero Auto-Focus Stealing**: Focus is strictly user-initiated (tapping an input, pressing `/`, or clicking Clear). Programmatic focus is never called on category switches, unit changes, or swaps, ensuring mobile virtual keyboards never pop up unprompted.
   - **Developer Modal (`src/components/DeveloperModal.jsx`)**: Live interactive API tester and 1-click Claude Desktop configs.
   - Starred favorites bar, recent history drawer, and searchable unit dropdowns.

7. **Monetization & AdSense Readiness (`src/components/AdSlot.jsx`, `public/ads.txt`)**:
   - Google AdSense verified with authorized `ads.txt` publisher record (`pub-2469761428575146`).
   - Prepared zero-CLS ad placement slots (`side-rail` slot `8779651833`, `mid-content` slot `1723113883`).
   - Compliant Privacy Policy and Terms of Service modals.

---

## 3. Directory Structure

```
convertThings/
├── api/
│   ├── convert.js             # Vercel serverless REST API endpoint (GET & POST)
│   ├── mcp.js                 # Vercel serverless MCP JSON-RPC 2.0 remote endpoint
│   └── units.js               # Vercel serverless units directory endpoint
├── bin/
│   ├── cli.mjs                # Standalone CLI converter (node bin/cli.mjs "100 km to miles")
│   └── mcp.mjs                # Stdio MCP Server executable for Claude Desktop / Cursor
├── build/                     # Production distribution bundle
├── public/                    # Static public assets
│   ├── 404.html               # Static fallback route for GitHub Pages / static servers
│   ├── ads.txt                # Google AdSense publisher verification
│   ├── favicon-32.png
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── index.html             # SEO-optimized HTML5 shell with OpenGraph, Twitter, AdSense
│   ├── llms.txt               # LLM discovery manifest and AI agent reference guide
│   ├── logo-black.png
│   ├── logo-white.png
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json          # Web app manifest
│   ├── privacy.html           # Standalone legal privacy policy
│   ├── robots.txt             # Crawl directives with sitemap index
│   ├── sitemap.xml            # 2,648 auto-generated canonical URLs (2,673 pre-rendered routes)
│   └── terms.html             # Standalone terms of service
├── scripts/
│   ├── generateIcons.mjs      # Brand asset & favicon generator from source logo
│   ├── generateSitemap.mjs    # Automated sitemap generation script (2,648 URLs)
│   ├── prerender.mjs          # Static HTML pre-rendering generator (2,673 routes)
│   └── test-api.mjs           # Serverless API and MCP integration test suite
├── src/
│   ├── assets/
│   │   ├── logo-black.svg     # Source monochrome dark logo
│   │   └── logo-white.svg     # Source monochrome light logo
│   ├── components/
│   │   ├── AdSlot.jsx             # Non-intrusive reserved ad containers (zero CLS)
│   │   ├── BrandLogo.jsx          # Vector brand logo with independent animated arrow paths
│   │   ├── CategoryNav.jsx        # Responsive horizontal category tabs
│   │   ├── ConversionCard.jsx     # Core interactive bidirectional conversion panel
│   │   ├── ConversionCard.test.js # Unit tests for ConversionCard workbench
│   │   ├── ConversionHistory.jsx  # Recent conversion drawer with 1-click reload
│   │   ├── ConversionHistory.test.js # Unit tests for conversion history drawer
│   │   ├── ConversionTable.jsx    # Benchmark value comparison & all-units equivalence
│   │   ├── DeveloperModal.jsx     # Developer & AI MCP modal with live API playground
│   │   ├── FavoritesBar.jsx       # Pinned conversions bar
│   │   ├── Footer.jsx             # Accessible footer with category index and standards
│   │   ├── Fraction.jsx           # Typographic diagonal fraction renderer component
│   │   ├── Fraction.test.js       # Unit tests for typographic Fraction component
│   │   ├── Header.jsx             # Branding, AI & API modal trigger, theme switch
│   │   ├── Icons.jsx              # Standalone, zero-dependency SVG icon system
│   │   ├── LegalModal.jsx         # Accessible Privacy, Terms, and About modal dialog
│   │   ├── Omnibox.jsx            # Universal natural language search bar with shortcut '/'
│   │   ├── Omnibox.test.js        # Unit tests for Omnibox search and suggestions
│   │   ├── SeoContent.jsx         # Category guides, FAQs, and Schema.org JSON-LD injection
│   │   └── Toast.jsx              # Accessible non-intrusive alert toasts
│   ├── engine/
│   │   ├── conversions.js         # Core measurement definitions, NIST factors, formatters
│   │   ├── conversions.test.js    # Unit tests for conversion calculations and formatters
│   │   ├── mcpTools.js            # MCP tool definitions and execution dispatcher
│   │   ├── mcpTools.test.js       # Jest tests for MCP engine
│   │   ├── parser.js              # Natural language query tokenizer and matching engine
│   │   ├── parser.test.js         # Jest tests for NLP parser and compound matching
│   │   ├── seo.js                 # Dynamic SEO & SERP metadata generator
│   │   ├── seo.test.js            # Unit tests for SEO title and description generation
│   │   ├── urlRouter.js           # Bidirectional URL slug and query parser/formatter
│   │   └── urlRouter.test.js      # Jest tests for URL router
│   ├── hooks/
│   │   ├── useLocalStorage.js     # Safe localStorage state persistence hook
│   │   └── useTheme.js            # Dark/light theme state & document attribute manager
│   ├── App.css                    # Modern CSS variable design system & responsive layout
│   ├── App.jsx                    # Root state coordinator, URL synchronization, and events
│   ├── App.test.js                # Core web integration and unit test suite
│   ├── index.css                  # CSS resets, typography, and CSS theme tokens
│   ├── index.js                   # Application entry point (React 18 createRoot)
│   ├── reportWebVitals.js         # Core Web Vitals monitor
│   ├── setupProxy.js              # Webpack dev server middleware
│   └── setupTests.js              # Jest DOM matcher setup
├── .gitignore
├── AGENTS.md                      # AI agent & developer guide
├── FUTURE.md                      # Long-term scaling & monetization roadmap
├── package.json                   # Dependencies, binary definitions, and npm scripts
├── README.md                      # Public project documentation & quickstart
└── vercel.json                    # Vercel deployment rewrites for API and SPA
```

---

## 4. Measurement Categories (22 Domains, 228 Units)

1. **Length & Distance (`length` - 18 units)**: Meter, Kilometer, Centimeter, Millimeter, Micrometer, Nanometer, Mile, Yard, Foot, Inch, Nautical Mile, Light-Year, Astronomical Unit, Parsec, Ångström, Mil / Thou, Fathom, Hand.
2. **Weight & Mass (`mass` - 17 units)**: Kilogram, Gram, Milligram, Microgram, Metric Ton, Pound, Ounce, Stone, US Short Ton, Imperial Long Ton, Carat, Grain, Troy Ounce, Pennyweight, Dalton (Atomic Mass Unit), Slug, Metric Quintal.
3. **Temperature (`temperature` - 4 units)**: Celsius, Fahrenheit, Kelvin, Rankine.
4. **Area (`area` - 10 units)**: Square Meter, Square Kilometer, Square Centimeter, Square Millimeter, Square Mile, Square Yard, Square Foot, Square Inch, Acre, Hectare.
5. **Volume & Capacity (`volume` - 23 units)**: Liter, Milliliter, Centiliter, Deciliter, Cubic Meter, Cubic Centimeter, US Gallon, US Quart, US Pint, Imperial Pint, Imperial Quart, US Cup, US Fluid Ounce, US Tablespoon, US Teaspoon, Imperial Gallon, Imperial Fluid Ounce, Oil Barrel, Cubic Foot, Cubic Yard, Cubic Inch, Microliter, Bushel (US Dry).
6. **Speed (`speed` - 6 units)**: Meter per Second, Kilometer per Hour, Mile per Hour, Knot, Foot per Second, Mach (Standard Sea Level).
7. **Time (`time` - 12 units)**: Second, Millisecond, Microsecond, Nanosecond, Minute, Hour, Day, Week, Month (Average), Year (365.25 days), Decade, Century.
8. **Digital Storage (`digital` - 15 units)**: Bit, Nibble, Byte, Kilobyte (Decimal), Kibibyte (Binary), Megabyte (Decimal), Mebibyte (Binary), Gigabyte (Decimal), Gibibyte (Binary), Terabyte (Decimal), Tebibyte (Binary), Petabyte (Decimal), Pebibyte (Binary), Exabyte (Decimal), Exbibyte (Binary).
9. **Data Transfer Rate (`data_rate` - 11 units)**: Bit per Second, Kilobit per Second, Megabit per Second, Gigabit per Second, Terabit per Second, Byte per Second, Kilobyte per Second, Megabyte per Second, Mebibyte per Second, Gigabyte per Second, Terabyte per Second.
10. **Pressure (`pressure` - 13 units)**: Pascal, Kilopascal, Megapascal, Bar, Millibar, Pound per Square Inch, Kilopound per Square Inch (ksi), Standard Atmosphere, Torr / mmHg, Inch of Mercury, Hectopascal, Inch of Water, Centimeter of Water.
11. **Energy (`energy` - 11 units)**: Joule, Kilojoule, Calorie (Gram/Small), Kilocalorie (Food Calorie), Watt-hour, Kilowatt-hour, Megawatt-hour, Electronvolt, British Thermal Unit, Therm, Foot-pound.
12. **Power (`power` - 8 units)**: Watt, Milliwatt, Kilowatt, Megawatt, Horsepower (Mechanical/US), Metric Horsepower (PS), BTU per Hour, Ton of Refrigeration.
13. **Angle (`angle` - 6 units)**: Degree, Radian, Gradian, Arcminute, Arcsecond, Revolution (Turn).
14. **Fuel Economy (`fuel` - 6 units)**: Liters per 100 km, Miles per Gallon (US), Miles per Gallon (UK), Kilometers per Liter, Miles per kWh, kWh per 100 km.
15. **Kitchen Mode (`cooking` - 19 units)**: Milliliter, US Cup, Metric Cup, US Tablespoon, Metric Tablespoon, US Teaspoon, Dessertspoon, Fluid Ounce, Standard Shot (Jigger), Pinch, Dash, Tad, Smidgen, Drop, Stick of Butter (US), Liter, US Pint, US Quart, US Gallon.
16. **Frequency (`frequency` - 8 units)**: Hertz, Kilohertz, Megahertz, Gigahertz, Terahertz, Revolutions per Minute, Radians per Second, Degrees per Second.
17. **Torque (`torque` - 6 units)**: Newton-meter, Pound-foot, Pound-inch, Kilogram-force Meter, Kilonewton-meter, Ounce-force Inch.
18. **Force (`force` - 8 units)**: Newton, Kilonewton, Meganewton, Pound-force, Kilogram-force, Dyne, Kip, Ounce-force.
19. **Volumetric Flow Rate (`flow_rate` - 7 units)**: Cubic Feet per Minute, Liter per Second, Liter per Minute, Cubic Meter per Hour, Cubic Meter per Second, US Gallon per Minute, US Gallon per Hour.
20. **Typography & Screen Resolution (`typography` - 7 units)**: Pixel, Point, Rem, Em, Pica, CSS Inch, CSS Millimeter.
21. **Electric Current & Battery Charge (`current` - 8 units)**: Ampere, Milliampere, Microampere, Kiloampere, Ampere-hour, Milliampere-hour, Abampere (Biot), Statampere.
22. **Illuminance (`illuminance` - 5 units)**: Lux, Foot-candle, Phot, Nox, Kilolux.

---

## 5. Development Workflow & Scripts

### Commands
- **Install Dependencies:**
  ```powershell
  npm install
  ```
- **Start Local Development Server:**
  ```powershell
  npm start
  ```
- **Execute Test Suite (Jest):**
  ```powershell
  $env:CI="true"; npm test -- --runInBand
  ```
  Runs all **337 unit and integration tests across 11 suites** without hanging.
- **Execute API & MCP Test Suite:**
  ```powershell
  npm run test:api
  ```
  Executes 28 serverless & MCP assertions across REST endpoints and JSON-RPC dispatchers.
- **Run Local MCP Server (Stdio):**
  ```powershell
  npm run mcp
  ```
- **Compile Production Build:**
  ```powershell
  npm run build
  ```
  Prebuild generates brand icons and canonical sitemap with 2,648 URLs, builds the optimized production bundle, and postbuild runs static pre-rendering generating 2,673 static routes.

---

## 6. Guidelines for Contributors and AI Agents

1. **Preserve Exact Mathematical Precision:**
   - Any added unit factors must follow official NIST / SI / ISO 80000 definitions.
   - Use `formatNumber` from `src/engine/conversions.js` to ensure clean representation without floating-point artifacts.
2. **Keep Zero-CLS Guarantee:**
   - All layout elements, cards, and ad placeholders must maintain stable layout dimensions to guarantee a 100% Core Web Vitals score.
3. **SEO & Routing Integrity:**
   - Any modifications to URL parsing in `src/engine/urlRouter.js` or metadata generation in `src/engine/seo.js` must be covered by unit tests in `src/engine/urlRouter.test.js` and `src/engine/seo.test.js`.
   - Never break static files (`ads.txt`, `sitemap.xml`, `robots.txt`, `llms.txt`).
4. **Adhere to Google Material 3 Design Tokens & Concentric Geometry:**
   - Always preserve the unified concentric corner radius scale (`--radius-card: 38px`, `--radius-surface: 18px`, `--radius-chip: 14px`, `--radius-pill: 9999px`).
   - Maintain the concentric alignment equation: Outer card radius ($38\text{px}$) = Inner nested surface radius ($18\text{px}$) + Card uniform padding ($20\text{px} / 1.25\text{rem}$). Action buttons with $36\text{px}$ height ($R = 18\text{px}$) also satisfy $18\text{px} + 20\text{px} = 38\text{px}$.
   - Omnibox dropdown maintains local menu concentricity: container radius $20\text{px}$, padding $8\text{px}$, item radius $12\text{px}$ ($12 + 8 = 20$).
   - Never use single-sided `border-left` on rounded surface cards (which bends around corner arcs into a "bent noodle"); use an absolute `::before` pseudo-element straight accent bar with inset top/bottom stops (`top: 14px; bottom: 14px;`).
   - Active table row highlights (`.ct-row-current`) must have rounded capsule ends (`10px` border-radius on outer cells) rather than sharp 90° rectangular blocks.
   - Lock interactive card text & icon vertical baselines (`min-height: 48px; line-height: 1`).
   - Use multi-tier ambient shadows (`--shadow-google-sm`, `--shadow-google-md`, `--shadow-google-lg`) and kinetic spring easing (`--ease-spring`).
   - Maintain the smart navigation hierarchy: ambient floating capsule on desktop, edge-to-edge docked on mobile, and smart headroom scroll dynamics.
5. **Zero-Border, Surface-Driven Architecture & Strict Binary Elevation Model (App-Wide)**:
   - Enforce a strict binary elevation model: elements are either **Clearly Raised** with generous multi-tier ambient shadows (primary cards, floating inputs, modal dialogs, and popover menus) or **Completely Flat** at rest and in interaction (zero micro-shadows, glow halos, or 1px–3px drop shadows on category chips, the search `"/"` shortcut key badge, favorite pills, precision toggles, unit chips, dropdown search boxes, badges, or secondary action buttons). Surface contrast, geometry, and crisp typography carry visual separation.
   - Avoid reintroducing harsh wireframe outlines, boxed sub-containers, or horizontal divider lines across any card or component. Always rely on natural surface contrast (`--bg-card` vs `--bg-card-subtle`), dual-layer ambient shadows (`--shadow-google-sm`, `--shadow-google-md`, `--shadow-google-lg`) for raised containers, and calibrated whitespace.
   - Applies universally across:
     - **Main Workbench**: borderless pods (`.ct-unit-block`), floating inputs, flat unit selector chips, flat swap dial, dissolved zero-divider footer.
     - **Navigation & Category Bar**: flat category tabs (`.ct-category-tab`, `.ct-category-tab.active`), flat `"/"` search shortcut badge (`.ct-omnibox-shortcut`), flat favorite pills (`.ct-favorite-pill`), and flat expand button.
     - **Reference Table & All Units Grid**: borderless `.ct-table-card`, header, flat tab pill container, and flat `.ct-unit-stat-card` cards.
     - **Recent Conversions Drawer**: borderless `.ct-history-section`, flat `.ct-history-item` cards, and pill buttons.
     - **Universal Omnibox**: borderless floating `.ct-omnibox-wrapper`, `.ct-omnibox-dropdown`, `.ct-omnibox-preview`, and badges with neutral focus ring.
     - **SEO Guides & FAQs**: borderless primary dossier `.ct-seo-guide` and `.ct-faq-card`, interactive `.ct-pair-card`, and soft flat accordion `.ct-faq-item` cards with active category accent.
     - **Kitchen View Drawer**: borderless `.ct-kitchen-drawer-card`, flat `.ct-kitchen-tool-chip` pills, and `.ct-kitchen-equiv-pill` cards.
     - **Developer & Legal Modals**: borderless `.ct-modal-dialog`, `.ct-dev-card`, `.ct-tester-input`, flat tabs, and flat action buttons.
6. **Unified Kinetic Hover & Active Click Framework (Pure Surface Stability & Tactile Precision)**:
   - All interactive controls adhere to a 4-tier kinetic interaction hierarchy with **zero background color flashing and zero border outline popping** on standalone buttons, pills, chips, dials, and cards:
     - **Tier 1 & 2 (Pills, Chips, Dial Buttons, Action Buttons)**:
       - Resting: flat surface background (`var(--bg-card)` or `var(--bg-card-subtle)`), `box-shadow: none; border-color: transparent;`
       - Hover: **Pure Surface Stability** — background color **never changes**, borders remain **completely transparent** (`border-color: transparent;`), and zero drop shadows are added. Responsiveness is communicated strictly through kinetic lift (`transform: translateY(-1.5px)` or radial `scale(1.08)` for the swap dial) and text/icon color deepening (`color: var(--text-main)`).
       - Active (`:active`): mechanical snap (`transform: translateY(0) scale(0.96)` or `scale(0.94)` for dial; `transition: transform 0.06s ease;`) with constant background (zero background flash).
     - **Tier 3 (Surface Cards & Interactive Items)**:
       - Resting: flat surface background (`var(--bg-card-subtle)`), `box-shadow: none; border-color: transparent;`
       - Hover: background color remains constant (`var(--bg-card-subtle)`), borders remain transparent (`border-color: transparent;`); `transform: translateY(-1.5px)` (or `-2px`), text deepens to `var(--text-main)`.
       - Active (`:active`): `transform: translateY(0) scale(0.985); transition: transform 0.06s ease;` with constant background.
     - **Dropdown & Menu Rows (Row Highlight Exception)**:
       - Because borderless list rows and menu items lack container borders at rest, they communicate mouse targeting through row highlight:
       - Hover: zero vertical translation (`translateY(0)`) to eliminate list-scrubbing jitter + `background-color: var(--bg-hover);`.
       - Active (`:active`): `transform: scale(0.985); background-color: var(--bg-active); transition: transform 0.06s ease;`.
     - **Tier 4 (Inline / Typographic Links)**:
       - Hover: typographic color shift and contrast without vertical translation.
       - Active (`:active`): `transform: scale(0.96);` or `opacity: 0.75; transition: transform 0.06s ease;`.
7. **Preserve the Single Hero Accent Rule**:
   - Within interactive conversion cards, maintain strict monochrome calm across secondary controls, unit chips, swap buttons, and formula captions. The converted result pill (`.ct-num-copy-btn`) must remain the sole colorful hero focal point on the card.
8. **Respect Intentional Focus (No Auto-Focus Stealing):**
   - Never call `.focus()` or `autoFocus` programmatically on category switches, unit changes, favorite loading, or swap operations.
   - Preserving passive focus prevents mobile virtual keyboards from jumping into view and obscuring results, and prevents desktop scroll hijacking.
9. **Touchscreen Native Tactile Fidelity & Sticky Hover Elimination**:
   - **Zero Tap Highlight Overlays**: `-webkit-tap-highlight-color: transparent;` and `-webkit-touch-callout: none;` are applied globally across all interactive elements (`*, button, a, input, select, textarea, [role="button"]`) so mobile browsers never draw default semi-transparent blue or grey tap bounding rectangles.
   - **Zero Sticky Hover on Mobile**: Touchscreens simulate mouse events upon tap without firing `mouseleave` on lift. All kinetic hover lifts (`translateY(-1.5px)`, `scale(1.08)`) and hover shadows are strictly suppressed on touch devices (`@media (hover: none), (pointer: coarse)`) via `:hover:not(:active) { transform: none !important; }`. Mobile taps trigger instantaneous tactile active compression (`:active` with `scale(0.96)`) and immediately settle back flat with zero lingering hovering.
10. **Fraction & Compound Measurement Integrity**:
    - When modifying fraction formatting, tape measure calculations, or compound unit parsing, always ensure that:
      - Fractions are rendered cleanly using `<Fraction />` (`src/components/Fraction.jsx`) to avoid optical collisions in bold font weights.
      - Compound inputs (`parseCompoundValue`) correctly parse mixed units without allowing nonsensical cross-category terms.
      - Edge cases (such as zero values, negative numbers, improper fractions, vulgar fractions, and offset notation like `+1/32`) remain verified against `src/components/Fraction.test.js` and `src/engine/conversions.test.js`.
11. **Test Everything:**
    - Always run `$env:CI="true"; npm test -- --runInBand` and `npm run test:api` before concluding turns. Ensure all 248 unit/integration tests and 28 API assertions pass. When running tests, always use CI=true npm test -- <filepath> --watchAll=false --forceExit.
