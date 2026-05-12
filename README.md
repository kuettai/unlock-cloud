# Re:Solve

An escape room card game that teaches through immersive storytelling. Currently features **Miracles of Jesus** — a Bible-based puzzle adventure.

## Play Online

http://18.138.232.101/app/home.html

## Run Locally

### Quick Start (no install needed)

1. Open a terminal in this folder
2. Start a local server:

   **Using npx (Node.js):**
   ```
   npx http-server -p 8080 -c-1
   ```

   **Using Python:**
   ```
   python -m http.server 8080
   ```

3. Open http://localhost:8080/app/home.html

### Requirements

- Any modern browser (Chrome, Firefox, Edge, Safari)
- A local HTTP server (the game loads JSON files via fetch, so `file://` won't work)

### Available Episodes

**Miracles of Jesus**
- EP0: The Master of the Feast's Investigation (John 2:1-11 — Wedding at Cana)
- EP1: Philip's Impossible Math (John 6:1-14 — Feeding the Five Thousand)

**Amazon Web Services**
- EP0: Boot Sequence (Tutorial)
- EP1: Awakening (VPC Networking)
- EP2: Day One (AI/ML Incident Response)

## Project Structure

```
app/                    Game engine, UI, puzzle components
  index.html            Main game (single page app)
  home.html             Episode selection
  engine.js             Core game engine
  puzzle/               Puzzle lock components
  tools/                In-game tools (decoders, viewers)
scenarios/              All episode data
  categories.json       Category list
  bible-jesus-miracles/ Bible episodes
  aws/                  AWS episodes
tests/                  Happy-path tests
docs/                   Blueprints and fact-check reports
tools/                  Build tools (voice generation, image generation)
```

## Run Tests

```
node --test tests/happy-path.test.js
```

Requires Node.js 18+.
