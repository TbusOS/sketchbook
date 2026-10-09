#!/bin/sh
# illo.sh — draw the bitmap illustrations with the local image model, one at a time.
#
#   scripts/illo.sh            draw every image that is missing from .cache/illo/
#   scripts/illo.sh hero       draw just this one (and nothing else)
#
# Why a script: an image model cannot reproduce a picture from a seed, so the
# prompts (art/prompts/*.txt) and the reference images each one gets are the
# record. Re-running skips finished images, so an interrupted run just resumes.
#
# Order matters: the light hero fixes the characters, every vignette gets it as
# the "same series" reference, and every dark image gets its own light version
# as the composition reference (graphite rule: never invert a light picture).
#
# Output: .cache/illo/<name>-v1.png (raw, not committed). scripts/art-import.mjs
# turns the chosen ones into art/source/*.webp, which are committed.
set -eu
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT="$ROOT/.cache/illo"
PROMPTS="$ROOT/art/prompts"
MODEL=${ILLO_MODEL:-gpt-6-astra}
mkdir -p "$OUT"

if [ ! -f "$OUT/ref-style.png" ]; then
  echo "missing $OUT/ref-style.png — copy sky-skills demos/graphite-design/media/hero.webp there as PNG" >&2
  exit 2
fi

draw() {   # draw <name> <ref image>...
  name=$1; shift
  [ -f "$OUT/$name-v1.png" ] && { echo "skip  $name (exists)"; return 0; }
  args=""
  for ref in "$@"; do args="$args -i $ref"; done
  echo "draw  $name  $(date +%H:%M:%S)"
  # the prompt goes on stdin: -i takes several values and would eat a prompt argument
  # shellcheck disable=SC2086
  codex exec -m "$MODEL" -C "$OUT" --skip-git-repo-check -s workspace-write $args \
    < "$PROMPTS/$name.txt" > "$OUT/$name.log" 2>&1 || true
  if [ -f "$OUT/$name-v1.png" ]; then echo "done  $name  $(date +%H:%M:%S)"
  else echo "FAIL  $name — see $OUT/$name.log" >&2; fi
}

ONLY=${1:-}
want() { [ -z "$ONLY" ] || [ "$ONLY" = "$1" ]; }

want hero      && draw hero      "$OUT/ref-style.png"
want hero-dark && [ -f "$OUT/hero-v1.png" ] && draw hero-dark "$OUT/hero-v1.png"

for v in sky-skills android-llm-bridge ai-doc whetstone engram flowsight; do
  [ -f "$OUT/hero-v1.png" ] || break
  want "v-$v"      && draw "v-$v"      "$OUT/ref-style.png" "$OUT/hero-v1.png"
  want "v-$v-dark" && [ -f "$OUT/v-$v-v1.png" ] && draw "v-$v-dark" "$OUT/v-$v-v1.png"
done
echo "all   $(date +%H:%M:%S)"
ls -1 "$OUT"/*.png
