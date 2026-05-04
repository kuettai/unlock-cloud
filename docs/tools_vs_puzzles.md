# Tools vs Puzzles

## Distinction

| | Puzzle | Tool |
|---|---|---|
| **Purpose** | Gate progress — must solve to get an item or unlock something | Assist the player — provides information to help solve a puzzle |
| **Has a solution** | Yes — correct answer triggers `onSubmit` | No — no right/wrong, just utility |
| **Awards a card** | Yes — solving discovers an item/room | No — just opens and closes |
| **One-time** | Yes — once solved, discovery button greys out as "done" | No — button stays active, can reopen anytime |
| **In puzzles.json** | `"type": "sequence_lock"` etc. | `"type": "tool"` |
| **Discovery behavior** | Solve → award card → show discovery popup | Open popup → use freely → close manually |

## Puzzle Examples (block progress)

- **Sequence Lock** — replay a flashing pattern to get an Access Key
- **Wire Lock** — connect wires to correct sockets to activate a device
- **Morse Lock** — tap morse code to open a door
- **Word Lock** — dial the correct word to finish the game
- **Jigsaw Lock** — arrange tiles in order to open a box

## Tool Examples (help you think)

- **Base64 Decoder** — decode Base64 encoded text (exists: `app/puzzle/base64-decoder.js`)

### Tool Ideas to Build

| Tool | Description | Use Case |
|---|---|---|
| Hex Decoder | Convert hex string to ASCII text | Decode hex-encoded passwords in logs |
| Binary Converter | Binary ↔ decimal ↔ hex conversion | Work with binary lock puzzles, subnet masks |
| Cipher Wheel | Caesar/ROT13 shift with adjustable offset | Decode shifted text clues |
| IP Calculator | Enter CIDR, shows range/subnet/hosts | VPC and subnet puzzles |
| JSON Formatter | Pretty-print a JSON blob | Read IAM policies, config files |
| Port Reference | Searchable table of common ports (22, 80, 443...) | Security group configuration puzzles |
| AWS Service Glossary | Quick lookup of AWS service names and one-liners | Any AWS-themed scenario |
| Frequency Analyzer | Letter frequency chart for a given text | Substitution cipher puzzles |

## How to Build a Tool

### 1. Create the component

File: `app/puzzle/<name>.js`

```js
class HexDecoder {
  constructor(container, opts = {}) {
    this.container = container;
    this._render();
  }

  _render() {
    // Build UI: input field, output display, any helper buttons
    // No onSubmit callback — tools don't have solutions
    this._injectStyles();
  }

  _injectStyles() {
    if (document.getElementById('hexd-css')) return;
    const s = document.createElement('style');
    s.id = 'hexd-css';
    s.textContent = `/* styles using var(--accent, #3b82f6) fallbacks */`;
    document.head.appendChild(s);
  }
}
```

### 2. Register in puzzles.json

```json
{
  "id": "hex-tool",
  "type": "tool",
  "card_ref": 50,
  "description": "Hex Decoder",
  "ui": "hex-decoder",
  "config": {},
  "hints": []
}
```

Key fields:
- `"type": "tool"` — marks it as a tool, not a puzzle
- `"ui"` — matches the component name used in `showPuzzlePopup`
- `"hints": []` — tools typically don't need hints

### 3. Add discovery in cards.json

```json
{ "card_id": -1, "label": "Use the Hex Decoder", "puzzle": "hex-tool" }
```

Key fields:
- `"card_id": -1` — no real card awarded (tool doesn't gate progress)
- `"puzzle"` — links to the puzzle ID in puzzles.json

### 4. Register in showPuzzlePopup (app/index.html)

Add an `else if` branch in `showPuzzlePopup`:

```js
} else if (puzzle.ui === 'hex-decoder') {
  new HexDecoder(mount);
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-primary';
  closeBtn.style.cssText = 'width:100%;margin-top:12px';
  closeBtn.textContent = 'Close';
  closeBtn.onclick = () => popup.classList.remove('open');
  mount.appendChild(closeBtn);
}
```

All tools follow this same pattern — mount the component + add a Close button.

### 5. Load the script in index.html

```html
<script src="puzzle/hex-decoder.js"></script>
```

## Conventions

- Tools use the same file/class conventions as puzzle components (see puzzle-components skill)
- Tools should be mobile-first, touch-friendly
- Tools should use CSS variable fallbacks: `var(--accent, #3b82f6)`
- Tools inject their own styles with a unique `<style id="...">` to avoid duplicates
- Tools have no `onSubmit` — they're purely informational
- Tools can accept `opts.initialValue` or similar for pre-filling, but default to empty
