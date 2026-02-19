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
config.resolver.extraNodeModules = {
  react: path.resolve(projectNodeModules, 'react'),
  'react/jsx-runtime': path.resolve(projectNodeModules, 'react/jsx-runtime'),
  'react/jsx-dev-runtime': path.resolve(projectNodeModules, 'react/jsx-dev-runtime'),
  'react-native': path.resolve(workspaceNodeModules, 'react-native'),
};

module.exports = config;
