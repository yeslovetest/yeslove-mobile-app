# Architecture

This document describes how the YesLove! mobile app is structured and the
conventions to follow when extending it. For setup and commands, see the
[README](../README.md).

## Bootstrapping

The app boots through three layers:

1. **`app/index.tsx`** — the `expo-router` entry. It wires the provider tree
   (`SafeAreaProvider` → Redux `Provider` → `App`), configures the shared axios
   client (`configureHttpClient`), and registers an auth-failure handler that
   stops token refresh and routes back to sign-in when a session expires.
2. **`app/App.tsx`** — the top-level screen switcher. On mount it dispatches
   `attemptRefreshFromLocalStorageAction` to restore a session, then renders one
   of four states based on `auth.loginState`: `LOADING`, `LOGGED_OUT` (login),
   `SIGN_UP`, or `LOGGED_IN` (the main app + `Footer`).
3. **The active screen** — when logged in, the screen is chosen by the current
   entry of the navigation `tabStack` (see below).

## Navigation: a Redux tab stack

Even though `expo-router` is the entry point, **in-app navigation is driven by
Redux, not the file system.** This is deliberate and predates the revamp.

- The `navigation` slice (`app/store/Navigation/navigationSlice.ts`) holds a
  `tabStack: TabData[]`. The **last** entry is the visible screen.
- `TabType` is an enum of every reachable screen (`HOME`, `EVENTS`, `PROFILE`,
  `CONVERSATION`, `INDIVIDUAL_POST`, …). `TabData` carries an optional `data`
  payload (e.g. `{ userId }`, a selected post/blog).
- `app/App.tsx` maps `currentActiveTab.type` to a component via an object
  lookup — effectively a switch statement over `TabType`.

### Navigating

| Intent                                 | Action                               |
| -------------------------------------- | ------------------------------------ |
| Replace the stack (switch primary tab) | `changeTabAction({ type, data })`    |
| Push a screen on top (drill in)        | `openTabOnTopAction({ type, data })` |
| Go back                                | `goBackToPreviousTabAction()`        |

Screens read their parameters from the top of the stack, e.g.
`useAppSelector((s) => s.navigation.tabStack.at(-1)?.data?.userId)`.

> When adding a screen: add a `TabType` member, render it in the `App.tsx` map,
> and navigate to it by dispatching one of the actions above.

## State management

Redux Toolkit is the single store (`app/store/store.ts`), composed of these
slices:

| Slice key                  | Source                          | Responsibility                       |
| -------------------------- | ------------------------------- | ------------------------------------ |
| `user`, `profile`, `media` | `Profile-store/`                | Current user, profile data, uploads  |
| `feed`                     | `Home-store/feedSlice.ts`       | Home feed posts, reactions, follows  |
| `auth`                     | `Auth-store/authSlice.ts`       | Login state, session, error messages |
| `events`                   | `Events-store/`                 | Events lists                         |
| `getHelp`                  | `Get-help-store/`               | Blogs + professionals                |
| `chat`                     | `Chat/chatSlice.ts`             | Conversations / friends list         |
| `notification`             | `Notification-store/`           | Notifications + friend requests      |
| `navigation`               | `Navigation/navigationSlice.ts` | The tab stack (above)                |

### Sagas own side effects

`redux-saga` middleware runs `rootSaga` (`app/store/sagas/rootSaga.ts`), which
forks one saga per domain (`feedSaga`, `blogSaga`, `chatSaga`, …). The pattern:

1. A slice declares an **intent action** with an empty reducer body, e.g.
   `fetchBlogPosts` in `getHelpSlice`.
2. The saga uses `takeEvery(fetchBlogPosts.type, …)`, calls the API client, and
   on success dispatches a **setter action** (`setBlogPosts`) that updates state.
3. Components dispatch the intent action and select the resulting state.

Errors are currently caught and logged inside the sagas. Only the profile
timeline slice tracks `loading` / `error` flags end-to-end; most list slices do
not (see "Loading & empty states").

Access the store through the typed hooks in `app/store/hooks.ts`
(`useAppDispatch`, `useAppSelector`) rather than the raw react-redux hooks.

## Networking & the generated API client

- HTTP is centralized on a shared axios instance configured in
  `app/config/httpClient.ts`, using `EXPO_PUBLIC_API_BASE_URL` /
  `EXPO_PUBLIC_CHATBOT_BASE_URL`.
- **`generated-api/`** is a `typescript-axios` client generated from
  `swagger.json`. It is generated code — **do not edit it by hand.** Regenerate
  with `npm run gen-api` (which also runs a patch script for the base path).
- Sagas call the generated factories (e.g. `BlogApiFactory().getBlogPosts(...)`).

## Design system / theming

Design tokens live in `app/theme/` and are the single source of truth for color,
spacing, typography, radii, and shadows. The revamp migrated screens off
hard-coded values onto these tokens.

- **`app/theme/index.ts`** composes the tokens into a `Theme` and exposes:
  - `theme` — the static **light** theme. Import this in module-scope
    `StyleSheet.create()` where a hook cannot run.
  - `useTheme()` — returns the theme for the current system color scheme. The
    app ships light-only today, but tokens are **dark-ready**: a full
    `darkColors` set exists, so enabling dark mode later is a config change, not
    a rewrite.
- **Color tokens** (`app/theme/colors.ts`) are semantic, not raw hues. Prefer the
  role name over a literal:

  | Token                                                        | Use                                                    |
  | ------------------------------------------------------------ | ------------------------------------------------------ |
  | `primary`, `primarySoft`, `accent`                           | Brand blue, soft blue tint, orange accent              |
  | `background`, `surface`, `surfaceAlt`                        | Screen bg, cards, alt surfaces                         |
  | `textPrimary`, `textSecondary`, `textMuted`, `textOnPrimary` | Text ramp; `textOnPrimary` is always-white / dark-safe |
  | `border`, `borderStrong`                                     | Dividers / outlines                                    |
  | `danger`, `success`, `warning`                               | Status colors                                          |
  | `overlay`                                                    | Modal backdrops                                        |

  Raw literals are intentionally kept only for image scrims, translucent
  overlays, media-lightbox backgrounds, and messaging-bubble accents where a
  semantic token would be wrong.

- **Watch for dynamic style overrides.** Some components override token styles at
  runtime from hooks (e.g. login/sign-up border colors). When changing a color,
  grep the component _and_ its hook — editing only the `*Styles` file can be
  silently defeated.

## Loading & empty states

Every data list renders a shared placeholder instead of a bare blank view:

- **`Universal-components/List-state/ListStateView.tsx`** — a centered spinner
  (with text) while loading, or a muted message when empty. It mirrors the
  original Profile-timeline state pattern.
- **`Universal-components/List-state/useSettleAfter.ts`** — for lists whose slice
  has no loading flag, this returns `false` for a short window after mount so the
  list shows a spinner briefly rather than flashing an "empty" message before the
  fetch resolves.

The Profile timeline (`TimelineContent`) and Notifications use real slice flags
(`timeline.loading` / `timeline.error`, `isFetchingNotifications`); the feed,
get-help, events, and chat lists use `useSettleAfter` because their slices do not
yet expose loading/error state. Adding full loading + error handling to those
would require new slice fields wired through their sagas.

## Accessibility conventions

Interactive elements carry accessibility metadata:

- `accessibilityRole` — `"button"` for touchables, `"tab"` for tab-bar items.
- `accessibilityLabel` — a human description, especially for icon-only controls
  (send, media pickers, reactions) and inputs (mirrors the placeholder/label).
- `accessibilityState` — `selected` for toggles/tabs, `disabled` for disabled
  buttons, `expanded` for disclosure controls.

When adding an interactive element, include these props — an icon with only an
`onPress` is invisible to screen readers otherwise.

## Conventions summary

- Feature folders: `pages/<Feature>/<Feature>-root/<Feature>-root-components/…`
  with co-located `*Styles.ts`.
- Path alias `@/*` maps to the project root (e.g. `@/app/theme`).
- Prefer typed store hooks, semantic tokens, and saga-driven side effects.
- Don't hand-edit `generated-api/`; don't change the locked bundle/package IDs.
