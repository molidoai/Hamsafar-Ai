# Usable Product Core

نسخه: 0.1  
وضعیت: IMPLEMENTED

## دامنه

- Travel Engine: ساخت و ویرایش سفر چندتوقفی
- Navigation: مسیریابی با fallback آفلاین
- Road Safety: هشدار سرعت بدون ادعای قطعیت روی داده نامعتبر
- Emergency: SOS و مخاطب مطمئن
- Offline Sync: صف همگام‌سازی

## اتصال به حاکمیت

قابلیت‌ها باید از Capability Registry عبور کنند:

- trip.create
- nav.route
- safety.speed_alert
- emergency.sos
- offline.sync
