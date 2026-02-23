const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const projectNodeModules = path.resolve(projectRoot, 'node_modules');
const workspaceNodeModules = path.resolve(workspaceRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  projectNodeModules,
  workspaceNodeModules,
];
config.resolver.disableHierarchicalLookup = true;
const resolveWorkspaceModule = (name) => path.resolve(workspaceNodeModules, name);
config.resolver.extraNodeModules = {
  '@mirror/routes': path.resolve(workspaceRoot, 'packages/routes/src'),
  react: resolveWorkspaceModule('react'),
  'react/jsx-runtime': resolveWorkspaceModule('react/jsx-runtime'),
  'react/jsx-dev-runtime': resolveWorkspaceModule('react/jsx-dev-runtime'),
  'react-native': resolveWorkspaceModule('react-native'),
};

let withNativeWind;
try {
  ({ withNativeWind } = require('nativewind/metro'));
} catch {
  withNativeWind = null;
}

module.exports = withNativeWind
  ? withNativeWind(config, { input: './global.css' })
  : config;
