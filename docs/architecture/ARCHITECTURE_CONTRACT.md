# Architecture Contract

وضعیت: LOCKED برای Foundation  
نسخه: 0.1  
تاریخ: 2026-08-29

## تصمیم اصلی

معماری اولیه: **Modular Monolith**

دلیل:
- تیم و محصول هنوز در مرحله صفر هستند
- مرزها باید واضح باشند، نه سرویس‌های زیاد
- استخراج بعدی فقط بعد از اثبات بار واقعی مجاز است

## لایه‌های محصول

| لایه | هدف | اجازه Feature |
|------|------|----------------|
| Foundation Lock | کنترل، امنیت پایه، مشاهده، بکاپ | خیر |
| Governed Core | Capability + Token + Autonomy + Memory سبک | خیر |
| Usable Product Core | سفر، ناوبری، ایمنی جاده، اضطراری، آفلاین | بله |
| Expansion | هوش مقصد، Agent پیشرفته، 3D، رشد | فقط با شواهد |

## مرزهای ماژول

- Identity
- Travel
- Navigation
- Safety / Emergency
- Destination
- AI Governance
- Localization
- Observability

هیچ وابستگی دایره‌ای مجاز نیست.

## محدودیت‌ها

- Microservice از روز اول ممنوع است
- GPU تا زمان اثبات بار ممنوع است
- هیچ Agentی نباید خارج از Capability Registry عمل کند
- داده کهنه نباید به‌عنوان واقعیت فعلی نمایش داده شود

## دامنه و محیط

- Development: محلی
- Laboratory / Staging: `hamsafa.molido.shop`
- Production: بعد از عبور هسته از تست پایداری
