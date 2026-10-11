# Accessibility pre-audit (against WCAG 2.2 AA)

**This is not an audit.** It is what could be found from the code and the theme without a screen reader, a device, or a person using the app. It tells an external auditor where to look first and it gives engineering a head start. DTAC D1.4 needs a real audit, with testing on a phone using VoiceOver and TalkBack, large text, and keyboard or switch access.

Method: the colour tokens in `frontendmobileapp/app/theme/colors.ts` were checked against WCAG contrast ratios (the app uses the light theme), and every `.tsx` file under `app/` was scanned for accessibility props. Numbers are exact for what was scanned and say nothing about runtime behaviour.

## Colour contrast (WCAG 1.4.3 text 4.5:1, 1.4.11 interface 3:1)

| Pair | Ratio | Result |
| --- | --- | --- |
| Primary text on page and card | 17.1 to 17.9 | Pass |
| Secondary text | 6.1 to 6.4 | Pass |
| Muted text and icons | 4.6 to 4.8 | Pass, but only just |
| Brand blue text and links | 5.4 to 7.2 | Pass |
| White text on brand blue buttons | 5.65 to 7.18 | Pass |
| Error red text, and white on red | 4.6 to 4.8 | Pass |
| **White text on the orange banners (accent)** | **2.51** | **Fails.** The Newsfeed, Our Professionals and similar banners use white text on orange. Needs a darker orange or dark text |
| **Orange accent as text on white** | **2.4 to 2.5** | **Fails** wherever it is used for text |
| Success green and warning orange as text | 3.0 to 3.3 | Fail for normal text; pass only for large text or icons |
| **Borders and disabled states** (`border`, `borderStrong`, `disabled`) | **1.2 to 1.5** | **Fail 1.4.11** if a border is the only thing showing where a field or button is. Text fields have a blue underline, which passes, but cards and disabled controls rely on very pale edges |

## Screen reader support (WCAG 4.1.2, 1.1.1, 1.3.1)

| Scan result | Count | What it means |
| --- | --- | --- |
| Tappable elements | 154 | |
| Without a label or a role | 89 | Where a tappable contains visible text it is still read out, but it is not announced as a button. Icon-only ones, such as the post options (three dots) and message icons, have no name at all. Worst areas: Home (47), Profile (9), Notifications (9), Events (7) |
| Text fields without a label | 7 of 17 | Placeholder text disappears when typing and is not a reliable name |
| Images without a description or an explicit "hidden from screen reader" | 27 of 27 | Avatars and photos: meaningful ones need a description, decorative ones need to be hidden |
| Elements marked as headings | 1 | Screen reader users navigate by headings. Section titles are not marked, so they cannot jump between sections |

New screens added recently (the Protect your account card, browser sign-in, the Message button on professionals) do have roles and labels. Older screens are where the gaps are.

## Text size, targets, motion

- **Large text (1.4.4, 1.4.10):** nothing disables font scaling, which is good, but layouts have not been tested at the largest sizes. Fixed-height rows and banners are the likeliest to clip.
- **Touch targets (2.5.8, 24 by 24 CSS pixels minimum):** not measured. Small icon buttons (post options, close icons) are the likeliest to fall short, and some use `hitSlop`, which helps.
- **Video and audio (1.2):** captions and transcripts for videos and podcasts are not evidenced.
- **Focus and keyboard (2.1.1, 2.4.7):** not testable statically. Needs a device with a keyboard or switch control.
- **Motion (2.3.3):** not assessed.

## Suggested order of work

1. **Fix the contrast failures** (the orange banners, orange text, success and warning text, pale borders). Small, visible, and the cheapest to verify.
2. **Name the icon-only buttons and give every field a label.** Start with Home, Profile and Notifications.
3. **Mark screen titles as headings** and hide decorative images from screen readers; describe meaningful ones.
4. **Test on a device** with VoiceOver and TalkBack for the main journeys (see `docs/user-journeys.md`), then at the largest text size.
5. **Commission the external audit** with the results above as the starting brief, and publish an accessibility statement (a draft is in `docs/accessibility-statement-draft.md`).
