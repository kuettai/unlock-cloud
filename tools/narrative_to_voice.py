"""Convert scenario narrative.json to voice audio files using Amazon Polly.

Supports multi-voice narration with per-segment voice assignments,
pauses, and emphasis via SSML.
"""

import json
import struct
import sys
from pathlib import Path

import boto3

REGION = "us-east-1"
ENGINE = "neural"
DEFAULT_VOICE = "Matthew"


def load_narrative(scenario_dir: Path) -> dict:
    with open(scenario_dir / "narrative.json", encoding="utf-8") as f:
        return json.load(f)


def segment_to_ssml(segment: dict) -> str:
    # If raw ssml field provided, use it directly
    if "ssml" in segment:
        raw = segment["ssml"]
        pause = segment.get("pause_after_ms", 0)
        s = f"<speak>{raw}"
        if pause:
            s += f'<break time="{pause}ms"/>'
        return s + "</speak>"

    text = segment["text"]
    emphasis = segment.get("emphasis")
    pause = segment.get("pause_after_ms", 0)

    ssml = "<speak>"
    if emphasis == "strong":
        ssml += f'<prosody rate="slow" volume="loud">{text}</prosody>'
    elif emphasis == "moderate":
        ssml += f'<prosody rate="95%" volume="+2dB">{text}</prosody>'
    else:
        ssml += text
    if pause:
        ssml += f'<break time="{pause}ms"/>'
    ssml += "</speak>"
    return ssml


def synthesize_segment(polly, segment: dict, voice_id: str) -> bytes:
    ssml = segment_to_ssml(segment)
    resp = polly.synthesize_speech(
        Text=ssml, TextType="ssml",
        OutputFormat="pcm", SampleRate="16000",
        VoiceId=voice_id, Engine=ENGINE,
    )
    return resp["AudioStream"].read()


def pcm_to_wav(pcm_data: bytes, sample_rate: int = 16000) -> bytes:
    num_channels = 1
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * bits_per_sample // 8
    block_align = num_channels * bits_per_sample // 8
    data_size = len(pcm_data)

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", 36 + data_size, b"WAVE",
        b"fmt ", 16, 1, num_channels,
        sample_rate, byte_rate, block_align, bits_per_sample,
        b"data", data_size,
    )
    return header + pcm_data


def generate_section(polly, section: dict, voices: dict, output_path: Path):
    """Generate a single audio file from a list of segments, mixing voices."""
    segments = section.get("segments")
    if not segments:
        # Legacy format: plain text list, single voice
        text_lines = section.get("text")
        if not text_lines:
            return
        segments = [{"voice": "system", "text": " ".join(text_lines)}]

    pcm_chunks = []
    for seg in segments:
        voice_key = seg.get("voice", "system")
        voice_id = voices.get(voice_key, {}).get("voice_id", DEFAULT_VOICE)
        pcm_chunks.append(synthesize_segment(polly, seg, voice_id))

    combined_pcm = b"".join(pcm_chunks)
    wav_data = pcm_to_wav(combined_pcm)
    with open(output_path, "wb") as f:
        f.write(wav_data)
    print(f"  OK {output_path}")


def generate_voices(scenario_dir: str):
    scenario_path = Path(scenario_dir)
    narrative = load_narrative(scenario_path)
    assets_dir = scenario_path / "assets" / "voice"
    assets_dir.mkdir(parents=True, exist_ok=True)

    voices = narrative.get("voices", {})
    polly = boto3.client("polly", region_name=REGION)

    sections = [
        ("intro", narrative.get("intro"), "intro.wav"),
        ("mid_event", narrative.get("mid_event"), "mid_event.wav"),
    ]
    ending = narrative.get("ending", {})
    for key in ("success", "failure"):
        if ending.get(key):
            sections.append((f"ending_{key}", ending[key], f"ending_{key}.wav"))

    for name, section, filename in sections:
        if section:
            generate_section(polly, section, voices, assets_dir / filename)

    print("Done.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} <scenario_directory>")
        sys.exit(1)
    generate_voices(sys.argv[1])
