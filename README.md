# MOLIDO HAMSAFAR

پلتفرم سفر هوشمند، چندزبانه، آفلاین‌محور و تحت حاکمیت AI.

> نه یک اپ سفر ساده.  
> یک Travel Operating Platform کنترل‌شده.

## وضعیت فعلی

- مخزن: [molidoai/Hamsafar-Ai](https://github.com/molidoai/Hamsafar-Ai)
- دامنه Staging: `hamsafa.molido.shop`
- لایه فعال: **Local Platform**
- وضعیت فاز 000 تا 003: `PASS`
- سرور ابری: فعلاً لازم نیست

## اجرای محلی

```bash
cd services/api
npx --yes tsx src/server.ts
```

سپس فایل `apps/web/index.html` را باز کنید. API روی `http://127.0.0.1:8080` است.

## معماری اجرایی قفل‌شده

1. Foundation Lock
2. Governed Core
3. Usable Product Core
4. Expansion Layer (فقط بعد از اثبات هسته)

## اصل کار

اول کنترل، امنیت، مشاهده‌پذیری و پشتیبان.  
بعد قابلیت محصول.

## ساختار

```text
docs/           قراردادها و تصمیمات
phases/         وضعیت و شواهد هر فاز
apps/           موبایل، وب، ادمین
services/       سرویس‌های دامنه
packages/       کد مشترک
infrastructure/ محیط‌ها و استقرار
tests/          تست‌ها
scripts/        ابزارهای عملیاتی
```

## قانون فاز

بدون PASS هیچ فاز بعدی شروع نمی‌شود.
