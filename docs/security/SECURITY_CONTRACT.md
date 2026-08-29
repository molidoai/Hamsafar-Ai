# Security Contract

وضعیت: LOCKED برای Foundation  
نسخه: 0.1

## اصل

Zero Trust.

هیچ اعتماد به کلاینت برای Authorization وجود ندارد.

## الزامات هویت

- ثبت‌نام و ورود امن
- Session + Refresh Token Rotation
- مدیریت دستگاه
- RBAC ساده در هسته
- Rate Limiting
- Audit برای اقدامات حساس

## الزامات داده

- حداقل داده لازم ذخیره شود
- Secrets داخل مخزن نرود
- موقعیت کاربر بدون رضایت صریح جمع نشود
- لاگ‌های حساس حداقل و محافظت‌شده باشند

## ممنوع

- Privilege Escalation توسط Agent
- دور زدن Capability Registry
- ادعای Approval ساختگی
- غیرفعال کردن Kill Switch توسط خود Agent
