import React, { useState, useEffect } from 'react';
import { executeTool } from '../engine/mcpTools';

/**
 * DeveloperModal Component
 * Interactive documentation and playground for:
 * 1. Model Context Protocol (MCP) Server for Claude Desktop, Cursor, Antigravity
 * 2. High-precision REST API (/api/convert, /api/units, /api/mcp)
 * 3. Interactive live API tester
 * 4. Stdio CLI instructions
 */
export function DeveloperModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('mcp');
  const [copiedKey, setCopiedKey] = useState(null);

  // Playground state
  const [testQuery, setTestQuery] = useState('100 km to miles');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runLiveTest = async () => {
    setTestLoading(true);
    try {
      const res = await executeTool('parse_and_convert', { query: testQuery });
      if (res.isError) {
        setTestResult({
          status: 400,
          success: false,
          error: res.content?.[0]?.text || 'Conversion failed',
        });
      } else {
        setTestResult({
          status: 200,
          success: true,
          ...res.structuredData,
        });
      }
    } catch (err) {
      setTestResult({
        status: 500,
        success: false,
        error: err.message,
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (!isOpen) return null;

  const claudeConfigSnippet = `{
  "mcpServers": {
    "convertthings": {
      "command": "node",
      "args": ["<path-to-repo>/bin/mcp.mjs"]
    }
  }
}`;

  const curlGetSnippet = `curl -s "https://www.convertthings.com/api/convert?q=100+km+to+miles"`;
  const curlStructuredSnippet = `curl -s "https://www.convertthings.com/api/convert?from=c&to=f&val=100"`;
  const mcpHttpSnippet = `curl -X POST "https://www.convertthings.com/api/mcp" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "convert_units",
      "arguments": { "value": 100, "from": "km", "to": "mi" }
    }
  }'`;

  return (
    <div className="ct-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="ct-modal-dialog ct-dev-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ct-dev-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ct-modal-header">
          <div className="ct-modal-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'mcp'}
              className={`ct-modal-tab ${activeTab === 'mcp' ? 'active' : ''}`}
              onClick={() => setActiveTab('mcp')}
            >
              🤖 MCP Server (AI)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'rest'}
              className={`ct-modal-tab ${activeTab === 'rest' ? 'active' : ''}`}
              onClick={() => setActiveTab('rest')}
            >
              🌐 REST API
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'tester'}
              className={`ct-modal-tab ${activeTab === 'tester' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('tester');
                if (!testResult) runLiveTest();
              }}
            >
              ⚡ Live Tester
            </button>
          </div>
          <button
            type="button"
            className="ct-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className="ct-modal-body">
          {activeTab === 'mcp' && (
            <div className="ct-dev-content">
              <h2 id="ct-dev-title" className="ct-modal-section-title">
                Model Context Protocol (MCP) Server
              </h2>
              <p>
                Connect Claude Desktop, Cursor, Antigravity, and autonomous AI agents directly to
                <strong> ConvertThings</strong>. Give your LLM real-time, zero-hallucination unit conversions calibrated to exact NIST/SI standards across 15 measurement domains and 120+ units.
              </p>

              <div className="ct-dev-card">
                <div className="ct-dev-card-header">
                  <span>Claude Desktop Configuration</span>
                  <button
                    type="button"
                    className="ct-btn-copy-code"
                    onClick={() => copyToClipboard(claudeConfigSnippet, 'claude')}
                  >
                    {copiedKey === 'claude' ? '✓ Copied!' : 'Copy Config'}
                  </button>
                </div>
                <pre className="ct-code-block">{claudeConfigSnippet}</pre>
                <p className="ct-dev-hint">
                  Place in <code>claude_desktop_config.json</code> (macOS: <code>~/Library/Application Support/Claude/</code>, Windows: <code>%APPDATA%\Claude\</code>).
                </p>
              </div>

              <div className="ct-dev-card">
                <div className="ct-dev-card-header">
                  <span>Remote MCP over HTTP (JSON-RPC 2.0)</span>
                  <button
                    type="button"
                    className="ct-btn-copy-code"
                    onClick={() => copyToClipboard(mcpHttpSnippet, 'mcpHttp')}
                  >
                    {copiedKey === 'mcpHttp' ? '✓ Copied!' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="ct-code-block">{mcpHttpSnippet}</pre>
                <p className="ct-dev-hint">
                  Endpoint: <code>https://www.convertthings.com/api/mcp</code> — Supports <code>initialize</code>, <code>tools/list</code>, and <code>tools/call</code>.
                </p>
              </div>

              <div className="ct-dev-tools-list">
                <h4>Exposed MCP Tools</h4>
                <ul>
                  <li>
                    <code>convert_units(value, from, to, category?, decimals?)</code>: High-precision bidirectional conversion with step-by-step formula.
                  </li>
                  <li>
                    <code>parse_and_convert(query)</code>: Natural language parser for queries like <em>"100 km to miles"</em> or <em>"72 f in c"</em>.
                  </li>
                  <li>
                    <code>list_units(category?)</code>: Discovers supported units and categories.
                  </li>
                  <li>
                    <code>get_reference_table(from, to, category?)</code>: Generates benchmark equivalence tables.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'rest' && (
            <div className="ct-dev-content">
              <h2 className="ct-modal-section-title">Public REST API</h2>
              <p>
                ConvertThings provides a fast, free, CORS-enabled REST API deployed globally on Vercel Serverless Edge infrastructure.
              </p>

              <div className="ct-dev-card">
                <div className="ct-dev-card-header">
                  <span>1. Natural Language Query</span>
                  <button
                    type="button"
                    className="ct-btn-copy-code"
                    onClick={() => copyToClipboard(curlGetSnippet, 'curlGet')}
                  >
                    {copiedKey === 'curlGet' ? '✓ Copied!' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="ct-code-block">{curlGetSnippet}</pre>
                <div className="ct-dev-example-response">
                  <span className="ct-badge-json">200 OK Response</span>
                  <pre className="ct-code-block-small">{`{
  "success": true,
  "value": 100,
  "result": 62.13711922,
  "formattedResult": "62.13711922",
  "readout": "100 km = 62.13711922 mi",
  "category": "length",
  "formula": "Multiply the kilometer value by 0.6213711922",
  "url": "https://www.convertthings.com/convert/100-km-to-mi"
}`}</pre>
                </div>
              </div>

              <div className="ct-dev-card">
                <div className="ct-dev-card-header">
                  <span>2. Structured Parameters</span>
                  <button
                    type="button"
                    className="ct-btn-copy-code"
                    onClick={() => copyToClipboard(curlStructuredSnippet, 'curlStructured')}
                  >
                    {copiedKey === 'curlStructured' ? '✓ Copied!' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="ct-code-block">{curlStructuredSnippet}</pre>
              </div>

              <div className="ct-dev-card">
                <div className="ct-dev-card-header">
                  <span>3. List Categories &amp; Units</span>
                </div>
                <pre className="ct-code-block">curl -s "https://www.convertthings.com/api/units?cat=temperature"</pre>
              </div>
            </div>
          )}

          {activeTab === 'tester' && (
            <div className="ct-dev-content">
              <h2 className="ct-modal-section-title">Interactive API Tester</h2>
              <p>Test the conversion engine live in real-time right from your browser.</p>

              <div className="ct-tester-bar">
                <input
                  type="text"
                  className="ct-tester-input"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') runLiveTest();
                  }}
                  placeholder="e.g. 100 km to miles, 72 f in c, 1 cup to ml"
                />
                <button
                  type="button"
                  className="ct-btn-primary ct-tester-btn"
                  onClick={runLiveTest}
                  disabled={testLoading}
                >
                  {testLoading ? 'Running...' : 'Execute'}
                </button>
              </div>

              <div className="ct-quick-test-pills">
                <span className="ct-pills-label">Try:</span>
                {['100 km to miles', '72 f in c', '150 lbs to kg', '500 sq ft to sqm', '1 cup to ml'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    className="ct-pill-btn"
                    onClick={() => {
                      setTestQuery(sample);
                      executeTool('parse_and_convert', { query: sample }).then((res) => {
                        setTestResult(res.structuredData || res);
                      });
                    }}
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {testResult && (
                <div className="ct-tester-result">
                  <div className="ct-tester-result-header">
                    <span>Response JSON</span>
                    <button
                      type="button"
                      className="ct-btn-copy-code"
                      onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2), 'testResult')}
                    >
                      {copiedKey === 'testResult' ? '✓ Copied!' : 'Copy Response'}
                    </button>
                  </div>
                  <pre className="ct-code-block">{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ct-modal-footer">
          <button type="button" className="ct-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeveloperModal;
