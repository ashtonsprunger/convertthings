/**
 * ConvertThings MCP Tools Engine
 * Core tool definitions and execution handler for the Model Context Protocol (MCP)
 * and REST APIs.
 */

import {
  CATEGORIES,
  UNIT_DEFINITIONS,
  convertUnits,
  formatNumber,
  getUnitsForCategory,
  getFormulaString,
  getQuickReferenceTable,
} from './conversions.js';
import { findUnit, parseConversionQuery } from './parser.js';

export const MCP_SERVER_INFO = {
  name: 'ConvertThings',
  version: '1.0.0',
  description: 'High-precision unit conversion MCP server and API for ConvertThings.com across 15 physical & computational measurement domains.',
  websiteUrl: 'https://www.convertthings.com',
  icons: [
    {
      src: 'https://www.convertthings.com/logo512.png',
      mimeType: 'image/png',
      sizes: ['512x512'],
    },
    {
      src: 'https://www.convertthings.com/logo192.png',
      mimeType: 'image/png',
      sizes: ['192x192'],
    },
    {
      src: 'https://www.convertthings.com/favicon.svg',
      mimeType: 'image/svg+xml',
    },
  ],
};

export const MCP_TOOLS = [
  {
    name: 'convert_units',
    description:
      'Perform precise unit conversions across 15 measurement domains (length, mass, temperature, area, volume, speed, time, digital storage, data transfer rate, pressure, energy, power, angle, fuel economy, cooking). Returns exact conversion, formatted output, and the step-by-step formula.',
    inputSchema: {
      type: 'object',
      properties: {
        value: {
          type: 'number',
          description: 'The numeric quantity to convert (e.g. 100, 3.14, -40).',
        },
        from: {
          type: 'string',
          description: 'Source unit ID, symbol, or name (e.g. "km", "mi", "kg", "lbs", "c", "f", "tbsp", "gb", "psi").',
        },
        to: {
          type: 'string',
          description: 'Target unit ID, symbol, or name (e.g. "mi", "km", "lb", "c", "tsp", "mb", "bar").',
        },
        category: {
          type: 'string',
          description: 'Optional category ID if known (e.g. "length", "mass", "temperature", "cooking", etc.). If omitted, will be inferred automatically.',
        },
        decimals: {
          type: 'string',
          description: 'Number of decimal places to format the output to, or "auto" for smart precision (default: "auto").',
        },
      },
      required: ['value', 'from', 'to'],
    },
  },
  {
    name: 'parse_and_convert',
    description:
      'Parse a natural language conversion query and calculate the result immediately. Supports queries like "100 km to miles", "72 f in c", "150 lbs into kg", "1 cup to ml", "500 sq ft to m²", "100 mbps to mbs".',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language conversion request (e.g. "100 km to miles", "350 F to C").',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_units',
    description:
      'List supported measurement categories and all available units with their symbols, IDs, and aliases.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category ID to filter by (e.g. "length", "mass", "temperature", "cooking", "digital", etc.). If omitted, all categories and units are returned.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_reference_table',
    description:
      'Generate a benchmark value conversion comparison table (milestone values: 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000) between two units.',
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Source unit ID, symbol, or name.',
        },
        to: {
          type: 'string',
          description: 'Target unit ID, symbol, or name.',
        },
        category: {
          type: 'string',
          description: 'Optional category ID.',
        },
      },
      required: ['from', 'to'],
    },
  },
];

/**
 * Resolves a unit token to its definition and category.
 */
function resolveUnit(token, categoryHint = null) {
  if (!token) return null;

  // If category hint given, try finding within that category first
  if (categoryHint && UNIT_DEFINITIONS[categoryHint]) {
    const clean = String(token).trim().toLowerCase();
    const catUnits = UNIT_DEFINITIONS[categoryHint].units;
    const direct = catUnits.find(
      (u) =>
        u.id.toLowerCase() === clean ||
        u.symbol.toLowerCase() === clean ||
        u.name.toLowerCase() === clean ||
        u.plural.toLowerCase() === clean ||
        (u.aliases && u.aliases.map((a) => a.toLowerCase()).includes(clean))
    );
    if (direct) {
      return { categoryId: categoryHint, unit: direct };
    }
  }

  // Fallback to universal parser lookup
  return findUnit(token, categoryHint);
}

/**
 * Core execution dispatcher for MCP tool calls.
 * @param {string} toolName
 * @param {object} args
 * @returns {object} MCP result format { content, structuredData?, isError? }
 */
export async function executeTool(toolName, args = {}) {
  try {
    switch (toolName) {
      case 'convert_units': {
        const { value, from, to, category, decimals = 'auto' } = args;

        if (value === undefined || value === null || isNaN(Number(value))) {
          return {
            content: [{ type: 'text', text: 'Error: A valid numeric "value" is required for conversion.' }],
            isError: true,
          };
        }

        const numVal = Number(value);
        const fromMatch = resolveUnit(from, category);
        const toMatch = resolveUnit(to, category || (fromMatch ? fromMatch.categoryId : null));

        if (!fromMatch) {
          return {
            content: [{ type: 'text', text: `Error: Unrecognized source unit "${from}". Use list_units to see supported units.` }],
            isError: true,
          };
        }

        if (!toMatch) {
          return {
            content: [{ type: 'text', text: `Error: Unrecognized target unit "${to}". Use list_units to see supported units.` }],
            isError: true,
          };
        }

        if (fromMatch.categoryId !== toMatch.categoryId) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: Incompatible unit conversion. Cannot convert "${fromMatch.unit.name}" (${fromMatch.categoryId}) to "${toMatch.unit.name}" (${toMatch.categoryId}). Both units must belong to the same measurement domain.`,
              },
            ],
            isError: true,
          };
        }

        const catId = fromMatch.categoryId;
        const converted = convertUnits(numVal, catId, fromMatch.unit.id, toMatch.unit.id);

        if (converted === null) {
          return {
            content: [{ type: 'text', text: `Error: Failed to calculate conversion from ${fromMatch.unit.name} to ${toMatch.unit.name}.` }],
            isError: true,
          };
        }

        const formatted = formatNumber(converted, decimals, catId);
        const formula = getFormulaString(catId, fromMatch.unit.id, toMatch.unit.id);
        const readout = `${numVal} ${fromMatch.unit.symbol} = ${formatted} ${toMatch.unit.symbol}`;

        const textOutput = [
          `**${numVal} ${fromMatch.unit.plural} (${fromMatch.unit.symbol}) = ${formatted} ${toMatch.unit.plural} (${toMatch.unit.symbol})**`,
          `Category: ${catId}`,
          formula ? `Formula: ${formula}` : '',
          `Canonical URL: https://www.convertthings.com/convert/${numVal}-${fromMatch.unit.id}-to-${toMatch.unit.id}`,
        ]
          .filter(Boolean)
          .join('\n');

        return {
          content: [{ type: 'text', text: textOutput }],
          structuredData: {
            value: numVal,
            result: converted,
            formattedResult: formatted,
            readout,
            category: catId,
            from: {
              id: fromMatch.unit.id,
              name: fromMatch.unit.name,
              plural: fromMatch.unit.plural,
              symbol: fromMatch.unit.symbol,
            },
            to: {
              id: toMatch.unit.id,
              name: toMatch.unit.name,
              plural: toMatch.unit.plural,
              symbol: toMatch.unit.symbol,
            },
            formula,
            url: `https://www.convertthings.com/convert/${numVal}-${fromMatch.unit.id}-to-${toMatch.unit.id}`,
          },
          isError: false,
        };
      }

      case 'parse_and_convert': {
        const { query } = args;
        if (!query || typeof query !== 'string') {
          return {
            content: [{ type: 'text', text: 'Error: A valid string "query" is required (e.g. "100 km to miles").' }],
            isError: true,
          };
        }

        const parsed = parseConversionQuery(query);
        if (!parsed || !parsed.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Could not parse conversion query: "${query}". Try standard formats like "100 km to miles", "72 f in c", or "150 lbs into kg".`,
              },
            ],
            isError: true,
          };
        }

        const formula = getFormulaString(parsed.categoryId, parsed.fromUnit.id, parsed.toUnit.id);
        const fromDisplay = parsed.isCompound
          ? parsed.compoundDisplay
          : `${parsed.value} ${parsed.fromUnit.symbol}`;
        const readout = `${fromDisplay} = ${parsed.formattedResult} ${parsed.toUnit.symbol}`;

        const headerLine = parsed.isCompound
          ? `**${parsed.compoundDisplay} = ${parsed.formattedResult} ${parsed.toUnit.plural} (${parsed.toUnit.symbol})**`
          : `**${parsed.value} ${parsed.fromUnit.plural} (${parsed.fromUnit.symbol}) = ${parsed.formattedResult} ${parsed.toUnit.plural} (${parsed.toUnit.symbol})**`;

        const textOutput = [
          headerLine,
          `Category: ${parsed.categoryId}`,
          formula ? `Formula: ${formula}` : '',
          `Canonical URL: https://www.convertthings.com/convert/${parsed.value}-${parsed.fromUnit.id}-to-${parsed.toUnit.id}`,
        ]
          .filter(Boolean)
          .join('\n');

        return {
          content: [{ type: 'text', text: textOutput }],
          structuredData: {
            value: parsed.value,
            result: parsed.result,
            formattedResult: parsed.formattedResult,
            readout,
            category: parsed.categoryId,
            from: parsed.fromUnit,
            to: parsed.toUnit,
            isCompound: !!parsed.isCompound,
            compoundDisplay: parsed.compoundDisplay || undefined,
            compoundParts: parsed.compoundParts || undefined,
            formula,
            query: parsed.query,
            url: `https://www.convertthings.com/convert/${parsed.value}-${parsed.fromUnit.id}-to-${parsed.toUnit.id}`,
          },
          isError: false,
        };
      }

      case 'list_units': {
        const { category } = args;
        if (category) {
          const catId = category.toLowerCase().trim();
          const catDef = UNIT_DEFINITIONS[catId];
          const catMeta = CATEGORIES.find((c) => c.id === catId);

          if (!catDef) {
            const valid = CATEGORIES.map((c) => c.id).join(', ');
            return {
              content: [{ type: 'text', text: `Error: Unknown category "${category}". Valid categories are: ${valid}` }],
              isError: true,
            };
          }

          const unitList = catDef.units.map((u) => `- **${u.name}** (\`${u.id}\`, symbol: \`${u.symbol}\`): ${u.plural}`).join('\n');
          const text = `**Category: ${catMeta ? catMeta.name : catId}** (Base: \`${catDef.baseUnit}\`)\n\n${unitList}`;

          return {
            content: [{ type: 'text', text: text }],
            structuredData: {
              category: catId,
              name: catMeta ? catMeta.name : catId,
              baseUnit: catDef.baseUnit,
              units: catDef.units,
            },
            isError: false,
          };
        }

        // List all categories with unit counts and sample units
        const summary = CATEGORIES.map((cat) => {
          const units = getUnitsForCategory(cat.id);
          const sampleSymbols = units.slice(0, 4).map((u) => u.symbol).join(', ');
          return `- **${cat.name}** (\`${cat.id}\`) - ${units.length} units (e.g. ${sampleSymbols}...)`;
        }).join('\n');

        const totalUnits = Object.values(UNIT_DEFINITIONS).reduce((acc, cat) => acc + cat.units.length, 0);
        const text = `**ConvertThings Measurement Domains (${CATEGORIES.length} categories, ${totalUnits} units total)**\n\n${summary}\n\nCall \`list_units\` with \`category: "<id>"\` to view all units for a specific domain.`;

        return {
          content: [{ type: 'text', text: text }],
          structuredData: {
            totalCategories: CATEGORIES.length,
            totalUnits,
            categories: CATEGORIES.map((cat) => ({
              id: cat.id,
              name: cat.name,
              defaultFrom: cat.defaultFrom,
              defaultTo: cat.defaultTo,
              unitCount: getUnitsForCategory(cat.id).length,
            })),
          },
          isError: false,
        };
      }

      case 'get_reference_table': {
        const { from, to, category } = args;
        const fromMatch = resolveUnit(from, category);
        const toMatch = resolveUnit(to, category || (fromMatch ? fromMatch.categoryId : null));

        if (!fromMatch || !toMatch) {
          return {
            content: [{ type: 'text', text: 'Error: Both "from" and "to" units must be valid recognized units.' }],
            isError: true,
          };
        }

        if (fromMatch.categoryId !== toMatch.categoryId) {
          return {
            content: [{ type: 'text', text: 'Error: Both units must belong to the same category to generate a reference table.' }],
            isError: true,
          };
        }

        const catId = fromMatch.categoryId;
        const table = getQuickReferenceTable(catId, fromMatch.unit.id, toMatch.unit.id);

        let md = `| ${fromMatch.unit.plural} (${fromMatch.unit.symbol}) | ${toMatch.unit.plural} (${toMatch.unit.symbol}) |\n`;
        md += `| :--- | :--- |\n`;
        table.forEach((row) => {
          md += `| ${row.fromValue} | ${row.toValue} |\n`;
        });

        return {
          content: [{ type: 'text', text: md }],
          structuredData: {
            category: catId,
            from: fromMatch.unit,
            to: toMatch.unit,
            benchmarks: table,
          },
          isError: false,
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: "${toolName}". Available tools: ${MCP_TOOLS.map((t) => t.name).join(', ')}` }],
          isError: true,
        };
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Execution error: ${err.message}` }],
      isError: true,
    };
  }
}
