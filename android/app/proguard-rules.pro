# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Keep essential React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep Supabase classes
-keep class io.supabase.** { *; }
-keep class com.google.gson.** { *; }

# Keep Expo classes
-keep class expo.** { *; }

# Aggressive optimization for size reduction
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Remove unused code
-dontwarn **
-ignorewarnings

# Add any project specific keep options here:

# Remove unused methods and fields
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}

# Remove debug information
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable,*Annotation*

# Remove unused string constants
-adaptclassstrings
-adaptresourcefilenames
-adaptresourcefilecontents

# Remove unused classes
-dontnote
-dontwarn

# Optimize for size
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Remove unused resources
-keep class **.R$* {
    public static <fields>;
}
