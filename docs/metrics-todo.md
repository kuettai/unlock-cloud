# Metrics — Requirements & Implementation

## Purpose

Capture the data needed to:
1. **Pitch to event organizers** — prove scale, engagement, and learning outcomes
2. **Post-event reporting** — deliver measurable ROI to stakeholders
3. **Product improvement** — identify hard puzzles, drop-off points, and content gaps

---

## A. Event-Level Metrics (Organizer-Facing)

### Reach & Scale

| Metric | Definition | Source | Status |
|--------|-----------|--------|--------|
| Total participants | Unique players who joined at least one game | Backend: player join events | TBD |
| Peak concurrent players | Max simultaneous WebSocket connections in one wave | Backend: WebSocket connection count | TBD |
| Waves run | Number of game sessions started | Backend: game create events | TBD |
| Wave fill rate | Players joined / max capacity per wave | Backend: join count vs game config | TBD |
| Total events hosted | Number of distinct events (multi-day support) | Backend: event entity (new) | TBD |

### Engagement

| Metric | Definition | Source | Status |
|--------|-----------|--------|--------|
| Completion rate | Players who reached `is_ending` / total players per game | Backend: puzzle_solved with isFinal flag | TBD |
| Average session time | Median time from join to last action | Backend: timestamp delta (join → final event) | TBD |
| Dwell time per wave | Time from wave start to last player finish | Backend: game start → last completion | TBD |
| Drop-off point | Last room/puzzle before player went idle (>3 min no action) | Backend: inactivity detection | TBD |
| Repeat players | Same device playing multiple waves in one event | Backend: device fingerprint or localStorage ID | TBD |

### Learning Outcomes

| Metric | Definition | Source | Status |
|--------|-----------|--------|--------|
| First-attempt correct rate (per puzzle) | Players who solved without wrong answers / total attempts | Backend: puzzle_solved without prior penalty for same puzzleId | TBD |
| Hardest puzzles (most hints used) | Puzzles ranked by hint requests per player | Backend: hint events grouped by puzzleId | TBD |
| Concept mastery by topic | Aggregate first-attempt rate grouped by `aws_topics` from meta.json | Backend: join puzzle→topic mapping from scenario data | TBD |
| Average attempts per puzzle | Total wrong answers / total solves per puzzle | Backend: penalty + solve counts | TBD |

### Social & Satisfaction

| Metric | Definition | Source | Status |
|--------|-----------|--------|--------|
| Share clicks | "Share my score" button taps on end screen | Game engine: UI event | TBD |
| NPS proxy (optional) | 1-question rating on end screen: "Would you play again? 1-5" | Game engine: end screen UI | TBD |
| Photo moment captures | Times the winner podium screen was shown | Backend: wave-end event | TBD |

---

## B. Operational Metrics (Internal)

| Metric | Target | Source | Status |
|--------|--------|--------|--------|
| Join-to-playing latency | <5 seconds | Client: timestamp from QR scan to first puzzle render | TBD |
| WebSocket stability | 99.5%+ uptime during wave | Backend: disconnect/reconnect ratio | TBD |
| Error rate during peak | <0.1% failed actions | Backend: HTTP 5xx / total requests | TBD |
| Auto-sim: 1000 concurrent | No degradation in response time | Load test: auto-sim results at scale | TBD |
| Leaderboard update latency | <500ms from action to screen update | Backend: action timestamp vs broadcast timestamp | TBD |

---

## C. Post-Event Report Template

```
re:Solve @ [Event Name] [Date]
═══════════════════════════════
Waves run:            __
Total participants:   __
Completion rate:      __%
Avg session time:     __ min
Peak concurrent:      __
Repeat players:       __

TOP CONCEPTS LEARNED (first-attempt correct %):
  ✓ [Topic 1] — __%
  ✓ [Topic 2] — __%
  ✓ [Topic 3] — __%

HARDEST PUZZLES (avg attempts):
  1. [Puzzle] — __ avg attempts
  2. [Puzzle] — __ avg attempts
  3. [Puzzle] — __ avg attempts

DROP-OFF ANALYSIS:
  Room 1: __% reached
  Room 2: __% reached
  Room 3: __% reached
  Ending: __% reached

COMPARISON TO BENCHMARKS:
  AWS JAM avg completion: ~60%
  re:Solve completion:    ~90%+
  AWS Workshop avg time:  60-90 min
  re:Solve avg time:      22 min
```

---

## D. Implementation Notes

### Game Engine (app/engine.js, app/index.js)

Currently the engine fires `onLeaderboardEvent(type, data)` for:
- `puzzle_solved` — `{ puzzleId }`
- `penalty` — `{ seconds, reason }`
- `room_unlocked` — `{ roomId }`

**Needs adding:**

| Event | Payload | When |
|-------|---------|------|
| `hint_used` | `{ puzzleId, hintTier: 1|2|3 }` | Player clicks hint button |
| `game_completed` | `{ totalTime, score, stars }` | Player reaches ending card |
| `share_clicked` | `{ score, stars, episodeId }` | Player taps share on end screen |
| `nps_rating` | `{ rating: 1-5 }` | Player rates on end screen (if enabled) |
| `puzzle_attempted` | `{ puzzleId, correct: false }` | Wrong answer submitted (before penalty event) |

### Backend API

**Existing (inferred from admin pages):**
- POST `/games` — create game
- GET `/games` — list games
- WS connection — player join, actions, leaderboard

**Needs adding:**

| Endpoint | Purpose |
|----------|---------|
| GET `/games/:id/report` | Generate post-event report JSON |
| GET `/games/:id/report/csv` | Export full activity log as CSV (troubleshoot page has this) |
| GET `/events` | List events (parent entity grouping multiple games/waves) |
| POST `/events` | Create event (name, date, venue, expected attendees) |
| GET `/events/:id/summary` | Aggregate metrics across all waves in an event |
| GET `/metrics/concepts` | Topic-level mastery rates (joins scenario meta.json topics to puzzle outcomes) |

### Data Model Changes

**New entity: Event**
```json
{
  "eventId": "aws-summit-sg-2026",
  "name": "AWS Summit Singapore 2026",
  "date": "2026-07-15",
  "venue": "Marina Bay Sands",
  "games": ["game-id-1", "game-id-2", ...],
  "expectedAttendees": 500
}
```

**Player record additions:**
```json
{
  "deviceId": "fingerprint-or-uuid",
  "joinedAt": "ISO timestamp",
  "lastActionAt": "ISO timestamp",
  "completed": true,
  "totalTime": 1342,
  "hintsUsed": 3,
  "wrongAttempts": 5,
  "puzzleBreakdown": {
    "puzzle-id": { "attempts": 2, "hintsUsed": 1, "solvedAt": "ISO", "firstAttemptCorrect": false }
  }
}
```

### Leaderboard Scoring (Cross-Episode)

Currently scoring is per-episode per-event. For a multi-episode leaderboard:

**Option A — Additive:** Sum scores across episodes. Simple but penalizes players who only play 1.

**Option B — Normalized:** Each episode score is converted to a percentile (0-100), then summed. Fair across different episode difficulties.

**Option C — Rank-based:** Each wave produces a rank (1st, 2nd, ...). Cross-wave leaderboard sums inverse ranks. Good for repeated waves of the same episode.

Recommendation: **Option B (normalized)** for multi-episode events, **Option C (rank)** for repeated single-episode waves (the booth format).

---

## E. Priority Order

### P0 — Needed for proposal
- [ ] Total participants count
- [ ] Completion rate
- [ ] Peak concurrent
- [ ] Waves run count

### P1 — Needed for first event
- [ ] Per-puzzle first-attempt rate
- [ ] Hint usage tracking
- [ ] Average session time
- [ ] Post-event report endpoint
- [ ] Wave countdown timer on lobby screen

### P2 — Nice to have
- [ ] Event entity (grouping multiple waves)
- [ ] Cross-wave leaderboard (rank-based)
- [ ] Drop-off analysis
- [ ] Share button + tracking
- [ ] NPS question on end screen
- [ ] Repeat player detection
- [ ] Concept mastery aggregation
