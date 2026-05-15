"""Generate card images for a scenario using OpenAI gpt-image-1.

Reads cards.json and image-style.json from the scenario directory,
finds cards with .png image fields, and generates images.

Requires OPENAI_API_KEY environment variable.
"""

import base64
import json
import sys
from pathlib import Path

from openai import OpenAI

DEFAULTS = {
    "style_prefix": "Digital illustration, game card art.",
    "style_prefix_item": "Digital illustration, single sci-fi object on dark background, glowing neon accents, clean icon style, centered, cyberpunk item, game inventory art.",
    "style_prefix_object": "Digital illustration, sci-fi interactive prop, dark moody background, neon highlights, cyberpunk, close-up detail, game card art.",
    "style_prefix_location": "Digital illustration, dark sci-fi escape room interior, neon-lit cyberpunk, moody atmosphere, circuit patterns, glowing accents, wide angle, game environment art.",
    "negative_prompt": "text, words, letters, numbers, watermark, blurry, low quality, ugly",
    "aspect_ratio": "16:9",
}

SIZE_MAP = {
    "16:9": "1536x1024",
    "9:16": "1024x1536",
    "1:1": "1024x1024",
}

RESIZE_MAP = {
    "location": (768, 432),
    "item": (320, 320),
    "object": (320, 320),
    "tool": (320, 320),
    "lore": (320, 320),
}
}


def load_json(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_style(scenario_dir: Path) -> dict:
    style_path = scenario_dir / "image-style.json"
    style = dict(DEFAULTS)
    if style_path.exists():
        style.update(load_json(style_path))
    return style


def generate_image(client: OpenAI, prompt: str, style: dict) -> bytes:
    size = SIZE_MAP.get(style["aspect_ratio"], "1536x1024")
    neg = style.get("negative_prompt", "")
    full_prompt = f"{prompt}\n\nDo NOT include: {neg}" if neg else prompt

    result = client.images.generate(
        model="gpt-image-1",
        prompt=full_prompt,
        n=1,
        size=size,
    )
    return base64.b64decode(result.data[0].b64_json)


def run(scenario_dir: str):
    scenario_path = Path(scenario_dir)
    cards = load_json(scenario_path / "cards.json")["cards"]
    style = load_style(scenario_path)
    client = OpenAI()

    targets = [c for c in cards if c.get("image") and c["image"].endswith(".png")]
    if not targets:
        print("No cards with .png image references found.")
        return

    print(f"Style: {style['style_prefix'][:80]}...")
    missing = [c for c in targets if not (scenario_path / c["image"]).exists()]
    if not missing:
        print(f"All {len(targets)} images already exist. Nothing to generate.")
        return
    print(f"Found {len(missing)} new image(s) ({len(targets) - len(missing)} already exist).\n")
    for card in missing:
        out_path = scenario_path / card["image"]
        out_path.parent.mkdir(parents=True, exist_ok=True)

        card_type = card.get("type", "")
        prefix = style.get(f"style_prefix_{card_type}", style["style_prefix"])
        desc = card.get("image_prompt") or card["description"]
        prompt = f"{prefix} {card['title']}: {desc}"
        print(f"  Card #{card['id']} ({card['title']}) -> {card['image']}")

        img_bytes = generate_image(client, prompt, style)
        with open(out_path, "wb") as f:
            f.write(img_bytes)

        # Resize to display size
        target_size = RESIZE_MAP.get(card_type)
        if target_size:
            from PIL import Image
            import io
            img = Image.open(io.BytesIO(img_bytes))
            img = img.resize(target_size, Image.LANCZOS)
            img.save(out_path, "PNG", optimize=True)
            print(f"  OK (resized to {target_size[0]}x{target_size[1]})\n")
        else:
            print(f"  OK ({len(img_bytes)} bytes)\n")

    print("Done.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} <scenario_directory>")
        sys.exit(1)
    run(sys.argv[1])
