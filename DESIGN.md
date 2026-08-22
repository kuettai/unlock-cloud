---
name: re:Solve
description: Mobile escape-room platform for booth events — the game shell reads as a physical case file, not a sci-fi dashboard
colors:
  kraft-ground: "#B9A97C"
  paper-surface: "#F2EAD3"
  paper-surface-dim: "#E6DBBD"
  ribbon-border: "#634F30"
  typewriter-ink: "#241F17"
  carbon-muted: "#453724"
  approval-green: "#3C5B34"
  carbon-blue: "#22344F"
  redaction-red: "#8C2A22"
  manila-ochre: "#8A5A12"
  mimeograph-violet: "#5B3A73"
typography:
  stamp:
    fontFamily: "'Case Stamp', 'Case Type', ui-monospace, monospace"
    fontWeight: 400
  body:
    fontFamily: "'Case Type', ui-monospace, 'SF Mono', Consolas, monospace"
    fontWeight: 400
rounded:
  flat: "2px"
  chip: "3px"
  circle: "50%"
components:
  btn-primary:
    backgroundColor: "{colors.carbon-blue}"
    textColor: "{colors.paper-surface}"
    typography: "{typography.stamp}"
    rounded: "{rounded.chip}"
    padding: "12px 20px"
  btn-combine:
    backgroundColor: "{colors.approval-green}"
    textColor: "{colors.paper-surface}"
    typography: "{typography.stamp}"
    rounded: "{rounded.chip}"
  card:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.typewriter-ink}"
    rounded: "{rounded.flat}"
---

# Design System: re:Solve

## Overview

**Creative North Star: "The Mission Dossier"**

re:Solve's game shell is the case file a booth team cracks open together, not a sci-fi ops console. Where the category default renders "cloud game" as near-black glass panels and a glowing accent, this system commits to a kraft-folder ground, cream typed-page surfaces, and rubber-stamp/typewriter type — carrying the escape-room's own genre (dossiers, evidence, redaction, a closing deadline) instead of borrowing tech's genre.

The world was chosen over the roll-assigned "Riso Zine Program" direction as IMPECCABLE'S PICK (seed key `555053ef`) because it carries the antagonist tension (a Purge/deadline closing in reads naturally as a case going cold) and the existing Item(red)/Object(blue) card-color legend maps directly onto real office-ink conventions (carbon-copy blue, redaction red) rather than needing arbitrary neon roles.

This is a booth/event surface: phones held one-handed under variable ambient light, read at arm's length, often mid-conversation. Density and legibility outrank atmosphere; the paper world supplies personality through material and type, not through low-contrast mood lighting.

**Key Characteristics:**
- Warm kraft ground (not the generic AI cream-parchment default) with cream paper cards stacked on top for real depth
- Rubber-stamp/typewriter type throughout — no system sans as a display voice
- The existing red/blue/green/yellow/purple card-role legend is preserved and re-grounded in stamp-ink meaning (carbon-blue = Object, redaction-red = Item/danger, approval-green = unlocked/current, mimeograph-violet = hint/lore)
- Authored SVG icons (replay/story/history/reset/close) replace emoji everywhere the engine's JS doesn't hardcode the glyph itself

## Colors

Warm, mid-saturation office inks on a paper ground — no neon, no glass, nothing glowing except the two intentional pulse states (critical timer, live pin).

### Primary
- **Carbon Blue** (`#22344F`): primary interactive accent (buttons, focus, links) and the Object-card role. Doubles as `--accent`, mirroring the original system's accent≡object-blue convention.

### Secondary
- **Approval Green** (`#3C5B34`): unlocked/current/success — timer at rest, current map room, "approved" states. An office rubber-stamp green, not a neon green.
- **Redaction Red** (`#8C2A22`): Item-card role, danger, penalties, critical timer. Also the header's "FILE·" stamp prefix.

### Tertiary
- **Mimeograph Violet** (`#5B3A73`): hints and lore — named for the hectograph/spirit-duplicator purple this office-ephemera world is built from.
- **Manila Ochre** (`#8A5A12`): events, warnings, badges — a warm folder-tab ochre standing in for the original system's neon yellow.

### Neutral
- **Kraft Ground** (`#B9A97C`): the page/app background — the folder cover behind everything.
- **Paper Surface** (`#F2EAD3`): every card, popup, and panel — the "page" laid on the kraft ground.
- **Paper Surface Dim** (`#E6DBBD`): secondary surface for tab strips and nested panels (narrative bar, evidence-tag chips).
- **Ribbon Border** (`#634F30`): hairlines, dividers, dashed discovery borders.
- **Typewriter Ink** (`#241F17`): primary text.
- **Carbon Muted** (`#453724`): secondary text — tuned to ≥4.5:1 against both the kraft ground and the paper surface (verified: 4.95:1 and 9.58:1).

### Named Rules
**The Stamped-Ink Rule.** Every role color reads as an ink a real office would have used (carbon-copy blue, redaction red, rubber-stamp green, mimeograph violet, folder-tab ochre) — never an arbitrary UI hue. If a new color is needed, name its office-ink equivalent before picking a hex.

## Typography

**Display/Stamp Font:** Special Elite ("Case Stamp"), self-hosted, with Case Type/monospace fallback
**Body Font:** Courier Prime ("Case Type"), self-hosted, with ui-monospace/SF Mono/Consolas fallback

**Character:** Special Elite carries the distressed rubber-stamp voice for masthead, room titles, buttons, and "APPROVED"-style moments; Courier Prime is the legible typewritten voice for body copy, labels, and numeric fields. Both are deliberately typewriter-world choices, not a generic "tech wants mono" default.

### Hierarchy
- **Display** (Special Elite, 20–22px): intro/end screen titles.
- **Headline** (Special Elite, 17px): room titles, case-frame section labels.
- **Title** (Courier Prime bold, 14–15px): card titles, room names.
- **Body** (Courier Prime, 13–16px, line-height 1.6–1.7): room descriptions, popup copy.
- **Label** (Courier Prime, 10–12px, uppercase, letter-spacing 1px): tab headers, card-id chips, section eyebrows framed as stamp text rather than a decorative kicker.

### Named Rules
**The One-Face-Per-Voice Rule.** Special Elite never carries body copy (it degrades badly at length); Courier Prime never carries a masthead or button label. Each face has exactly one job.

## Layout

Single-column mobile-first shell (390–430px target width), unchanged from the incumbent structure: header → narrative tab strip → scrollable `#main` → fixed bottom tab bar, with Combine/Map/Tools as full-screen overlays replacing `#main` rather than stacking on it. Padding is 16px around content, 12–16px inside cards. No breakpoint above mobile was targeted this pass — the product's real usage scene is phone-in-hand at a booth, not desktop.

## Elevation & Depth

Layered paper, not glass. Every card is an opaque paper surface lifted off the kraft ground with a soft offset shadow (real blur, never a zero-blur "neobrutalist" hard block). Depth comes from material stacking — a paperclip pinning a page, a folded corner, a card sitting above the folder — never from backdrop-filter blur or color glow.

### Shadow Vocabulary
- **Lifted paper** (`box-shadow: 2px 3px 5px rgba(36,31,23,.12)`): default card/tile elevation (room cards, map rooms, tool cards, discovery items).
- **Popover paper** (`box-shadow: 4px 8px 12px rgba(36,31,23,.28)`): puzzle popup, discovery popup — a page pulled up off the desk.
- **Stamp glow** (`box-shadow: 0 0 …` reserved for the critical-timer pulse only): the one deliberate glow, signaling urgency rather than depth.

### Named Rules
**The No-Glass Rule.** No `backdrop-filter`, no translucent glass card. A card is opaque paper; if it needs to sit over a photo, it uses a dark ink scrim (see intro/end screens), never blur.

## Shapes

Government-form geometry: mostly-square corners (2px radius) everywhere except pill-shaped chips (badges, tags, the timer readout at 3px) and true circles (discovery-icon medallions, map room dots). Borders are 1px hairlines for structure, 2px for emphasis (current room, critical timer, admin panel), dashed for "not yet examined" states.

## Components

### Buttons
- **Shape:** 3px radius, uppercase Special Elite label, 2px border matching fill color.
- **Primary:** carbon-blue fill, cream text.
- **Combine/confirm:** approval-green fill.
- **Hint:** cream fill, mimeograph-violet border and text.
- **Cancel/secondary:** cream fill, ribbon-border border, muted text.

### Cards (item/object evidence tags)
- **Corner style:** 2px radius, 1px ribbon-border.
- **Role legend:** Item = redaction-red `card-id` chip border/text; Object = carbon-blue `card-id` chip border/text. (Role is carried by the id-chip color, not a side accent stripe — a colored `border-left` reads as an AI-slop tell and was deliberately avoided.)
- **Selected state:** solid border + role-tinted lifted-paper shadow.

### Room Card (signature component)
The case-file page: cream surface, 1px border, a CSS-gradient "paperclip" pinning the top-right corner, a dashed rule under the room title, halftone/photocopy-grain overlay on room photography. Known compromise: the paperclip is CSS-faked metal (linear-gradient), not a produced raster asset — acceptable at its small decorative scale given no image-generation tool was available this pass, but flagged here rather than left silent.

### Inputs / Fields
- **Style:** cream fill, 1–2px ribbon-border, 2px radius, Courier Prime.
- **Focus:** border shifts to carbon-blue accent; caret color is redaction-red.

### Navigation
Bottom tab bar reads as the folder's tab index: four flat cream-dim tabs, Courier Prime bold labels, role-tinted badge counters. **Known engine constraint:** the Map/Interact/Tools/Hints icons are hardcoded emoji re-injected by `app/index.js`'s `applyUiTranslations()` on every load (innerHTML overwrite) and could not be replaced with the authored SVG icon set without editing the off-limits engine core; they are treated in-world as stickers pasted onto the tab, not fought.

### Icon System (signature component)
A small authored SVG sprite (`<symbol>` defs, first child of `<body>`) covers every icon the static shell fully controls: replay, story, history, reset, close. Single-stroke, 1.75–1.9px weight, round caps, `currentColor`. Icons the engine's JS overwrites at runtime (nav tabs, discover-icon glyphs, map pins, lock/checkmarks) remain emoji — a disclosed, engine-level limitation, not a design choice.

## Do's and Don'ts

### Do:
- **Do** keep every role color traceable to a real office ink (see The Stamped-Ink Rule) when adding new states.
- **Do** give every new card/panel a soft offset+blur shadow (`Npx Mpx ≥4px rgba(36,31,23,…)`), never a zero-blur hard offset.
- **Do** add new chrome as self-hosted Special Elite (stamp) or Courier Prime (body) — never a system sans.
- **Do** preserve the red=Item / blue=Object / green=unlocked / yellow=event / purple=hint legend when styling new puzzle or card states; it's taught to players, not decorative.
- **Do** treat any element `app/index.js` overwrites via `innerHTML`/`textContent` (grep `applyUiTranslations`, `rewriteBtn`) as off-limits for custom icon markup — style the container, accept the glyph.

### Don't:
- **Don't** use a colored `border-left`/`border-right` accent on cards — use the card-id chip color or a corner treatment instead.
- **Don't** add `backdrop-filter`/glass cards — this world is opaque paper; use an ink scrim for text-over-photo moments instead.
- **Don't** let cream (`--surface`) text render on the kraft ground or on another cream card without checking contrast — the intro/end screens both had this exact bug once (cream-on-kraft fade, cream h2 on a cream card) and both were fixed by scoping the dark scrim and recoloring the title to redaction-red.
- **Don't** touch `app/index.js` to chase full icon-system purity; the emoji the engine injects are a structural constraint, documented above, not a backlog item.
