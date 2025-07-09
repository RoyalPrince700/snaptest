
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
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx expo run:android --variant release
```
