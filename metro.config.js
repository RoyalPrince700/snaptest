const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree shaking and bundle optimization
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
  output: {
    ascii_only: true,
    quote_style: 3,
    wrap_iife: true,
  },
  compress: {
    reduce_funcs: false,
  },
};

// Optimize asset handling
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Enable bundle splitting for better caching
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Exclude unnecessary files from bundle
config.resolver.blockList = [
  /.*\/__tests__\/.*/,
  /.*\/\.git\/.*/,
  /.*\/node_modules\/.*\/test\/.*/,
  /.*\/node_modules\/.*\/tests\/.*/,
  /.*\/node_modules\/.*\/docs\/.*/,
  /.*\/node_modules\/.*\/examples\/.*/,
];

// Optimize resolver for faster builds
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 