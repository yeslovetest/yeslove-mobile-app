# Accessibility pre-audit (against WCAG 2.2 AA)

**Status (updated after the first fixes):** the contrast failures on the orange banners, the missing roles and labels, the image descriptions and the screen headings listed below were fixed in code and are guarded by `frontendmobileapp/test/a11y/accessibility.test.ts`. A correction: the first version of this document counted tappable elements with a rough text search that miscounted; the figures below come from parsing every screen. Nothing here has been checked on a device.

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
| White text on the orange banners (accent) | 2.51 | Failed. **Fixed:** the banner title, caption, icon and divider are now dark slate, about 7:1 |
| Orange accent as text on white | 2.4 to 2.5 | Fails, but the accent colour is used only for the banner background, so no text is affected |
| Success green and warning orange as text | 3.0 to 3.3 | Fail for normal text. Neither is used for text in the screens (success is a status dot); keep it that way |
| **Borders and disabled states** (`border`, `borderStrong`, `disabled`) | **1.2 to 1.5** | **Fail 1.4.11** if a border is the only thing showing where a field or button is. Text fields have a blue underline, which passes, but cards and disabled controls rely on very pale edges |

## Screen reader support (WCAG 4.1.2, 1.1.1, 1.3.1)

Every `.tsx` file under `app/` was parsed, not searched. The counts are for the code as it stood before the fixes, and all were fixed:

| Scan result | Count | Fixed by |
| --- | --- | --- |
| Tappable elements | 152 | |
| Without a role or label | 22 | The five real buttons (attend an event, remove an attachment, close, view attachment) now have a role and a label; the 16 modal backdrops and cards, which were never controls, are marked not accessible |
| Text fields | 17 | |
| Without a label | 2 (the web date fields) | Labelled |
| Images | 27 | |
| Without a description or a "decorative" mark | 27 | Avatars next to a name, thumbnails inside a labelled button and similar are marked decorative; photos in posts, chats and attachments have a description |
| Elements marked as headings | 2 | 43 screen and section titles are now marked as headings |

What this does not show: whether the labels are good, whether the reading order is sensible, and whether custom components behave. Only a person using VoiceOver and TalkBack can say.

## Text size, targets, motion

- **Large text (1.4.4, 1.4.10):** nothing disables font scaling, which is good, but layouts have not been tested at the largest sizes. Fixed-height rows and banners are the likeliest to clip.
- **Touch targets (2.5.8, 24 by 24 CSS pixels minimum):** not measured. Small icon buttons (post options, close icons) are the likeliest to fall short, and some use `hitSlop`, which helps.
- **Video and audio (1.2):** captions and transcripts for videos and podcasts are not evidenced.
- **Focus and keyboard (2.1.1, 2.4.7):** not testable statically. Needs a device with a keyboard or switch control.
- **Motion (2.3.3):** not assessed.

## Suggested order of work

1. ~~Fix the contrast failures on the banners~~ and ~~name the controls, label the fields, describe the images and mark the headings~~ are done. Pale borders (1.2 to 1.5:1) are not: they only matter where a border is the sole sign of where a control is.
2. **Test on a device** with VoiceOver and TalkBack for the main journeys (see `docs/user-journeys.md`), then at the largest text size.
3. **Commission the external audit** with the results above as the starting brief, and publish an accessibility statement (a draft is in `docs/accessibility-statement-draft.md`).
