import csv
import importlib.util
from datetime import datetime, timedelta
from pathlib import Path

spec = importlib.util.spec_from_file_location("uptime_report", Path(__file__).resolve().parents[2] / "scripts" / "uptime_report.py")
uptime = importlib.util.module_from_spec(spec)
spec.loader.exec_module(uptime)

NOW = datetime(2026, 10, 11, 12, 0, 0)


def write(tmp_path, rows, header=("Timestamp", "Status")):
    path = tmp_path / "checks.csv"
    with open(path, "w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(header)
        writer.writerows(rows)
    return str(path)


def test_availability_is_up_checks_over_all_checks_to_two_places(tmp_path):
    rows = [((NOW - timedelta(minutes=5 * i)).isoformat(), "up" if i % 3 else "down") for i in range(300)]
    result = uptime.report(uptime.read([write(tmp_path, rows)]), months=1, now=NOW)
    assert result["checks"] == 300 and result["availability_percent"] == 66.67


def test_http_codes_and_other_words_count_as_up(tmp_path):
    rows = [(NOW.isoformat(), v) for v in ("200", "204", "301", "OK", "success", "500", "503", "timeout")]
    assert uptime.report(uptime.read([write(tmp_path, rows)]), months=1, now=NOW)["up"] == 5


def test_only_the_requested_period_counts(tmp_path):
    rows = [((NOW - timedelta(days=400)).isoformat(), "down"), ((NOW - timedelta(days=1)).isoformat(), "up")]
    result = uptime.report(uptime.read([write(tmp_path, rows)]), months=12, now=NOW)
    assert result["checks"] == 1 and result["availability_percent"] == 100.0


def test_the_longest_outage_is_reported(tmp_path):
    states = ["up", "down", "down", "down", "up", "down", "up"]
    rows = [((NOW - timedelta(minutes=10 * (len(states) - i))).isoformat(), s) for i, s in enumerate(states)]
    assert uptime.report(uptime.read([write(tmp_path, rows)]), months=1, now=NOW)["longest_failed_run"] == 3


def test_no_data_in_the_period_is_not_reported_as_100_percent(tmp_path):
    rows = [((NOW - timedelta(days=500)).isoformat(), "up")]
    assert uptime.report(uptime.read([write(tmp_path, rows)]), months=12, now=NOW) is None
