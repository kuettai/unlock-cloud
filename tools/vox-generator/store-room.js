/**
 * Store Room — cold storage with shelves, coffee bean bags, keypad door
 * 32x32x20, two walls (back + left), open right + front
 */
const fs = require('fs');
const path = require('path');
const { createVoxFile } = require('./vox-writer');

const PAL = {
  FLOOR: 1, FLOOR_DARK: 2, WALL: 3, WALL_TRIM: 4,
  SHELF_FRAME: 5, SHELF_PLANK: 6, BEAN_BAG: 7, BEAN_BAG2: 8,
  DOOR_FRAME: 9, DOOR: 10, KEYPAD: 11, KEYPAD_BTN: 12,
  CRATE: 13, CRATE_DARK: 14, PIPE: 15, VENT: 16,
  LABEL: 17, BUCKET: 18,
};

const palette = [];
palette[0]  = { r: 160, g: 165, b: 170, a: 255 };  // 1: cold concrete
palette[1]  = { r: 130, g: 135, b: 140, a: 255 };  // 2: darker concrete
palette[2]  = { r: 210, g: 215, b: 220, a: 255 };  // 3: cold white wall
palette[3]  = { r: 80, g: 85, b: 90, a: 255 };     // 4: metal trim
palette[4]  = { r: 90, g: 95, b: 100, a: 255 };    // 5: shelf frame (metal)
palette[5]  = { r: 160, g: 160, b: 165, a: 255 };  // 6: shelf plank
palette[6]  = { r: 100, g: 65, b: 30, a: 255 };    // 7: bean bag (dark roast)
palette[7]  = { r: 140, g: 100, b: 50, a: 255 };   // 8: bean bag (light roast)
palette[8]  = { r: 70, g: 75, b: 80, a: 255 };     // 9: door frame
palette[9]  = { r: 140, g: 150, b: 155, a: 255 };  // 10: metal door
palette[10] = { r: 40, g: 40, b: 45, a: 255 };     // 11: keypad body
palette[11] = { r: 50, g: 200, b: 80, a: 255 };    // 12: keypad button (green)
palette[12] = { r: 180, g: 140, b: 80, a: 255 };   // 13: wooden crate
palette[13] = { r: 130, g: 95, b: 50, a: 255 };    // 14: crate edge
palette[14] = { r: 170, g: 175, b: 180, a: 255 };  // 15: pipe
palette[15] = { r: 120, g: 125, b: 130, a: 255 };  // 16: vent
palette[16] = { r: 230, g: 230, b: 220, a: 255 };  // 17: label
palette[17] = { r: 80, g: 100, b: 120, a: 255 };   // 18: bucket

const W = 32, D = 32, H = 20;
const voxels = [];
function add(x, y, z, c) { voxels.push({ x, y, z, colorIndex: c }); }
function box(x0, y0, z0, x1, y1, z1, c) {
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++) add(x, y, z, c);
}

// Floor
for (let x = 0; x < W; x++)
  for (let y = 0; y < D; y++)
    add(x, y, 0, (x + y) % 3 === 0 ? PAL.FLOOR_DARK : PAL.FLOOR);

// Back wall (y=31)
for (let x = 0; x < W; x++)
  for (let z = 1; z <= 16; z++) add(x, 31, z, PAL.WALL);

// Left wall (x=0)
for (let y = 0; y < D; y++)
  for (let z = 1; z <= 16; z++) add(0, y, z, PAL.WALL);

// Trim
for (let x = 1; x < W; x++) add(x, 31, 1, PAL.WALL_TRIM);
for (let y = 0; y < D; y++) add(0, y, 1, PAL.WALL_TRIM);

// --- Metal shelving unit on back wall (left section) ---
// Uprights
for (let z = 1; z <= 14; z++) { add(3, 30, z, PAL.SHELF_FRAME); add(10, 30, z, PAL.SHELF_FRAME); }
// Shelves
for (let lvl of [3, 7, 11]) box(3, 29, lvl, 10, 30, lvl, PAL.SHELF_PLANK);
// Bean bags on shelves
box(4, 29, 4, 5, 30, 5, PAL.BEAN_BAG);
box(7, 29, 4, 8, 30, 5, PAL.BEAN_BAG2);
box(4, 29, 8, 5, 30, 9, PAL.BEAN_BAG2);
box(7, 29, 8, 8, 30, 9, PAL.BEAN_BAG);
box(5, 29, 12, 6, 30, 13, PAL.BEAN_BAG);
add(9, 29, 12, PAL.BEAN_BAG2);

// --- Second shelving unit (right section) ---
for (let z = 1; z <= 14; z++) { add(14, 30, z, PAL.SHELF_FRAME); add(21, 30, z, PAL.SHELF_FRAME); }
for (let lvl of [3, 7, 11]) box(14, 29, lvl, 21, 30, lvl, PAL.SHELF_PLANK);
// More bags and crates
box(15, 29, 4, 16, 30, 5, PAL.BEAN_BAG);
box(18, 29, 4, 19, 30, 6, PAL.CRATE);
box(18, 29, 4, 18, 30, 6, PAL.CRATE_DARK);
box(15, 29, 8, 17, 30, 9, PAL.BEAN_BAG2);
box(19, 29, 8, 20, 30, 9, PAL.BEAN_BAG);

// --- Shelving on left wall ---
for (let z = 1; z <= 14; z++) { add(0, 5, z, PAL.SHELF_FRAME); add(0, 12, z, PAL.SHELF_FRAME); }
for (let lvl of [3, 7, 11]) { for (let y = 5; y <= 12; y++) add(0, y, lvl, PAL.SHELF_PLANK); }
// Items
box(0, 6, 4, 0, 7, 5, PAL.BEAN_BAG);
box(0, 9, 4, 0, 10, 5, PAL.BEAN_BAG2);
add(0, 7, 8, PAL.BUCKET);
add(0, 10, 8, PAL.BUCKET);

// --- Door with keypad (front-left area, y=0-1) ---
// Door frame
for (let z = 1; z <= 12; z++) { add(8, 0, z, PAL.DOOR_FRAME); add(13, 0, z, PAL.DOOR_FRAME); }
for (let x = 8; x <= 13; x++) add(x, 0, 12, PAL.DOOR_FRAME);
// Door (slightly open)
for (let z = 1; z <= 11; z++) { add(9, 1, z, PAL.DOOR); add(10, 1, z, PAL.DOOR); add(10, 2, z, PAL.DOOR); }
// Keypad on wall next to door
box(14, 0, 6, 15, 0, 8, PAL.KEYPAD);
add(14, 0, 7, PAL.KEYPAD_BTN);
add(15, 0, 7, PAL.KEYPAD_BTN);

// --- Crates on floor (right side) ---
box(24, 20, 1, 27, 23, 3, PAL.CRATE);
box(24, 20, 1, 24, 23, 3, PAL.CRATE_DARK);
box(25, 24, 1, 28, 27, 3, PAL.CRATE);
box(25, 24, 1, 25, 27, 3, PAL.CRATE_DARK);
// Stacked
box(25, 21, 4, 27, 23, 6, PAL.CRATE);
box(25, 21, 4, 25, 23, 6, PAL.CRATE_DARK);

// --- Overhead pipe ---
for (let x = 2; x <= 30; x++) add(x, 31, 15, PAL.PIPE);
// Vent on back wall
box(24, 31, 12, 28, 31, 14, PAL.VENT);

// Labels on bean bags (small white dots)
add(5, 29, 5, PAL.LABEL);
add(8, 29, 5, PAL.LABEL);
add(16, 29, 5, PAL.LABEL);

const buf = createVoxFile(W, D, H, voxels, palette);
const outPath = path.join(__dirname, 'output', 'store-room.vox');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);
console.log(`Written: ${outPath} (${voxels.length} voxels, ${buf.length} bytes)`);
