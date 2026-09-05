# APK signing — HAMSAFAR

Do not commit keystore, passwords, or `*.jks` / `*.keystore`.

## Identity
- applicationId: `shop.molido.hamsafar`
- versionName: `0.3.1`
- versionCode: start at `31` and only increase
- minSdk: `24` (Android 7, v2-capable)

## Schemes
- v2: required (whole-file integrity)
- v3: required (future key rotation)
- v1: off when minSdk >= 24
- v4: optional later (`.apk.idsig`)

## After Android Studio is installed
```text
keytool -genkeypair -keystore hamsafar-release.jks -alias hamsafar -keyalg EC -keysize 256 -validity 10000
./gradlew assembleRelease
apksigner sign --ks hamsafar-release.jks --ks-key-alias hamsafar app-release-unsigned.apk
apksigner verify --verbose --print-certs app-release.apk
```
Expect `Verified using v2 scheme` and `Verified using v3 scheme`.

Web preview until then: https://molidoai.github.io/Hamsafar-Ai/more.html
