/**
 * Service Counter — front counter with register, display case, menu board
 * 32x32x20, two walls (back + left), open right + front
 */
const fs = require('fs');
const path = require('path');
const { createVoxFile } = require('./vox-writer');

const PAL = {
  FLOOR: 1, FLOOR_DARK: 2, WALL: 3, WALL_TRIM: 4,
  COUNTER_TOP: 5, COUNTER_BODY: 6, REGISTER: 7, REGISTER_SCREEN: 8,
  DISPLAY_FRAME: 9, DISPLAY_GLASS: 10, PASTRY: 11, PASTRY2: 12,
  MENU_BOARD: 13, MENU_TEXT: 14, CUP_STACK: 15, LID_STACK: 16,
  STRAW_BOX: 17, NAPKIN: 18, TIP_JAR: 19, LIGHT: 20,
};

const palette = [];
palette[0]  = { r: 180, g: 130, b: 80, a: 255 };   // 1: warm wood floor
palette[1]  = { r: 140, g: 95, b: 55, a: 255 };    // 2: dark wood
palette[2]  = { r: 235, g: 225, b: 210, a: 255 };  // 3: cream wall
palette[3]  = { r: 60, g: 45, b: 35, a: 255 };     // 4: dark trim
palette[4]  = { r: 140, g: 140, b: 145, a: 255 };  // 5: counter top (stone)
palette[5]  = { r: 50, g: 60, b: 55, a: 255 };     // 6: counter body (dark green)
palette[6]  = { r: 40, g: 40, b: 45, a: 255 };     // 7: register body
palette[7]  = { r: 80, g: 180, b: 120, a: 255 };   // 8: register screen
palette[8]  = { r: 60, g: 60, b: 65, a: 255 };     // 9: display frame
palette[9]  = { r: 180, g: 220, b: 240, a: 255 };  // 10: display glass
palette[10] = { r: 210, g: 160, b: 80, a: 255 };   // 11: pastry (golden)
palette[11] = { r: 180, g: 100, b: 60, a: 255 };   // 12: pastry (brown)
palette[12] = { r: 30, g: 30, b: 28, a: 255 };     // 13: chalkboard
palette[13] = { r: 240, g: 240, b: 230, a: 255 };  // 14: chalk text
palette[14] = { r: 245, g: 245, b: 240, a: 255 };  // 15: cup stack
palette[15] = { r: 60, g: 60, b: 60, a: 255 };     // 16: lid stack
palette[16] = { r: 200, g: 50, b: 50, a: 255 };    // 17: straw box
palette[17] = { r: 230, g: 220, b: 200, a: 255 };  // 18: napkin
palette[18] = { r: 180, g: 220, b: 200, a: 255 };  // 19: tip jar (glass)
palette[19] = { r: 255, g: 220, b: 100, a: 255 };  // 20: light

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
    add(x, y, 0, (x + y) % 2 === 0 ? PAL.FLOOR : PAL.FLOOR_DARK);

// Back wall (y=31)
for (let x = 0; x < W; x++)
  for (let z = 1; z <= 16; z++) add(x, 31, z, PAL.WALL);

// Left wall (x=0)
for (let y = 0; y < D; y++)
  for (let z = 1; z <= 16; z++) add(0, y, z, PAL.WALL);

// Trim
for (let x = 1; x < W; x++) add(x, 31, 1, PAL.WALL_TRIM);
for (let y = 0; y < D; y++) add(0, y, 1, PAL.WALL_TRIM);

// --- Main service counter (runs across the room, y=12-14) ---
box(2, 12, 1, 28, 14, 4, PAL.COUNTER_BODY);
box(2, 12, 5, 28, 14, 5, PAL.COUNTER_TOP);

// --- Register on counter (x=20-23) ---
box(20, 12, 6, 23, 13, 8, PAL.REGISTER);
box(20, 12, 9, 23, 12, 9, PAL.REGISTER_SCREEN);

// --- Cup stacks on counter ---
box(6, 12, 6, 7, 13, 8, PAL.CUP_STACK);
box(9, 12, 6, 10, 13, 7, PAL.LID_STACK);

// --- Straw box + napkins ---
box(12, 12, 6, 13, 13, 7, PAL.STRAW_BOX);
box(15, 12, 6, 16, 13, 6, PAL.NAPKIN);

// --- Tip jar ---
add(25, 12, 6, PAL.TIP_JAR);
add(25, 12, 7, PAL.TIP_JAR);

// --- Display case (in front of counter, y=8-11) ---
box(4, 8, 1, 16, 11, 1, PAL.DISPLAY_FRAME);  // base
box(4, 8, 2, 4, 11, 5, PAL.DISPLAY_FRAME);    // left frame
box(16, 8, 2, 16, 11, 5, PAL.DISPLAY_FRAME);  // right frame
box(4, 8, 5, 16, 11, 5, PAL.DISPLAY_FRAME);   // top frame
box(5, 8, 2, 15, 8, 4, PAL.DISPLAY_GLASS);    // front glass
// Pastries inside
box(6, 9, 2, 7, 10, 2, PAL.PASTRY);
box(9, 9, 2, 10, 10, 2, PAL.PASTRY2);
box(12, 9, 2, 13, 10, 2, PAL.PASTRY);
add(7, 9, 3, PAL.PASTRY2);
add(11, 9, 3, PAL.PASTRY);

// --- Menu board on back wall ---
box(8, 31, 8, 22, 31, 15, PAL.MENU_BOARD);
// Chalk text lines
for (let x = 10; x <= 20; x += 2) add(x, 30, 14, PAL.MENU_TEXT);
for (let x = 10; x <= 18; x += 2) add(x, 30, 12, PAL.MENU_TEXT);
for (let x = 10; x <= 20; x += 2) add(x, 30, 10, PAL.MENU_TEXT);

// --- Back counter (behind service counter, y=26-30) ---
box(2, 26, 1, 28, 28, 3, PAL.COUNTER_BODY);
box(2, 26, 4, 28, 28, 4, PAL.COUNTER_TOP);

// --- Cups and supplies on back counter ---
box(4, 27, 5, 5, 28, 7, PAL.CUP_STACK);
box(8, 27, 5, 9, 28, 6, PAL.CUP_STACK);
box(12, 27, 5, 13, 28, 6, PAL.LID_STACK);

// --- Ceiling light ---
add(16, 16, 16, PAL.LIGHT);
add(15, 16, 16, PAL.LIGHT);

const buf = createVoxFile(W, D, H, voxels, palette);
const outPath = path.join(__dirname, 'output', 'service-counter.vox');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);
console.log(`Written: ${outPath} (${voxels.length} voxels, ${buf.length} bytes)`);
