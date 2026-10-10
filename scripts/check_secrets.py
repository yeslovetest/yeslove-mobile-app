#!/usr/bin/env python3
"""Fail if a tracked file looks like it holds a real secret.

Runs in CI (.github/workflows/secret-scan.yml) and locally:  python3 scripts/check_secrets.py

Only high-confidence patterns are checked, so a failure should always be taken seriously.
If a hit is a deliberate fake (a test fixture), add its path to ALLOWED_PATHS with a reason.
A secret that was committed must be rotated at the provider; deleting the file is not enough.
"""
import re
import subprocess
import sys

# Files that must never be tracked, whatever they contain.
FORBIDDEN_NAMES = re.compile(r"(^|/)(\.env(\.[a-z]+)?|[^/]*\.env\.save|[^/]*\.pem|[^/]*\.p12|[^/]*\.jks|[^/]*keystore[^/]*)$")
ALLOWED_NAMES = re.compile(r"(^|/)\.env\.example$")

PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED |)PRIVATE KEY-----"),
    "service account key": re.compile(r'"type"\s*:\s*"service_account"'),
    "Google API key": re.compile(r"\bAIza[0-9A-Za-z_\-]{35}\b"),
    "OpenAI key": re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_\-]{32,}"),
    "Groq key": re.compile(r"\bgsk_[A-Za-z0-9]{30,}"),
    "AWS access key id": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "DigitalOcean key": re.compile(r"\b(?:dop_v1_[a-f0-9]{40,}|DO00[A-Z0-9]{16,})\b"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}\b"),
    "Slack token": re.compile(r"\bxox[baprs]-[A-Za-z0-9\-]{10,}"),
}

ALLOWED_PATHS: dict[str, str] = {}


def main():
    files = subprocess.run(["git", "ls-files", "-z"], capture_output=True, text=True, check=True).stdout.split("\0")
    problems = []
    for path in filter(None, files):
        if path in ALLOWED_PATHS or path.startswith("node_modules/") or "/node_modules/" in path:
            continue
        if FORBIDDEN_NAMES.search(path) and not ALLOWED_NAMES.search(path):
            problems.append(f"{path}: this kind of file must not be committed")
            continue
        try:
            text = open(path, encoding="utf-8", errors="ignore").read()
        except (OSError, IsADirectoryError):
            continue
        for label, pattern in PATTERNS.items():
            if pattern.search(text):
                problems.append(f"{path}: looks like a {label}")
    for line in problems:
        print(f"::error::{line}" if "GITHUB_ACTIONS" in __import__("os").environ else line)
    if problems:
        print(f"\n{len(problems)} problem(s). Remove the secret and rotate it at the provider.")
        sys.exit(1)
    print("No secrets found in tracked files.")


if __name__ == "__main__":
    main()
