# 🚨 Play Store Deployment Bottlenecks
> AI System Design Interview Simulator — React Native (Expo)
> Last Updated: June 2026

This document outlines all potential third-party packages, features, permissions, and architectural decisions that could cause **rejection, delays, or policy violations** when publishing to the Google Play Store.

---

## 🔴 High Risk — Fix Before Submission

### 1. `expo-speech-recognition`
- **Risk:** Requires `RECORD_AUDIO` permission — one of Play Store's most scrutinized permissions
- **Policy:** Google requires a clear, prominent disclosure explaining exactly why the app records audio
- **Action Required:**
  - Add a permission rationale dialog before requesting mic access
  - Update `app.json` with explicit permission description:
    ```json
    "android": {
      "permissions": ["RECORD_AUDIO"],
      "requestLegacyExternalStorage": false
    }
    ```
  - Add a Privacy Policy URL in Play Console (mandatory for mic access)

### 2. JWT Token Storage
- **Risk:** If JWT is stored in `AsyncStorage`, it's unencrypted on-device
- **Policy:** Play Store's Data Safety section requires you to declare all data stored locally
- **Action Required:**
  - Migrate to `expo-secure-store` for token storage
  - Declare "Authentication data" in Play Console Data Safety form

### 3. Data Safety Form (Mandatory)
- **Risk:** Missing or incomplete Data Safety declaration = **automatic rejection**
- **What you collect that must be declared:**
  - Email address (registration)
  - Audio data (speech recognition)
  - App activity (interview sessions, messages)
  - Authentication tokens
- **Action Required:** Fill out every field in Play Console → Data Safety section honestly

---

## 🟡 Medium Risk — Address Before or Shortly After Launch

### 4. `react-native-keyboard-controller`
- **Risk:** Already causing **260-character path length build failures** on Windows
- **C++ native module** — adds significant APK size and build complexity
- **Action Required:**
  - Verify it builds cleanly in CI/CD (Linux-based build servers won't have Windows path issues)
  - Consider replacing with `KeyboardAvoidingView` (built into React Native) if usage is minimal

### 5. `react-native-reanimated` + `react-native-worklets`
- **Risk:** Both are C++ native modules — significantly increase APK size
- **Play Store:** APK over 100MB requires using Android App Bundle (AAB) format
- **Action Required:**
  - Always build with `eas build` producing `.aab` not `.apk` for Play Store submission
  - Enable Hermes engine (already default in Expo) to reduce JS bundle size

### 6. `react-native-gesture-handler`
- **Risk:** Low risk on its own, but combined with reanimated and worklets, total native code size grows
- **Action Required:** No action needed, just monitor total APK/AAB size

### 7. Google Gemini API Key Exposure
- **Risk:** If `GEMINI_API_KEY` or any secret is hardcoded or bundled in the JS bundle, it can be extracted
- **Action Required:**
  - All API calls to Gemini must go through your **backend only** — never call Gemini directly from the app
  - Verify `API_URL` in `.env` points to your backend, not directly to Google's API
  - Never put secret keys in `app.json` or `app.config.js`

### 8. `expo-speech-recognition` — Exact Speech Content
- **Risk:** If speech content (interview answers) is sent to your backend, you must disclose this
- **Play Store Policy:** Audio data transmission requires explicit disclosure in Data Safety
- **Action Required:** Disclose in Data Safety that voice input is processed server-side

---

## 🟢 Low Risk — Monitor & Good Practices

### 9. Target SDK Version
- **Current:** `targetSdk: 36` ✅
- Play Store requires `targetSdk >= 34` for new apps in 2024+ — you're ahead of this

### 10. `minSdk: 24` (Android 7.0)
- **Status:** ✅ Fine — covers 95%+ of active Android devices
- No action needed

### 11. App Permissions Audit
- Ensure only permissions you **actually use** are declared
- Remove any auto-linked permissions from unused packages
- Check `android/app/src/main/AndroidManifest.xml` after prebuild:
  ```xml
  <!-- Remove if not used -->
  <uses-permission android:name="android.permission.CAMERA"/>
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
  ```

### 12. `expo-linking` — Deep Links
- **Risk:** If you use deep links, they must be verified via Digital Asset Links
- **Action Required:** Only needed if you implement OAuth or deep link flows

### 13. Network Security
- All API calls must use **HTTPS** — HTTP calls are blocked by Android 9+ by default
- Verify your `API_URL` in production uses `https://`

---

## 📋 Pre-Submission Checklist

```
[ ] Privacy Policy URL added in Play Console
[ ] Data Safety form fully completed
[ ] RECORD_AUDIO permission rationale dialog implemented
[ ] JWT stored in expo-secure-store (not AsyncStorage)
[ ] No API keys in frontend code or app.json
[ ] App built as .aab (not .apk) via eas build
[ ] All network calls use HTTPS
[ ] AndroidManifest.xml reviewed for unused permissions
[ ] App tested on physical device with clean install
[ ] App icon and screenshots meet Play Store specs
[ ] Content rating questionnaire completed in Play Console
```

---

## 🛠 Recommended Build Command for Play Store

Never use `expo run:android` for production. Use:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for Play Store (produces .aab)
eas build --platform android --profile production
```

---

## 📦 APK Size Estimate

| Package | Approximate Size Contribution |
|---|---|
| react-native-reanimated | ~2.5MB |
| react-native-worklets | ~1MB |
| react-native-gesture-handler | ~1MB |
| react-native-keyboard-controller | ~0.5MB |
| expo-speech-recognition | ~0.5MB |
| JS Bundle (Hermes) | ~3-5MB |
| **Estimated Total AAB** | **~15-25MB** ✅ |

Well within Play Store limits. No immediate concern.

---

## 🔗 Key Play Store Policy Links

- [Data Safety Requirements](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Sensitive Permissions Policy](https://support.google.com/googleplay/android-developer/answer/9888170)
- [Target API Level Requirements](https://support.google.com/googleplay/android-developer/answer/11926878)
- [App Bundle Requirements](https://support.google.com/googleplay/android-developer/answer/9844564)
