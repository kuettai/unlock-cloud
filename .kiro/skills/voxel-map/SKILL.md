---
name: voxel-map-generation
description: Guide for generating 2.5D isometric voxel room maps using MagicaVoxel. Use when creating or updating map visuals for any episode.
---

# 2.5D Voxel Map Generation

## Overview

Replaces flat 2D room images (CSS-transformed) with pre-rendered isometric voxel art from MagicaVoxel. The voxel renders are already isometric, so the map displays them flat (no CSS 3D transform).

## Workflow

### 1. Read Image Prompts

Read the episode's `IMAGE-PROMPTS.md` file, specifically the **Room Images** section. Each room prompt describes the environment, objects, mood, and lighting. Use these as the design reference for voxel models.

### 2. Generate .vox Files

Use the vox-writer utility to create room models:

```
node tools/vox-generator/<room-name>.js
```

Each room script:
- Imports `./vox-writer.js` (the binary writer)
- Defines a palette (up to 255 colors, index 1-based)
- Builds voxels using `add(x, y, z, colorIndex)` and `box(x0, y0, z0, x1, y1, z1, colorIndex)` helpers
- Outputs to `tools/vox-generator/output/<room-name>.vox`

**Key conventions:**
- Model size: 32×32×20 (W×D×H)
- Only 2 walls: back wall (y=31) and left wall (x=0) — keeps interior visible from isometric angle
- Floor at z=0, walls from z=1 upward
- Objects placed 1 voxel away from walls so renderer can see them
- Skip wall voxels where doors/windows go (avoid duplicate voxels at same position)

### 3. Render in MagicaVoxel

Prompt the user to:
1. Open each `.vox` file in MagicaVoxel
2. Switch to **Render** mode
3. Position camera at a consistent isometric angle across all rooms
4. Press **Ctrl+6** to save the render (saves to `<MagicaVoxel>/export/`)
5. Save/copy all rendered PNGs to the episode's `25maps/` folder:
   ```
   scenarios/<category>/<episode>/25maps/<room-name>.png
   ```

### 4. Remove Background

MagicaVoxel renders have a grey gradient background. Remove it:

```
node tools/vox-generator/remove-bg.js "<input.png>" "<output.png>"
```

To overwrite in-place (recommended):
```
node tools/vox-generator/remove-bg.js "scenarios/.../25maps/room.png" "scenarios/.../25maps/room.png"
```

This flood-fills from edges, removing neutral grey pixels (saturation < 0.10, brightness 30–160), producing a transparent PNG.

### 5. Test in maps-test.html

Update `app/maps-test.html` with the new image paths pointing to `25maps/`:

```js
{ id: 1, name: 'Room Name', image: '../scenarios/.../25maps/room.png', x: 230, y: 420, state: 'explored' }
```

The test page uses **flat layout** (no CSS 3D transform) since voxel renders are already isometric. Key CSS:
- `.map-tile`: `background: transparent; border: none; padding: 0`
- `.map-tile img`: `object-fit: contain`
- State indicators use `filter: drop-shadow(...)` instead of borders
- Pin marker uses 📍 emoji
- No `rotateX`/`rotateZ` on the container

### 6. Update meta.json

Add `"map_style": "voxel"` to the episode's `meta.json`:

```json
{
  "id": "ep2-153-fish",
  "map_style": "voxel",
  ...
}
```

Values:
- `"voxel"` — flat layout, images from `25maps/` folder, no CSS 3D transform
- absent or `"flat"` — legacy behavior: 2D images with CSS `rotateX(55deg) rotateZ(45deg)` transform

The engine reads this field to decide which map renderer to use.

### 7. Update rooms.json map_pos

When using voxel style, `map_pos` coordinates should be spaced for 200×200 tiles in a diamond pattern. Example layout:

```json
"map_pos": [230, 420]   // bottom center
"map_pos": [100, 320]   // middle left
"map_pos": [230, 220]   // center
"map_pos": [360, 320]   // middle right
"map_pos": [230, 60]    // top center
```

## File Structure

```
tools/vox-generator/
  vox-writer.js          # Binary .vox format writer (reusable)
  remove-bg.js           # Background removal (requires sharp)
  <room-name>.js         # Per-room model generators
  output/                # Generated .vox files
  node_modules/          # sharp dependency

scenarios/<category>/<episode>/
  25maps/                # Transparent rendered PNGs for voxel map
    back-door.png
    store-room.png
    brew-station.png
    ...
  meta.json              # Contains "map_style": "voxel"
  rooms.json             # map_pos coordinates for tile placement
```

## Palette Tips

- Use 12–22 colors per room (keeps models readable at small size)
- Include floor variation (checkerboard or noise pattern)
- Dark trim/baseboard on walls adds depth
- Bright accent colors for interactive objects (keys, buttons, signs)
- Keep similar palette across rooms in the same episode for visual consistency

## Common Issues

| Issue | Fix |
|-------|-----|
| Objects invisible in render | Move 1 voxel away from walls (avoid z-fighting) |
| Grey spots after bg removal | Widen tolerance in `remove-bg.js` or re-render with different angle |
| Door not visible | Skip wall voxels in the door area before drawing the door |
| Room looks empty | Add furniture, floor mats, wall shelves, items on surfaces |
| Car/object too square | Elongate one axis (make rectangular, not cubic) |
