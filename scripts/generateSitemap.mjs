/**
 * Generate XML Sitemap for ConvertThings
 * Generates public/sitemap.xml with canonical homepage, category pages, and all 1,200+ unit pairs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSitemapXml, getAllUnitPairs } from '../src/engine/urlRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xml = generateSitemapXml('https://convertthings.com');
const outputPath = path.resolve(__dirname, '../public/sitemap.xml');

fs.writeFileSync(outputPath, xml, 'utf8');

const pairs = getAllUnitPairs();
console.log(`Successfully generated sitemap.xml with ${pairs.length + 16} URLs at ${outputPath}`);
