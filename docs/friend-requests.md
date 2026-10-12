# Friend requests

Becoming friends needs the other person's say-so. Until they accept, a request gives no access to messages or the Friends feed.

## How it works

A request is a row in `friend_request` (requester, recipient, status, timestamps). It is kept apart from `Follow` because chat and the Friends feed treat any friend row in `Follow` as a friendship. Accepting creates the two friend rows (and upgrades any plain follows between the two people).

| Action | Call | Result |
| --- | --- | --- |
| Ask | `POST /api/feed/follow/<id>` `{"action":"follow","follow_type":"friend"}` | 202, request pending, recipient notified |
| Accept | the same call, made by the person who was asked | 201, both become friends, requester notified |
| Decline | `{"action":"decline"}` | 200, no friendship, requester not told |
| Withdraw | `{"action":"unfollow"}` while a request is pending | 200, request cancelled |
| List | `GET /api/feed/friend-requests` | pending requests sent to you |
| Following list | `GET /api/feed/following/<id>` | adds `friendship_status`: `friend`, `requested` or empty |

The mobile app already makes exactly these calls, so no app update is needed.

## Rules

- Blocking someone deletes any request between you, and a blocked person cannot send one.
- At most 10 new requests a day and 50 pending at once (answer: 429).
- After a decline the same person cannot ask again for 30 days. The reply does not say they were declined.
- Asking someone who is already a friend, or who you have already asked, changes nothing.
- Friendships that existed before this change are left as they are.
- Unknown actions are refused (400). An unrecognised action used to be treated as a follow, which is how a decline could create a friendship.

## Data

- Deleted with the account, and listed in the data export (`friend_requests`).
- Accepted, declined and withdrawn requests are purged by the retention job after 90 days. Pending requests stay until answered.
- Accepts are recorded in the audit trail (`friend_request.accept`).
- The table is created on startup if missing, like the other recent tables; there is no manual migration step.
- The retention schedule in the public privacy notice needs a line for this: answered friend requests, 90 days.
