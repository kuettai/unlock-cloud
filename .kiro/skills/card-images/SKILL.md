---
name: card-image-generation
description: Guide for generating scenario card images using OpenAI gpt-image-1. Use when creating or updating card artwork for any episode.
---

# Card Image Generation

## Overview

Cards with an `image` field ending in `.png` in `cards.json` get artwork generated via OpenAI `gpt-image-1`.

## Running

```
python tools/cards_to_images.py scenarios/<episode-dir>
```

Only generates missing images. Existing files are skipped.

## Style Configuration

Each scenario has an `image-style.json` that controls the visual style:

```json
{
  "style_prefix": "Digital illustration, game card art.",
  "style_prefix_location": "Digital illustration, wide angle, game environment art.",
  "style_prefix_item": "Digital illustration, single object, clean icon style, game inventory art.",
  "style_prefix_object": "Digital illustration, interactive prop, close-up detail, game card art.",
  "negative_prompt": "text, words, letters, numbers, watermark, blurry, low quality, ugly",
  "aspect_ratio": "16:9"
}
```

Fields:
- `style_prefix` — default prefix for all card types.
- `style_prefix_location` / `style_prefix_item` / `style_prefix_object` — type-specific overrides. The tool picks the prefix matching the card's `type` field, falling back to `style_prefix`.
- `negative_prompt` — appended as "Do NOT include: ..." to the prompt.
- `aspect_ratio` — mapped to OpenAI sizes: `16:9` → `1536x1024`, `9:16` → `1024x1536`, `1:1` → `1024x1024`.

If `image-style.json` is missing, defaults are used (generic game card art, 16:9).

## Image Resolution by Type

When generating images manually (e.g. in ChatGPT), always include the target resolution in the prompt. Different card types need different sizes:

| Image Type | Resolution | Ratio | Notes |
|---|---|---|---|
| **Cover** (`cover.png`) | 1536×1024 | 16:9 | High-res, cinematic title screen |
| **Ending Success** (`ending-success.png`) | 1536×1024 | 16:9 | High-res, triumphant scene |
| **Ending Failure** (`ending-failure.png`) | 1536×1024 | 16:9 | High-res, melancholic scene |
| **Location/Room** (`<room>.png`) | 1280×720 | 16:9 | Medium-res, wide environment |
| **Object** (`card-<name>.png`) | 480×480 | 1:1 | Small, close-up interactive prop |
| **Item** (`card-<name>.png`) | 480×480 | 1:1 | Small, clean icon-style collectible |
| **NPC** (`card-<name>.png`) | 480×480 | 1:1 | Small, character portrait |

Always include the resolution in the prompt when generating manually. Example:
> "Generate a 1280x720 image: Digital illustration, wide angle..."
> "Generate a 480x480 image: Single object, clean icon style..."

## Prompt Construction

The tool builds prompts as: `{style_prefix_<type>} {card.title}: {card.image_prompt || card.description}`

### Writing Good Image Prompts

When preparing prompts for manual generation, always include the target filename from `cards.json` so the user knows where to save it. Format:

**Filename:** `assets/<name>.png`
**Prompt:** ...

The card `description` field is written for gameplay narrative — it's often too long and too narrative-heavy for image generation. The model cherry-picks details randomly from long prompts. **Use the `image_prompt` field on cards for focused visual descriptions.**

#### Key lessons:

1. **Read the full blueprint, not just card descriptions.** The blueprint has NPC details, room context, discoverable objects, and atmosphere that the card description may omit or summarize.

2. **Include characters when the scene has NPCs.** Describe their appearance, posture, and mood — not just "a person." Example: "A stressed man in a dress shirt paces near a whiteboard, phone pressed to his ear" (Jordan in the War Room).

3. **Focus on 4–6 key visual elements.** Too many details and the model ignores most of them. Pick the elements that define the room's identity and puzzle relevance.

4. **Describe mood and atmosphere.** "Crisis mode", "tense", "claustrophobic", "academic yet messy" — these shape the image more than listing furniture.

5. **Mention lighting and color cues.** "Red glow from error screens", "blue-green LED glow", "morning light through windows" — these set the tone.

6. **Specify what's NOT in the scene when needed.** Server closet has no people. Empty desks should feel abandoned.

#### Example — Bad vs Good:

Bad (raw card description as prompt):
> A glass-walled conference room. Every screen shows red. A massive TV displays the Quick Suite dashboard — all critical services in crimson. Jordan paces by the whiteboard, phone pressed to ear. Coffee cups litter the table. Someone has written "ROOT CAUSE?" in red marker on the whiteboard with nothing underneath.

Good (focused image prompt):
> A glass-walled conference room in full crisis mode. A stressed man in a dress shirt paces near a whiteboard, phone pressed to his ear, gesturing urgently. A massive TV on the wall displays a dashboard glowing entirely in red. Coffee cups scattered across the conference table. A whiteboard with a phrase scrawled in red marker with empty space beneath. Red light from screens reflects off glass walls. Tense, urgent atmosphere.

The good version removes quoted text (AI generates gibberish text), describes the NPC visually, and emphasizes atmosphere.

### Per-episode style considerations

- **ep0 (Boot Sequence):** Cyberpunk neon, no people (digital world). Purple/cyan palette.
- **ep1 (Awakening):** Tron-style cyan wireframe, no people (AI programs). Dark void backgrounds.
- **ep2 (Day One):** Realistic modern NYC office, include people/NPCs. Warm lighting, tech startup feel.

Future episodes should define their own style in `image-style.json` and consider whether the setting includes human characters.

## Cover Images

Each scenario should have an `assets/cover.png` used on the home page and intro screen. Cover images are NOT auto-generated by the tool — create them manually with a cinematic, title-screen composition:

- Include the protagonist/player character in the scene
- Over-the-shoulder or slightly-behind framing so the viewer feels part of the scene
- Show the key environment (the world they're entering)
- Convey the episode's mood (safe/curious for tutorial, urgent/dangerous for action)

## Ending Images

Each scenario should have ending images displayed on the end screen. These are NOT auto-generated — create them manually.

- `assets/ending-success.png` — shown when the player completes the episode
- `assets/ending-failure.png` — shown when time runs out

Success image guidelines:
- Show the aftermath of success — the world transformed by the player's actions
- Include the protagonist in a triumphant or relieved pose
- Reflect the episode's resolution: dashboards turning green, doors opening, systems restored
- Include supporting characters reacting positively (celebrating, nodding, relieved)
- Use warmer/brighter lighting than the gameplay scenes to convey resolution
- Callback to the cover image composition — same character, same world, different outcome

Failure image guidelines:
- Show the same world, but unresolved — screens still red, systems still broken
- Include the protagonist alone, reflective but not destroyed
- Convey "not yet, but next time" — defeat with a hint of hope
- Dimmer, cooler lighting than success — dusk, empty office, quiet
- Include a small hopeful detail (a sticky note, the cat staying nearby)

## Card Image Conventions

- Location cards (green) should have `image` fields pointing to `assets/<room-name>.png`.
- Object and item cards typically have `"image": null`.
- The hidden room mural (`hidden-room-mural.svg`) is hand-crafted SVG with embedded puzzle elements. Do not regenerate it.
- Only `.png` references are processed; `.svg` files are skipped.
- Use `image_prompt` field on cards for focused visual descriptions instead of relying on `description`.

## Adding Images to New Episodes

1. Create `image-style.json` in the scenario directory with the desired visual style.
2. Set card `image` fields in `cards.json` to `assets/<name>.png`.
3. Add `image_prompt` fields to cards that need focused visual descriptions (especially locations with NPCs).
4. Read the full blueprint to understand room context, NPCs, and discoverable objects before writing prompts.
5. Run the tool, or generate one-by-one for review.
6. Create `assets/cover.png` separately for the episode cover.
7. Create `assets/ending-success.png` and `assets/ending-failure.png` for the end screens.

## Prerequisites

- `OPENAI_API_KEY` environment variable set (stored as user env var, not in repo).
- Python with `openai` package installed.
- API billing enabled at https://platform.openai.com/settings/organization/billing
- Cost: ~$0.02–0.08 per image at 1536x1024.
