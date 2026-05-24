#!/usr/bin/env python3
"""Brand-casing audit — flag prose drift and legacy-brand regressions.

Two checks run together:

1. **prose-cogneris** — lowercase "cogneris" used as prose. Per
   cogneris-brand-guidelines v1.3 § 9, the brand name in prose is title-case
   "Cogneris". Lowercase "cogneris" is reserved for the codename layer:
     - File paths (cogneris-logo.png, cogneris-public DB tenant)
     - URLs (https://cogneris.ai/...)
     - Event names (cogneris:consent)
     - Snake_case identifiers (cogneris_consent_v1)
     - npm scope (@xtrakt-ai), repo names, GCP services

2. **fluex-regression** — any occurrence of the legacy brand "fluex" (case
   insensitive). The 2026-05-21 rebrand removed all customer-surface uses;
   new occurrences are regressions. Historical references in audit/memory
   docs are skipped via SKIP_FILENAMES.

Intended for use in CI (per-repo .github/workflows/brand-casing-check.yml)
and as a local pre-commit hygiene check.

Exit codes:
  0 — clean (no drift found)
  1 — drift found (matches reported on stderr)
  2 — usage error
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# Word-boundary cogneris that is NOT:
#   - followed by - : /  (identifiers, paths, event names)
#   - followed by . then a word char (URLs like cogneris.ai/cogneris.com)
# \b already handles trailing _ (underscore is a word char), so cogneris_public
# does not match.
PROSE_COGNERIS = re.compile(r"\bcogneris\b(?![\-:\/])(?!\.\w)")

# Word-boundary "fluex" in any casing — legacy brand renamed to Cogneris
# 2026-05-21. Any source-tree occurrence is a rebrand regression. Historical
# audit/memory docs are exempt via SKIP_FILENAMES.
FLUEX_REGRESSION = re.compile(r"\bfluex\b", re.IGNORECASE)

# File extensions to scan when running in tree-walk mode (no explicit files).
SCAN_EXTENSIONS = {
    ".html", ".htm",
    ".vue",
    ".ts", ".tsx", ".js", ".jsx",
    ".scss", ".css",
    ".json",
    ".md", ".mdx", ".txt",
    ".yaml", ".yml",
}

# Path fragments to skip during tree-walk (build outputs, deps, test data,
# historical audits that capture pre-rollout state).
SKIP_DIR_FRAGMENTS = (
    "/node_modules/",
    "/.git/",
    "/dist/",
    "/build/",
    "/coverage/",
    "/.test-results/",
    "/REPORTS/",
    "/.angular/",
    "/.cache/",
    "/audits/",   # historical SEO / brand audits — frozen snapshots
)

# Filenames to skip — test fixtures, archives, and meta-documentation that
# legitimately quotes the lowercase form (rule definitions, migration plans).
SKIP_FILENAMES = (
    ".spec.ts",
    ".spec.js",
    ".test.ts",
    ".test.js",
    "cogneris-brand-guidelines.md",                   # v1.3 guideline (defines the rule)
    "cogneris-brand-guidelines-2026-05-07-v1.2.md",   # archived v1.2 guideline
    "brand-voice-guidelines.md",                      # .claude mirror
    "project_brand_fluex_unification.md",             # auto-memory history
    "CLAUDE.md",                                       # agent-instruction doc (quotes the rule)
    "AGENTS.md",                                       # codex-instruction doc (quotes the rule)
)

# Substring patterns in basenames to skip — planning docs and session recaps
# that capture historical state.
SKIP_FILENAME_FRAGMENTS = (
    "-implementation-plan",
    "-session-recap",
    "-migration-plan",
)


def should_scan(path: Path) -> bool:
    p = str(path)
    if any(frag in p for frag in SKIP_DIR_FRAGMENTS):
        return False
    if any(p.endswith(s) for s in SKIP_FILENAMES):
        return False
    name = path.name
    if any(frag in name for frag in SKIP_FILENAME_FRAGMENTS):
        return False
    return path.suffix.lower() in SCAN_EXTENSIONS


def scan_file(path: Path) -> list[tuple[int, str, str]]:
    """Return [(line_no, kind, line_content), ...] for matches in this file."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        print(f"warn: cannot read {path}: {e}", file=sys.stderr)
        return []
    hits = []
    for i, line in enumerate(text.splitlines(), start=1):
        if PROSE_COGNERIS.search(line):
            hits.append((i, "prose-cogneris", line.rstrip()))
        if FLUEX_REGRESSION.search(line):
            hits.append((i, "fluex-regression", line.rstrip()))
    return hits


def walk_tree(root: Path) -> list[Path]:
    return [p for p in root.rglob("*") if p.is_file() and should_scan(p)]


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Audit prose-cogneris (lowercase) for brand-casing drift."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        type=Path,
        help="Files or directories to scan. Defaults to CWD.",
    )
    parser.add_argument(
        "--max-show",
        type=int,
        default=50,
        help="Maximum matches to show in stderr report (default: 50).",
    )
    args = parser.parse_args(argv)

    targets = args.paths or [Path.cwd()]
    files: list[Path] = []
    for t in targets:
        if t.is_file():
            if should_scan(t):
                files.append(t)
        elif t.is_dir():
            files.extend(walk_tree(t))
        else:
            print(f"warn: {t} does not exist", file=sys.stderr)

    drift: list[tuple[Path, int, str, str]] = []
    for f in files:
        for line_no, kind, line in scan_file(f):
            drift.append((f, line_no, kind, line))

    if not drift:
        print(f"OK: scanned {len(files)} files, no brand drift.")
        return 0

    prose_count = sum(1 for d in drift if d[2] == "prose-cogneris")
    fluex_count = sum(1 for d in drift if d[2] == "fluex-regression")
    print(
        f"DRIFT: {len(drift)} occurrence(s) across "
        f"{len({d[0] for d in drift})} file(s) — "
        f"{prose_count} prose-cogneris, {fluex_count} fluex-regression. "
        "Expected title-case 'Cogneris' per brand-guidelines v1.3 § 9; "
        "no 'fluex' in source (legacy brand, renamed 2026-05-21).",
        file=sys.stderr,
    )
    for f, line_no, kind, line in drift[: args.max_show]:
        snippet = line.strip()[:140]
        print(f"  [{kind}] {f}:{line_no}: {snippet}", file=sys.stderr)
    if len(drift) > args.max_show:
        print(
            f"  ... and {len(drift) - args.max_show} more "
            f"(re-run with --max-show {len(drift)} to see all).",
            file=sys.stderr,
        )
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
