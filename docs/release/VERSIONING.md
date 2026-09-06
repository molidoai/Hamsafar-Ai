# APK versions

- versionName: human label, now 0.3.2
- versionCode: integer only goes up. 31 first debug, 32 current UpdateGate LOCAL_CODE
- Channel tag `debug-apk` is overwritten each successful Actions build
- Stable later: tag `v0.3.x` and do not overwrite
- update.json / update-32.json versionCode must match the APK on the apk URL
- hasNewer = remote.versionCode > LOCAL_CODE AND apk URL present
- Debug and Play-signed are different certs; do not mix on one device without uninstall
