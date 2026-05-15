/**
 * Back Door — outdoor car park at night, looking at back of building with metal door
 * 32x32x20, building wall at back (y=31), car park in front, one car
 */
const fs = require('fs');
const path = require('path');
const { createVoxFile } = require('./vox-writer');

const PAL = {
  ASPHALT: 1, ASPHALT_DARK: 2, BRICK: 3, BRICK_DARK: 4,
  DOOR: 5, DOOR_FRAME: 6, KEYPAD: 7, KEYPAD_GREEN: 8,
  CAR_BODY: 9, CAR_WINDOW: 10, CAR_WHEEL: 11, HEADLIGHT: 12,
  LINE_PAINT: 13, KEY_BRASS: 14, HOOK: 15, NOTE: 16,
  PIPE: 17, LAMP_POST: 18, LAMP_LIGHT: 19, CURB: 20,
};

const palette = [];
palette[0]  = { r: 55, g: 55, b: 60, a: 255 };     // 1: asphalt
palette[1]  = { r: 40, g: 40, b: 45, a: 255 };     // 2: asphalt dark
palette[2]  = { r: 140, g: 75, b: 55, a: 255 };    // 3: brick
palette[3]  = { r: 110, g: 55, b: 40, a: 255 };    // 4: brick dark (mortar)
palette[4]  = { r: 60, g: 100, b: 70, a: 255 };  // 5: green door
palette[5]  = { r: 80, g: 80, b: 85, a: 255 };     // 6: door frame
palette[6]  = { r: 30, g: 30, b: 35, a: 255 };     // 7: keypad body
palette[7]  = { r: 50, g: 220, b: 80, a: 255 };    // 8: keypad green light
palette[8]  = { r: 50, g: 60, b: 90, a: 255 };     // 9: car body (dark blue)
palette[9]  = { r: 100, g: 140, b: 170, a: 255 };  // 10: car window
palette[10] = { r: 25, g: 25, b: 25, a: 255 };     // 11: wheel
palette[11] = { r: 255, g: 240, b: 150, a: 255 };  // 12: headlight
palette[12] = { r: 240, g: 240, b: 240, a: 255 };  // 13: parking line paint
palette[13] = { r: 200, g: 170, b: 60, a: 255 };   // 14: brass key
palette[14] = { r: 90, g: 90, b: 95, a: 255 };     // 15: hook
palette[15] = { r: 230, g: 220, b: 200, a: 255 };  // 16: note/paper
palette[16] = { r: 120, g: 125, b: 130, a: 255 };  // 17: pipe
palette[17] = { r: 70, g: 70, b: 75, a: 255 };     // 18: lamp post
palette[18] = { r: 255, g: 220, b: 100, a: 255 };  // 19: lamp light
palette[19] = { r: 100, g: 100, b: 105, a: 255 };  // 20: curb

const W = 32, D = 32, H = 20;
const voxels = [];
function add(x, y, z, c) { voxels.push({ x, y, z, colorIndex: c }); }
function box(x0, y0, z0, x1, y1, z1, c) {
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++) add(x, y, z, c);
}

// --- Asphalt ground (car park) ---
for (let x = 0; x < W; x++)
  for (let y = 0; y < 28; y++)
    add(x, y, 0, (x * 7 + y * 3) % 6 === 0 ? PAL.ASPHALT_DARK : PAL.ASPHALT);

// --- Curb/sidewalk along building ---
for (let x = 0; x < W; x++) {
  add(x, 28, 0, PAL.CURB);
  add(x, 28, 1, PAL.CURB);
  add(x, 29, 0, PAL.CURB);
}

// --- Parking lines ---
for (let y = 2; y <= 12; y++) { add(8, y, 0, PAL.LINE_PAINT); add(18, y, 0, PAL.LINE_PAINT); add(28, y, 0, PAL.LINE_PAINT); }

// --- Building back wall (y=30-31, brick), skip door area on y=30 ---
for (let x = 0; x < W; x++)
  for (let z = 1; z <= 16; z++) {
    const isMortar = z % 3 === 0 || x % 5 === 0;
    add(x, 31, z, isMortar ? PAL.BRICK_DARK : PAL.BRICK);
    // Skip door area on front face (x=11-20, z=1-13)
    if (x >= 11 && x <= 20 && z <= 13) continue;
    add(x, 30, z, isMortar ? PAL.BRICK_DARK : PAL.BRICK);
  }

// --- Metal door (center of wall) ---
for (let z = 2; z <= 12; z++) {
  box(12, 30, z, 19, 30, z, PAL.DOOR);
}
// Door frame
for (let z = 1; z <= 13; z++) { add(11, 30, z, PAL.DOOR_FRAME); add(20, 30, z, PAL.DOOR_FRAME); }
for (let x = 11; x <= 20; x++) add(x, 30, 13, PAL.DOOR_FRAME);

// --- Keypad beside door ---
box(21, 30, 7, 22, 30, 9, PAL.KEYPAD);
add(22, 30, 8, PAL.KEYPAD_GREEN);

// --- Hook with brass key ---
add(10, 30, 8, PAL.HOOK);
add(10, 30, 7, PAL.KEY_BRASS);
add(10, 30, 6, PAL.KEY_BRASS);

// --- Note taped to wall ---
box(23, 30, 10, 25, 30, 12, PAL.NOTE);

// --- Pipe running along top of wall ---
for (let x = 0; x < W; x++) add(x, 30, 15, PAL.PIPE);

// --- Car (parked, facing building, elongated) ---
// Body (x=11-16, y=2-14, z=1-3)
box(11, 2, 1, 16, 14, 3, PAL.CAR_BODY);
// Roof (x=12-15, y=5-11, z=4-5)
box(12, 5, 4, 15, 11, 5, PAL.CAR_BODY);
// Windows
box(12, 5, 4, 15, 5, 5, PAL.CAR_WINDOW);
box(12, 11, 4, 15, 11, 5, PAL.CAR_WINDOW);
// Wheels
add(11, 3, 1, PAL.CAR_WHEEL); add(11, 13, 1, PAL.CAR_WHEEL);
add(16, 3, 1, PAL.CAR_WHEEL); add(16, 13, 1, PAL.CAR_WHEEL);
// Headlights (facing building)
add(12, 14, 2, PAL.HEADLIGHT);
add(15, 14, 2, PAL.HEADLIGHT);

// --- Lamp post (left side) ---
add(3, 15, 1, PAL.LAMP_POST);
add(3, 15, 2, PAL.LAMP_POST);
add(3, 15, 3, PAL.LAMP_POST);
add(3, 15, 4, PAL.LAMP_POST);
add(3, 15, 5, PAL.LAMP_POST);
add(3, 15, 6, PAL.LAMP_POST);
add(3, 15, 7, PAL.LAMP_POST);
add(3, 15, 8, PAL.LAMP_LIGHT);
add(2, 15, 8, PAL.LAMP_LIGHT);
add(4, 15, 8, PAL.LAMP_LIGHT);

const buf = createVoxFile(W, D, H, voxels, palette);
const outPath = path.join(__dirname, 'output', 'back-door.vox');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);
console.log(`Written: ${outPath} (${voxels.length} voxels, ${buf.length} bytes)`);
