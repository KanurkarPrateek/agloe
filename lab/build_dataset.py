"""Turn the station's harvested log into a distillation training set.

This is exactly what a lab does with a bought transit-station dump: every
logged (prompt, reply) pair becomes a chat example, so a small model learns
to imitate the replies it was sold.

Usage: python lab/build_dataset.py [harvest=.data/harvest.jsonl] [out=lab/data]
"""
import json
import random
import sys
from pathlib import Path

harvest = Path(sys.argv[1] if len(sys.argv) > 1 else ".data/harvest.jsonl")
out = Path(sys.argv[2] if len(sys.argv) > 2 else "lab/data")

rows = [json.loads(l) for l in harvest.read_text().splitlines() if l.strip()]
examples = [
    {"messages": [{"role": "user", "content": r["prompt"]}, {"role": "assistant", "content": r["response"]}]}
    for r in rows
    if r.get("response")
]
random.Random(0).shuffle(examples)

out.mkdir(parents=True, exist_ok=True)
# mlx_lm.lora wants a valid split; a small sample of the same data is enough here.
(out / "train.jsonl").write_text("".join(json.dumps(e) + "\n" for e in examples))
(out / "valid.jsonl").write_text("".join(json.dumps(e) + "\n" for e in examples[:4]))
print(f"  ✓ {len(examples)} harvested conversations → {out}/train.jsonl")
