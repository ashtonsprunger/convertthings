#!/usr/bin/env node

/**
 * ConvertThings CLI Tool
 * Instant command-line conversions.
 *
 * Usage:
 *   node bin/cli.mjs "100 km to miles"
 *   node bin/cli.mjs 100 km mi
 *   node bin/cli.mjs --list
 */

import { executeTool } from '../src/engine/mcpTools.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
ConvertThings CLI - Instant High-Precision Unit Conversions
Website: https://www.convertthings.com

Usage:
  node bin/cli.mjs "<query>"             e.g. node bin/cli.mjs "100 km to miles"
  node bin/cli.mjs <val> <from> <to>     e.g. node bin/cli.mjs 72 f c
  node bin/cli.mjs --list [category]     e.g. node bin/cli.mjs --list temperature
  node bin/cli.mjs --table <from> <to>   e.g. node bin/cli.mjs --table km mi
`);
    process.exit(0);
  }

  if (args.includes('--list')) {
    const catIndex = args.indexOf('--list') + 1;
    const cat = args[catIndex] && !args[catIndex].startsWith('-') ? args[catIndex] : null;
    const res = await executeTool('list_units', { category: cat });
    console.log(res.content[0].text);
    process.exit(0);
  }

  if (args.includes('--table')) {
    const fromIdx = args.indexOf('--table') + 1;
    const from = args[fromIdx];
    const to = args[fromIdx + 1];
    if (!from || !to) {
      console.error('Error: --table requires <from> and <to> units.');
      process.exit(1);
    }
    const res = await executeTool('get_reference_table', { from, to });
    console.log(res.content[0].text);
    process.exit(0);
  }

  // If 3 arguments: <val> <from> <to>
  if (args.length === 3 && !isNaN(Number(args[0]))) {
    const res = await executeTool('convert_units', {
      value: Number(args[0]),
      from: args[1],
      to: args[2],
    });
    console.log(res.content[0].text);
    process.exit(res.isError ? 1 : 0);
  }

  // Otherwise, treat whole input as natural language query
  const query = args.join(' ');
  const res = await executeTool('parse_and_convert', { query });
  console.log(res.content[0].text);
  process.exit(res.isError ? 1 : 0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
