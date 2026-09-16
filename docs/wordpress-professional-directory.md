# Website professionals in the mobile app

The app previously queried only local verified User/ProfessionalDetails rows. It now reads WordPress users filtered by the configured professional role on each directory request. No scheduled import or duplicate app accounts are needed. Blog and upload behaviour is unchanged.

## Backend configuration

Set these on the backend service (ECS task environment/secrets), never in Expo:

- `PROFESSIONALS_SOURCE=wordpress` (default)
- `WORDPRESS_DIRECTORY_API_URL=https://yeslove.co.uk/wp-json/wp/v2` (default)
- `WORDPRESS_PROFESSIONAL_ROLE=professional` (default; verify against the website directory)
- `WORDPRESS_DIRECTORY_USERNAME`: dedicated integration account
- `WORDPRESS_DIRECTORY_APPLICATION_PASSWORD`: application password for that account

The account needs WordPress `list_users` capability to filter users by role and include professionals who have no published posts. Prefer a dedicated integration account with only the needed capability. Application passwords inherit the account permissions; they do not add permissions. Configure secrets through the deployment secret store, not source control or the app. HTTPS is required and redirects are rejected.

Missing configuration returns 503; upstream errors return 502/504. The app shows a retry state rather than claiming the directory is empty. The endpoint now requires the app user's normal bearer token because the website directory is login-protected. Existing mobile requests already carry that token.

## Required live verification before release

1. Confirm the website Get Help directory uses role `professional`. If it also filters approval/status or uses plugin-specific profile fields, adapt the service to that same rule before release. Role membership alone is not proof of professional verification.
2. Confirm the integration account can GET `/wp-json/wp/v2/users?roles=professional&context=view`. Verify that non-author professionals are included.
3. Compare names, count, biographies and images against the website while signed in. This adapter uses standard WordPress name, description and avatar fields; a membership plugin may store these elsewhere.
4. Sign into the app and check the list, search, next/previous pages and retry after a simulated network failure.
5. Add/update a website professional and confirm reopening the app directory reflects the change.

No live credentials were available during implementation. Automated tests mock WordPress; they do not establish that the live directory uses this role or these profile fields.

For installations intentionally using local professional accounts, `PROFESSIONALS_SOURCE=database` retains the existing verified-database source. There is no silent fallback between sources.

References: https://developer.wordpress.org/rest-api/reference/users/ and https://developer.wordpress.org/advanced-administration/security/application-passwords/
