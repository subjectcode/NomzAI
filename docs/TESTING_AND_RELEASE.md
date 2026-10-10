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

### Compatibility Resolution
The build configuration in `frontend/android/gradle.properties` has been updated to:
```properties
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86_64
```
This builds a universal standalone production release APK packaging:
- `lib/arm64-v8a/`: All modern 64-bit ARM Android physical phones (Android 8.0 - 15+).
- `lib/armeabi-v7a/`: 32-bit ARM legacy smartphones.
- `lib/x86_64/`: 64-bit Android emulators for development and testing.

### Specifications
- **Package Name**: `com.nomz.app`
- **Version Name**: `1.0.0`
- **Version Code**: `1`
- **Min SDK Version**: `24` (Android 7.0 Nougat) — covers 99.5%+ of active global Android devices.
- **Target SDK Version**: `36` (Android 16 API)
- **Signing Keystore**: Signed with official Nomz release key (`~/.android/nomz-release.keystore`).

---

## 3. How to Build the Release APK Locally

1. Navigate to the Android project root:
   ```bash
   cd frontend/android
   ```
2. Build the release APK:
   ```bash
   ./gradlew assembleRelease --no-daemon
   ```
3. The standalone APK is output to:
   ```
   frontend/android/app/build/outputs/apk/release/app-release.apk
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
  Get-FileHash Nomz-v1.0.0-android.apk -Algorithm SHA256
  ```
- **macOS / Linux**:
  ```bash
  sha256sum Nomz-v1.0.0-android.apk
  ```

### C. Sideload Installation on Physical Phone
1. Transfer the `.apk` file to your Android phone via USB, Google Drive, or browser download.
2. Open your phone's File Manager and tap `Nomz-v1.0.0-android.apk`.
3. If prompted, enable "Install unknown apps" for your browser or file manager.
4. Tap **Install** and launch Nomz directly without requiring Metro or Expo Go.

### D. Installation via ADB
If connecting a phone or emulator via USB debugging:
```bash
adb install -r Nomz-v1.0.0-android.apk
```

---

## 5. Testing Environments & Device Matrix

| Device Profile | Architecture | OS Version | Environment | Result |
| :--- | :--- | :--- | :--- | :--- |
| Pixel 10 (Automated QA) | `x86_64` | Android 15 (API 35) | Emulator (`emulator-5554`) | PASS (Smoke, Nav, Auth, Vision) |
| Modern Physical Phone | `arm64-v8a` | Android 12 - 15 | Physical Device | Supported via `lib/arm64-v8a` |
| Older / Budget Phone | `armeabi-v7a` | Android 7.0 - 11 | Physical Device | Supported via `lib/armeabi-v7a` |
