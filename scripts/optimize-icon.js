const fs = require('fs');
const path = require('path');

console.log('🎨 SnapTest Icon Optimizer\n');

// Function to analyze current icon
function analyzeCurrentIcon() {
  const iconPath = path.join(__dirname, '../assets/images/icon.png');
  const adaptiveIconPath = path.join(__dirname, '../assets/images/adaptive-icon.png');
  
  console.log('📊 Current Icon Analysis:\n');
  
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Main icon: icon.png (${sizeInMB} MB)`);
  } else {
    console.log('❌ Main icon: icon.png (missing)');
  }
  
  if (fs.existsSync(adaptiveIconPath)) {
    const stats = fs.statSync(adaptiveIconPath);
    const sizeInKB = (stats.size / 1024).toFixed(1);
    console.log(`✅ Adaptive icon: adaptive-icon.png (${sizeInKB} KB)`);
  } else {
    console.log('❌ Adaptive icon: adaptive-icon.png (missing)');
  }
}

// Function to create optimization instructions
function createIconOptimizationGuide() {
  const guide = `
# 🎨 SnapTest Icon Optimization Guide

## Current Status:
Your app is configured to use:
- Main icon: ./assets/images/icon.png
- Adaptive icon: ./assets/images/adaptive-icon.png
- Splash screen: ./assets/images/icon.png

## Issues Found:
1. Main icon is 746KB (too large for app store)
2. Should be optimized to ~100KB or less

## Quick Fix Options:

### Option 1: Optimize Current Icon (Recommended)
1. Go to https://tinypng.com/
2. Upload your assets/images/icon.png
3. Download the optimized version
4. Replace the original file

### Option 2: Use Adaptive Icon as Main
If adaptive-icon.png looks good:
1. Copy adaptive-icon.png to icon.png
2. This will reduce size from 746KB to 17KB

### Option 3: Generate New Icon Set
1. Go to https://appicon.co/
2. Upload your logo
3. Download all sizes
4. Replace files in assets/images/

## Icon Requirements:
- Main icon: 1024x1024px, PNG format
- Adaptive icon: 1024x1024px, PNG with transparency
- Max size: 100KB for main icon

## After Optimization:
1. Rebuild the app: npx expo run:android
2. Check the new icon appears correctly
3. Verify bundle size is reduced

## Expected Results:
- Icon size: 746KB → ~50-100KB
- Bundle size: ~68MB → ~67MB
- Better app store performance
`;

  fs.writeFileSync(path.join(__dirname, 'ICON_OPTIMIZATION_GUIDE.md'), guide);
  console.log('📝 Created icon optimization guide: scripts/ICON_OPTIMIZATION_GUIDE.md');
}

// Function to create a simple backup and optimization script
function createOptimizationScript() {
  const script = `
# Icon optimization commands

# 1. Backup current icons
cp assets/images/icon.png assets/images/icon-backup.png
cp assets/images/adaptive-icon.png assets/images/adaptive-icon-backup.png

# 2. Quick optimization (if you have ImageMagick installed)
# convert assets/images/icon.png -resize 1024x1024 -quality 85 assets/images/icon-optimized.png

# 3. Or use online tools:
# - Go to https://tinypng.com/
# - Upload icon.png and adaptive-icon.png
# - Download optimized versions
# - Replace original files

# 4. Rebuild app after optimization
npx expo run:android
`;

  fs.writeFileSync(path.join(__dirname, 'optimize-icon.sh'), script);
  console.log('📝 Created optimization script: scripts/optimize-icon.sh');
}

// Function to check app.json configuration
function checkAppConfiguration() {
  const appJsonPath = path.join(__dirname, '../app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  console.log('\n🔧 App Configuration Check:\n');
  console.log(`✅ Icon path: ${appJson.expo.icon}`);
  console.log(`✅ Adaptive icon: ${appJson.expo.android.adaptiveIcon.foregroundImage}`);
  console.log(`✅ Splash screen: ${appJson.expo.splash.image}`);
  console.log(`✅ Background color: ${appJson.expo.android.adaptiveIcon.backgroundColor}`);
  
  // Check if all paths exist
  const iconPath = path.join(__dirname, '..', appJson.expo.icon);
  const adaptiveIconPath = path.join(__dirname, '..', appJson.expo.android.adaptiveIcon.foregroundImage);
  
  if (fs.existsSync(iconPath)) {
    console.log('✅ Main icon file exists');
  } else {
    console.log('❌ Main icon file missing');
  }
  
  if (fs.existsSync(adaptiveIconPath)) {
    console.log('✅ Adaptive icon file exists');
  } else {
    console.log('❌ Adaptive icon file missing');
  }
}

// Main execution
function main() {
  analyzeCurrentIcon();
  checkAppConfiguration();
  createIconOptimizationGuide();
  createOptimizationScript();
  
  console.log('\n✅ Icon analysis complete!');
  console.log('📖 Check scripts/ICON_OPTIMIZATION_GUIDE.md for optimization steps');
  console.log('🎯 Your icon is already configured in app.json');
  console.log('💡 Optimize icon.png to reduce bundle size by ~0.6MB');
}

if (require.main === module) {
  main();
}

module.exports = { analyzeCurrentIcon, checkAppConfiguration }; 