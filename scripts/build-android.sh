#!/usr/bin/env bash
set -euo pipefail
# RAVENDORA Android build helper (requires JDK 17+ and Android SDK)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/tools/jdk-17.0.18+8}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/.local/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
cd "$ROOT_DIR/mobile"
echo "Using JAVA_HOME=$JAVA_HOME"
echo "Using ANDROID_HOME=$ANDROID_HOME"
npx expo prebuild -p android --non-interactive
cd android
./gradlew assembleDebug
APK=$(find app/build/outputs/apk/debug -name "*.apk" | head -1)
mkdir -p "$ROOT_DIR/release"
cp "$APK" "$ROOT_DIR/release/ravendora-debug.apk"
sha256sum "$ROOT_DIR/release/ravendora-debug.apk" > "$ROOT_DIR/release/ravendora-debug.apk.sha256"
echo "APK: $ROOT_DIR/release/ravendora-debug.apk"
