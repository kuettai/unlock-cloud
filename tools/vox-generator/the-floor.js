/**
 * The Floor — café dining area with tables, chairs, chalkboard
 * 32x32x20, two walls (back + left), open right + front
 */
const fs = require('fs');
const path = require('path');
const { createVoxFile } = require('./vox-writer');

const PAL = {
  FLOOR: 1, FLOOR_DARK: 2, WALL: 3, WALL_TRIM: 4,
  TABLE_TOP: 5, TABLE_LEG: 6, CHAIR_SEAT: 7, CHAIR_BACK: 8,
  CHALK_BOARD: 9, CHALK_TEXT: 10, WINDOW: 11, PLANT_POT: 12,
  PLANT_LEAF: 13, LAMP: 14, LAMP_SHADE: 15, CUP: 16,
  BOOK: 17, RUG: 18, FRAME: 19, DOOR_MAT: 20,
};

const palette = [];
palette[0]  = { r: 180, g: 130, b: 80, a: 255 };   // 1: warm wood
palette[1]  = { r: 140, g: 95, b: 55, a: 255 };    // 2: dark wood
palette[2]  = { r: 235, g: 225, b: 210, a: 255 };  // 3: cream wall
palette[3]  = { r: 60, g: 45, b: 35, a: 255 };     // 4: dark trim
palette[4]  = { r: 200, g: 165, b: 110, a: 255 };  // 5: table top (light oak)
palette[5]  = { r: 60, g: 60, b: 65, a: 255 };     // 6: table leg (metal)
palette[6]  = { r: 160, g: 80, b: 50, a: 255 };    // 7: chair seat (leather)
palette[7]  = { r: 50, g: 50, b: 55, a: 255 };     // 8: chair back (metal)
palette[8]  = { r: 30, g: 30, b: 28, a: 255 };     // 9: chalkboard
palette[9]  = { r: 240, g: 240, b: 230, a: 255 };  // 10: chalk
palette[10] = { r: 170, g: 210, b: 230, a: 255 };  // 11: window (light blue)
palette[11] = { r: 140, g: 90, b: 60, a: 255 };    // 12: plant pot
palette[12] = { r: 60, g: 140, b: 50, a: 255 };    // 13: plant leaf
palette[13] = { r: 40, g: 40, b: 40, a: 255 };     // 14: lamp pole
palette[14] = { r: 255, g: 220, b: 100, a: 255 };  // 15: lamp shade
palette[15] = { r: 245, g: 245, b: 240, a: 255 };  // 16: cup
palette[16] = { r: 150, g: 50, b: 50, a: 255 };    // 17: book
palette[17] = { r: 120, g: 80, b: 60, a: 255 };    // 18: rug
palette[18] = { r: 80, g: 60, b: 45, a: 255 };     // 19: picture frame
palette[19] = { r: 50, g: 50, b: 45, a: 255 };     // 20: door mat

const W = 32, D = 32, H = 20;
const voxels = [];
function add(x, y, z, c) { voxels.push({ x, y, z, colorIndex: c }); }
function box(x0, y0, z0, x1, y1, z1, c) {
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++) add(x, y, z, c);
}
function table(cx, cy) {
  // Leg
  add(cx, cy, 1, PAL.TABLE_LEG);
  add(cx, cy, 2, PAL.TABLE_LEG);
  add(cx, cy, 3, PAL.TABLE_LEG);
  // Top
  box(cx-1, cy-1, 4, cx+1, cy+1, 4, PAL.TABLE_TOP);
}
function chair(cx, cy, facing) {
  // Seat
  add(cx, cy, 1, PAL.CHAIR_BACK);
  add(cx, cy, 2, PAL.CHAIR_SEAT);
  // Back
  if (facing === 'N') add(cx, cy+1, 3, PAL.CHAIR_BACK);
  if (facing === 'S') add(cx, cy-1, 3, PAL.CHAIR_BACK);
  if (facing === 'E') add(cx-1, cy, 3, PAL.CHAIR_BACK);
  if (facing === 'W') add(cx+1, cy, 3, PAL.CHAIR_BACK);
}

// Floor
for (let x = 0; x < W; x++)
  for (let y = 0; y < D; y++)
    add(x, y, 0, (x + y) % 2 === 0 ? PAL.FLOOR : PAL.FLOOR_DARK);

// Rug under center area
for (let x = 10; x <= 22; x++)
  for (let y = 10; y <= 22; y++)
    add(x, y, 0, PAL.RUG);

// Back wall (y=31)
for (let x = 0; x < W; x++)
  for (let z = 1; z <= 16; z++) add(x, 31, z, PAL.WALL);

// Left wall (x=0)
for (let y = 0; y < D; y++)
  for (let z = 1; z <= 16; z++) add(0, y, z, PAL.WALL);

// Trim
for (let x = 1; x < W; x++) add(x, 31, 1, PAL.WALL_TRIM);
for (let y = 0; y < D; y++) add(0, y, 1, PAL.WALL_TRIM);

// --- Tables and chairs ---
// Table 1 (front-left)
table(8, 8);
chair(8, 6, 'N'); chair(8, 10, 'S'); chair(6, 8, 'E');

// Table 2 (front-right)
table(22, 8);
chair(22, 6, 'N'); chair(22, 10, 'S'); chair(24, 8, 'W');

// Table 3 (center)
table(15, 16);
chair(15, 14, 'N'); chair(15, 18, 'S'); chair(13, 16, 'E'); chair(17, 16, 'W');

// Table 4 (back-left)
table(8, 24);
chair(8, 22, 'N'); chair(8, 26, 'S');

// Table 5 (back-right)
table(24, 24);
chair(24, 22, 'N'); chair(24, 26, 'S'); chair(26, 24, 'W');

// Items on tables
add(8, 8, 5, PAL.CUP);
add(22, 8, 5, PAL.BOOK);
add(15, 16, 5, PAL.CUP);
add(15, 15, 5, PAL.CUP);
add(24, 24, 5, PAL.CUP);

// --- Chalkboard on back wall ---
box(10, 31, 7, 22, 31, 14, PAL.CHALK_BOARD);
// Chalk writing
for (let x = 12; x <= 20; x += 2) add(x, 30, 13, PAL.CHALK_TEXT);
for (let x = 12; x <= 18; x += 2) add(x, 30, 11, PAL.CHALK_TEXT);
for (let x = 12; x <= 20; x += 2) add(x, 30, 9, PAL.CHALK_TEXT);

// --- Window on left wall ---
box(0, 14, 6, 0, 22, 12, PAL.WINDOW);
// Window frame
for (let y = 14; y <= 22; y++) { add(0, y, 6, PAL.WALL_TRIM); add(0, y, 12, PAL.WALL_TRIM); }
for (let z = 6; z <= 12; z++) { add(0, 14, z, PAL.WALL_TRIM); add(0, 22, z, PAL.WALL_TRIM); }
add(0, 18, 6, PAL.WALL_TRIM); // center divider
for (let z = 6; z <= 12; z++) add(0, 18, z, PAL.WALL_TRIM);

// --- Picture frame on back wall ---
box(4, 31, 9, 7, 31, 12, PAL.FRAME);
box(5, 31, 10, 6, 31, 11, PAL.WALL); // inside

// --- Plant in corner ---
box(28, 29, 1, 29, 30, 2, PAL.PLANT_POT);
add(28, 29, 3, PAL.PLANT_LEAF);
add(29, 30, 3, PAL.PLANT_LEAF);
add(28, 30, 4, PAL.PLANT_LEAF);
add(29, 29, 4, PAL.PLANT_LEAF);
add(29, 30, 5, PAL.PLANT_LEAF);

// --- Standing lamp (front-right) ---
add(28, 4, 1, PAL.LAMP);
add(28, 4, 2, PAL.LAMP);
add(28, 4, 3, PAL.LAMP);
add(28, 4, 4, PAL.LAMP);
add(28, 4, 5, PAL.LAMP);
add(28, 4, 6, PAL.LAMP_SHADE);
add(27, 4, 6, PAL.LAMP_SHADE);
add(29, 4, 6, PAL.LAMP_SHADE);

const buf = createVoxFile(W, D, H, voxels, palette);
const outPath = path.join(__dirname, 'output', 'the-floor.vox');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);
console.log(`Written: ${outPath} (${voxels.length} voxels, ${buf.length} bytes)`);
