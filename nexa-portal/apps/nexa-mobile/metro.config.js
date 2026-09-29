const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Watch shared libs only — not the monorepo root/node_modules (Windows
// FallbackWatcher races on pnpm temp folders like expo_tmp_<pid>).
config.watchFolders = [path.resolve(workspaceRoot, 'libs')];

// Prefer the app's React 19.1.0 (RN 0.81) over the web portal's React at
// the monorepo root (currently 19.3.x). Mixing copies causes:
// "Invalid hook call" / "Cannot read property 'useId' of null".
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react' ||
    moduleName === 'react-dom' ||
    moduleName === 'react-native' ||
    moduleName.startsWith('react/') ||
    moduleName.startsWith('react-dom/') ||
    moduleName.startsWith('react-native/')
  ) {
    const fromDir =
      moduleName === 'react-native' || moduleName.startsWith('react-native/')
        ? workspaceRoot
        : projectRoot;
    return {
      filePath: require.resolve(moduleName, { paths: [fromDir] }),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

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
