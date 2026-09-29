# Nexa Mobile (`@nexa/nexa-mobile`)

Expo React Native client for the Nexa sidecar. Same API surface as the web portal
(`apps/nexa-portal`); session transport is Bearer after DP-009.

## Prerequisites

- **Node 20 LTS** (see repo `.nvmrc`). Node 24 can break Expo CLI with
  `Body is unusable: Body has already been read` during dependency checks.
  `pnpm start` uses `--offline` to avoid that; use `pnpm start:online` on Node 20.
- pnpm 10 (workspace root)
- Android Studio with an AVD (API 34+ recommended)
- Sidecar running on the host at `http://localhost:8080`

## Install

From the monorepo root (`nexa-portal/`):

```bash
pnpm install
cp apps/nexa-mobile/.env.example apps/nexa-mobile/.env
```

The repo root `.npmrc` uses `node-linker=hoisted` so Metro can resolve Expo
packages (`expo-modules-core`, `react-refresh`, etc.) under pnpm.

Default `EXPO_PUBLIC_API_URL` for the Android emulator is `http://10.0.2.2:8080`
(maps to the host loopback).

## Run on Android Studio emulator

1. Start the sidecar (`uvicorn` / docker-compose as usual) on port **8080**.
2. Open Android Studio → Device Manager → start an AVD.
3. From the monorepo root:

```bash
pnpm --filter @nexa/nexa-mobile android
```

Or:

```bash
cd apps/nexa-mobile
pnpm android
```

This runs `expo run:android` against the running emulator.

`pnpm start` / `pnpm android` apply a Metro FallbackWatcher guard and ignore
`android/` in Metro’s file map so Windows `ENOENT` watch crashes stay fixed.

On Windows, `pnpm android` sets a short `GRADLE_USER_HOME` on the project
drive (e.g. `W:\g\nexa`) and runs `gradlew --stop` first — keeps Ninja under
the 260-character path limit and avoids a second daemon holding
`buildLogic.lock`. Override with `NEXA_GRADLE_USER_HOME` if needed.

`android/app/build.gradle` also sets `-DCMAKE_OBJECT_PATH_MAX=128` so CMake
hashes New Arch `.o` paths (needed when the repo lives under a long path
like `Designer Bros\...`).

**Current Windows workaround:** `newArchEnabled` is **false** in
`app.json` and `android/gradle.properties` because New Arch + Ninja 1.10
fails with `Filename longer than 260 characters` on this path. The app
runs on the old architecture. To re-enable New Arch later:

1. Open the project via short junction `W:\nx\apps\nexa-mobile\android`, or
2. Install **CMake 3.31+** / **Ninja 1.12+**, put `ninja.exe` at
   `W:\g\ninja\ninja.exe` (or set `NEXA_NINJA`), enable Windows long paths,
   set `newArchEnabled=true` again, delete `android/app/.cxx`, then rebuild.

### Dev client only (Metro)

```bash
pnpm --filter @nexa/nexa-mobile start
```

Then press `a` once an emulator is connected.

If Metro crashes with `ENOENT ... watch ... expo_tmp_*`, stop any other
install/build touching `node_modules`, then retry `pnpm start`. The app
Metro config watches `libs/` only (not root `node_modules`) to avoid that
Windows watcher race.

## Composition root

Platform adapters live under `src/platform/` and are wired in
`src/app/composition-root.ts`:

| Port | Mobile implementation |
| ---- | --------------------- |
| `HttpClient` | `fetch` + `AuthStrategy.attach` |
| `AuthStrategy` | `TokenAuthStrategy` (AsyncStorage) |
| `KeyValueStore` | AsyncStorage |

Feature screens import `@nexa/data` / `@nexa/auth` only — never platform modules directly
(except the composition root and the fetch client).

## Legacy shell

The previous Expo shell under `Nexa-FrontEnd-main/.../mobile` is superseded by this app.
Do not use the Kotlin `app/` debug shell as the product path.
