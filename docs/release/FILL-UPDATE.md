# Fill update.json after first signed APK

Run on the machine that built the APK. Do not commit the keystore.

```text
sha256sum app-release.apk
apksigner verify --print-certs app-release.apk
```

Copy:
- apk = public URL of the file (GitHub Release, not Pages if file is large)
- apkSha256 = output of sha256sum
- certSha256 = SHA-256 digest of signing certificate from apksigner
- versionCode = must match Gradle and UpdateGate.LOCAL_CODE after you ship it

Until apk is a real URL, UpdateGate.hasNewer() stays false.
