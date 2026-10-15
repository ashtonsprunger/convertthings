/**
 * Generate XML Sitemap for ConvertThings
 * Generates public/sitemap.xml with canonical homepage, category pages, and all 1,200+ unit pairs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSitemapXml, getAllUnitPairs, HUB_ROUTES } from '../src/engine/urlRouter.js';
import { CATEGORIES } from '../src/engine/conversions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xml = generateSitemapXml('https://www.convertthings.com');
const outputPath = path.resolve(__dirname, '../public/sitemap.xml');

fs.writeFileSync(outputPath, xml, 'utf8');

const pairs = getAllUnitPairs().filter((p) => p.isIndexable);
const totalUrls = 1 + 1 + 3 + HUB_ROUTES.length + CATEGORIES.length + pairs.length;
console.log(`Successfully generated sitemap.xml with ${totalUrls} high-value indexable URLs at ${outputPath}`);
