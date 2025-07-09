const fs = require('fs');
const path = require('path');

console.log('🔍 SnapTest Dependency Analyzer\n');

// Function to analyze package.json dependencies
function analyzeDependencies() {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('📦 Heavy Dependencies Analysis:\n');
  
  const heavyDeps = [
    { name: 'react-native-pdf', reason: 'PDF rendering library (~3-5MB)', size: '3-5MB' },
    { name: 'expo-mlkit-ocr', reason: 'OCR functionality (~2-3MB)', size: '2-3MB' },
    { name: 'react-native-mlkit-ocr', reason: 'Additional OCR library (~2-3MB)', size: '2-3MB' },
    { name: 'react-native-webview', reason: 'WebView component (~500KB-1MB)', size: '0.5-1MB' },
    { name: 'expo-image', reason: 'Image processing (~1-2MB)', size: '1-2MB' },
    { name: 'expo-document-picker', reason: 'Document picker (~500KB)', size: '0.5MB' },
    { name: 'expo-media-library', reason: 'Media library access (~500KB)', size: '0.5MB' },
    { name: 'expo-file-system', reason: 'File system operations (~500KB)', size: '0.5MB' },
    { name: 'react-native-reanimated', reason: 'Animation library (~1-2MB)', size: '1-2MB' },
    { name: 'react-native-gesture-handler', reason: 'Gesture handling (~500KB)', size: '0.5MB' }
  ];
  
  let totalEstimatedSize = 0;
  const foundDeps = [];
  
  heavyDeps.forEach(dep => {
    if (packageJson.dependencies[dep.name]) {
      foundDeps.push(dep);
      const sizeRange = dep.size.split('-');
      const avgSize = (parseFloat(sizeRange[0]) + parseFloat(sizeRange[1])) / 2;
      totalEstimatedSize += avgSize;
      console.log(`⚠️  ${dep.name}: ${dep.reason} (${dep.size})`);
    }
  });
  
  console.log(`\n📊 Estimated dependency size: ~${totalEstimatedSize.toFixed(1)}MB`);
  return { foundDeps, totalEstimatedSize };
}

// Function to provide optimization recommendations
function provideOptimizationRecommendations(foundDeps) {
  console.log('\n💡 Optimization Recommendations:\n');
  
  console.log('1. 🗑️  Remove Unused Heavy Dependencies:');
  
  if (foundDeps.find(d => d.name === 'react-native-pdf')) {
    console.log('   - react-native-pdf: Do you really need PDF rendering?');
    console.log('     Consider using web-based PDF viewers instead');
  }
  
  if (foundDeps.find(d => d.name === 'expo-mlkit-ocr') && foundDeps.find(d => d.name === 'react-native-mlkit-ocr')) {
    console.log('   - You have BOTH expo-mlkit-ocr AND react-native-mlkit-ocr');
    console.log('     Remove one of them (keep expo-mlkit-ocr)');
  }
  
  if (foundDeps.find(d => d.name === 'react-native-webview')) {
    console.log('   - react-native-webview: Only needed if you show web content');
    console.log('     Consider removing if not used');
  }
  
  console.log('\n2. 🖼️  Replace Images with Vector Icons:');
  console.log('   - camera.png (0.77MB) → Use @expo/vector-icons camera');
  console.log('   - upload_image.png (0.22MB) → Use @expo/vector-icons image');
  console.log('   - upload_doc.png (0.07MB) → Use @expo/vector-icons document');
  
  console.log('\n3. 🎨 Optimize Avatar Images:');
  console.log('   - Compress avatar4.jpg, avatar2.jpg, avatar6.jpg, avatar7.jpg, avatar5.jpg');
  console.log('   - Convert to WebP format (saves 30-50%)');
  
  console.log('\n4. 🔧 Additional Build Optimizations:');
  console.log('   - Enable bundle compression');
  console.log('   - Remove unused resources');
  console.log('   - Enable code splitting');
}

// Function to create dependency removal script
function createDependencyRemovalScript(foundDeps) {
  let script = '# Dependency removal commands\n\n';
  
  if (foundDeps.find(d => d.name === 'react-native-pdf')) {
    script += '# Remove PDF library (if not needed)\n';
    script += 'npm uninstall react-native-pdf\n\n';
  }
  
  if (foundDeps.find(d => d.name === 'react-native-mlkit-ocr')) {
    script += '# Remove duplicate OCR library\n';
    script += 'npm uninstall react-native-mlkit-ocr\n\n';
  }
  
  if (foundDeps.find(d => d.name === 'react-native-webview')) {
    script += '# Remove WebView (if not needed)\n';
    script += 'npm uninstall react-native-webview\n\n';
  }
  
  script += '# After removing dependencies:\n';
  script += 'cd android\n';
  script += './gradlew clean\n';
  script += 'cd ..\n';
  script += './gradlew bundleRelease\n';
  
  fs.writeFileSync(path.join(__dirname, 'remove-dependencies.sh'), script);
  console.log('📝 Created dependency removal script: scripts/remove-dependencies.sh');
}

// Function to estimate potential savings
function estimateSavings(foundDeps) {
  let potentialSavings = 0;
  
  // Dependency savings
  if (foundDeps.find(d => d.name === 'react-native-pdf')) {
    potentialSavings += 4; // 4MB
  }
  if (foundDeps.find(d => d.name === 'react-native-mlkit-ocr')) {
    potentialSavings += 2.5; // 2.5MB
  }
  if (foundDeps.find(d => d.name === 'react-native-webview')) {
    potentialSavings += 0.75; // 0.75MB
  }
  
  // Image savings
  potentialSavings += 2.5; // Image optimization
  
  return potentialSavings;
}

// Main execution
function main() {
  const { foundDeps, totalEstimatedSize } = analyzeDependencies();
  provideOptimizationRecommendations(foundDeps);
  createDependencyRemovalScript(foundDeps);
  
  const potentialSavings = estimateSavings(foundDeps);
  
  console.log('\n📊 Size Analysis Summary:');
  console.log(`📱 Current bundle: ~68MB`);
  console.log(`📦 Dependencies: ~${totalEstimatedSize.toFixed(1)}MB`);
  console.log(`🎨 Images: ~5.2MB`);
  console.log(`📉 Potential savings: ~${potentialSavings.toFixed(1)}MB`);
  console.log(`🎯 Target size: ~${(68 - potentialSavings).toFixed(1)}MB`);
  
  console.log('\n✅ Analysis complete!');
  console.log('💡 Start with removing unused heavy dependencies');
  console.log('📖 Check scripts/remove-dependencies.sh for removal commands');
}

if (require.main === module) {
  main();
}

module.exports = { analyzeDependencies, estimateSavings }; 