const fs = require('fs');
const path = require('path');

console.log('🔍 SnapTest Usage Analysis\n');

// Function to search for imports in all TypeScript/JavaScript files
function searchForImports() {
  const searchTerms = [
    'react-native-pdf',
    'react-native-mlkit-ocr', 
    'expo-mlkit-ocr',
    'react-native-webview',
    'expo-document-picker',
    'expo-media-library',
    'expo-file-system',
    'expo-image',
    'expo-image-picker'
  ];
  
  const results = {};
  
  searchTerms.forEach(term => {
    results[term] = { found: false, files: [], usage: '' };
  });
  
  // Search in app directory
  const appDir = path.join(__dirname, '../app');
  if (fs.existsSync(appDir)) {
    const files = fs.readdirSync(appDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    
    files.forEach(file => {
      const filePath = path.join(appDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      searchTerms.forEach(term => {
        if (content.includes(term)) {
          results[term].found = true;
          results[term].files.push(file);
          
          // Extract the import line
          const lines = content.split('\n');
          const importLine = lines.find(line => line.includes(term));
          if (importLine) {
            results[term].usage = importLine.trim();
          }
        }
      });
    });
  }
  
  return results;
}

// Function to analyze usage and provide recommendations
function analyzeUsage(results) {
  console.log('📊 Dependency Usage Analysis:\n');
  
  const usedDeps = [];
  const unusedDeps = [];
  
  Object.entries(results).forEach(([dep, info]) => {
    if (info.found) {
      usedDeps.push({ name: dep, ...info });
      console.log(`✅ ${dep}: USED in ${info.files.join(', ')}`);
      console.log(`   ${info.usage}`);
    } else {
      unusedDeps.push(dep);
      console.log(`❌ ${dep}: NOT USED (can be removed)`);
    }
    console.log('');
  });
  
  return { usedDeps, unusedDeps };
}

// Function to provide specific recommendations
function provideRecommendations(usedDeps, unusedDeps) {
  console.log('💡 Optimization Recommendations:\n');
  
  if (unusedDeps.length > 0) {
    console.log('1. 🗑️  Remove Unused Dependencies:');
    unusedDeps.forEach(dep => {
      console.log(`   - npm uninstall ${dep}`);
    });
    console.log('');
  }
  
  console.log('2. 🔄 Replace Heavy Dependencies:');
  
  // Check for specific heavy deps that can be replaced
  const heavyReplacements = [
    {
      current: 'react-native-mlkit-ocr',
      replacement: 'expo-mlkit-ocr',
      reason: 'You have both OCR libraries. Keep expo-mlkit-ocr and remove react-native-mlkit-ocr'
    }
  ];
  
  heavyReplacements.forEach(item => {
    if (usedDeps.find(d => d.name === item.current)) {
      console.log(`   - Replace ${item.current} with ${item.replacement}`);
      console.log(`     Reason: ${item.reason}`);
    }
  });
  
  console.log('\n3. 🎯 Specific Actions:');
  
  // Check if react-native-mlkit-ocr is used
  const mlkitOcr = usedDeps.find(d => d.name === 'react-native-mlkit-ocr');
  if (mlkitOcr) {
    console.log('   - You\'re using react-native-mlkit-ocr for image OCR');
    console.log('   - Consider switching to expo-mlkit-ocr (smaller, better maintained)');
    console.log('   - Or use a web-based OCR service to remove the dependency entirely');
  }
  
  // Check if expo-document-picker is used
  const documentPicker = usedDeps.find(d => d.name === 'expo-document-picker');
  if (documentPicker) {
    console.log('   - expo-document-picker is used for document selection');
    console.log('   - This is necessary for your app functionality');
  }
  
  // Check if expo-image-picker is used
  const imagePicker = usedDeps.find(d => d.name === 'expo-image-picker');
  if (imagePicker) {
    console.log('   - expo-image-picker is used for image selection');
    console.log('   - This is necessary for your app functionality');
  }
}

// Function to estimate size savings
function estimateSavings(unusedDeps) {
  const sizeMap = {
    'react-native-pdf': 4, // 4MB
    'react-native-mlkit-ocr': 2.5, // 2.5MB
    'react-native-webview': 0.75, // 0.75MB
    'expo-media-library': 0.5, // 0.5MB
    'expo-file-system': 0.5, // 0.5MB
  };
  
  let totalSavings = 0;
  unusedDeps.forEach(dep => {
    if (sizeMap[dep]) {
      totalSavings += sizeMap[dep];
    }
  });
  
  return totalSavings;
}

// Function to create removal script
function createRemovalScript(unusedDeps) {
  if (unusedDeps.length === 0) {
    console.log('📝 No unused dependencies to remove!');
    return;
  }
  
  let script = '# Remove unused dependencies\n\n';
  
  unusedDeps.forEach(dep => {
    script += `npm uninstall ${dep}\n`;
  });
  
  script += '\n# Clean and rebuild\n';
  script += 'cd android\n';
  script += './gradlew clean\n';
  script += 'cd ..\n';
  script += 'cd android\n';
  script += './gradlew bundleRelease\n';
  
  fs.writeFileSync(path.join(__dirname, 'remove-unused-deps.sh'), script);
  console.log('📝 Created removal script: scripts/remove-unused-deps.sh');
}

// Main execution
function main() {
  const results = searchForImports();
  const { usedDeps, unusedDeps } = analyzeUsage(results);
  provideRecommendations(usedDeps, unusedDeps);
  
  const savings = estimateSavings(unusedDeps);
  
  console.log('📊 Summary:');
  console.log(`📱 Current bundle: ~68MB`);
  console.log(`✅ Used dependencies: ${usedDeps.length}`);
  console.log(`❌ Unused dependencies: ${unusedDeps.length}`);
  console.log(`📉 Potential savings: ~${savings.toFixed(1)}MB`);
  console.log(`🎯 Target size: ~${(68 - savings).toFixed(1)}MB`);
  
  createRemovalScript(unusedDeps);
  
  console.log('\n✅ Analysis complete!');
  if (unusedDeps.length > 0) {
    console.log('💡 Run the removal script to reduce bundle size');
  } else {
    console.log('💡 All dependencies are being used. Consider replacing heavy ones with lighter alternatives.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { searchForImports, analyzeUsage }; 