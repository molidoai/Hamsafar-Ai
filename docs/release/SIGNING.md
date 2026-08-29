# امضای انتشار

کلید واقعی هیچ‌وقت داخل Git نمی‌رود.

## اندروید

1. یک keystore فقط روی سیستم خودتان بسازید:

```bash
keytool -genkey -v -keystore hamsafar-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias hamsafar
```

2. فایل `apps/mobile/android-signing/key.properties.example` را کپی کنید به `key.properties`.
3. مسیر keystore و رمز را فقط محلی پر کنید.
4. APK/AAB امضاشده را در GitHub Releases بگذارید.
5. SHA256 فایل امضاشده را در `infrastructure/updates/manifest.json` ثبت کنید.

## قانون

- `*.jks` و `key.properties` در gitignore هستند
- اپ فقط فایلی را به‌روزرسانی می‌کند که checksum و امضای مانیفست معتبر باشد
