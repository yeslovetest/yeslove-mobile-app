# Verification and reset emails

Keycloak sends the account verification and password reset emails through the Gmail account named in its mail settings (Keycloak admin console, realm YesLove_Auth, Realm settings, Email). When sending fails, sign-up fails too: the API reports an error and removes the half-created account, so the person can try again with the same address.

## Settings that must be right

| Setting | Value |
| --- | --- |
| Host and port | `smtp.gmail.com`, `587` |
| Enable StartTLS | **On.** Without it Gmail refuses with `530 5.7.0 Must issue a STARTTLS command first` and no email is sent |
| Enable SSL | Off (SSL is for port 465) |
| Authentication | Enabled, user = the sending Gmail address, password = a Gmail **app password** (needs 2-step verification on that Google account) |
| From | The sending Gmail address |

The password is never stored in the repository. Set it in the admin console after the realm is created or imported. The imported realm export carries the host, port, user and the STARTTLS setting only.

## Checking it

1. In the admin console, Realm settings, Email, press **Test connection**. It sends a test message to the email address on the admin user, so give that user an address first.
2. If sign-up fails, read the Keycloak log for the line starting `KC-SERVICES0029: Failed to send email`. The reason follows it:
   - `530 ... STARTTLS` means StartTLS is off.
   - `535 ... Username and Password not accepted` means the app password is wrong or has been revoked. Create a new one and enter it.
   - A timeout or connection error means the server cannot reach `smtp.gmail.com` on port 587.
3. If no error appears but nothing arrives, look in the recipient's spam or junk folder, because the message comes from a Gmail address.

## After rotating credentials

The Gmail app password was once committed to the repository, so it must be replaced (see the credential rotation checklist). Create the new app password, enter it in the Email settings, press Test connection, and then sign up with a test address to confirm the whole path.
