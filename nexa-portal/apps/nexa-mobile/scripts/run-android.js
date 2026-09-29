/**
 * Windows-safe Android launch:
 * - Applies Metro ENOENT watcher guard
 * - Uses a short GRADLE_USER_HOME to stay under Ninja's 260-char path limit
 * - Stops leftover Gradle daemons that hold buildLogic.lock
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(appRoot, 'android');

require('./patch-metro-fallback-watcher.js');

function pickGradleUserHome() {
  if (process.env.NEXA_GRADLE_USER_HOME) {
    return process.env.NEXA_GRADLE_USER_HOME;
  }
  // Prefer the project drive (W:) — C:\g\nexa often fails create/transform
  // because of ACL / AV locks on the system drive for non-admin writers.
  if (process.platform === 'win32' && /^[A-Za-z]:/.test(appRoot)) {
    return path.join(appRoot.slice(0, 2), 'g', 'nexa');
  }
  return path.join(appRoot, '.gradle-home');
}

function ensureGradleHome(gradleHome) {
  const transforms = path.join(gradleHome, 'caches', '8.14.3', 'transforms');
  fs.mkdirSync(transforms, { recursive: true });
  const probe = path.join(transforms, '.nexa-write-probe');
  fs.writeFileSync(probe, 'ok');
  fs.unlinkSync(probe);
}

if (process.platform === 'win32') {
  const shortGradleHome = pickGradleUserHome();
  try {
    ensureGradleHome(shortGradleHome);
    process.env.GRADLE_USER_HOME = shortGradleHome;
    console.log('[nexa-mobile] GRADLE_USER_HOME=' + shortGradleHome);
  } catch (error) {
    console.warn(
      '[nexa-mobile] Could not prepare GRADLE_USER_HOME at',
      shortGradleHome,
      '-',
      error.message,
    );
    console.warn(
      '[nexa-mobile] Falling back to default Gradle home (long paths may break Ninja).',
    );
  }
}

const gradlew = path.join(
  androidRoot,
  process.platform === 'win32' ? 'gradlew.bat' : 'gradlew',
);
if (fs.existsSync(gradlew)) {
  spawnSync(gradlew, ['--stop'], {
    cwd: androidRoot,
    stdio: 'ignore',
    shell: process.platform === 'win32',
    env: process.env,
  });
}

const extraArgs = process.argv.slice(2);
const result = spawnSync(
  process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
  ['exec', 'expo', 'run:android', ...extraArgs],
  {
    cwd: appRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  },
);

process.exit(result.status ?? 1);
