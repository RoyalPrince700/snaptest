# Dependency removal commands

# Remove PDF library (if not needed)
npm uninstall react-native-pdf

# Remove duplicate OCR library
npm uninstall react-native-mlkit-ocr

# Remove WebView (if not needed)
npm uninstall react-native-webview

# After removing dependencies:
cd android
./gradlew clean
cd ..
./gradlew bundleRelease
