# Nomz — Testing, Quality Assurance & Release Guide

## 1. Test Suites & Verification

### A. Backend Pytest Test Suite
Nomz backend maintains a comprehensive suite of unit, integration, and scenario tests covering auth, database isolation, cooking steps, OTP handling, Langflow orchestration, and error resilience.

- **Command**:
  ```bash
  pytest -v tests/
  ```
- **Verified Result**: `78 passed, 0 failures` (100% PASS).
- **Scope**:
  - `test_auth.py`: Password hashing, JWT token lifecycle, Google Sign-In JWKS verification.
  - `test_database_isolation.py`: Multitenant data boundary checks preventing cross-account data leaks.
  - `test_cooking_steps.py`: Step timer validation, instruction parsing, step status updates.
  - `test_otp.py`: 6-digit numeric OTP generation, expiry windows, Composio delivery mock.
  - `test_v2_scenarios.py`: Langflow V2 recipe ranking, pantry matching, and multi-tier fallbacks.
  - `test_backend_cooking_hardening.py`: Boundary conditions and edge case inputs.

### B. Frontend TypeScript Type Safety
- **Command**:
  ```bash
  cd frontend
  npx tsc --noEmit
  ```
- **Verified Result**: `0 errors`. Full strict TypeScript coverage across all screens, navigation components, and context hooks.

### C. Live Backend Health & Connectivity
- **Production Endpoint**:
  ```bash
  curl -s https://nomz-backend-production.up.railway.app/api/health
  ```
- **Expected Response**: `{"status": "healthy", "database": "connected"}`.

---

## 2. Release APK Architecture & Compatibility

### Root Cause of Previous Physical Installation Failure
Previous release APKs explicitly configured `reactNativeArchitectures=x86_64` inside Gradle properties for local emulator testing. As a result, the packaged APK contained only `lib/x86_64/` binaries and zero ARM native binaries. When downloaded to real physical Android smartphones (which run 64-bit or 32-bit ARM processors), the Android Package Manager immediately rejected the installation with `INSTALL_FAILED_NO_MATCHING_ABIS`.

### Root Cause of 75.5 MB APK Size & Optimization
When multi-ABI support (`armeabi-v7a,arm64-v8a,x86_64`) was initially enabled, the resulting universal APK ballooned to 75.52 MB (75,521,782 bytes). Detailed APK analysis revealed:
1. Native libraries (`.so`) were stored uncompressed in the APK due to default `expo.useLegacyPackaging=false` (totaling 53.71 MB across all 3 architectures).
2. By setting `expo.useLegacyPackaging=true` in `frontend/android/gradle.properties`, Gradle packages compressed `.so` files into the APK archive, shrinking native libraries from 53.71 MB to 21.70 MB.
3. Universal APK size was reduced from **75.52 MB** to **38.89 MB** (**46.0% reduction**), while maintaining full backwards compatibility across all architectures.
4. Dedicated single-architecture APKs were also built, reducing the 64-bit ARM APK to **25.05 MB** (**65.2% reduction**).

### Specifications & Checksums (v1.0.0)

| Artifact | Purpose | ABIs | Size | SHA-256 Checksum |
| :--- | :--- | :--- | :--- | :--- |
| **`Nomz-v1.0.0-android-universal.apk`** | **Recommended (Universal)** | `arm64-v8a`, `armeabi-v7a`, `x86_64` | **38.89 MB** (40,783,794 B) | `2e892663d8a120273232b30d49a6d6655deea817eb7b51cf31142173ef4a470d` |
| **`Nomz-v1.0.0-android-arm64.apk`** | Modern 64-bit phones | `arm64-v8a` | **25.05 MB** (26,265,678 B) | `8a8b7d7af4d0008555abbc962fed5a51a73fcfebaa4f17bde2f369d755bea761` |
| **`Nomz-v1.0.0-android-arm32.apk`** | Budget 32-bit phones | `armeabi-v7a` | **24.10 MB** (25,271,718 B) | `f88436eaea804381252f0ec1080b79fe845dfe7fe6bd61013c5e358703f46180` |
| **`Nomz-v1.0.0-android.aab`** | Google Play Store Bundle | `arm64-v8a`, `armeabi-v7a`, `x86_64` | **49.00 MB** (51,378,449 B) | `cb5cf26ec2b605a67497d02342fa531572426cbedd0343a22b0e08e54da0d83f` |

- **Package Name**: `com.nomz.app`
- **Version Name**: `1.0.0`
- **Version Code**: `1`
- **Min SDK Version**: `24` (Android 7.0 Nougat) — covers 99.5%+ of active global Android devices.
- **Target SDK Version**: `36` (Android 16 API)
- **Signing Keystore**: Signed with official Nomz release key (`~/.android/nomz-release.keystore`).
- **Signer DN**: `CN=Nomz App, OU=Nomz, O=NomzAI, L=Jakarta, ST=DKI Jakarta, C=ID`
- **Certificate SHA-256**: `6c82dc39869fbf39ae591b6d64c21f0a141807b45c6d49413d97cdd102162b34`

---

## 3. How to Build Release Artifacts Locally

1. Navigate to the Android project root:
   ```bash
   cd frontend/android
   ```
2. Build the optimized universal APK (multi-ABI):
   ```bash
   ./gradlew assembleRelease --no-daemon
   ```
3. Build architecture-specific APKs:
   ```bash
   # Dedicated 64-bit ARM APK
   ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a --no-daemon

   # Dedicated 32-bit ARM APK
   ./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a --no-daemon
   ```
4. Build Google Play Store Bundle (AAB):
   ```bash
   ./gradlew bundleRelease --no-daemon
   ```

---

## 4. How to Install and Verify the APK

### A. Download the Official Release
Download the verified APK from the official GitHub Release:
```
https://github.com/subjectcode/NomzAI/releases/tag/v1.0.0
```

### B. Verify SHA-256 Checksum
Verify the integrity of the downloaded file prior to installation:
- **Windows (PowerShell)**:
  ```powershell
  Get-FileHash Nomz-v1.0.0-android-universal.apk -Algorithm SHA256
  ```
- **macOS / Linux**:
  ```bash
  sha256sum Nomz-v1.0.0-android-universal.apk
  ```

### C. Sideload Installation on Physical Phone
1. Transfer `Nomz-v1.0.0-android-universal.apk` (or architecture-specific APK) to your Android phone via USB, Google Drive, or browser download.
2. Open your phone's File Manager and tap the downloaded `.apk` file.
3. If prompted, enable "Install unknown apps" for your browser or file manager.
4. Tap **Install** and launch Nomz directly without requiring Metro or Expo Go.

### D. Installation via ADB
If connecting a phone or emulator via USB debugging:
```bash
adb install -r Nomz-v1.0.0-android-universal.apk
```

---

## 5. Testing Environments & Device Matrix

| Device Profile | Architecture | OS Version | Environment | Result |
| :--- | :--- | :--- | :--- | :--- |
| Pixel 10 (Automated QA) | `x86_64` | Android 15 (API 35) | Emulator (`emulator-5554`) | **PASS** (Smoke, Nav, Auth, Vision) |
| Modern Physical Phone | `arm64-v8a` | Android 12 - 15 | Physical Device | Supported via `lib/arm64-v8a` |
| Older / Budget Phone | `armeabi-v7a` | Android 7.0 - 11 | Physical Device | Supported via `lib/armeabi-v7a` |
