/**
 * ConvertThings MCP Remote Endpoint - /api/mcp
 * Full Model Context Protocol (MCP) JSON-RPC 2.0 & StreamableHTTP / SSE implementation.
 * Fully compatible with Gemini Spark / Gemini Connected Apps, Claude Desktop,
 * Cursor, Antigravity, and autonomous AI agents.
 */

import { randomUUID } from 'crypto';
import { MCP_TOOLS, MCP_SERVER_INFO, executeTool } from '../src/engine/mcpTools.js';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle HEAD healthcheck
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  const sessionId = req.headers['mcp-session-id'] || req.query?.sessionId || randomUUID();
  res.setHeader('Mcp-Session-Id', sessionId);

  // GET: Handle either SSE stream (if requested) or JSON discovery
  if (req.method === 'GET') {
    const acceptHeader = (req.headers.accept || '').toLowerCase();
    const wantsSse = acceptHeader.includes('text/event-stream') || req.query?.sse !== undefined;

    if (wantsSse) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Mcp-Session-Id',
        'Mcp-Session-Id': sessionId,
      });

      // Emit MCP SSE endpoint event directing client to POST endpoint
      res.write(`event: endpoint\ndata: https://www.convertthings.com/api/mcp?sessionId=${sessionId}\n\n`);
      res.write(`: keep-alive\n\n`);
      return;
    }

    return res.status(200).json({
      status: 'online',
      protocol: 'Model Context Protocol (JSON-RPC 2.0 & StreamableHTTP)',
      protocolVersion: '2024-11-05',
      serverInfo: MCP_SERVER_INFO,
      tools: MCP_TOOLS,
      endpoints: {
        httpMcp: 'https://www.convertthings.com/api/mcp',
        restApi: 'https://www.convertthings.com/api/convert',
        unitsList: 'https://www.convertthings.com/api/units',
      },
    });
  }

  // POST: Handle MCP JSON-RPC 2.0 requests
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error: Invalid JSON string' },
          });
        }
      }

      body = body || {};

      // Handle batch requests
      if (Array.isArray(body)) {
        const responses = await Promise.all(body.map((item) => handleSingleRpc(item, req, res)));
        const nonNullResponses = responses.filter(Boolean);
        return res.status(200).json(nonNullResponses);
      }

      const result = await handleSingleRpc(body, req, res);
      if (result === null) {
        // Notification responded with 202/204
        return res.status(202).send('Accepted');
      }

      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: `Internal error: ${err.message}`,
        },
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleSingleRpc(body, req, res) {
  const id = body.id !== undefined ? body.id : null;
  const method = body.method;

  // Direct tool call format fallback (e.g. { name: 'convert_units', arguments: { ... } })
  if (!method && body.name) {
    const toolRes = await executeTool(body.name, body.arguments || {});
    return {
      jsonrpc: '2.0',
      id,
      result: toolRes,
    };
  }

  switch (method) {
    case 'initialize': {
      const clientVersion = body.params?.protocolVersion || '2024-11-05';
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: clientVersion,
          capabilities: {
            tools: {
              listChanged: false,
            },
            resources: {
              subscribe: false,
              listChanged: false,
            },
            prompts: {
              listChanged: false,
            },
            logging: {},
          },
          serverInfo: MCP_SERVER_INFO,
        },
      };
    }

    case 'notifications/initialized': {
      // Per JSON-RPC 2.0, notifications do not return a result
      return null;
    }

    case 'ping': {
      return {
        jsonrpc: '2.0',
        id,
        result: {},
      };
    }

    case 'tools/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS,
        },
      };
    }

    case 'tools/call': {
      const toolName = body.params?.name;
      const toolArgs = body.params?.arguments || {};

      if (!toolName) {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32602,
            message: 'Invalid params: tool "name" is required',
          },
        };
      }

      const toolRes = await executeTool(toolName, toolArgs);

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: toolRes.content,
          isError: Boolean(toolRes.isError),
          structuredData: toolRes.structuredData,
        },
      };
    }

    default: {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: "${method}"`,
        },
      };
    }
  }
}
