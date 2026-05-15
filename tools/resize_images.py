"""Resize all scenario images to display-optimized sizes.

Room/location images (wide): 768x432
Card images (square-ish): 320x320
Cover/ending images: 1024x576

Determines type by filename pattern:
- cover.png, ending-*.png → 1024x576
- Room images (no 'card-' prefix, not cover/ending) → 768x432
- card-*.png → 320x320
"""

import os
import sys
from pathlib import Path
from PIL import Image

TARGETS = {
    'cover': (1024, 576),
    'ending': (1024, 576),
    'room': (768, 432),
    'card': (320, 320),
}

def classify(filename):
    name = filename.lower()
    if name == 'cover.png' or name.startswith('ending'):
        return 'cover'
    if name.startswith('card-'):
        return 'card'
    return 'room'

def resize_image(filepath, target_size):
    img = Image.open(filepath)
    if img.size[0] <= target_size[0] and img.size[1] <= target_size[1]:
        return False  # already small enough
    # Respect orientation: if image is portrait but target is landscape, flip target
    img_is_portrait = img.size[1] > img.size[0]
    target_is_landscape = target_size[0] > target_size[1]
    if img_is_portrait and target_is_landscape:
        target_size = (target_size[1], target_size[0])  # swap to portrait
    img = img.resize(target_size, Image.LANCZOS)
    img.save(filepath, 'PNG', optimize=True)
    return True

def main():
    base = Path('scenarios')
    if not base.exists():
        print("Run from project root (where scenarios/ is)")
        sys.exit(1)

    pngs = list(base.rglob('*.png'))
    print(f"Found {len(pngs)} PNG files")

    resized = 0
    saved_bytes = 0
    for p in pngs:
        old_size = p.stat().st_size
        cat = classify(p.name)
        target = TARGETS[cat]
        if resize_image(p, target):
            new_size = p.stat().st_size
            saved_bytes += old_size - new_size
            resized += 1
            print(f"  OK {p} ({old_size//1024}KB -> {new_size//1024}KB)")

    print(f"\nDone. Resized {resized}/{len(pngs)} images. Saved {saved_bytes//1024//1024}MB.")

if __name__ == '__main__':
    main()
