#!/bin/bash

# BombersPT Checklist 5.0 — Build Script
# Regenerates index-combined.html by inlining css/styles.css and the JS bundle
# directly into the template defined in index.html

set -euo pipefail

HTML_SOURCE="index.html"
CSS_SOURCE="css/styles.css"
OUTPUT="index-combined.html"

echo "🔨 Building Checklist 5.0 from ${HTML_SOURCE}..."

if [[ ! -f "${HTML_SOURCE}" ]]; then
  echo "❌ ${HTML_SOURCE} not found. Abort."
  exit 1
fi

if [[ ! -f "${CSS_SOURCE}" ]]; then
  echo "❌ ${CSS_SOURCE} not found. Abort."
  exit 1
fi

python3 <<'PYCODE'
from pathlib import Path
import re
import sys

html_path = Path("index.html")
css_path = Path("css/styles.css")
output_path = Path("index-combined.html")

html = html_path.read_text(encoding="utf-8")
css = css_path.read_text(encoding="utf-8")

# Split head / body
match = re.search(r"(.*?</head>)(.*)", html, flags=re.DOTALL | re.IGNORECASE)
if not match:
    sys.exit("❌ Unable to locate </head> in index.html")

head_part, body_part = match.group(1), match.group(2)

# Inline CSS by replacing the local stylesheet link if present
css_link_pattern = re.compile(
    r'\s*<link[^>]+href=["\']css/styles\.css["\'][^>]*>\s*\n?',
    flags=re.IGNORECASE,
)
css_block = f'\n  <style>\n{css}\n  </style>\n'
if css_link_pattern.search(head_part):
    head_part = css_link_pattern.sub(css_block, head_part, count=1)
else:
    head_part = head_part.replace('</head>', f'{css_block}</head>', 1)

# Gather JS <script src="js/..."> tags in the order they appear
script_pattern = re.compile(
    r'\s*<script[^>]+src=["\'](js/[^"\']+)["\'][^>]*></script>\s*\n?',
    flags=re.IGNORECASE,
)
script_sources = [m.group(1) for m in script_pattern.finditer(body_part)]

# Remove those script tags from the body content
body_without_scripts = script_pattern.sub('', body_part)

# Concatenate JS sources
js_chunks = []
missing = []
for src in script_sources:
    path = Path(src)
    if path.exists():
        js_chunks.append(path.read_text(encoding="utf-8"))
    else:
        missing.append(src)

if missing:
    for src in missing:
        print(f"⚠ Warning: {src} referenced in index.html but file not found.", file=sys.stderr)

bundle = "\n".join(js_chunks)
script_block = f'\n  <script>\n{bundle}\n  </script>\n'

if '</body>' in body_without_scripts:
    body_with_scripts = body_without_scripts.replace('</body>', f'{script_block}</body>', 1)
else:
    body_with_scripts = f'{body_without_scripts}{script_block}'

combined = head_part + body_with_scripts
output_path.write_text(combined, encoding="utf-8")
PYCODE

echo "✅ Build complete: ${OUTPUT}"
echo "📦 File size: $(wc -c < "${OUTPUT}") bytes"
echo ""
echo "Next steps:"
echo "1. Open ${OUTPUT} in a browser to test"
echo "2. Copy contents to GoHighLevel custom HTML block"
