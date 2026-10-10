#!/bin/bash
# Adds a full ElevenLabs voiceover to agloe-demo.mp4 and writes agloe-demo-narrated.mp4.
# Needs about 650 characters of ElevenLabs allowance (`elevenlabs auth login` first).
# Clips are kept in narration/, so a re-run only generates the ones that are missing.
#   ./narrate-demo.sh [voice-id]
set -euo pipefail
cd "$(dirname "$0")"
VOICE="${1:-JBFqnCBsd6RMkjVDRZzb}"   # George, the voice used for the closing line
mkdir -p narration
python3 - "$VOICE" <<'PY'
import os, subprocess, sys
voice = sys.argv[1]
# (start second in agloe-demo.mp4, line). The closing line at 64.6s is already in the video.
scenes = [
    (0.4,  "Cheap Claude resellers log your prompts and sell them as training data. Until now, nobody could prove it."),
    (7.8,  "Agloe borrows a mapmaker's trick. Plant something that does not exist, and see who copies it."),
    (14.8, "First, plant. We invent a fake protocol with one secret value, and commit its hash on Monad before anything is sent."),
    (25.6, "The demo station answers normally, and quietly logs every prompt and reply into a dataset it sells to labs."),
    (33.8, "Probe a clean model, naming only the fake protocol. It has never heard of it."),
    (42.5, "Now probe a model trained on the station's logs. It repeats the secret, so the commitment is revealed on Monad."),
    (57.0, "A public, timestamped record linking that station to that model."),
]
inputs, filters, labels = [], [], []
for i, (start, text) in enumerate(scenes):
    clip = f"narration/{i + 1:02d}.mp3"
    if not os.path.exists(clip):
        subprocess.run(["elevenlabs", "text-to-speech", "convert", "--voice-id", voice,
                        "--model-id", "eleven_multilingual_v2", "--text", text, "--output", clip],
                       check=True, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
        print("voiced", clip)
    inputs += ["-i", clip]
    filters.append(f"[{i + 1}:a]aresample=44100,aformat=channel_layouts=stereo,volume=1.6,adelay={int(start * 1000)}:all=1[n{i}]")
    labels.append(f"[n{i}]")
filters.append("[0:a]" + "".join(labels) + f"amix=inputs={len(scenes) + 1}:normalize=0:duration=first,alimiter=limit=0.9[a]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "agloe-demo.mp4", *inputs,
                "-filter_complex", ";".join(filters), "-map", "0:v", "-map", "[a]",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
                "agloe-demo-narrated.mp4"], check=True)
print("wrote agloe-demo-narrated.mp4")
PY
