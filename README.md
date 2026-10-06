# ConvertThings ⚡

> Modern, high-precision unit conversion platform with universal natural language parsing, zero cumulative layout shift (CLS), a public REST API, and a Model Context Protocol (MCP) server for Claude Desktop, Cursor, Antigravity, and autonomous AI agents.

🌐 **Live Website:** [https://www.convertthings.com](https://www.convertthings.com)  
🤖 **MCP Remote Endpoint:** `https://www.convertthings.com/api/mcp`  
🔌 **Public REST API:** `https://www.convertthings.com/api/convert`

---

## Features

- **15 Measurement Categories & 120+ Units**: Length, Weight/Mass, Temperature, Area, Volume, Speed, Time, Digital Storage, Data Transfer Rate, Pressure, Energy, Power, Angle, Fuel Economy, Cooking.
- **Exact NIST / SI Standards**: Zero-dependency calculation engine eliminating IEEE 754 floating-point inaccuracies.
- **Model Context Protocol (MCP) Server**: Native support for Anthropic's Model Context Protocol. Connect Claude Desktop, Cursor, and agent frameworks to eliminate conversion hallucinations.
- **Serverless Public REST API**: Fast, zero-config endpoints deployed on Vercel Serverless Edge with natural language query parsing.
- **Natural Language Parsing**: Omnibox and APIs understand queries like *"100 km to miles"*, *"72 f in c"*, *"150 lbs into kg"*, and *"1 cup to ml"*.
- **Zero Cumulative Layout Shift (CLS)**: Perfectly stable layout with 100% Core Web Vitals score.
- **SEO & Discoverability**: Programmatic URL pair routing (`/convert/celsius-to-fahrenheit`, `/convert/100-km-to-miles`), dynamic JSON-LD Schema.org metadata, and automated 1,244-URL XML sitemap.
- **Dark & Light Mode**: Seamless theme switching with system preference detection and localStorage persistence.

---

## 🤖 Model Context Protocol (MCP) Integration

ConvertThings runs an MCP server that exposes 4 tools to AI models:
1. `convert_units`: High-precision bidirectional conversion with step-by-step formula.
2. `parse_and_convert`: Natural language conversion for queries like *"100 km to miles"*.
3. `list_units`: Unit discovery across all 15 domains.
4. `get_reference_table`: Benchmark value equivalence tables (1 to 1,000).

### Claude Desktop Configuration
Add the following to your `claude_desktop_config.json`:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "convertthings": {
      "command": "node",
      "args": ["<path-to-repo>/bin/mcp.mjs"]
    }
  }
}
```

### Remote MCP over HTTP (JSON-RPC 2.0)
You can connect remote agents directly to the hosted server:
```bash
curl -X POST "https://www.convertthings.com/api/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "convert_units",
      "arguments": { "value": 100, "from": "km", "to": "mi" }
    }
  }'
```

---

## 🌐 Public REST API

ConvertThings provides free, high-performance, CORS-enabled endpoints:

### 1. Natural Language Query
```bash
curl -s "https://www.convertthings.com/api/convert?q=100+km+to+miles"
```
**Response:**
```json
{
  "success": true,
  "value": 100,
  "result": 62.13711922,
  "formattedResult": "62.13711922",
  "readout": "100 km = 62.13711922 mi",
  "category": "length",
  "formula": "Multiply the kilometer value by 0.6213711922",
  "url": "https://www.convertthings.com/convert/100-km-to-mi"
}
```

### 2. Structured Parameters
```bash
curl -s "https://www.convertthings.com/api/convert?from=c&to=f&val=100"
```

### 3. List Units and Categories
```bash
curl -s "https://www.convertthings.com/api/units?cat=temperature"
```

---

## 💻 CLI Usage

You can run conversions instantly from your terminal:

```bash
# Natural query
node bin/cli.mjs "100 km to miles"

# Direct values
node bin/cli.mjs 72 f c

# Benchmark table
node bin/cli.mjs --table km mi

# List categories and units
node bin/cli.mjs --list temperature
```

---

## 🛠️ Development & Testing

```bash
# Install dependencies
npm install

# Start local React development server
npm start

# Run unit and integration tests (Jest)
npm test

# Run API and MCP serverless tests
npm run test:api

# Run local MCP server
npm run mcp

# Compile production build with sitemap generation
npm run build
```

---

## 📄 License & Standards

- Calibrated to official **NIST Special Publication 811** and **ISO 80000** standards.
- MIT License.
