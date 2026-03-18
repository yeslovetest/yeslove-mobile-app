# Frontend Mobile App (Expo SDK 54)

This app now targets Expo SDK 54.

## Runtime Requirements

- Node.js 20.19.4 or newer
- npm 9+

Note: Using older Node versions can break SDK 54 tooling commands (for example, `expo-doctor`).

## Get Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npx expo start
   ```

## Useful Validation Commands

- Check Expo package compatibility:

  ```bash
  npx expo install --check
  ```

- Run lint:

  ```bash
  npm run lint
  ```

- Run typecheck:

  ```bash
  npx tsc --noEmit
  ```
