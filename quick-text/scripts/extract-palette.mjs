import fs from 'node:fs/promises';
import path from 'node:path';

const source = 'https://p.weaver-yuwono.com/fabric-palette/swatches.json';
const outputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(import.meta.dirname, '..', 'corpus', 'palette.json');

const response = await fetch(source, { cache: 'no-store' });
if (!response.ok) throw new Error(`Failed to fetch ${source}: ${response.status}`);

const swatches = await response.json();
const colors = swatches
  .map((swatch, index) => ({
    id: `brown-${String(index + 1).padStart(2, '0')}`,
    name: swatch.primary?.name || swatch.title || `Robert Brown ${index + 1}`,
    hex: String(swatch.primary?.hex || '').toUpperCase()
  }))
  .filter((color) => /^#[0-9A-F]{6}$/.test(color.hex));

const palette = {
  name: 'Robert Brown Fabric Collection',
  source: 'https://p.weaver-yuwono.com/fabric-palette/palette.html',
  extractedAt: new Date().toISOString(),
  colors
};

await fs.writeFile(outputPath, `${JSON.stringify(palette, null, 2)}\n`);
console.log(`Extracted ${colors.length} colors to ${path.relative(process.cwd(), outputPath)}.`);
