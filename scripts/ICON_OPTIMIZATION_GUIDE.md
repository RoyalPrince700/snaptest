
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
