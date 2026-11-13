#!/usr/bin/env fish
# VAQTARA — local Android release APK build for CachyOS/Arch (Fish shell).
# Prereqs (run once, needs sudo):  sudo pacman -S --needed jdk17-openjdk nodejs-lts-jod npm unzip zip curl
# Usage:  fish scripts/build-vaqtara-android.fish
# Optional env:  EXPO_PUBLIC_API_BASE_URL=https://api.example.com/api/v1   ARCHS=arm64-v8a,armeabi-v7a,x86_64

set -l ROOT (path resolve (dirname (status filename))/..)
set -l ARCHS_VAL arm64-v8a,armeabi-v7a
set -q ARCHS; and set ARCHS_VAL $ARCHS

set -gx JAVA_HOME /usr/lib/jvm/java-17-openjdk
set -gx ANDROID_HOME $HOME/Android/Sdk
set -gx ANDROID_SDK_ROOT $ANDROID_HOME
set -gx PATH $JAVA_HOME/bin $ANDROID_HOME/cmdline-tools/latest/bin $ANDROID_HOME/platform-tools $PATH
mkdir -p $ROOT/release
set -gx CI 1
set -gx EXPO_NO_TELEMETRY 1

echo "== 1/7 checking JDK 17"
test -x $JAVA_HOME/bin/java; or begin; echo "JDK 17 missing: sudo pacman -S --needed jdk17-openjdk"; exit 1; end
java -version

echo "== 2/7 checking Node"
node -v; or begin; echo "Node missing: sudo pacman -S --needed nodejs-lts-jod npm"; exit 1; end

echo "== 3/7 Android command-line tools"
if not test -x $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager
    mkdir -p $ANDROID_HOME/cmdline-tools
    curl -fL -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip; or exit 1
    unzip -q -o /tmp/cmdline-tools.zip -d $ANDROID_HOME/cmdline-tools; or exit 1
    rm -rf $ANDROID_HOME/cmdline-tools/latest
    mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest; or exit 1
end
sdkmanager --version; or exit 1

echo "== 4/7 SDK packages + licenses"
yes | sdkmanager --licenses >/dev/null 2>&1
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0" "ndk;26.1.10909125"; or exit 1

echo "== 5/7 JS dependencies"
cd $ROOT/mobile; or exit 1
npm install --no-audit --no-fund; or exit 1

echo "== 6/7 generate native project + Gradle release build"
npx expo prebuild -p android --clean --no-install; or exit 1
cd android; or exit 1
chmod +x gradlew
./gradlew assembleRelease -PreactNativeArchitectures=$ARCHS_VAL --no-daemon 2>&1 | tee $ROOT/release/gradle-build.log
test $pipestatus[1] -eq 0; or begin; echo "Gradle build FAILED, see release/gradle-build.log"; exit 1; end

echo "== 7/7 collect + verify"
set -l SRC $ROOT/mobile/android/app/build/outputs/apk/release/app-release.apk
test -s $SRC; or begin; echo "APK not found at $SRC"; exit 1; end
mkdir -p $ROOT/release
cp $SRC $ROOT/release/VAQTARA.apk
cd $ROOT/release
sha256sum VAQTARA.apk | tee VAQTARA.apk.sha256
ls -l VAQTARA.apk
set -l BT $ANDROID_HOME/build-tools/35.0.0
$BT/aapt2 dump badging VAQTARA.apk | grep -E "^package:|application-label|launchable-activity"
$BT/apksigner verify --verbose VAQTARA.apk | head -5
echo "DONE: $ROOT/release/VAQTARA.apk"
