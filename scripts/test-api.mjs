/**
 * Test script for Vercel serverless function handlers
 * (api/convert.js, api/units.js, api/mcp.js)
 */

import convertHandler from '../api/convert.js';
import unitsHandler from '../api/units.js';
import mcpHandler from '../api/mcp.js';

function createMockReqRes(options = {}) {
  const req = {
    method: options.method || 'GET',
    query: options.query || {},
    body: options.body || {},
    headers: options.headers || {},
  };

  let statusCode = 200;
  let responseData = null;
  const headers = {};

  const res = {
    setHeader(key, val) {
      headers[key] = val;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    end() {
      return this;
    },
    _getData() {
      return { statusCode, responseData, headers };
    },
  };

  return { req, res };
}

async function runTests() {
  console.log('🧪 Starting API & MCP Serverless Functions Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Test /api/convert with natural query
  {
    const { req, res } = createMockReqRes({ query: { q: '100 km to miles' } });
    await convertHandler(req, res);
    const { statusCode, responseData } = res._getData();
    assert(statusCode === 200, '/api/convert?q=100 km to miles returns 200');
    assert(responseData.success === true, 'Response success is true');
    assert(Math.round(responseData.result) === 62, `Converted 100 km to ~62 miles (got ${responseData.result})`);
  }

  // 2. Test /api/convert with structured params
  {
    const { req, res } = createMockReqRes({ query: { from: 'c', to: 'f', val: '100' } });
    await convertHandler(req, res);
    const { statusCode, responseData } = res._getData();
    assert(statusCode === 200, '/api/convert?from=c&to=f&val=100 returns 200');
    assert(responseData.result === 212, `100 C = 212 F (got ${responseData.result})`);
  }

  // 3. Test /api/convert docs endpoint
  {
    const { req, res } = createMockReqRes({});
    await convertHandler(req, res);
    const { statusCode, responseData } = res._getData();
    assert(statusCode === 200, '/api/convert documentation returns 200');
    assert(responseData.service.includes('ConvertThings'), 'Documentation contains ConvertThings service name');
  }

  // 4. Test /api/units endpoint
  {
    const { req, res } = createMockReqRes({});
    await unitsHandler(req, res);
    const { statusCode, responseData } = res._getData();
    assert(statusCode === 200, '/api/units returns 200');
    assert(responseData.totalCategories === 15, `Returns 15 categories (got ${responseData.totalCategories})`);
  }

  // 5. Test /api/units with category filter
  {
    const { req, res } = createMockReqRes({ query: { cat: 'temperature' } });
    await unitsHandler(req, res);
    const { statusCode, responseData } = res._getData();
    assert(statusCode === 200, '/api/units?cat=temperature returns 200');
    assert(responseData.units.length === 4, `Temperature has 4 units (got ${responseData.units.length})`);
  }

  // 6. Test /api/mcp GET discovery
  {
    const { req, res } = createMockReqRes({ method: 'GET' });
    await mcpHandler(req, res);
    const { statusCode, responseData } = res._getData();
    assert(statusCode === 200, 'GET /api/mcp returns 200');
    assert(responseData.tools.length === 4, `Exposes 4 MCP tools (got ${responseData.tools.length})`);
  }

  // 7. Test /api/mcp POST JSON-RPC initialize
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} },
    });
    await mcpHandler(req, res);
    const { statusCode, responseData } = res._getData();
    assert(statusCode === 200, 'POST /api/mcp initialize returns 200');
    assert(responseData.result?.serverInfo?.name === 'convertthings-mcp', 'Returns serverInfo convertthings-mcp');
  }

  // 8. Test /api/mcp POST JSON-RPC tools/list
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
    });
    await mcpHandler(req, res);
    const { statusCode, responseData } = res._getData();
    assert(statusCode === 200, 'POST /api/mcp tools/list returns 200');
    assert(responseData.result?.tools?.length === 4, 'tools/list returns 4 tools');
  }

  // 9. Test /api/mcp POST JSON-RPC tools/call
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'convert_units',
          arguments: { value: 50, from: 'psi', to: 'bar' },
        },
      },
    });
    await mcpHandler(req, res);
    const { statusCode, responseData } = res._getData();
    assert(statusCode === 200, 'POST /api/mcp tools/call convert_units returns 200');
    assert(responseData.result?.isError === false, 'tools/call isError is false');
    assert(responseData.result?.content?.[0]?.text.includes('50'), 'Tool response text contains 50');
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
