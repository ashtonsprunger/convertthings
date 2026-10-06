/**
 * ConvertThings MCP Remote Endpoint - /api/mcp
 * Full Model Context Protocol (MCP) JSON-RPC 2.0 implementation over HTTP.
 * Compatible with Claude Desktop, Cursor, Antigravity, AutoGen, LangChain,
 * and autonomous AI agent swarms.
 */

import { MCP_TOOLS, MCP_SERVER_INFO, executeTool } from '../src/engine/mcpTools.js';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Return server status, metadata, tools list, and connection docs
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      protocol: 'Model Context Protocol (JSON-RPC 2.0)',
      protocolVersion: '2024-11-05',
      serverInfo: MCP_SERVER_INFO,
      tools: MCP_TOOLS,
      endpoints: {
        httpMcp: 'https://www.convertthings.com/api/mcp',
        restApi: 'https://www.convertthings.com/api/convert',
        unitsList: 'https://www.convertthings.com/api/units',
      },
      integrationGuide: {
        claudeDesktopConfig: {
          mcpServers: {
            convertthings: {
              command: 'npx',
              args: ['-y', '@convertthings/mcp'],
            },
          },
        },
        cursorOrAntigravityConfig: {
          command: 'node bin/mcp.mjs',
          type: 'stdio',
        },
        sampleJsonRpcRequest: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'convert_units',
            arguments: {
              value: 100,
              from: 'km',
              to: 'miles',
            },
          },
        },
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
      const id = body.id !== undefined ? body.id : null;
      const method = body.method;

      // Direct tool call format support (e.g. { name: 'convert_units', arguments: { ... } })
      if (!method && body.name) {
        const toolRes = await executeTool(body.name, body.arguments || {});
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: toolRes,
        });
      }

      switch (method) {
        case 'initialize': {
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
              },
              serverInfo: MCP_SERVER_INFO,
            },
          });
        }

        case 'notifications/initialized': {
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: { status: 'ready' },
          });
        }

        case 'ping': {
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {},
          });
        }

        case 'tools/list': {
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {
              tools: MCP_TOOLS,
            },
          });
        }

        case 'tools/call': {
          const toolName = body.params?.name;
          const toolArgs = body.params?.arguments || {};

          if (!toolName) {
            return res.status(400).json({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32602,
                message: 'Invalid params: tool "name" is required',
              },
            });
          }

          const toolRes = await executeTool(toolName, toolArgs);

          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {
              content: toolRes.content,
              isError: Boolean(toolRes.isError),
              structuredData: toolRes.structuredData,
            },
          });
        }

        default: {
          return res.status(400).json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method not found: "${method}"`,
            },
          });
        }
      }
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
