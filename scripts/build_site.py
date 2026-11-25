#!/usr/bin/env python3
"""Build the static site with content versions for cached CSS and JavaScript."""

import hashlib
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def build_site(source=ROOT, destination=ROOT / "_site"):
    destination.mkdir(parents=True, exist_ok=True)
    html = (source / "index.html").read_text(encoding="utf-8")
    for name in ("styles.css", "companies-data.js", "script.js"):
        content = (source / name).read_bytes()
        version = hashlib.sha256(content).hexdigest()[:16]
        (destination / name).write_bytes(content)
        html = html.replace(f'"{name}"', f'"{name}?v={version}"')
    for name in ("assets", "downloads"):
        shutil.copytree(source / name, destination / name, dirs_exist_ok=True)
    (destination / "index.html").write_text(html, encoding="utf-8")
    print(f"Built site with versioned assets in {destination}")


if __name__ == "__main__":
    build_site()
