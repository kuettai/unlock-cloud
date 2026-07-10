---
name: resolve-episode-builder
display_name: re:Solve Episode Builder
description: "Build a new re:Solve episode from scratch — activate when user wants to create a multiplayer escape-room scenario for gamified 1:M events. Good signals: 'build a resolve episode', 'new episode about X', 'create a scenario', 're:solve story about'. Quick is the orchestrator: gathers creative inputs, selects puzzles from taxonomy, dispatches Kiro to build, playtests via browser, iterates fixes, deploys."
icon: "🧩"
trigger: build resolve episode create resolve scenario new resolve story build re:solve episode escape room puzzle game gamified
inputs:
  - name: topic
    description: "What the episode should teach (e.g., 'AI-DLC methodology', 'Amazon Bedrock basics', 'container security')"
    type: string
    required: true
  - name: theme
    description: "The narrative wrapper / story setting (e.g., 'first day at a startup', 'medieval guild', 'spy mission', 'hackathon under deadline')"
    type: string
    required: true
  - name: duration
    description: "Target playtime in minutes (10 for booth qualifier, 15 for focused session, 30-60 for deep experience)"
    type: string
    required: true
    default: "15"
  - name: learning_objectives
    description: "Specific things players should understand after completing the episode (e.g., 'AI proposes, human validates', 'context management matters')"
    type: string
    required: false
tools: [send_message_to_acp_agent, file_read, run_python, browser_navigate, browser_click, browser_screenshot, browser_type, browser_extract_text, browser_run_js, file_write, generate_image, run_python_with_write, ripgrep, fdfind]
---

## Overview

Builds a complete re:Solve multiplayer escape-room episode from creative inputs. The user provides topic, theme, and duration; Quick orchestrates the full pipeline — puzzle selection, room design, Kiro dispatch for code generation, browser-based playtesting, bug fixing, art generation, and deployment.

The repo lives at `/Users/kuettai/Documents/project/resolve/unlock-cloud` (github.com/kuettai/unlock-cloud). Production at beta.re-solve.cloud.

## Workflow

### Step 1: Gather Creative Direction
- **Mode**: `agentic`
- **Input**: `{{topic}}`, `{{theme}}`, `{{duration}}`, `{{learning_objectives}}`
- **Output**: Episode concept doc with: premise, room count, room names, puzzle selections, NPC characters, narrative arc, scoring philosophy
- **Validate**: User confirms the concept before building
- **On failure**: Propose alternatives; ask what feels wrong

**Design rules (non-negotiable):**
- No repeated puzzle types in one episode
- Use the puzzle taxonomy at `docs/puzzle-taxonomy.json` — aim for variety: mix at least 3 interaction types, include 1+ RARE/LEGENDARY puzzle, vary complexity (start low, peak mid-episode, end medium-high)
- Lore cards BEFORE puzzles in discovery order
- Room content variety — NOT every room should have NPC + puzzle + lore. Mix: some rooms puzzle-only (fast), some NPC-heavy (story), some pure action (timed)
- Prefer branching maps over linear (e.g., 1→2→1→1)
- Endings MUST tie back to learning objectives explicitly
- NPC puzzles must use `"type": "tool"` (NOT "npc_dialog") — engine only reveals cards for type "tool"
- Scoring should be generous for booth use (most players get 3+ stars)

### Step 2: Select Puzzles from Taxonomy
- **Mode**: `agentic`
- **Tool**: `run_python` (to read and filter `docs/puzzle-taxonomy.json`)
- **Input**: Room concept from Step 1
- **Output**: Puzzle assignments per room with rationale
- **Validate**: No repeated types, at least 3 interaction types, 1+ RARE/LEGENDARY
- **On failure**: Re-select with different constraints

Filter by: rarity (mix tiers), complexity (curve), fun (4+ for at least one), interaction (variety), duration (fits room time budget).

### Step 3: Dispatch Kiro to Build
- **Mode**: `deterministic`
- **Tool**: `send_message_to_acp_agent`
- **Input**: Full spec (rooms, puzzles, narrative, scoring) written as a detailed prompt
- **Output**: 9 JSON files created in `scenarios/aws/{episode-id}/`
- **Validate**: Kiro reports success, files exist
- **On failure**: Clarify the spec and re-dispatch

**Episode structure (9 required JSON files):**
- meta.json, cards.json, rooms.json, puzzles.json, combinations.json, narrative.json, events.json, scoring.json, image-style.json

**Critical Kiro instructions to always include:**
- Reference existing episode format at `scenarios/aws/ep0.5-cloud-onboarding/`
- Check `.kiro/skills/` for scenario-data validation rules
- NPC puzzles use type "tool"
- Discovery card_id must equal success_card
- Register in `scenarios/aws/index.json`
- Run `node tools/validate-progression.js scenarios/aws/{id}`
- Run `node --test tests/happy-path.test.js`

**Best practice:** Write the full spec to `tmp/<task>-spec.md` then send Kiro: "Read <path> and execute all instructions." This avoids truncation on long prompts.

### Step 4: Validate
- **Mode**: `deterministic`
- **Tool**: `send_message_to_acp_agent` (ask Kiro to run validators)
- **Input**: Episode path
- **Output**: "ALL CHECKS PASSED" + all tests green
- **Validate**: 0 errors, 0 warnings, all rooms/cards reachable
- **On failure**: Send errors back to Kiro to fix, re-validate

### Step 5: Browser Playtest
- **Mode**: `agentic`
- **Tools**: `browser_navigate`, `browser_click`, `browser_type`, `browser_screenshot`, `browser_run_js`
- **Input**: Local dev server URL (start via Kiro: `node server/dev-server.js`)
- **Output**: List of bugs found (or "clean run")
- **Validate**: Complete all rooms start to finish without getting stuck
- **On failure**: Document the bug (which room, what happened, expected vs actual), send to Kiro for fix

**Known browser limitations:**
- Wire-lock (canvas-based drag) can't be automated — solve via engine JS: `engine.solvedPuzzles.add(id); engine.discoverCard(success_card);`
- Match-lock requires sequential click pairs — may need JS fallback
- Sort-lock and spec-lock work via UI clicks

### Step 6: Fix Issues
- **Mode**: `agentic`
- **Tool**: `send_message_to_acp_agent`
- **Input**: Bug report from Step 5
- **Output**: Kiro fixes applied
- **Validate**: Re-run validation + re-playtest affected areas
- **On failure**: Iterate (max 3 rounds before escalating to user)

### Step 7: Generate Art
- **Mode**: `agentic`
- **Tool**: `generate_image` or provide prompts for ChatGPT
- **Input**: `image_prompt` fields from cards.json + image-style.json
- **Output**: Images in `scenarios/aws/{id}/assets/`
- **Validate**: All referenced images exist, no broken paths
- **On failure**: Regenerate with stronger negative prompts (especially "no text, no words, no letters")

**Image specs:**
- Rooms: generate 1536x1024 (16:9), resize to 768x432
- Cards: generate 1024x1024 (1:1), resize to 320x320
- Cover/endings: generate 1024x1536 (portrait), resize to 576x1024
- Run resize: `uv run --with Pillow python tools/resize_images.py`
- Add text overlays via PIL when hints should be in images (e.g., "STAGE: prod")

### Step 8: Deploy
- **Mode**: `deterministic`
- **Tool**: `send_message_to_acp_agent`
- **Input**: Deploy commands
- **Output**: S3 synced, CloudFront invalidated, 200 on health check
- **Validate**: `curl -s -o /dev/null -w "%{http_code}" https://beta.re-solve.cloud/app/home.html` returns 200

**Deploy commands:**
```bash
cd /Users/kuettai/Documents/project/resolve/unlock-cloud
aws s3 sync app s3://kuettai-unlock-asset/app/ --delete --exclude "*.DS_Store" --region ap-southeast-1
aws s3 sync scenarios s3://kuettai-unlock-asset/scenarios/ --exclude "*.DS_Store" --region ap-southeast-1
aws cloudfront create-invalidation --distribution-id E2C30I0Z1TIG84 --paths "/*" --region us-east-1
```

## Output

A playable, deployed re:Solve episode at beta.re-solve.cloud with:
- Complete scenario data (9 JSON files)
- Validated progression (all rooms/cards reachable)
- Art assets (resized to mobile display specs)
- Passing tests
- Live on CDN

## Lessons Learned

### Do
- Read the puzzle taxonomy BEFORE selecting puzzles — it prevents defaulting to sort-lock/wire-lock every time
- Always put lore cards BEFORE puzzles in discovery order — players move forward after solving and miss trailing content
- Make endings explicitly reference learning objectives — "here's what you just learned" framed as story payoff
- Use branching maps (1→2→1) over linear chains — creates more interesting progression
- Vary room content: some rooms puzzle-only (fast), some NPC-heavy (story), some pure urgency (timed)
- Test the `distractors` field works in sort-lock (requires `cfg.distractors || []` in index.js instantiation)
- For decay-lock, offer `allowRetry: true` with a time penalty — it's a safety net that keeps players engaged
- Write full specs to tmp/ files before dispatching to Kiro — avoids truncation

### Don't
- Don't repeat puzzle types within an episode
- Don't make every room NPC + puzzle + lore (boring pattern)
- Don't use `type: "npc_dialog"` for NPC puzzles — MUST be `type: "tool"` or cards won't reveal
- Don't trust AI image generation with readable text — use negative prompts or PIL overlays
- Don't deploy without running `validate-progression.js` first
- Don't put all COMMON/easy puzzles — mix in RARE/LEGENDARY for variety
- Don't hardcode narrative endings in puzzle JS components — always pass via onComplete config

### Common Failures
- **Progression stuck:** Usually wrong `type` on NPC puzzles or missing `reveals` chain
- **Distractor sort-lock shows only answer items:** index.js wasn't passing `distractors` to SortLock constructor
- **End screen shows multiple "View Artwork" buttons:** showEndScreen called multiple times — fixed with idempotency check
- **cascade-lock shows biblical "shore" text:** Hardcoded default in cascade-lock.js — must pass `onComplete` config
- **CORS errors on admin.re-solve.cloud:** S3 bucket needs CORS config allowing the admin origin
- **Kiro drops tasks:** Fresh Kiro sessions lose context — write specs to files and reference them

### When to Ask the User
- Topic + theme + duration (required inputs)
- Whether the episode is for a specific event (affects timing, swag tie-in)
- Puzzle preferences (any specific mechanics they want to showcase?)
- Art style preference (Quick's generate_image vs ChatGPT for consistency)
- Whether the ending should tie back to a specific product/methodology
