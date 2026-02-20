module.exports = function (api) {
  api.cache(true);
  let hasNativeWind = true;
  let hasReanimated = true;
  let hasExpoRouter = true;
  try {
    require.resolve('nativewind/package.json');
  } catch {
    hasNativeWind = false;
  }
  try {
    require.resolve('react-native-reanimated/package.json');
  } catch {
    hasReanimated = false;
  }
  try {
    require.resolve('expo-router/package.json');
  } catch {
    hasExpoRouter = false;
  }

  const routerPlugins = hasExpoRouter ? ['expo-router/babel'] : [];

  if (!hasNativeWind) {
    return {
      presets: ['babel-preset-expo'],
      plugins: hasReanimated
        ? [...routerPlugins, 'react-native-reanimated/plugin']
        : routerPlugins,
    };
  }

  const nativewindConfig = require('nativewind/babel')();
  const nativewindPlugins = (nativewindConfig.plugins || []).filter((plugin) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    // nativewind@4.2 adds this plugin for Reanimated 4+, but this app uses Reanimated 3.
    return pluginName !== 'react-native-worklets/plugin';
  });

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: hasReanimated
      ? [...nativewindPlugins, ...routerPlugins, 'react-native-reanimated/plugin']
      : [...nativewindPlugins, ...routerPlugins],
  };
};
