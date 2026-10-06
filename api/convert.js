/**
 * ConvertThings REST API - /api/convert
 * Fast, serverless unit conversion endpoint with natural language query parsing.
 * Supports:
 * - GET /api/convert?q=100+km+to+miles
 * - GET /api/convert?from=km&to=mi&val=100
 * - POST /api/convert { "from": "km", "to": "mi", "value": 100 }
 */

import { executeTool } from '../src/engine/mcpTools.js';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const queryParams = req.query || {};
    const bodyParams = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const params = { ...queryParams, ...bodyParams };

    // 1. Natural language query mode (e.g. ?q=100 km to miles)
    const rawQuery = params.q || params.query;
    if (rawQuery) {
      const toolRes = await executeTool('parse_and_convert', { query: String(rawQuery).trim() });
      if (toolRes.isError) {
        return res.status(400).json({
          success: false,
          error: toolRes.content?.[0]?.text || 'Failed to parse conversion query',
          query: rawQuery,
        });
      }
      return res.status(200).json({
        success: true,
        ...toolRes.structuredData,
      });
    }

    // 2. Direct unit conversion mode (e.g. ?from=km&to=mi&val=100)
    const from = params.from;
    const to = params.to;
    const value = params.val !== undefined ? params.val : params.value !== undefined ? params.value : params.v;

    if (from && to) {
      const toolRes = await executeTool('convert_units', {
        value: value !== undefined ? Number(value) : 1,
        from: String(from).trim(),
        to: String(to).trim(),
        category: params.cat || params.category,
        decimals: params.decimals || params.precision || 'auto',
      });

      if (toolRes.isError) {
        return res.status(400).json({
          success: false,
          error: toolRes.content?.[0]?.text || 'Conversion failed',
          from,
          to,
        });
      }

      return res.status(200).json({
        success: true,
        ...toolRes.structuredData,
      });
    }

    // 3. No parameters provided - Return documentation and usage guide
    return res.status(200).json({
      service: 'ConvertThings Public Conversion API',
      version: '1.0.0',
      description: 'Free, high-precision unit conversion API supporting 15 measurement categories and 120+ units.',
      homepage: 'https://www.convertthings.com',
      endpoints: {
        naturalLanguage: {
          url: 'https://www.convertthings.com/api/convert?q=100+km+to+miles',
          method: 'GET',
          params: { q: 'Natural language query (e.g. "72 f in c", "150 lbs to kg", "1 cup to ml")' },
        },
        structured: {
          url: 'https://www.convertthings.com/api/convert?from=km&to=mi&val=100',
          method: 'GET',
          params: {
            from: 'Source unit symbol or ID (e.g. "km")',
            to: 'Target unit symbol or ID (e.g. "mi")',
            val: 'Numeric value to convert (default: 1)',
            decimals: 'Optional decimal places or "auto" (default: "auto")',
          },
        },
        categoriesAndUnits: {
          url: 'https://www.convertthings.com/api/units',
          method: 'GET',
        },
        mcpServer: {
          url: 'https://www.convertthings.com/api/mcp',
          protocol: 'Model Context Protocol (JSON-RPC 2.0)',
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`,
    });
  }
}
