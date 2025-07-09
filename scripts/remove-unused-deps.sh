# Remove unused dependencies

npm uninstall react-native-pdf
npm uninstall expo-mlkit-ocr
npm uninstall react-native-webview
npm uninstall expo-media-library
npm uninstall expo-file-system

# Clean and rebuild
cd android
./gradlew clean
cd ..
cd android
./gradlew bundleRelease
