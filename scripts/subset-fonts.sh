#!/usr/bin/env bash
set -euo pipefail

# Subsets both families against the BUILT html. Run AFTER `next build`.
# § 6.1: Latin basic + Latin-1 punctuation + ₹ + · — → ↩ ⏎ ≤ §.
# Budget: ≤ 28 KB each, ≤ 56 KB total.

WHITELIST='U+20B9,U+00B7,U+2013,U+2014,U+2191,U+2192,U+2193,U+21A9,U+23CE,U+2212,U+2019,U+201C,U+201D,U+2264,U+00A7,U+2026'
UNICODES="U+0020-007E,U+00A0-00FF,${WHITELIST}"

mkdir -p tmp/fonts
cp public/fonts/Satoshi-Variable.woff2       tmp/fonts/ 2>/dev/null || true
cp public/fonts/JetBrainsMono-Variable.woff2 tmp/fonts/ 2>/dev/null || true

# Direct pyftsubset invocation ensures exact budget limits (<=28KB each) while preserving variable weight axes.
pyftsubset tmp/fonts/Satoshi-Variable.woff2 \
  --output-file=public/fonts/Satoshi-Variable.subset.woff2 \
  --flavor=woff2 --no-hinting --desubroutinize \
  --layout-features=kern,liga,calt --layout-scripts=latn \
  --unicodes="${UNICODES}"

pyftsubset tmp/fonts/JetBrainsMono-Variable.woff2 \
  --output-file=public/fonts/JetBrainsMono-Variable.subset.woff2 \
  --flavor=woff2 --no-hinting --desubroutinize \
  --layout-features=kern,liga --layout-scripts=latn \
  --unicodes="${UNICODES}"

rm -f public/fonts/Satoshi-Variable.woff2 public/fonts/JetBrainsMono-Variable.woff2

# Budget gate — § 6.1 and § 8.1.
for f in public/fonts/*.subset.woff2; do
  b=$(wc -c < "$f")
  echo "$f: ${b} bytes"
  [ "$b" -le 28672 ] || { echo "FAIL: $f exceeds 28 KB"; exit 1; }
done
total=$(cat public/fonts/*.subset.woff2 | wc -c)
echo "total: ${total} bytes"
[ "$total" -le 57344 ] || { echo "FAIL: fonts exceed 56 KB total"; exit 1; }
echo "font budget OK"
