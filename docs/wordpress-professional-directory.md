# Website professionals in the mobile app

The app never contacts WordPress. A sync job copies the website's professionals into our own database (`wordpress_professionals`), and `/api/events/professionals` reads that copy. The job runs every 6 hours as the `professional-sync` service in `docker-compose.microservices.yml`, and on demand with:

```
docker compose -f docker-compose.microservices.yml exec main-app flask sync-wordpress-professionals
```

It prints `added`, `updated`, `removed` and `total`. A change on the website shows in the app after the next sync (at most 6 hours).

## Backend configuration

Set these in `backend/.env` on the server, never in Expo or in source control:

- `PROFESSIONALS_SOURCE=wordpress` (default) or `database` (the verified local professionals, no WordPress)
- `WORDPRESS_DIRECTORY_API_URL=https://yeslove.co.uk/wp-json/wp/v2` (default; HTTPS required)
- `WORDPRESS_PROFESSIONAL_ROLE=professional` (default; verify against the website directory)
- `WORDPRESS_DIRECTORY_USERNAME`: a dedicated integration account
- `WORDPRESS_DIRECTORY_APPLICATION_PASSWORD`: an application password for that account

Only the sync job uses the WordPress password. The account needs the WordPress `list_users` capability. Use a dedicated account with only that capability.

## How it behaves

- **Not configured:** the sync command fails with a clear message, and the API returns 503 ("not yet configured") while the copy is empty. It does not show an empty directory as if that were true.
- **Configured, not yet synced:** the API returns an empty list.
- **WordPress down, timing out, or rejecting the login:** the sync fails and the existing copy is left untouched, so the app keeps working.
- **WordPress returns nobody while we hold a copy:** treated as a failure and the copy is kept, so an outage or a role change cannot wipe the list. (If the website really has no professionals left, clear the table by hand.)
- Only the name, biography and photo are copied. Email addresses and other account details are never requested or stored.

## Before relying on it

1. Confirm the website directory uses the role `professional`. If it also filters on approval or status, or uses plugin-specific profile fields, change the sync to the same rule. Role membership alone is not proof that someone is verified.
2. Confirm the integration account can GET `/wp-json/wp/v2/users?roles=professional&context=view`, including professionals with no published posts.
3. Run the sync, then compare names, count, biographies and photos with the website.
4. In the app, check the list, search and next/previous pages.

No live credentials were available while this was built. The tests mock WordPress, so they do not show that the live directory uses this role or these fields.

References: https://developer.wordpress.org/rest-api/reference/users/ and https://developer.wordpress.org/advanced-administration/security/application-passwords/
