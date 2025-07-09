
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
