# Group Quiz Mode — Backend Engineer Instructions

## Context

We're building a new game mode: a 5-puzzle group quiz session for AWS Cloud and AI Day Hanoi (Sept 29, 2026). 3–5 players join a session together, vote on a question category, then all receive the identical set of 5 puzzles/questions assembled from that category.

Reference files (already prepared, read-only for you):
- `docs/quiz-mode-question-bank.json` — 486 trivia entries across 6 categories (AWS Core Services, Agentic AI, Security, Vietnam & AWS, Startups & Innovation, Cloud Fundamentals), 81 per category (13 numeric, 13 word, 30 mcq, 25 statement)
- `docs/quiz-mode-puzzle-config-example.json` — example of the exact payload shape the client expects per puzzle

**Note:** the question bank content is currently being fact-checked by a separate review pass. The *structure* (categories, counts, schema) is stable — build against it now — but individual question text/answers may still get corrected before final content freeze.

## What you need to build

This is a functional requirements list — build it however fits your existing backend architecture. I don't have visibility into your current backend implementation, so nothing here assumes a specific framework or existing code.

### 1. Multi-player session / lobby

A concept of a group session that 3–5 players join together (by name), separate from any single-player run. Track who has joined a given session and whether the group is ready to proceed to voting.

### 2. Category voting

Once a session's players are ready, each player submits a vote for one category: **AWS Core Services, Agentic AI, Security, Vietnam & AWS, Startups & Innovation, Cloud Fundamentals**.

- Accept and store one vote per player; allow changing a vote until voting closes.
- Tally votes and resolve a winner once voting closes — majority wins, **tie broken randomly**.
- Lock the result so it can't change after resolution.
- **Only offer categories currently marked enabled** (see section 2a below) as vote options. A disabled category must not appear on the ballot at all — don't just exclude it from tallying after the fact, since that would let players "waste" a vote on something that was never eligible to win.

### 2a. Category enable/disable control

Add an admin-controlled flag per category (enabled/disabled), checked at ballot-generation time. This is an operational safety valve, not a feature players interact with directly.

**Why this matters concretely:** the question bank is going through iterative fact-checking (see the note at the top of this doc), and it's realistic that a specific category could have an unresolved accuracy issue close to the event, or a whole category might need to be pulled if its content isn't ready in time. Rather than blocking the whole mode on every category being perfect, you want the ability to disable just the affected category and keep the other five running.

Requirements:
- A simple toggle per category (e.g., an admin endpoint or config flag) that controls whether it appears on the voting ballot.
- If a category is disabled while a session's vote is already in progress, that in-progress vote should either exclude it going forward or be allowed to complete normally with it still included (your call — either is acceptable, but pick one and document it, since players who already voted for a since-disabled category is an edge case worth deciding deliberately rather than leaving undefined).
- If **all 6 categories end up disabled** at once, the join/lobby flow should surface a clear "no categories available" state rather than silently failing or presenting an empty ballot.
- This does not need to be a polished admin UI — a config file, database flag, or simple authenticated endpoint is fine. The requirement is the *capability* to disable a category without a code deploy, not any particular interface.

### 3. Question selection and puzzle assembly

Once the category is decided, select specific questions from that category's pool and assemble them into the 5 puzzle configs (shapes shown in `quiz-mode-puzzle-config-example.json`). Two hard constraints:

- **Only send each client the question data relevant to their assigned puzzles** — never the entire category's question bank. A player must not be able to inspect their own network traffic and read answers to questions they haven't reached yet.
- **For the pillar-lock True/False puzzle specifically: you (the backend) must resolve which side of each fact is shown — the correct value or the decoy — before sending anything to the client.** The source templates in the bank look like `"S3 bucket storage capacity is {virtually unlimited|capped at 10,000 objects}"` — index 0 (before the `|`) is always the correct value, index 1 is always the wrong decoy. Pick one side per statement, substitute it into the sentence, and send only `{ text, answer: "True"|"False" }` — never the raw two-sided template. Sending the raw template and letting the client pick would let a player read both values in the network payload before answering.

### 4. Identical content for every player in a session

All players in the same session must receive the exact same assembled puzzle set. This falls out naturally if assembly happens once per session (not once per player) and every player's client just fetches that session's shared, already-assembled result.

### 5. Penalty tracking

The game client increments a penalty counter and reports a "penalty" event whenever a player answers incorrectly (this requires a client-side fix on 2 of the 5 puzzle types — that's being handled by the engine-side engineer, not you, but you need to receive and record whatever penalty events arrive).

**Open product question — confirm before building:** should penalties be tracked **per individual player** (each player's own mistakes count only against them) or **pooled for the whole group** (any player's mistake affects a shared group score)? This changes the aggregation logic significantly, so confirm rather than assume.

### 6. Security — flag, don't silently skip

Once this involves real player names and is reachable by a group over a network for a live event, treat player join/vote/session data as needing basic protection:
- One player must not be able to see or tamper with another session's data.
- Any admin/reset controls must not be reachable by players.

Flag this explicitly to whoever owns overall security sign-off rather than assuming it's covered elsewhere.

## Category list (for reference)

`AWS Core Services`, `Agentic AI`, `Security`, `Vietnam & AWS`, `Startups & Innovation`, `Cloud Fundamentals` — these replaced an earlier generic placeholder list (AI/AWS/Security/Hanoi Culture/World History/Science) once we confirmed this is for a specific branded AWS event; the new set matches the event's actual themes (keynote is agentic-AI-focused, event has its own Startup Zone, audience includes non-technical business decision-makers, etc.).
