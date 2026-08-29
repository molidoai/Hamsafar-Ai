# Environments

| محیط | دامنه / محل | نقش |
|------|-------------|-----|
| Development | لوکال | توسعه |
| Laboratory / Staging | hamsafa.molido.shop | آزمایش کنترل‌شده |
| Production | بعداً تعیین می‌شود | انتشار عمومی |

## زیرساخت پیشنهادی Staging

- ارائه‌دهنده: Hetzner Cloud
- موقعیت: آلمان یا فنلاند
- شروع: 4–8 GB RAM
- OS: Ubuntu 24.04 LTS
- اجزا: Caddy/Nginx + Docker + Postgres + Redis
