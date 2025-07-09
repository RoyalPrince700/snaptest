
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
