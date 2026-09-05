# APK version policy

- versionCode: integer, only increases. Current preview: 31.
- versionName: display string. Current: 0.3.1.
- First signed installable APK: jump to versionName 0.4.0 and versionCode 40.
- Keep Gradle, UpdateGate.LOCAL_CODE, and update.json versionCode in lockstep after a ship.
- Same applicationId and same signing cert for upgrades.
- Pages/sw.js cache is a separate channel from APK versionCode.
