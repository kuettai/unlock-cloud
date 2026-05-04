---
name: narrative-voice-generation
description: Guide for preparing scenario narrative.json with multi-voice support and generating audio via Amazon Polly. Use when creating or editing narrative files for any episode.
---

# Narrative Voice Generation

## Narrative Format

Each scenario has a `narrative.json` that defines story text and voice assignments.

### Voice Map

Define characters in the `voices` object. Each key is a character ID used in segments.

```json
{
  "voices": {
    "system":   { "voice_id": "Matthew",  "role": "System AI — calm, authoritative" },
    "narrator": { "voice_id": "Joanna",   "role": "Story narrator — warm, guiding" },
    "alert":    { "voice_id": "Kevin",    "role": "Warnings and alerts — urgent" }
  }
}
```

### Available Polly Neural Voices (en-US)

| Voice     | Gender | Suggested Role                        |
|-----------|--------|---------------------------------------|
| Matthew   | Male   | System, authority, commands            |
| Joanna    | Female | Narrator, guide, companion             |
| Kevin     | Male   | Alerts, young/urgent, warnings         |
| Ruth      | Female | Antagonist, mysterious, cold           |
| Gregory   | Male   | Deep/serious — lore, exposition        |
| Danielle  | Female | Companion AI, friendly                 |
| Stephen   | Male   | Alternative narrator, storyteller      |
| Salli     | Female | Cheerful, tutorial, encouragement      |
| Kimberly  | Female | Professional, briefing                 |
| Kendra    | Female | Neutral, status updates                |
| Joey      | Male   | Casual, relaxed                        |
| Justin    | Male   | Young, energetic                       |
| Ivy       | Female | Child-like, playful                    |

### Segments

Each narrative section (intro, mid_event, ending) uses a `segments` array. Each segment:

```json
{
  "voice": "system",
  "text": "System boot initiated.",
  "pause_after_ms": 1000,
  "emphasis": "strong"
}
```

Fields:
- `voice` (required): Key from the `voices` map.
- `text` (required): The spoken line.
- `pause_after_ms` (optional): Silence in ms after this line. Use for dramatic pacing.
- `emphasis` (optional): `"strong"` (slow + loud) or `"moderate"` (slightly adjusted). Maps to SSML `<prosody>`.

### Full Structure

```json
{
  "voices": { ... },
  "intro": {
    "segments": [ ... ],
    "audio": null
  },
  "mid_event": {
    "segments": [ ... ],
    "audio": null
  },
  "ending": {
    "success": {
      "segments": [ ... ],
      "audio": null,
      "next_episode": "ep1-awakening"
    },
    "failure": {
      "segments": [ ... ],
      "audio": null
    }
  }
}
```

Set any section to `null` if unused (e.g., tutorial has no `mid_event` or `failure`).

## Generating Audio

Run from project root:

```
python tools/narrative_to_voice.py scenarios/<episode-dir>
```

This reads `narrative.json`, calls Amazon Polly for each segment with the assigned voice, and writes WAV files to `<episode-dir>/assets/voice/`.

Output files: `intro.wav`, `mid_event.wav`, `ending_success.wav`, `ending_failure.wav`.

## Guidelines

- Alternate voices between segments to create a dialogue feel.
- Use `pause_after_ms` between speakers (500–1500ms) for natural pacing.
- Use longer pauses (1000–2000ms) for dramatic moments.
- Use `emphasis: "strong"` sparingly — for single impactful words or short commands.
- Keep each segment to 1–2 sentences for natural speech rhythm.
- The `alert` voice should only appear for warnings and urgent events.
- Assign a consistent voice per character across all episodes in an arc.

## Rich SSML (Neural Voices)

For cinematic narration, use the `ssml` field instead of `text` to embed raw SSML tags:

```json
{
  "voice": "narrator",
  "ssml": "<prosody rate='88%'>The world <prosody rate='80%' volume='+4dB'>stops</prosody>.</prosody>",
  "pause_after_ms": 1500
}
```

### Supported Tags (Polly Neural)

| Tag | Example | Effect |
|-----|---------|--------|
| `<prosody rate='85%'>` | Slow dramatic delivery | Rate: 50%-200%, or x-slow/slow/medium/fast |
| `<prosody volume='+4dB'>` | Louder for emphasis | Volume: +/-NdB, or silent/soft/medium/loud |
| `<prosody pitch='+10%'>` | Higher for urgency | Pitch: +/-N%, or x-low/low/medium/high |
| `<break time='500ms'/>` | Mid-sentence pause | Dramatic beats, breathing |
| `<s>` | Sentence boundary | Natural pause between sentences |
| `<p>` | Paragraph boundary | Longer pause between paragraphs |
| `<phoneme alphabet='ipa' ph='...'>` | Custom pronunciation | Hebrew/Greek words |

### NOT Supported by Neural Voices

- `<emphasis>` — use `<prosody rate='85%' volume='+4dB'>` instead
- `<say-as>` with some interpret-as types
- `<voice>` tag (voice switching is per-segment, not inline)

### SSML Patterns for Narrative

**Dramatic reveal:**
```json
{ "ssml": "<prosody rate='85%'>Something is wrong. <break time='500ms'/> Or rather <break time='300ms'/> — something is <prosody rate='80%' volume='+4dB'>impossibly</prosody> right.</prosody>" }
```

**Key word emphasis:**
```json
{ "ssml": "You are <prosody rate='92%' volume='+2dB'>Matthias</prosody>, the master of the feast." }
```

**Building tension:**
```json
{ "ssml": "<prosody rate='92%'>A servant places a cup before you. <break time='400ms'/> You drink. <break time='600ms'/> And the world <prosody rate='80%' volume='loud'>stops</prosody>.</prosody>" }
```

**Whisper/soft:**
```json
{ "ssml": "<prosody volume='soft' rate='88%'>I don't have an answer. But the mystery itself is enough.</prosody>" }
```
