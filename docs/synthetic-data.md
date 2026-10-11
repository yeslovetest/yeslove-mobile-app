# Synthetic data for local testing

Fill your **local** database with made-up content so screens can be tried with a realistic amount to scroll through: a feed, comments, friends, long conversations, notifications, events and professionals.

```
cd backend
flask seed-synthetic-data --user <your local username>      # 30 people by default; --people N, --reset
flask remove-synthetic-data                                  # deletes all of it again
```

The `--user` account must already exist locally (sign up or sign in as it first). Run the commands with the same environment overrides as the local backend (local Keycloak address, `FLASK_ENV=development`).

## What it creates

| Area | What you get |
| --- | --- |
| People | About 30 synthetic members and 6 synthetic professionals. Usernames start `synth_`, addresses are at `example.invalid`, and none has a Keycloak login, so nobody can sign in as them |
| Feed | About 48 posts over the last two months (some by your account, some anonymous), roughly 90 comments, 150 likes and 45 reactions |
| Friends | 10 friends of your account, a few followers, and some follows between the others |
| Messages | 10 conversations (8 friends, 2 professionals) of 8 to 30 messages each, with the newest ones unread |
| Notifications | 26 for your account, about 40% unread |
| Events | 8 events, past and upcoming, with attendees, your account attending half |
| Professionals | 6 sample professionals in the directory, each linked to a synthetic account so the Message button works |
| Safety | One blocked person, so blocking can be tried |

Anything written as your account starts with `[sample]`, so you can tell it from what you wrote yourself.

## Safety

- It **refuses** to run unless the database is local (SQLite, `localhost` or `127.0.0.1`) and `FLASK_ENV` is not `production`. The production database host is not local, so it cannot run there.
- It only ever deletes synthetic rows: people with the `synth_` prefix and the content tied to them, `[sample]` content, sample events, flagged sample notifications and the sample professionals. Your own posts and everything else stay.
- Running it twice is refused until you remove the first set (or use `--reset`). With the same seed it creates the same content.

## Not covered

- Photos and video (no files are created), so media screens stay empty.
- Admin screens (reports, moderation logs): these need an admin account, so seed those by hand if you want them.
- Keycloak: synthetic people exist only in the app database.
