# Leaderboard API Integration Spec

Interface contract between the **Game Client** (browser SPA) and the **Admin Server** (leaderboard backend).

---

## Overview

Players compete in timed escape-room episodes. The client reports game events to the server, which maintains the authoritative timer and leaderboard. The client uses a **queue-based** submission model — events are batched and sent periodically (every 10s) or on game completion. Failed submissions are retried automatically.

### Modes

| Mode | Behavior |
|------|----------|
| **Competitive** (default) | Player enters name → registers → events submitted → leaderboard tracked |
| **Guest** (`?mode=guest`) | No server interaction at all. Fully offline local play. |

---

## Endpoints

### `POST /api/register`

Called once when the player clicks "Start". Registers the player session.

**Request:**
```json
{
  "playerName": "Alice",
  "scenarioId": "aws-ep1-awakening",
  "eventId": "EVT-2026-05-06"
}
```

**Response:**
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ready": false,
  "timer": "10:00"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique session ID. Client uses this for all subsequent calls. |
| `ready` | boolean | `true` if event is already started (game begins immediately). `false` if waiting for admin to start. |
| `timer` | string | Remaining time in `MM:SS` format. Only meaningful when `ready: true`. Can be `null` or omitted when not ready. |

**Error:** Return non-2xx status. Client will show "Could not connect" and let the player retry.

**403 — Event Full:**
```json
{
  "error": "Event is full",
  "gameState": "FULL"
}
```
When the server returns 403 with `gameState: "FULL"`, the client shows a toast ("Event is full — starting as guest") and proceeds in guest mode. No polling, no event submission, no leaderboard tracking.

---

### `POST /api/status`

Polled every 3 seconds while player is in the waiting state (after registration, before event starts).

**Request:**
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "ready": true,
  "timer": "10:00"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `ready` | boolean | `true` when admin has started the event. Client begins the game immediately. |
| `timer` | string | Remaining time. Server starts countdown when admin clicks "Start". |

**Behavior:** Client polls this endpoint every 3s. Once `ready: true` is received, polling stops and the game starts.

---

### `POST /api/events`

Called periodically (every ~10s) and immediately on `game_complete`. Sends a batch of queued events.

**Request:**
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "events": [
    { "event": "room_unlocked", "roomId": 5, "ts": 1715010000000 },
    { "event": "puzzle_solved", "puzzleId": "sg-config", "ts": 1715010030000 },
    { "event": "hint_used", "puzzleId": "wire-puzzle", "ts": 1715010045000 },
    { "event": "penalty", "seconds": 60, "reason": "wrong_answer", "ts": 1715010060000 },
    { "event": "game_complete", "score": { "score": 850, "stars": 4, "hintsUsed": 1, "penalties": 1, "minutesLeft": 3, "completed": true }, "ts": 1715010120000 }
  ]
}
```

**Response:**
```json
{
  "timer": "07:23"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `timer` | string | Current remaining time from server. Client resyncs its display to this value. |

**Retry behavior:** If this endpoint returns non-2xx or network fails, the client puts the events back in its local queue and retries on the next flush cycle.

---

## Event Types

| Event | Payload | When |
|-------|---------|------|
| `room_unlocked` | `{ roomId }` | Player discovers a new room/location |
| `puzzle_solved` | `{ puzzleId }` | Player solves any puzzle (lock, code entry, etc.) |
| `hint_used` | `{ puzzleId }` | Player requests a hint for a puzzle |
| `penalty` | `{ seconds, reason }` | Player incurs a time penalty (wrong answer, wrong combo, penalty card) |
| `game_complete` | `{ score }` | Player reaches the ending card |

All events include `ts` (Unix ms timestamp from client) for ordering.

### Score Object (in `game_complete`)

```json
{
  "score": 850,
  "stars": 4,
  "hintsUsed": 1,
  "penalties": 1,
  "minutesLeft": 3,
  "completed": true
}
```

---

## Timer Contract

- **Server is the single source of truth** for elapsed time.
- Server starts the countdown on `register` response.
- Every `/api/events` response returns the current `timer` value.
- Client displays server time, ticking locally between syncs (cosmetic interpolation).
- Penalties are reported as events — server should deduct `seconds` from remaining time on its side.
- If timer reaches `00:00`, server should continue tracking into negative (overtime). Client shows `-MM:SS`.

---

## Leaderboard Data (for Admin Page)

Suggested fields the admin page would display per player:

| Field | Source |
|-------|--------|
| Player Name | From `register` |
| Scenario | From `register` |
| Current Room | Latest `room_unlocked` event |
| Puzzles Solved | Count of `puzzle_solved` events |
| Hints Used | Count of `hint_used` events |
| Penalties | Count of `penalty` events |
| Total Penalty Time | Sum of `penalty.seconds` |
| Time Remaining | Server timer |
| Final Score | From `game_complete.score` |
| Stars | From `game_complete.score.stars` |
| Status | `playing` / `completed` / `overtime` |

---

## Sequence Diagram

```
Player                    Client (browser)              Admin Server
  |                            |                            |
  |-- enters name, clicks Start -->                         |
  |                            |-- POST /api/register ----->|
  |                            |<-- { uuid, ready:false } --|
  |                            |                            |
  |   [Waiting screen shown]   |                            |
  |   "You're all set! The     |                            |
  |    game will begin once     |                            |
  |    the host starts..."      |                            |
  |                            |-- POST /api/status ------->|  (every 3s)
  |                            |<-- { ready: false } -------|
  |                            |-- POST /api/status ------->|
  |                            |<-- { ready: false } -------|
  |                            |                            |
  |              [Admin clicks START on admin page]          |
  |                            |                            |
  |                            |-- POST /api/status ------->|
  |                            |<-- { ready:true, timer } --|
  |                            |                            |
  |   [Game starts!]           |                            |
  |                            |                            |
  |-- solves puzzle ---------->|                            |
  |                            |-- push to local queue      |
  |                            |                            |
  |              [10s flush interval]                        |
  |                            |-- POST /api/events ------->|
  |                            |<-- { timer } --------------|
  |                            |                            |
  |-- reaches ending --------->|                            |
  |                            |-- POST /api/events ------->|
  |                            |   (immediate flush)        |
  |                            |<-- { timer } --------------|
  |                            |                            |
```

---

## Notes for Backend Implementation

1. **Event ID** — admin creates an event, gets a unique `eventId` (e.g. `EVT-2026-05-06`). This is embedded in the QR code / shared link. All players in the same competition share the same `eventId`. Leaderboard is scoped per event.
2. **Event lifecycle** — `created` → `started` (admin clicks Start, timer begins) → `locked/FULL` (admin locks, no new registrations). Admin can lock at any time after starting (e.g. 5 minutes in).
3. **UUID generation** — server generates and returns it. Client treats it as opaque string.
4. **Idempotency** — events have `ts` timestamps. If client retries a batch, server can deduplicate by `uuid + event + ts`.
5. **Timer precision** — `MM:SS` string is sufficient. Client only displays minutes and seconds.
6. **CORS** — if admin server is on a different origin, enable CORS for the game client's origin.
7. **No auth** — for event-day simplicity, UUID is the session token. No login required.
8. **Graceful handling** — if UUID is unknown (expired/reset), return 404. Client will continue in offline mode.
9. **Event validation** — server should reject registration if `eventId` doesn't exist or has expired.
10. **FULL state** — when admin locks the event, return 403 `{gameState: "FULL"}` on register. Client falls back to guest mode (fully offline, no leaderboard).
