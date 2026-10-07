# AGENTS.md

> Developer and AI Agent Guide for **ConvertThings** (Rebuilt & Modernized)

---

## 1. Project Overview

**ConvertThings** is a modern, high-precision, real-time unit conversion web platform built with React 18, Vercel Serverless Functions, and native Model Context Protocol (MCP) server integration. It provides instantaneous bidirectional unit conversion across 15 physical and computational measurement domains with over 120 standardized units, universal natural language query parsing, zero cumulative layout shift (CLS), dark/light mode, dynamic SEO metadata, Schema.org rich snippet schemas, a public REST API, and native AI agent tooling.

- **Repository:** [https://github.com/ashtonsprunger/convertthings.git](https://github.com/ashtonsprunger/convertthings.git)
- **Production URL / Homepage:** [https://www.convertthings.com](https://www.convertthings.com)
- **Remote MCP Endpoint:** `https://www.convertthings.com/api/mcp`
- **Public REST API:** `https://www.convertthings.com/api/convert`
- **Deployment Platform:** Vercel (Edge serverless functions + React SPA) & GitHub Pages (`gh-pages` branch)

---

## 2. Core Architecture & Highlights

1. **High-Precision Custom Conversion Engine (`src/engine/conversions.js`)**:
   - Zero-dependency, exact NIST/SI factor calculation engine.
   - Eliminates IEEE 754 floating-point artifacts (e.g., `0.30000000000000004` -> `0.3`).
   - Supports non-linear transformations (Celsius, Fahrenheit, Kelvin, Rankine) and reciprocal transformations (e.g. US mpg, Imperial mpg, L/100km, km/L).
   - Dynamic step-by-step formula generation for every unit pair.
   - Generates instant comparison benchmark tables (1 to 1,000) and all-units equivalence grids.

2. **Model Context Protocol (MCP) Server (`src/engine/mcpTools.js`, `api/mcp.js`, `bin/mcp.mjs`)**:
   - Full MCP implementation supporting 4 AI agent tools: `convert_units`, `parse_and_convert`, `list_units`, `get_reference_table`.
   - Dual transport support:
     - **Stdio transport** (`bin/mcp.mjs`) for local desktop environments (Claude Desktop, Cursor, Antigravity).
     - **HTTP JSON-RPC 2.0 transport** (`api/mcp.js`) on Vercel Serverless Functions for remote web agents and microservices.

3. **Public Serverless REST API (`api/convert.js`, `api/units.js`)**:
   - Free, CORS-enabled endpoints on Vercel.
   - Natural language queries: `GET /api/convert?q=100+km+to+miles`.
   - Structured unit queries: `GET /api/convert?from=km&to=mi&val=100`.
   - Unit directory: `GET /api/units?cat=temperature`.

4. **Universal Omnibox & Natural Language Query Parser (`src/engine/parser.js`)**:
   - Parses natural queries on the fly: `"100 km to miles"`, `"72 f in c"`, `"150 lbs into kg"`, `"1 cup to ml"`, `"500 sq ft to m²"`.
   - Omnibox with hotkey (`/`) focus and live preview match banner.

5. **SEO & Clean Route Architecture (`src/engine/urlRouter.js`, `scripts/generateSitemap.mjs`)**:
   - Programmatic unit-pair URLs (`/convert/:from-to-:to`, `/convert/:val-:from-to-:to`).
   - Dynamic document title and meta description updates.
   - Automated sitemap generator indexing 1,244 pair URLs in `public/sitemap.xml`.
   - Injects structured JSON-LD schema (`WebApplication` and `FAQPage`) dynamically into `<head>` for Google search rich snippets.

6. **Google Material 3 Rounded Design System (`src/App.css`, `src/index.css`)**:
   - **Full Pill & Floating Capsule Geometry**:
     - Main inputs (`.ct-integrated-input-box`) and Omnibox search bar use `border-radius: var(--radius-full)` (9999px) capsules.
     - Docked unit selectors (`.ct-integrated-unit-btn`) nest inside the input capsule as Material pill chips.
     - Primary cards (`.ct-card`, `.ct-table-card`, `.ct-history-section`, modals, SEO guides) use `--radius-card: 28px`.
     - Secondary surfaces and footers use `--radius-surface: 20px`.
     - Filter tags and dropdown results use `--radius-chip: 14px`.
   - **Multi-Tier Ambient Elevation & Lighting**:
     - Ambient shadows (`--shadow-google-sm`, `--shadow-google-md`, `--shadow-google-lg`) paired with specular inset highlight strokes (`--shadow-specular`) that adapt smoothly between light and dark modes.
     - Tactile spring easings (`--ease-spring: cubic-bezier(0.34, 1.45, 0.64, 1)` and `--ease-smooth: cubic-bezier(0.16, 1, 0.3, 1)`).
   - **Dual-Mode Architectural Hierarchy (Auto vs. Manual)**:
     - **Docked Header**: Sits flush at `top: 0` with edge-to-edge frosted glass (`backdrop-filter: blur(20px)`), allowing the Omnibox below to stand out as the **sole hero floating pill** on the page.
     - **Animated Omnibox**: Displays rotating double-quoted examples (`"100 km to miles"`, `"72°F in °C"`, `"1 cup to ml"`) with smooth vertical slide-and-fade transitions every 3.2s when unfocused.
     - **Mode Bridge Divider**: A clean, balanced hairline divider (`────────── or select units manually ──────────`) clearly distinguishing the fast Auto search above from the Manual interactive workbench below.
     - **Unified Mobile Steppers**: On mobile screens (`<= 680px`), increment and decrement buttons merge into a contiguous vertical capsule rocker beside the input, featuring top/bottom rounded caps and a hairline divider.
   - **Zero Auto-Focus Stealing**: Focus is strictly user-initiated (tapping an input, pressing `/`, or clicking Clear). Programmatic focus is never called on category switches, unit changes, or swaps, ensuring mobile virtual keyboards never pop up unprompted.
   - **Color-Highlighted Equation Readout**: Prominent live conversion statement (e.g. `1 ft = 12 in`) with high-contrast color badges and full-name captions.
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
│   ├── convert.js             # Vercel serverless REST API endpoint
│   ├── mcp.js                 # Vercel serverless MCP JSON-RPC 2.0 remote endpoint
│   └── units.js               # Vercel serverless units directory endpoint
├── bin/
│   ├── cli.mjs                # Standalone CLI converter (node bin/cli.mjs "100 km to miles")
│   └── mcp.mjs                # Stdio MCP Server executable for Claude Desktop / Cursor
├── build/                     # Production distribution bundle
├── public/                    # Static public assets
│   ├── ads.txt                # Google AdSense publisher verification
│   ├── favicon.ico
│   ├── index.html             # SEO-optimized HTML5 shell with OpenGraph, Twitter, AdSense
│   ├── privacy.html           # Standalone legal privacy policy
│   ├── robots.txt             # Crawl directives with sitemap index
│   ├── sitemap.xml            # 1,244 auto-generated unit pair URLs
│   └── terms.html             # Standalone terms of service
├── scripts/
│   ├── generateSitemap.mjs    # Automated sitemap generation script
│   └── test-api.mjs           # Serverless API and MCP integration test suite
├── src/
│   ├── components/
│   │   ├── AdSlot.jsx             # Non-intrusive reserved ad containers (zero CLS)
│   │   ├── CategoryNav.jsx        # Responsive horizontal category tabs
│   │   ├── ConversionCard.jsx     # Core interactive bidirectional conversion panel
│   │   ├── ConversionHistory.jsx  # Recent conversion drawer with 1-click reload
│   │   ├── ConversionTable.jsx    # Benchmark value comparison & all-units equivalence
│   │   ├── DeveloperModal.jsx     # Developer & AI MCP modal with live API playground
│   │   ├── FavoritesBar.jsx       # Pinned conversions bar
│   │   ├── Footer.jsx             # Accessible footer with category index and standards
│   │   ├── Header.jsx             # Branding, AI & API modal trigger, theme switch
│   │   ├── Icons.jsx              # Standalone, zero-dependency SVG icon system
│   │   ├── LegalModal.jsx         # Accessible Privacy, Terms, and About modal dialog
│   │   ├── Omnibox.jsx            # Universal natural language search bar with shortcut '/'
│   │   ├── SeoContent.jsx         # Category guides, FAQs, and Schema.org JSON-LD injection
│   │   └── Toast.jsx              # Accessible non-intrusive alert toasts
│   ├── engine/
│   │   ├── conversions.js         # Core measurement definitions, NIST factors, formatters
│   │   ├── mcpTools.js            # MCP tool definitions and execution dispatcher
│   │   ├── mcpTools.test.js       # Jest tests for MCP engine
│   │   ├── parser.js              # Natural language query tokenizer and matching engine
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
│   └── setupTests.js              # Jest DOM matcher setup
├── .gitignore
├── AGENTS.md                      # AI agent & developer guide
├── FUTURE.md                      # Long-term scaling & monetization roadmap
├── package.json                   # Dependencies, binary definitions, and npm scripts
├── README.md                      # Public project documentation & quickstart
└── vercel.json                    # Vercel deployment rewrites for API and SPA
```

---

## 4. Measurement Categories (15 Domains, 120+ Units)

1. **Length & Distance (`length`)**: Meter, Kilometer, Centimeter, Millimeter, Micrometer, Nanometer, Mile, Yard, Foot, Inch, Nautical Mile, Light-Year.
2. **Weight & Mass (`mass`)**: Kilogram, Gram, Milligram, Microgram, Metric Ton, Pound, Ounce, Stone, US Short Ton, Imperial Long Ton, Carat, Grain.
3. **Temperature (`temperature`)**: Celsius, Fahrenheit, Kelvin, Rankine.
4. **Area (`area`)**: Square Meter, Square Kilometer, Square Centimeter, Square Millimeter, Square Mile, Square Yard, Square Foot, Square Inch, Acre, Hectare.
5. **Volume & Capacity (`volume`)**: Liter, Milliliter, Cubic Meter, Cubic Centimeter, US Gallon, US Quart, US Pint, US Cup, US Fluid Ounce, US Tablespoon, US Teaspoon, Imperial Gallon, Imperial Fluid Ounce, Cubic Foot, Cubic Inch.
6. **Speed (`speed`)**: Meter per Second, Kilometer per Hour, Mile per Hour, Knot, Foot per Second, Mach.
7. **Time (`time`)**: Second, Millisecond, Microsecond, Nanosecond, Minute, Hour, Day, Week, Month, Year, Decade, Century.
8. **Digital Storage (`digital`)**: Bit, Byte, Kilobyte, Kibibyte, Megabyte, Mebibyte, Gigabyte, Gibibyte, Terabyte, Tebibyte, Petabyte.
9. **Data Transfer Rate (`data_rate`)**: bps, Kbps, Mbps, Gbps, B/s, KB/s, MB/s, GB/s.
10. **Pressure (`pressure`)**: Pascal, Kilopascal, Megapascal, Bar, Millibar, PSI, Standard Atmosphere, Torr/mmHg, Inch of Mercury, Hectopascal.
11. **Energy (`energy`)**: Joule, Kilojoule, Calorie, Kilocalorie, Watt-hour, Kilowatt-hour, Electronvolt, BTU, Foot-pound.
12. **Power (`power`)**: Watt, Kilowatt, Megawatt, Mechanical HP, Metric HP, BTU/hour.
13. **Angle (`angle`)**: Degree, Radian, Gradian, Arcminute, Arcsecond, Revolution.
14. **Fuel Economy (`fuel`)**: Liters per 100km, US MPG, UK Imperial MPG, km/L.
15. **Cooking & Kitchen (`cooking`)**: US Cup, US Tablespoon, US Teaspoon, Fluid Ounce, Milliliter, Liter, Pinch, Dash, Drop, Stick of Butter.

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
  $env:CI="true"; npm test
  ```
  Runs all 166 unit and integration tests across 6 suites without hanging.
- **Execute API & MCP Test Suite:**
  ```powershell
  npm run test:api
  ```
- **Run Local MCP Server (Stdio):**
  ```powershell
  npm run mcp
  ```
- **Compile Production Build:**
  ```powershell
  npm run build
  ```
  Prebuild generates sitemap with 1,244 URLs and creates optimized bundle with zero warnings.

---

## 6. Guidelines for Contributors and AI Agents

1. **Preserve Exact Mathematical Precision:**
   - Any added unit factors must follow official NIST / SI / ISO 80000 definitions.
   - Use `formatNumber` from `src/engine/conversions.js` to ensure clean representation without floating-point artifacts.
2. **Keep Zero-CLS Guarantee:**
   - All layout elements, cards, and ad placeholders must maintain stable layout dimensions to guarantee a 100% Core Web Vitals score.
3. **SEO & Routing Integrity:**
   - Any modifications to URL parsing in `src/engine/urlRouter.js` must be covered by unit tests in `src/engine/urlRouter.test.js`.
   - Never break static files (`ads.txt`, `sitemap.xml`, `robots.txt`).
4. **Adhere to Google Material 3 Design Tokens:**
   - Always preserve the unified corner radius scale (`--radius-card: 28px`, `--radius-surface: 20px`, `--radius-chip: 14px`, `--radius-pill: 9999px`).
   - Use multi-tier ambient shadows (`--shadow-google-sm`, `--shadow-google-md`, `--shadow-google-lg`) and kinetic spring easing (`--ease-spring`).
   - Maintain the dual-mode hierarchy: docked flush header, hero floating Omnibox with animated placeholder, clean mode divider, and conjoined vertical mobile steppers.
5. **Respect Intentional Focus (No Auto-Focus Stealing):**
   - Never call `.focus()` or `autoFocus` programmatically on category switches, unit changes, favorite loading, or swap operations.
   - Preserving passive focus prevents mobile virtual keyboards from jumping into view and obscuring results, and prevents desktop scroll hijacking.
6. **Test Everything:**
   - Always run `$env:CI="true"; npm test` and `npm run test:api` before concluding turns.
