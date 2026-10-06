/**
 * ConvertThings REST API - /api/units
 * Lists supported categories and units.
 * Supports:
 * - GET /api/units
 * - GET /api/units?cat=length
 */

import { executeTool } from '../src/engine/mcpTools.js';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const category = req.query?.cat || req.query?.category;
    const toolRes = await executeTool('list_units', { category });

    if (toolRes.isError) {
      return res.status(400).json({
        success: false,
        error: toolRes.content?.[0]?.text || 'Failed to list units',
      });
    }

    return res.status(200).json({
      success: true,
      ...toolRes.structuredData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`,
    });
  }
}
