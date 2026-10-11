# User journeys (DTAC D1.1)

How people use the app today, written from the code and the screens. **Not user-tested.** Each journey ends with where it can go wrong and the safety or support point on the way. Use it as the starting script for usability testing with real members (D1.2) and for screen reader testing (see `docs/accessibility-pre-audit.md`).

## Who uses it

- **Members:** adults looking for peer support and information about relationships and wellbeing.
- **Professionals:** therapists and counsellors who register with a licence body and number, are verified by an admin, and can be messaged by members once linked to their website profile.
- **Admins:** YesLove staff who review flagged content, reports and professional verification.

## 1. Joining

1. Open the app and choose **Sign up**.
2. Enter email, confirm email, a password of at least 12 characters, and confirm the password.
3. Enter a username, first name and last name, and accept the Terms and Privacy Policy.
4. Check your email and open the verification link.
5. Sign in.

*Can go wrong:* a password under 12 characters is refused (the older app build says 6); an email already in use; the verification email does not arrive or lands in spam (it is sent from a single Gmail account); someone under 18 signs up, because age is not collected. *Support point:* the sign-up errors, and the support contact in the Privacy Policy.

**Professionals** also give a licence body (HCPC, BACP or UKCP), a licence number, and consent to show licence details. An admin verifies them before they appear.

## 2. Signing in and out

- **Today:** enter username or email and password. If your account uses an authenticator app, type the 6-digit code in the code box.
- **Newer builds with browser sign-in:** tap Sign in; Keycloak's page opens in a sheet; sign in there, with the code if asked.
- **Signing out:** Profile, Settings, General, Log out.

*Can go wrong:* a wrong code looks the same as a wrong password (Keycloak does not distinguish them); a lost phone locks out someone with an authenticator (see `docs/member-mfa-support.md`).

## 3. Reading and posting in the community feed

1. Home shows **All Updates** and **Friends**.
2. Tap **+** to write a post, with photos or video if you like. The text is checked by moderation before it appears.
3. React to and comment on posts.
4. Tap the three dots on someone else's post or comment to **report** it or **block** the person.

*Can go wrong:* a post is blocked by moderation with a message; a harmful post is not caught (nothing watches the review queue yet). *Safety point:* report and block; admins review reports.

## 4. Finding a professional and messaging them

1. Open **Get help**, then **Professionals**. Search by name, or page through the list.
2. Read a professional's description (**Read more** shows the rest).
3. If they are linked to an app account, tap **Message** (or their photo or name) to open a chat and write to them.

*Can go wrong:* a professional who has not been linked shows "Messaging isn't available for this professional yet"; the list shows an error with a Retry button if it cannot load. *Safety point:* the person messaged may not be a clinician in an emergency; the crisis wording and the report and block buttons are available in the chat.

## 5. Messaging a friend

Messages (the speech bubble at the top of Home) lists your conversations, including anyone you have messaged. Open one, type a message, attach a photo or video if you like, and send. The text is checked by moderation. The three dots offer report and block.

## 6. Talking to the AI assistant (Sera) and the multilingual chat

1. From Messages, open the assistant. A notice says it is not medical or therapy advice and shows crisis signposting.
2. Type a question. Replies come from an AI and may be wrong.
3. The multilingual chat accepts typed text or a voice recording in one of ten languages and answers in the same language.

*Can go wrong:* an unsafe or mistaken reply, a mistranslated crisis phrase, a voice transcription error. *Safety point:* the notice and crisis signposting are the main mitigation; this is the area a clinical safety review would examine first.

## 7. Events and articles

**Events** lists upcoming events with a date filter and lets you say you are attending. **Get help**, then **Blogs** lists articles from the website.

## 8. Notifications

The bell lists friend requests, messages and other activity. Push notifications (when switched on) show the sender's name and the start of a message; they can be turned off in Settings.

## 9. Managing your account and data

Profile, then the gear icon opens Settings:

- **General:** log out, **Password and security** (or Change password), delete account;
- **Email**, **Profile Visibility** and **Push Notification Settings**;
- **Export Data:** download a JSON copy of your account, posts, messages and settings;
- **Privacy Policy** and **Terms & Conditions**.

**Deleting your account** erases your posts, messages, files and profile and signs you out for good. Accounts that wrote published articles or videos cannot be deleted in the app and are asked to contact support.

*Can go wrong:* deletion refused with a message for article authors; the export is large.

## What to test with real people

Run journeys 1, 2, 4, 6 and 9 with five to eight members, including some who use a screen reader, large text, or a lot of caution about their data. Note where they hesitate, what they read aloud, and whether they notice the crisis wording. Record dates, what you changed afterwards, and keep the notes: DTAC D1.2 asks whether usability is tested with intended users.
