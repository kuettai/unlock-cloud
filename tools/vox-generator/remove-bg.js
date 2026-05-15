/**
 * Remove grey background from MagicaVoxel renders → transparent PNG
 * Uses pure Node.js (no dependencies) by parsing/writing PNG manually via sharp-less approach.
 * 
 * Requires: npm install sharp (in this directory)
 * Usage: node remove-bg.js <input.png> [output.png]
 */
const fs = require('fs');
const path = require('path');

// Check for sharp
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('sharp not found. Installing...');
  require('child_process').execSync('npm install sharp', { cwd: __dirname, stdio: 'inherit' });
  sharp = require('sharp');
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node remove-bg.js <input.png> [output.png]');
  process.exit(1);
}

const outputPath = process.argv[3] || inputPath.replace('.png', '-transparent.png');

// MagicaVoxel default background is ~rgb(54,54,54) to rgb(77,77,77) gradient
// We'll remove any pixel that's close to grey and has low saturation
const TOLERANCE = 30;

function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const brightness = (r + g + b) / 3;
  return saturation < 0.10 && brightness > 30 && brightness < 160;
}

async function removeBg() {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Flood-fill from corners to find background
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed from all 4 edges
  for (let x = 0; x < width; x++) {
    queue.push(x); // top row
    queue.push((height - 1) * width + x); // bottom row
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width); // left col
    queue.push(y * width + (width - 1)); // right col
  }

  // BFS flood fill
  while (queue.length > 0) {
    const idx = queue.pop();
    if (idx < 0 || idx >= width * height || visited[idx]) continue;

    const px = idx * 4;
    const r = data[px], g = data[px + 1], b = data[px + 2];

    if (!isBackground(r, g, b)) continue;

    visited[idx] = 1;
    data[px + 3] = 0; // make transparent

    const x = idx % width, y = Math.floor(idx / width);
    if (x > 0) queue.push(idx - 1);
    if (x < width - 1) queue.push(idx + 1);
    if (y > 0) queue.push(idx - width);
    if (y < height - 1) queue.push(idx + width);
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log(`Done: ${outputPath}`);
}

removeBg().catch(err => { console.error(err); process.exit(1); });
