# Measuring availability (DTAC D1.5)

DTAC asks for average availability over the last 12 months, to two decimal places. There is no record today, so the 12-month figure can only be reported from the day measuring starts. Start now.

## What the app offers

`GET https://api.yeslove.co.uk/healthz` is public and cheap. It answers `200 {"status":"ok"}` when the API is serving and can reach its database, and `503 {"status":"unavailable"}` when it cannot. It returns nothing about members or the system.

## Set up an external monitor (about 15 minutes, needs an account owner)

Use a monitor that runs outside the server, so it still notices when the server is down. DigitalOcean's uptime checks are the simplest because the account already exists; any HTTP monitor with an export works.

1. Create an HTTPS check against `https://api.yeslove.co.uk/healthz` every minute or every five minutes, expecting HTTP 200.
2. Add a second check against `https://auth.yeslove.co.uk/realms/YesLove_Auth/.well-known/openid-configuration` (sign-in).
3. Send alerts to a mailbox more than one person reads.
4. Check that the monitor keeps history for as long as you need, or export it every month (below).

## Keeping the 12-month record

Monitors often keep detailed history for a limited time. Each month, export the checks as CSV and commit them as `docs/uptime/YYYY-MM-api.csv` (and `-auth.csv`). The files hold a timestamp and a result only, no personal data.

## Working out the figure

```
python3 scripts/uptime_report.py docs/uptime/*-api.csv --months 12
```

It prints availability to two decimal places, the number of checks, and the longest run of failed checks. If the data covers less than the period asked for it says so, because a three-month figure is not a 12-month figure. Report the real figure with the dates it covers.

## Also worth doing

- List outages as they happen (date, length, cause). DTAC reviewers read the percentage and the explanation together.
- The product runs on one server, so any deploy or reboot is a gap. Check what the monitor shows during a deploy, and say so in the record.
