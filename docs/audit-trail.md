# Audit trail of access to personal data (DTAC C3.6)

The `audit_events` table records who did what to whose personal data. It holds ids and action names only, never message text or profile content, and it has no foreign keys so a record survives the deletion of the account it is about.

## What is recorded

| Action | When |
| --- | --- |
| `admin.moderation_logs.list`, `admin.moderation_log.review` | An admin views the flagged-content log (which holds flagged message text) or reviews an entry |
| `admin.user.suspend` | An admin suspends or reinstates a member (the member is recorded as the subject) |
| `admin.moderation_stats.view` | An admin views moderation statistics |
| `admin.professionals.list`, `admin.professional.verify` | An admin views professionals' licence details or verifies one |
| `admin.reports.list`, `admin.report.review` | An admin lists or reviews reports about members |
| `admin.audit.view` | An admin reads the audit trail (reading it is recorded) |
| `account.export`, `account.delete` | A member exports or deletes their own data (recorded before deletion) |
| `cli.professional.link`, `cli.professional.unlink` | Someone with server access links or unlinks a website professional |

Each event has the time, the actor (user id, sign-in id, and role admin, member or system), the subject member where one applies, a short resource label such as `user:12`, the outcome (`ok`, `denied` or `error`) and the IP address. A refused attempt, for example a member calling an admin route, is recorded as `denied`.

Ordinary reading by members of their own data (their feed, their messages) is not recorded: it would drown the events that matter. Add `@audited(...)` to a route, or call `record_audit(...)`, to record more.

## Reading it

Admins call `GET /api/admin/audit/events` with optional filters `action` (a name or prefix such as `admin.`), `actor_user_id`, `subject_user_id`, `outcome`, `since`, `page` and `per_page`. To answer "who has looked at this member's data?", filter by `subject_user_id`.

## Retention and deletion

Events are deleted after 12 months by the daily retention job (`audit_events` in the policy). When a member deletes their account their events are kept, but the sign-in id on them is removed, so what remains is a numeric id that no longer points at anyone.

## Not covered yet

- Reads of other members' data by ordinary members (profiles, posts) are not audited.
- Database and server access by operators is not in this table. Keep the server's own access logs and Keycloak admin events (switched on by `mfa.py harden`) alongside it.
- A write failure is logged and never blocks the request, so a database outage can leave gaps.
