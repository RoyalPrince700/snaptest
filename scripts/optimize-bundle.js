const fs = require('fs');
const path = require('path');

console.log('🚀 SnapTest Bundle Optimizer for Windows\n');

// Function to create optimized asset structure
function createOptimizedAssets() {
  const assetsDir = path.join(__dirname, '../assets');
  const optimizedDir = path.join(assetsDir, 'optimized');
  
  // Create optimized directory structure
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }
  
  const imagesDir = path.join(optimizedDir, 'images');
  const avatarsDir = path.join(optimizedDir, 'avatars');
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
  }
  
  console.log('📁 Created optimized asset directories');
  return { optimizedDir, imagesDir, avatarsDir };
}

// Function to create optimization instructions
function createOptimizationInstructions() {
  const instructions = `
# 🎯 SnapTest Bundle Size Optimization Guide

## Current Status:
- Image assets: 5.86 MB
- Estimated bundle: ~20.9 MB
- Target: <30 MB ✅

## Immediate Actions (Manual):

### 1. 🖼️ Optimize Large Images (Save ~3MB):

**Use online tools:**
- Go to https://tinypng.com/
- Upload these files and download optimized versions:
  - assets/avatars/avatar4.jpg (0.84 MB → ~0.3 MB)
  - assets/avatars/avatar2.jpg (0.76 MB → ~0.25 MB)
  - assets/avatars/avatar6.jpg (0.70 MB → ~0.25 MB)
  - assets/avatars/avatar7.jpg (0.66 MB → ~0.25 MB)
  - assets/avatars/avatar5.jpg (0.60 MB → ~0.2 MB)
  - assets/images/camera.png (0.77 MB → ~0.3 MB)
  - assets/images/icon.png (0.73 MB → ~0.3 MB)

**Replace original files with optimized versions**

### 2. 🎨 Convert to WebP (Save ~2MB):

**Use online converter:**
- Go to https://convertio.co/png-webp/
- Convert these files to WebP:
  - camera.png → camera.webp
  - icon.png → icon.webp
  - upload_image.png → upload_image.webp

### 3. 📱 Use Vector Icons Instead:

**Replace these images with vector icons:**
- camera.png → Use @expo/vector-icons camera icon
- upload_image.png → Use @expo/vector-icons image icon
- upload_doc.png → Use @expo/vector-icons document icon

### 4. 🔧 Build Optimizations (Already Applied):
- ✅ R8 full mode enabled
- ✅ Only arm64-v8a architecture
- ✅ Resource shrinking enabled
- ✅ ProGuard optimization enabled

## Expected Results:
- Image assets: 5.86 MB → ~2.5 MB (57% reduction)
- Total bundle: ~20.9 MB → ~17.5 MB
- Savings: ~3.4 MB

## Next Steps:
1. Optimize images using online tools
2. Replace large PNGs with vector icons
3. Convert remaining images to WebP
4. Rebuild the app
5. Check final bundle size

## Commands to run after optimization:
\`\`\`bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx expo run:android --variant release
\`\`\`
`;

  fs.writeFileSync(path.join(__dirname, 'OPTIMIZATION_GUIDE.md'), instructions);
  console.log('📝 Created optimization guide: scripts/OPTIMIZATION_GUIDE.md');
}

// Function to create vector icon replacement suggestions
function createVectorIconSuggestions() {
  const suggestions = `
// Replace these image imports with vector icons:

// Instead of: require('../assets/images/camera.png')
import { Ionicons } from '@expo/vector-icons';
<Ionicons name="camera" size={24} color="#1D3D47" />

// Instead of: require('../assets/images/upload_image.png')
<Ionicons name="image" size={24} color="#1D3D47" />

// Instead of: require('../assets/images/upload_doc.png')
<Ionicons name="document" size={24} color="#1D3D47" />

// Instead of: require('../assets/images/paste.png')
<Ionicons name="clipboard" size={24} color="#1D3D47" />

// Benefits:
// - No file size impact
// - Scalable to any size
// - Consistent with platform design
// - Better performance
`;

  fs.writeFileSync(path.join(__dirname, 'VECTOR_ICON_SUGGESTIONS.js'), suggestions);
  console.log('📝 Created vector icon suggestions: scripts/VECTOR_ICON_SUGGESTIONS.js');
}

// Function to analyze dependencies
function analyzeDependencies() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  
  console.log('📦 Dependency Analysis:\n');
  
  const heavyDeps = [
    { name: 'react-native-pdf', reason: 'PDF rendering library (~2-3MB)' },
    { name: 'expo-mlkit-ocr', reason: 'OCR functionality (~1-2MB)' },
    { name: 'react-native-mlkit-ocr', reason: 'Additional OCR library (~1-2MB)' },
    { name: 'react-native-webview', reason: 'WebView component (~500KB)' }
  ];
  
  heavyDeps.forEach(dep => {
    if (packageJson.dependencies[dep.name]) {
      console.log(`⚠️  ${dep.name}: ${dep.reason}`);
    }
  });
  
  console.log('\n💡 Consider removing unused heavy dependencies');
}

// Main execution
function main() {
  createOptimizedAssets();
  createOptimizationInstructions();
  createVectorIconSuggestions();
  analyzeDependencies();
  
  console.log('\n✅ Bundle optimization setup complete!');
  console.log('📖 Check scripts/OPTIMIZATION_GUIDE.md for detailed instructions');
  console.log('🎯 Expected bundle size after optimization: ~17.5 MB');
}

if (require.main === module) {
  main();
}

module.exports = { createOptimizedAssets, createOptimizationInstructions }; 