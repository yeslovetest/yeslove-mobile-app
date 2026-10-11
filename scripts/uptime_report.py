#!/usr/bin/env python3
"""Work out availability from monitor exports (DTAC D1.5: average availability over 12 months, to 2 decimal places).

Usage:  python3 scripts/uptime_report.py docs/uptime/*.csv [--months 12]

Each CSV has one row per check with at least a timestamp and a result, as exported from the
uptime monitor (see docs/availability.md). Column names are matched loosely: the timestamp column
is the first one whose header contains "time" or "date"; the result column is the first containing
"status", "result", "up" or "state". A row counts as up when its result is up, ok, success, true,
1 or an HTTP 2xx/3xx code. Availability is up checks divided by all checks. Checks are assumed to be
evenly spaced, so the figure is only as good as the monitor's schedule; the report also lists the
longest run of failed checks so an outage is visible even when the percentage looks high.
"""
import argparse
import csv
import sys
from datetime import datetime, timedelta

UP_WORDS = {"up", "ok", "success", "true", "1", "healthy", "passed"}


def is_up(value):
    value = str(value).strip().lower()
    if value in UP_WORDS:
        return True
    return value.isdigit() and 200 <= int(value) < 400


def parse_time(value):
    value = str(value).strip().replace("Z", "+00:00")
    for fmt in (None, "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%d/%m/%Y %H:%M"):
        try:
            parsed = datetime.fromisoformat(value) if fmt is None else datetime.strptime(value, fmt)
            return parsed.replace(tzinfo=None)
        except ValueError:
            continue
    raise ValueError(f"Cannot read the time {value!r}")


def pick(header, words):
    for index, name in enumerate(header):
        if any(word in name.lower() for word in words):
            return index
    raise ValueError(f"No column with {words} in {header}")


def read(paths):
    rows = []
    for path in paths:
        with open(path, newline="") as handle:
            reader = csv.reader(handle)
            header = next(reader)
            when, result = pick(header, ("time", "date")), pick(header, ("status", "result", "up", "state"))
            for row in reader:
                if row:
                    rows.append((parse_time(row[when]), is_up(row[result])))
    return sorted(rows)


def report(rows, months, now=None):
    now = now or datetime.utcnow()
    start = now - timedelta(days=round(months * 30.4375))
    window = [(t, up) for t, up in rows if t >= start]
    if not window:
        return None
    ups = sum(1 for _, up in window if up)
    longest = current = 0
    for _, up in window:
        current = 0 if up else current + 1
        longest = max(longest, current)
    return {
        "checks": len(window), "up": ups, "availability_percent": round(100 * ups / len(window), 2),
        "from": window[0][0].isoformat(), "to": window[-1][0].isoformat(), "longest_failed_run": longest,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("files", nargs="+")
    parser.add_argument("--months", type=float, default=12)
    args = parser.parse_args()
    result = report(read(args.files), args.months)
    if result is None:
        sys.exit("No checks in that period.")
    print(f"Availability over the last {args.months:g} months: {result['availability_percent']:.2f}%")
    print(f"  {result['up']} of {result['checks']} checks up, from {result['from']} to {result['to']}")
    print(f"  longest run of failed checks: {result['longest_failed_run']}")
    if (datetime.fromisoformat(result["to"]) - datetime.fromisoformat(result["from"])).days < args.months * 30 - 31:
        print("  Note: the data covers less than the period asked for, so this is not yet a 12-month figure.")


if __name__ == "__main__":
    main()
