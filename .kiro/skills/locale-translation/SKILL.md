---
name: locale-translation
description: Schema and process for translating re:Solve episodes into target languages using the overlay locale system. The locale file overlays translated text at runtime without modifying the original English JSONs.
---

# Locale Translation Skill

## Overview

re:Solve supports player-controlled multi-language via an **overlay pattern**. English is the base (original JSONs unchanged). Each target language is a single JSON file that overrides translatable strings. The game engine reads the locale at runtime and substitutes text where translations exist; missing keys fall back to English.

## File Locations

```
scenarios/aws/<episode-id>/
├── cards.json              ← English (DO NOT MODIFY)
├── narrative.json          ← English (DO NOT MODIFY)
├── rooms.json              ← English (DO NOT MODIFY)
├── puzzles.json            ← English (DO NOT MODIFY)
├── meta.json               ← English (DO NOT MODIFY)
└── locales/
    ├── index.json          ← Registry of available locales
    └── <lang>.json         ← Translation overlay (e.g., id.json, ja.json, zh.json)
```

## Locale Index Schema (`locales/index.json`)

```json
{
  "locales": [
    { "code": "id", "label": "Indonesia", "flag": "🇮🇩" },
    { "code": "ja", "label": "日本語", "flag": "🇯🇵" }
  ]
}
```

- `code`: ISO 639-1 language code
- `label`: Native-language name shown in the toggle
- `flag`: Flag emoji for the toggle button

## Locale File Schema (`locales/<lang>.json`)

```json
{
  "locale": "<lang-code>",
  "label": "<Native name>",
  "flag": "<flag emoji>",

  "meta": {
    "title": "...",
    "description": "...",
    "start_button": "...",
    "end_title": "...",
    "lore_label": "..."
  },

  "ui": {
    "map": "...",
    "interact": "...",
    "tools": "...",
    "hints": "...",
    "hint": "...",
    "start": "...",
    "score": "...",
    "time_remaining": "...",
    "send_to_golem": "...",
    "lore_collected": "...",
    "items_collected": "...",
    "puzzles_solved": "..."
  },

  "narrative": {
    "intro": {
      "segments": [
        { "index": 0, "text": "..." },
        { "index": 1, "text": "..." }
      ]
    },
    "ending": {
      "success": {
        "segments": [
          { "index": 0, "text": "..." }
        ]
      },
      "failure": {
        "segments": [
          { "index": 0, "text": "..." }
        ]
      }
    }
  },

  "cards": {
    "<card_id>": {
      "title": "...",
      "description": "..."
    }
  },

  "rooms": {
    "<room_card_id>": {
      "unlock_text": "..."
    }
  },

  "puzzles": {
    "<puzzle_id>": {
      "description": "...",
      "config_overrides": {
        "question": "...",
        "greeting": "...",
        "lines": [
          { "label": "...", "response": "..." }
        ],
        "options": ["...", "..."],
        "steps": [
          { "question": "...", "narration": "..." }
        ]
      }
    }
  }
}
```

## Field Rules

### Cards (`cards` section)
- Key: card_id as string (e.g., "100", "205")
- Fields: `title` (translated), `description` (translated)
- MUST cover every card in cards.json — no gaps

### Rooms (`rooms` section)
- Key: room card_id as string
- Fields: `unlock_text` (translated)

### Narrative (`narrative` section)
- `segments` uses `index` (0-based) to match the original segment position
- Translate the `text` field only
- Preserve segment count — every original segment should have a translation

### Puzzles (`puzzles` section)
- Key: puzzle id (string)
- `description`: player-facing instruction text
- `config_overrides`: ONLY display text. Override ONLY these fields:
  - `question` / `narration` — what the player reads
  - `greeting` — NPC opening line
  - `lines[].label` / `lines[].response` — NPC dialog choices and responses
  - `options[]` — display labels for choices (NOT answer values)
  - `steps[].question` / `steps[].narration` — multi-step puzzle text
  - `wrong{}` — wrong-answer feedback messages
  - `after` — post-step confirmation messages
- NEVER override: `answer`, `solution`, `answers`, `accept`, `id`, `type`, `ui`, `target`, `tasks`

### UI (`ui` section)
- Static UI strings used by the game engine
- Keys are fixed (defined by the engine): map, interact, tools, hints, hint, start, score, time_remaining, send_to_golem, lore_collected, items_collected, puzzles_solved
- Only include keys that the episode's UI actually displays

## Process

### Step 1: Read Source

```bash
cat scenarios/aws/<episode-id>/cards.json
cat scenarios/aws/<episode-id>/narrative.json
cat scenarios/aws/<episode-id>/rooms.json
cat scenarios/aws/<episode-id>/puzzles.json
cat scenarios/aws/<episode-id>/meta.json
```

### Step 2: Create locales/ directory

```bash
mkdir -p scenarios/aws/<episode-id>/locales
```

### Step 3: Write index.json

```bash
cat > scenarios/aws/<episode-id>/locales/index.json << 'EOF'
{
  "locales": [
    { "code": "<lang>", "label": "<Native name>", "flag": "<emoji>" }
  ]
}
EOF
```

### Step 4: Write translation file

Translate ALL cards, rooms, narrative segments, meta, UI strings, and puzzle display text. Write to `scenarios/aws/<episode-id>/locales/<lang>.json`.

### Step 5: Validate

```bash
# Count check
node -e "
const cards = require('./scenarios/aws/<id>/cards.json');
const locale = require('./scenarios/aws/<id>/locales/<lang>.json');
const srcCount = (cards.cards || Object.keys(cards)).length;
const locCount = Object.keys(locale.cards).length;
console.log('Cards:', srcCount, '→ Locale:', locCount, srcCount === locCount ? '✓' : '✗ MISMATCH');
"
```

## Supported Languages

| Code | Label | Flag | Notes |
|------|-------|------|-------|
| id | Indonesia | 🇮🇩 | Bahasa Indonesia — informal "kamu" style |
| ms | Melayu | 🇲🇾 | Bahasa Melayu — similar to id but with MY vocab |
| ja | 日本語 | 🇯🇵 | Japanese — polite casual (です/ます) |
| zh | 中文 | 🇨🇳 | Simplified Chinese |
| th | ไทย | 🇹🇭 | Thai |
| ko | 한국어 | 🇰🇷 | Korean |

## Common Mistakes

1. **Translating puzzle answers** — NEVER. If the answer is "CONDUCTOR", it stays "CONDUCTOR" regardless of locale.
2. **Missing cards** — Every card_id in cards.json MUST appear in the locale. Don't skip "simple" cards.
3. **Stiff translation** — This is a game. Use conversational language, humor, urgency.
4. **Translating proper nouns** — "Kiro", "Bolt", "Lambda" stay as-is.
5. **Ignoring NPC personality** — If the PO is "busy and vague" in English, they should be "sibuk dan samar" in Indonesian — same energy.
6. **Forgetting UI strings** — Players see "Map", "Hints", "Tools" every screen. These must be translated.
