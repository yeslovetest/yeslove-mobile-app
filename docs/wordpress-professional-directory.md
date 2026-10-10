# Website professionals in the mobile app

The app never contacts WordPress. A sync job copies the website's professionals into our own database (`wordpress_professionals`), and `/api/events/professionals` reads that copy. The job runs every 6 hours as the `professional-sync` service in `docker-compose.microservices.yml`, and on demand with:

```
docker compose -f docker-compose.microservices.yml exec main-app flask sync-wordpress-professionals
```

It prints `added`, `updated`, `removed` and `total`. A change on the website shows in the app after the next sync (at most 6 hours).

## Backend configuration

No login or password is needed. The sync job reads the website's public BuddyPress member list. All settings are optional (defaults shown) and go in `backend/.env`:

- `PROFESSIONALS_SOURCE=wordpress` (default) or `database` (the verified local professionals, no WordPress)
- `WORDPRESS_DIRECTORY_API_URL=https://yeslove.co.uk/wp-json/buddypress/v1` (HTTPS required)
- `WORDPRESS_PROFESSIONAL_MEMBER_TYPE=professionals` (the BuddyPress member type that marks a professional)

BuddyPress returns only what each member has chosen to show publicly, so a member who hides a field simply has it blank in the app.

## How it behaves

- **Not configured** (URL or member type blank): the sync command fails with a clear message, and the API returns 503 while the copy is empty, rather than showing an empty directory as if that were true.
- **Configured, not yet synced:** the API returns an empty list.
- **WordPress down, timing out or returning an error:** the sync fails and the existing copy is left untouched, so the app keeps working.
- **WordPress returns nobody while we hold a copy:** treated as a failure and the copy is kept, so an outage or a role change cannot wipe the list. (If the website really has no professionals left, clear the table by hand.)
- Only the name, photo and a short description (the profile's Bio, or "How I can help" if there is no Bio) are copied. Email, phone, birthday, gender and other contact details can be public on the website but are never stored.

## Before relying on it

1. Confirm the website's Get Help directory is the same set of people as the BuddyPress member type `professionals` (6 at the time of writing). If it uses a different member type or extra approval rules, change the setting or the sync.
2. Confirm every member of that type has agreed to be listed in the app. Their public profile fields are visible on the website, but the app is a second place they appear.
3. Run the sync, then compare names, count, descriptions and photos with the website.
4. In the app, check the list, search and next/previous pages.

The tests use a mocked WordPress. The live endpoint was checked by hand for its shape only.

References: https://developer.buddypress.org/bp-rest-api/reference/members/
