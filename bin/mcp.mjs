#!/usr/bin/env node

/**
 * ConvertThings MCP Server (Stdio Transport)
 * Connects directly to Claude Desktop, Cursor, Antigravity, and other MCP clients.
 *
 * Usage:
 *   node bin/mcp.mjs
 *
 * Claude Desktop Config (~/Library/Application Support/Claude/claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "convertthings": {
 *       "command": "node",
 *       "args": ["/absolute/path/to/convertThings/bin/mcp.mjs"]
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { MCP_TOOLS, MCP_SERVER_INFO, executeTool } from '../src/engine/mcpTools.js';

async function runServer() {
  const server = new Server(
    {
      name: MCP_SERVER_INFO.name,
      version: MCP_SERVER_INFO.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tools/list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: MCP_TOOLS,
    };
  });

  // Handle tools/call
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const result = await executeTool(name, args || {});

    return {
      content: result.content,
      isError: Boolean(result.isError),
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch((error) => {
  console.error('Fatal MCP Server Error:', error);
  process.exit(1);
});
