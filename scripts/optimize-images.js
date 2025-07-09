const fs = require('fs');
const path = require('path');

// Function to get file size in MB
function getFileSizeInMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Function to analyze image assets
function analyzeImageAssets() {
  const assetsDir = path.join(__dirname, '../assets');
  const imagesDir = path.join(assetsDir, 'images');
  const avatarsDir = path.join(assetsDir, 'avatars');
  
  console.log('🔍 Analyzing image assets...\n');
  
  let totalSize = 0;
  const largeFiles = [];
  
  // Analyze images directory
  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir);
    imageFiles.forEach(file => {
      const filePath = path.join(imagesDir, file);
      const size = getFileSizeInMB(filePath);
      totalSize += parseFloat(size);
      
      if (parseFloat(size) > 0.1) { // Files larger than 100KB
        largeFiles.push({ path: filePath, size, type: 'image' });
      }
    });
  }
  
  // Analyze avatars directory
  if (fs.existsSync(avatarsDir)) {
    const avatarFiles = fs.readdirSync(avatarsDir);
    avatarFiles.forEach(file => {
      const filePath = path.join(avatarsDir, file);
      const size = getFileSizeInMB(filePath);
      totalSize += parseFloat(size);
      
      if (parseFloat(size) > 0.1) { // Files larger than 100KB
        largeFiles.push({ path: filePath, size, type: 'avatar' });
      }
    });
  }
  
  console.log(`📊 Total image assets size: ${totalSize.toFixed(2)} MB\n`);
  
  if (largeFiles.length > 0) {
    console.log('🚨 Large files detected (>100KB):');
    largeFiles.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
    largeFiles.forEach(file => {
      console.log(`  - ${path.basename(file.path)}: ${file.size} MB (${file.type})`);
    });
  }
  
  return { totalSize, largeFiles };
}

// Function to provide optimization recommendations
function provideRecommendations(largeFiles) {
  console.log('\n💡 Optimization Recommendations:\n');
  
  console.log('1. 🖼️  Image Optimization:');
  console.log('   - Use WebP format instead of PNG/JPG (saves 25-35%)');
  console.log('   - Compress images using tools like TinyPNG or ImageOptim');
  console.log('   - Consider using different sizes for different screen densities');
  console.log('   - Remove unused images from the bundle');
  
  console.log('\n2. 📱 Platform-specific assets:');
  console.log('   - Use @2x and @3x suffixes for iOS');
  console.log('   - Use drawable-hdpi, drawable-xhdpi for Android');
  console.log('   - Consider lazy loading for large images');
  
  console.log('\n3. 🔧 Build optimizations:');
  console.log('   - Enable R8 full mode (already configured)');
  console.log('   - Use only arm64-v8a architecture (already configured)');
  console.log('   - Enable resource shrinking (already configured)');
  
  console.log('\n4. 📦 Dependency optimization:');
  console.log('   - Consider if you need both expo-mlkit-ocr and react-native-mlkit-ocr');
  console.log('   - Evaluate if react-native-pdf is necessary');
  console.log('   - Use tree-shaking for unused dependencies');
  
  // Specific recommendations for large files
  if (largeFiles.length > 0) {
    console.log('\n5. 🎯 Specific file recommendations:');
    largeFiles.forEach(file => {
      const fileName = path.basename(file.path);
      const size = parseFloat(file.size);
      
      if (size > 0.5) {
        console.log(`   - ${fileName}: Consider replacing with WebP or smaller format`);
      }
      if (fileName.includes('camera') || fileName.includes('upload')) {
        console.log(`   - ${fileName}: Consider using vector icons instead of images`);
      }
    });
  }
}

// Function to create optimized image structure
function createOptimizationScript() {
  const script = `
# Image optimization script
# Run these commands to optimize your images:

# Install image optimization tools
npm install -g imagemin-cli imagemin-webp imagemin-pngquant imagemin-mozjpeg

# Optimize PNG images
imagemin snaptest/assets/images/*.png --out-dir=snaptest/assets/images/optimized --plugin=pngquant

# Convert to WebP (better compression)
imagemin snaptest/assets/images/*.{png,jpg} --out-dir=snaptest/assets/images/webp --plugin=webp

# Optimize avatar images
imagemin snaptest/assets/avatars/*.jpg --out-dir=snaptest/assets/avatars/optimized --plugin=mozjpeg

# Expected size reduction: 40-60%
`;
  
  fs.writeFileSync(path.join(__dirname, 'optimize-images.sh'), script);
  console.log('\n📝 Created optimization script: scripts/optimize-images.sh');
}

// Main execution
function main() {
  console.log('🚀 SnapTest Bundle Size Analyzer\n');
  
  const { totalSize, largeFiles } = analyzeImageAssets();
  provideRecommendations(largeFiles);
  createOptimizationScript();
  
  console.log('\n✅ Analysis complete!');
  console.log(`📱 Current estimated bundle size: ~${(totalSize + 15).toFixed(1)} MB`);
  console.log(`🎯 Target bundle size: <30 MB`);
  console.log(`📉 Potential savings: ${(totalSize * 0.5).toFixed(1)} MB (50% reduction)`);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeImageAssets, provideRecommendations }; 