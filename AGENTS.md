# AGENTS.md

> Developer and AI Agent Guide for **ConvertThings** (Rebuilt & Modernized)

---

## 1. Project Overview

**ConvertThings** is a modern, high-precision, real-time unit conversion web application built with React 18. It provides instantaneous bidirectional unit conversion across 15 physical and computational measurement domains with over 120 standardized units, universal natural language query parsing, zero cumulative layout shift (CLS), dark/light mode, dynamic SEO metadata, and Schema.org rich snippet schemas.

- **Repository:** [https://github.com/ashtonsprunger/convertthings.git](https://github.com/ashtonsprunger/convertthings.git)
- **Production URL / Homepage:** [https://convertthings.com](https://convertthings.com)
- **Deployment Platform:** GitHub Pages (via `gh-pages` branch deployment)

---

## 2. Core Architecture & Highlights

1. **High-Precision Custom Conversion Engine (`src/engine/conversions.js`)**:
   - Zero-dependency, exact NIST/SI factor calculation engine.
   - Eliminates IEEE 754 floating-point artifacts (e.g., `0.30000000000000004` -> `0.3`).
   - Supports non-linear transformations (Celsius, Fahrenheit, Kelvin, Rankine) and reciprocal transformations (e.g. US mpg, Imperial mpg, L/100km, km/L).
   - Dynamic step-by-step formula generation for every unit pair.
   - Generates instant comparison benchmark tables (1 to 1,000) and all-units equivalence grids.

2. **Universal Omnibox & Natural Language Query Parser (`src/engine/parser.js`)**:
   - Parses natural queries on the fly: `"100 km to miles"`, `"72 f in c"`, `"150 lbs into kg"`, `"1 cup to ml"`, `"500 sq ft to m²"`.
   - Omnibox with hotkey (`/`) focus, live preview match banner, and popular search chips.

3. **SEO & Discoverability (`src/components/SeoContent.jsx`, `public/index.html`)**:
   - Synchronizes current state to URL query parameters (`?cat=length&from=km&to=mi&v=100`) via `history.replaceState`.
   - Dynamically updates `document.title` and `<meta name="description">` on every unit or value change.
   - Injects structured JSON-LD schema (`WebApplication` and `FAQPage`) dynamically into `<head>` for Google search rich snippets and FAQ carousels.
   - Comprehensive educational guides, unit history, and conversion formulas indexed for search bots.

4. **Clean, Modern UI/UX (`src/App.css`, `src/index.css`)**:
   - Full dark and light mode with automatic system preference detection and localStorage persistence.
   - **Immediate Color-Highlighted Equation Readout**: Prominent live conversion statement (e.g. `1 ft = 12 in`) with high-contrast color badges and full-name captions right on the card for effortless reading.
   - Tactile animated swap button (`⇄`, shortcut: `Alt + S` or `s`).
   - Quick value modifiers (`= 1`, `+1`, `+10`, `2×`, `10×`, `½`).
   - One-click copy result (`📋`) with toast feedback.
   - Starred favorites bar with localStorage persistence.
   - Recent conversion history with one-click reload and clear.
   - Searchable, filterable unit selector dropdowns.

5. **Monetization Readiness (`src/components/AdSlot.jsx`)**:
   - Prepared zero-CLS ad placement slots (`top-banner`, `mid-content`) ready for Google AdSense or display networks when monetization is activated.

---

## 3. Directory Structure

```
convertThings/
├── build/                 # Production distribution bundle
├── public/                # Static public assets
│   ├── favicon.ico
│   ├── index.html         # SEO-optimized HTML5 shell with OpenGraph, Twitter, AdSense
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json      # Progressive Web App manifest
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── AdSlot.jsx             # Non-intrusive reserved ad containers (zero CLS)
│   │   ├── CategoryNav.jsx        # Responsive horizontal category tabs
│   │   ├── ConversionCard.jsx     # Core interactive bidirectional conversion panel
│   │   ├── ConversionHistory.jsx  # Recent conversion drawer with 1-click reload
│   │   ├── ConversionTable.jsx    # Benchmark value comparison & all-units equivalence
│   │   ├── FavoritesBar.jsx       # Pinned conversions bar
│   │   ├── Footer.jsx             # Accessible footer with category index and standards
│   │   ├── Header.jsx             # Branding, dark/light theme switch, link sharing
│   │   ├── Icons.jsx              # Standalone, zero-dependency SVG icon system
│   │   ├── Omnibox.jsx            # Universal natural language search bar with shortcut '/'
│   │   ├── SeoContent.jsx         # Category guides, FAQs, and Schema.org JSON-LD injection
│   │   └── Toast.jsx              # Accessible non-intrusive alert toasts
│   ├── engine/
│   │   ├── conversions.js         # Core measurement definitions, NIST factors, formatters
│   │   └── parser.js              # Natural language query tokenizer and matching engine
│   ├── hooks/
│   │   ├── useLocalStorage.js     # Safe localStorage state persistence hook
│   │   └── useTheme.js            # Dark/light theme state & document attribute manager
│   ├── App.css                    # Modern CSS variable design system & responsive layout
│   ├── App.jsx                    # Root state coordinator, URL synchronization, and events
│   ├── App.test.js                # 17-point automated test suite (Jest + React Testing Library)
│   ├── index.css                  # CSS resets, typography, and CSS theme tokens
│   ├── index.js                   # Application entry point (React 18 createRoot)
│   ├── reportWebVitals.js         # Core Web Vitals monitor
│   └── setupTests.js              # Jest DOM matcher setup
├── .gitignore
├── AGENTS.md                      # AI agent & developer guide
├── package.json                   # Dependencies and npm scripts
└── README.md
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

### Prerequisites
- Node.js (v16+, v18+, or v20+)
- `npm`

### Commands
- **Install Dependencies:**
  ```powershell
  npm install
  ```
- **Start Local Development Server:**
  ```powershell
  npm start
  ```
  Runs at [http://localhost:3000](http://localhost:3000).

- **Execute Test Suite:**
  ```powershell
  $env:CI="true"; npm test
  ```
  Runs all 18 integration and unit tests without hanging.

- **Compile Production Build:**
  ```powershell
  npm run build
  ```
  Generates production-optimized bundle in `build/` with zero warnings.

- **Deployment Options:**
  - **Vercel (Recommended)**: Connect repository to Vercel. Continuous deployment triggers on every push to `main` with automatic edge caching, SSL, and SPA rewrite support via `vercel.json`.
  - **GitHub Pages**: Run `npm run deploy` to compile and deploy to the `gh-pages` branch.

---

## 6. Guidelines for Contributors and AI Agents

1. **Preserve Exact Mathematical Precision:**
   - Any added unit factors must follow official NIST / SI / ISO 80000 definitions.
   - Use `formatNumber` from `src/engine/conversions.js` to ensure clean representation without floating-point artifacts.
2. **Keep Zero-CLS Guarantee:**
   - All layout elements, cards, and ad placeholders must maintain stable layout dimensions to guarantee a 100% Core Web Vitals score.
3. **SEO Continuity:**
   - Maintain Schema.org JSON-LD generation and dynamic `document.title` and meta tags whenever modifying routing or state.
4. **Test Everything:**
   - Always run `$env:CI="true"; npm test` before committing or concluding turns.
