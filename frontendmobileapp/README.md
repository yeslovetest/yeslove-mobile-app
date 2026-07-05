# YesLove! Mobile App

The YesLove! mobile client — a React Native app built with Expo (SDK 54) and
shipped to the Google Play Store. It is the front end for the YesLove! platform
(feed, events, get-help resources, messaging + AI assistant, notifications, and
profiles), talking to the backend and chatbot services over HTTP.

> Part of the wider YesLove! monorepo. This README covers the mobile app only
> (`frontendmobileapp/`). For deeper design notes see
> [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Tech stack

| Area            | Choice                                                                                |
| --------------- | ------------------------------------------------------------------------------------- |
| Framework       | Expo SDK 54, React Native 0.81, React 19.1 (New Architecture enabled)                 |
| Language        | TypeScript (strict)                                                                   |
| Entry / routing | `expo-router` entry; in-app screen switching via a Redux navigation stack (see below) |
| State           | Redux Toolkit + `redux-saga` for side effects                                         |
| Networking      | `axios` against a generated TypeScript API client (`generated-api/`)                  |
| Styling         | Design tokens under `app/theme` (`useTheme()` / `theme`)                              |
| Tooling         | ESLint (`eslint-config-expo`), Prettier, Husky + lint-staged, Jest (`jest-expo`)      |

## Runtime requirements

- **Node.js 20.19.4+** (see `.nvmrc`). Older versions break SDK 54 tooling such
  as `expo-doctor`.
- **npm 9+**

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see "Environment variables" below)
cp .env.example .env   # then fill in the values

# 3. Start the Metro dev server
npx expo start
```

From the Expo dev server you can open the app in an Android emulator, iOS
simulator, a physical device via Expo Go / a dev build, or the web preview.

### Native builds

```bash
npm run android   # expo run:android
npm run ios       # expo run:ios (macOS only)
```

Release builds are produced with EAS (`eas.json`).

> **Locked identifiers:** the Android `package` and iOS `bundleIdentifier` are
> permanently `uk.co.yeslove.app` (`app.json`). Do not change them — the app is
> already published under this identity. Likewise, do not bump `version` /
> `versionCode` / `buildNumber` unless a release explicitly calls for it.

## Environment variables

Configuration is provided via Expo public env vars (see `.env.example`). Because
they are prefixed `EXPO_PUBLIC_`, they are inlined into the client bundle and are
**not secret** — never put credentials here.

| Variable                       | Purpose                              |
| ------------------------------ | ------------------------------------ |
| `EXPO_PUBLIC_API_BASE_URL`     | Base URL of the YesLove! backend API |
| `EXPO_PUBLIC_CHATBOT_BASE_URL` | Base URL of the chatbot microservice |

## NPM scripts

| Script                            | What it does                                        |
| --------------------------------- | --------------------------------------------------- |
| `npm start`                       | Start the Expo dev server                           |
| `npm run android` / `ios` / `web` | Launch on the respective platform                   |
| `npm run typecheck`               | `tsc --noEmit`                                      |
| `npm run lint` / `lint:fix`       | ESLint (report / autofix)                           |
| `npm run format` / `format:check` | Prettier write / check                              |
| `npm test` / `test:watch`         | Jest (`jest-expo`)                                  |
| `npm run gen-api`                 | Regenerate the typed API client from `swagger.json` |
| `npm run hooks:setup`             | Install Husky git hooks                             |

## Project structure

```
frontendmobileapp/
├── app/
│   ├── index.tsx              # expo-router entry: providers + HTTP/auth bootstrap
│   ├── App.tsx                # top-level screen switcher (auth gate + tab stack)
│   ├── pages/                 # feature screens (Home, Events, Get-help, Login, …)
│   ├── Universal-components/  # shared UI (Header, Footer, ListStateView, …)
│   ├── components/            # smaller reusable components
│   ├── store/                 # Redux slices, sagas, and the navigation stack
│   ├── theme/                 # design tokens (colors, spacing, typography, …)
│   ├── services/              # app services
│   └── config/                # HTTP client, base URLs
├── generated-api/             # generated axios client (do not edit by hand)
├── hooks/                     # cross-screen hooks (login, message toggle, …)
├── constants/                 # image fallbacks, media limits, …
├── assets/                    # images, fonts
└── app.json / eas.json        # Expo + EAS configuration
```

Feature folders follow a consistent nesting convention:
`pages/<Feature>/<Feature>-root/<Feature>-root-components/…`, with co-located
`*Styles.ts` files next to each component.

## Key concepts (quick tour)

- **Navigation is Redux-driven, not file-routed.** Although `expo-router` is the
  entry point, in-app screens are selected by a `tabStack` in the `navigation`
  slice and rendered by a `switch`-like map in `app/App.tsx`. You move between
  screens by dispatching `changeTabAction` / `openTabOnTopAction` /
  `goBackToPreviousTabAction`.
- **Side effects live in sagas.** Slices declare intent actions (e.g.
  `fetchBlogPosts`); the matching saga in `app/store/sagas/` performs the API
  call and dispatches the `set…` action with the result.
- **Styling goes through design tokens.** Import `theme` (static, light) in
  `StyleSheet.create`, or `useTheme()` inside components that should react to the
  system color scheme. Avoid hard-coded colors/spacing.
- **List screens share state placeholders.** Data lists render
  `Universal-components/List-state/ListStateView` for loading/empty states so no
  screen shows a bare blank view.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full picture.

## Code quality

Commits are guarded by Husky + lint-staged (ESLint + Prettier on staged files).
Before opening a PR, make sure the following are clean:

```bash
npm run typecheck
npm run lint
npm run format:check
```
