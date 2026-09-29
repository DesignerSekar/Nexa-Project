/**
 * Metro's FallbackWatcher (used on Windows without Watchman) calls fs.watch()
 * without try/catch. When Gradle/pnpm deletes a directory mid-walk, Node throws
 * ENOENT synchronously and Metro exits. Guard that path; re-run on every start.
 */
const fs = require('fs');
const path = require('path');

const MARKER = 'NEXA_METRO_WATCH_ENOENT_GUARD';

/** @type {{ needle: string, replacement: string }[]} */
const VARIANTS = [
  {
    // metro-file-map 0.83.3 (public instance fields)
    needle: `  _watchdir = (dir) => {
    if (this.watched[dir]) {
      return false;
    }
    const watcher = _fs.default.watch(
      dir,
      {
        persistent: true,
      },
      (event, filename) => this._normalizeChange(dir, event, filename),
    );
    this.watched[dir] = watcher;
    watcher.on("error", this._checkedEmitError);
    if (this.root !== dir) {
      this._register(dir, "d");
    }
    return true;
  };`,
    replacement: `  _watchdir = (dir) => {
    // ${MARKER}
    if (this.watched[dir]) {
      return false;
    }
    if (dir !== this.root) {
      const relativePath = _path.default.relative(this.root, dir);
      if (this.doIgnore(relativePath)) {
        return false;
      }
    }
    let watcher;
    try {
      watcher = _fs.default.watch(
        dir,
        {
          persistent: true,
        },
        (event, filename) => this._normalizeChange(dir, event, filename),
      );
    } catch (error) {
      this._checkedEmitError(error);
      return false;
    }
    this.watched[dir] = watcher;
    watcher.on("error", this._checkedEmitError);
    if (this.root !== dir) {
      this._register(dir, "d");
    }
    return true;
  };`,
  },
  {
    // metro-file-map 0.83.8+ (private fields)
    needle: `  #watchdir = (dir) => {
    if (this.#watched[dir]) {
      return false;
    }
    const watcher = _fs.default.watch(
      dir,
      {
        persistent: true,
      },
      (event, filename) => this.#normalizeChange(dir, event, filename),
    );
    this.#watched[dir] = watcher;
    watcher.on("error", this.#checkedEmitError);
    if (this.root !== dir) {
      this.#register(dir, "d");
    }
    return true;
  };`,
    replacement: `  #watchdir = (dir) => {
    // ${MARKER}
    if (this.#watched[dir]) {
      return false;
    }
    if (dir !== this.root) {
      const relativePath = _path.default.relative(this.root, dir);
      if (this.doIgnore(relativePath)) {
        return false;
      }
    }
    let watcher;
    try {
      watcher = _fs.default.watch(
        dir,
        {
          persistent: true,
        },
        (event, filename) => this.#normalizeChange(dir, event, filename),
      );
    } catch (error) {
      this.#checkedEmitError(error);
      return false;
    }
    this.#watched[dir] = watcher;
    watcher.on("error", this.#checkedEmitError);
    if (this.root !== dir) {
      this.#register(dir, "d");
    }
    return true;
  };`,
  },
];

function findTargets() {
  const workspaceRoot = path.resolve(__dirname, '../../..');
  const pnpmRoot = path.join(workspaceRoot, 'node_modules', '.pnpm');
  const found = new Set();
  if (!fs.existsSync(pnpmRoot)) {
    return [];
  }
  for (const name of fs.readdirSync(pnpmRoot)) {
    if (!name.startsWith('metro-file-map@')) continue;
    const candidate = path.join(
      pnpmRoot,
      name,
      'node_modules',
      'metro-file-map',
      'src',
      'watchers',
      'FallbackWatcher.js',
    );
    if (fs.existsSync(candidate)) found.add(candidate);
  }
  return [...found];
}

function patchFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  if (src.includes(MARKER)) {
    return 'already';
  }
  for (const { needle, replacement } of VARIANTS) {
    if (src.includes(needle)) {
      fs.writeFileSync(filePath, src.replace(needle, replacement), 'utf8');
      return 'patched';
    }
  }
  console.warn('[nexa-mobile] FallbackWatcher shape changed; skip:', filePath);
  return 'skipped';
}

function main() {
  const targets = findTargets();
  if (targets.length === 0) {
    console.warn('[nexa-mobile] metro-file-map FallbackWatcher not found; skip patch.');
    return;
  }

  let patched = 0;
  let already = 0;
  for (const target of targets) {
    const result = patchFile(target);
    if (result === 'patched') {
      patched += 1;
      console.log('[nexa-mobile] Patched Metro FallbackWatcher:', target);
    } else if (result === 'already') {
      already += 1;
    }
  }
  if (patched === 0 && already > 0) {
    console.log(
      `[nexa-mobile] Metro ENOENT guard already present (${already} file(s)).`,
    );
  }
}

main();
