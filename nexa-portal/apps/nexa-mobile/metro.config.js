const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Watch shared libs only — not the monorepo root/node_modules (Windows
// FallbackWatcher races on pnpm temp folders like expo_tmp_<pid>).
config.watchFolders = [path.resolve(workspaceRoot, 'libs')];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = false;

// Patterns are matched after backslashes → `/` (see metro-file-map
// posixPathMatchesPattern). Use `(?:^|/)` so relative paths like
// `android/build/...` match — a leading `[/\\]` alone does not.
const priorBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(priorBlockList)
    ? priorBlockList
    : priorBlockList
      ? [priorBlockList]
      : []),
  /(?:^|\/)android(?:\/|$)/,
  /(?:^|\/)ios(?:\/|$)/,
  /(?:^|\/)\.expo(?:\/|$)/,
  /(?:^|\/)\.cxx(?:\/|$)/,
  /expo_tmp_[^/]+/,
  /(?:^|\/)\.git(?:\/|$)/,
];

module.exports = config;
