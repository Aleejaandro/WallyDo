const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const {
    resolver: { sourceExts: defaultSourceExts, assetExts: defaultAssetExts },
  } = defaultConfig;

  const customConfig = {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      assetExts: defaultAssetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...defaultSourceExts, 'svg'],
    },
  };

  // Fusionamos las configuraciones
  const mergedConfig = mergeConfig(defaultConfig, customConfig);

  // Envolvemos con reanimated
  return wrapWithReanimatedMetroConfig(mergedConfig);
})();
