"""Generate ALL images for EP3 — cards, cover, and endings.

Runs cards_to_images.py for card art, then generates cover.png,
ending-success.png, and ending-failure.png manually.

Requires OPENAI_API_KEY environment variable.
"""

import base64
import json
import sys
from pathlib import Path

from openai import OpenAI

SCENARIO_DIR = Path("scenarios/aws/ep3-kings-errand")
ASSETS_DIR = SCENARIO_DIR / "assets"


def load_json(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_style() -> dict:
    return load_json(SCENARIO_DIR / "image-style.json")


def generate_image(client: OpenAI, prompt: str, size: str = "1536x1024") -> bytes:
    style = load_style()
    neg = style.get("negative_prompt", "")
    full_prompt = f"{prompt}\n\nDo NOT include: {neg}" if neg else prompt
    result = client.images.generate(
        model="gpt-image-1",
        prompt=full_prompt,
        n=1,
        size=size,
    )
    return base64.b64decode(result.data[0].b64_json)


def save_image(data: bytes, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)
    print(f"  OK ({len(data)} bytes)")


# --- Manual image definitions (not in cards.json) ---

MANUAL_IMAGES = {
    "cover.png": {
        "size": "1536x1024",
        "prompt": (
            "Medieval illuminated manuscript illustration, storybook art style, rich jewel tones, gold leaf accents, ornate borders, warm parchment textures. "
            "A young steward seen from slightly behind, standing at the entrance of a grand medieval castle courtyard at golden hour. "
            "Before them stretches a bustling kingdom — a marketplace with colorful stalls, castle towers with fluttering banners, and rolling hills beyond. "
            "The steward holds a royal scroll in one hand. Five knight figures of ascending rank are visible in the distance — from a simple soldier to a gleaming champion. "
            "Warm golden afternoon light, sense of adventure and possibility, cinematic wide composition. "
            "Title screen composition for 'The King's Errand'."
        ),
    },
    "ending-success.png": {
        "size": "1536x1024",
        "prompt": (
            "Medieval illuminated manuscript illustration, storybook art style, rich jewel tones, gold leaf accents, ornate borders, warm parchment textures. "
            "A grand festival celebration scene at sunset. The festival grounds are alive with color — "
            "fire-breathers performing on a main stage, colorful stalls with crimson and emerald canopies, "
            "crowds of joyful townspeople, fireworks bursting in the golden sky. "
            "A young steward stands in the foreground, relieved and triumphant, with a gleaming Champion knight beside them. "
            "King Aldric claps from a royal viewing platform. Pip the apprentice jumps with joy. "
            "Warm golden sunset light, festive lanterns, celebration and triumph atmosphere."
        ),
    },
    "ending-failure.png": {
        "size": "1536x1024",
        "prompt": (
            "Medieval illuminated manuscript illustration, storybook art style, muted jewel tones, gold leaf accents, ornate borders, warm parchment textures. "
            "Empty festival grounds at dusk. Undecorated stalls stand bare, stages are empty, "
            "a few scattered banners flutter in the evening breeze. "
            "A young steward stands alone in the center of the empty grounds, looking at an unfinished errand board. "
            "The castle looms in the background against a dimming sky. "
            "A single lantern glows warmly nearby — a small hopeful detail. "
            "Pip the apprentice sits on a barrel nearby, still holding scrolls, waiting patiently. "
            "Melancholic but not hopeless, dusk light, quiet and reflective atmosphere."
        ),
    },
}


def run():
    client = OpenAI()
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    # --- Step 1: Generate card images via the standard tool ---
    print("=== Step 1: Card images ===\n")
    cards = load_json(SCENARIO_DIR / "cards.json")["cards"]
    style = load_style()
    targets = [c for c in cards if c.get("image") and c["image"].endswith(".png")]
    missing = [c for c in targets if not (SCENARIO_DIR / c["image"]).exists()]

    if not missing:
        print(f"All {len(targets)} card images already exist.\n")
    else:
        print(f"Generating {len(missing)} card image(s) ({len(targets) - len(missing)} already exist).\n")
        for card in missing:
            out_path = SCENARIO_DIR / card["image"]
            out_path.parent.mkdir(parents=True, exist_ok=True)

            card_type = card.get("type", "")
            prefix = style.get(f"style_prefix_{card_type}", style["style_prefix"])
            desc = card.get("image_prompt") or card["description"]
            prompt = f"{prefix} {card['title']}: {desc}"

            # Use 1:1 for items/objects, 16:9 for locations
            if card_type in ("item", "object", "tool"):
                size = "1024x1024"
            else:
                size = "1536x1024"

            print(f"  Card #{card['id']} ({card['title']}) -> {card['image']}")
            try:
                img_bytes = generate_image(client, prompt, size)
                save_image(img_bytes, out_path)
            except Exception as e:
                print(f"  FAILED: {e}\n")

    # --- Step 2: Generate manual images (cover, endings) ---
    print("\n=== Step 2: Cover & ending images ===\n")
    for filename, spec in MANUAL_IMAGES.items():
        out_path = ASSETS_DIR / filename
        if out_path.exists():
            print(f"  {filename} already exists, skipping.")
            continue
        print(f"  Generating {filename}...")
        try:
            img_bytes = generate_image(client, spec["prompt"], spec["size"])
            save_image(img_bytes, out_path)
        except Exception as e:
            print(f"  FAILED: {e}\n")

    print("\nDone.")


if __name__ == "__main__":
    run()
