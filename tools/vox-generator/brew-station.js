/**
 * Brew Station — voxel room model for Café 153 (v2 - detailed)
 * 32x32x20 room with more furniture and detail
 */
const fs = require('fs');
const path = require('path');
const { createVoxFile } = require('./vox-writer');

const PAL = {
  FLOOR_TILE: 1,
  FLOOR_DARK: 2,
  WALL: 3,
  WALL_TRIM: 4,
  COUNTER_TOP: 5,
  COUNTER_BODY: 6,
  MACHINE_BODY: 7,
  MACHINE_DARK: 8,
  MACHINE_RED: 9,
  SHELF: 10,
  CUP: 11,
  GRINDER: 12,
  SINK_BODY: 13,
  SINK_BASIN: 14,
  STOOL_SEAT: 15,
  STOOL_LEG: 16,
  TABLE_TOP: 17,
  TABLE_LEG: 18,
  PIPE_SILVER: 19,
  TOWEL: 20,
  BEAN_BAG: 21,
  MAT: 22,
};

const palette = [];
palette[0]  = { r: 180, g: 130, b: 80, a: 255 };   // 1: warm wood
palette[1]  = { r: 140, g: 95, b: 55, a: 255 };    // 2: dark wood
palette[2]  = { r: 235, g: 225, b: 210, a: 255 };  // 3: cream wall
palette[3]  = { r: 60, g: 45, b: 35, a: 255 };     // 4: dark trim
palette[4]  = { r: 120, g: 120, b: 125, a: 255 };  // 5: granite
palette[5]  = { r: 70, g: 50, b: 35, a: 255 };     // 6: dark wood counter
palette[6]  = { r: 190, g: 195, b: 200, a: 255 };  // 7: stainless
palette[7]  = { r: 50, g: 50, b: 55, a: 255 };     // 8: dark metal
palette[8]  = { r: 200, g: 40, b: 40, a: 255 };    // 9: red accent
palette[9]  = { r: 200, g: 160, b: 100, a: 255 };  // 10: shelf
palette[10] = { r: 245, g: 245, b: 240, a: 255 };  // 11: white cup
palette[11] = { r: 30, g: 30, b: 30, a: 255 };     // 12: black grinder
palette[12] = { r: 170, g: 175, b: 180, a: 255 };  // 13: sink body
palette[13] = { r: 100, g: 140, b: 160, a: 255 };  // 14: sink basin (blue-grey)
palette[14] = { r: 160, g: 80, b: 50, a: 255 };    // 15: stool seat (leather)
palette[15] = { r: 80, g: 80, b: 85, a: 255 };     // 16: stool leg (metal)
palette[16] = { r: 190, g: 150, b: 100, a: 255 };  // 17: table top (light wood)
palette[17] = { r: 60, g: 60, b: 65, a: 255 };     // 18: table leg
palette[18] = { r: 200, g: 205, b: 210, a: 255 };  // 19: pipe/faucet
palette[19] = { r: 220, g: 220, b: 230, a: 255 };  // 20: towel
palette[20] = { r: 90, g: 60, b: 30, a: 255 };     // 21: bean bag (brown)
palette[21] = { r: 50, g: 50, b: 45, a: 255 };     // 22: rubber mat

const W = 32, D = 32, H = 20;
const voxels = [];

function add(x, y, z, c) { voxels.push({ x, y, z, colorIndex: c }); }
function box(x0, y0, z0, x1, y1, z1, c) {
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++) add(x, y, z, c);
}

// --- Floor (checkerboard) ---
for (let x = 0; x < W; x++)
  for (let y = 0; y < D; y++)
    add(x, y, 0, (x + y) % 2 === 0 ? PAL.FLOOR_TILE : PAL.FLOOR_DARK);

// --- Rubber mat behind counter ---
for (let x = 6; x <= 26; x++)
  for (let y = 25; y <= 27; y++)
    add(x, y, 0, PAL.MAT);

// --- Back wall (y=31) ---
for (let x = 0; x < W; x++)
  for (let z = 1; z <= 16; z++)
    add(x, 31, z, PAL.WALL);

// --- Left wall (x=0) ---
for (let y = 0; y < D; y++)
  for (let z = 1; z <= 16; z++)
    add(0, y, z, PAL.WALL);

// --- Wall trim (baseboard) ---
for (let x = 1; x < W; x++) add(x, 31, 1, PAL.WALL_TRIM);
for (let y = 0; y < D; y++) add(0, y, 1, PAL.WALL_TRIM);

// --- L-shaped counter along back wall + wraps left ---
// Back section (y=28-30)
box(4, 28, 1, 28, 30, 3, PAL.COUNTER_BODY);
box(4, 28, 4, 28, 30, 4, PAL.COUNTER_TOP);
// Left section (x=1-3)
box(1, 10, 1, 3, 27, 3, PAL.COUNTER_BODY);
box(1, 10, 4, 3, 27, 4, PAL.COUNTER_TOP);

// --- Sink in left counter (x=1-3, y=18-20) ---
box(1, 18, 4, 3, 20, 4, PAL.SINK_BODY);
add(2, 19, 4, PAL.SINK_BASIN);
add(2, 19, 5, PAL.PIPE_SILVER); // faucet

// --- Coffee machine (x=14-18) ---
box(14, 29, 5, 18, 30, 9, PAL.MACHINE_BODY);
box(14, 29, 10, 18, 30, 10, PAL.MACHINE_DARK);
box(15, 28, 5, 17, 28, 7, PAL.MACHINE_DARK);  // drip tray
add(16, 29, 7, PAL.MACHINE_RED);               // button
// Steam wand
add(14, 29, 7, PAL.PIPE_SILVER);
add(14, 29, 6, PAL.PIPE_SILVER);
// Portafilter
add(16, 28, 6, PAL.MACHINE_DARK);

// --- Grinder (x=21-23) ---
box(21, 29, 5, 23, 30, 7, PAL.GRINDER);
box(22, 29, 8, 22, 30, 9, PAL.MACHINE_DARK); // hopper (narrower)

// --- Second grinder (x=25-27) ---
box(25, 29, 5, 27, 30, 7, PAL.GRINDER);
box(26, 29, 8, 26, 30, 9, PAL.MACHINE_DARK);

// --- Shelves on back wall ---
box(5, 30, 10, 13, 30, 10, PAL.SHELF);
add(6, 30, 11, PAL.CUP);
add(8, 30, 11, PAL.CUP);
add(10, 30, 11, PAL.CUP);
add(12, 30, 11, PAL.CUP);

box(5, 30, 13, 13, 30, 13, PAL.SHELF);
add(6, 30, 14, PAL.CUP);
add(8, 30, 14, PAL.CUP);
add(10, 30, 14, PAL.CUP);

// --- Shelves on left wall ---
box(0, 12, 10, 0, 18, 10, PAL.SHELF);
add(0, 13, 11, PAL.CUP);
add(0, 15, 11, PAL.CUP);
add(0, 17, 11, PAL.CUP);

// --- Bean bags on left counter ---
box(1, 11, 5, 2, 12, 6, PAL.BEAN_BAG);
box(1, 14, 5, 2, 15, 6, PAL.BEAN_BAG);

// --- Prep table (center of room, x=10-18, y=10-14) ---
// Legs
box(10, 10, 1, 10, 10, 3, PAL.TABLE_LEG);
box(18, 10, 1, 18, 10, 3, PAL.TABLE_LEG);
box(10, 14, 1, 10, 14, 3, PAL.TABLE_LEG);
box(18, 14, 1, 18, 14, 3, PAL.TABLE_LEG);
// Top
box(10, 10, 4, 18, 14, 4, PAL.TABLE_TOP);
// Items on table
add(12, 12, 5, PAL.CUP);
add(14, 12, 5, PAL.BEAN_BAG);
add(16, 11, 5, PAL.TOWEL);

// --- Stools at prep table ---
// Stool 1 (x=12, y=8)
add(12, 8, 1, PAL.STOOL_LEG);
add(12, 8, 2, PAL.STOOL_LEG);
add(12, 8, 3, PAL.STOOL_SEAT);
// Stool 2 (x=16, y=8)
add(16, 8, 1, PAL.STOOL_LEG);
add(16, 8, 2, PAL.STOOL_LEG);
add(16, 8, 3, PAL.STOOL_SEAT);

// --- Towel rack on left wall ---
add(0, 24, 6, PAL.PIPE_SILVER);
add(0, 25, 6, PAL.PIPE_SILVER);
add(0, 24, 5, PAL.TOWEL);
add(0, 25, 5, PAL.TOWEL);

// Write file
const buf = createVoxFile(W, D, H, voxels, palette);
const outPath = path.join(__dirname, 'output', 'brew-station.vox');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);
console.log(`Written: ${outPath} (${voxels.length} voxels, ${buf.length} bytes)`);
