# HAMSAFAR application model

Two shells, one core.

- Core: static Pages in docs/ (HTML, localStorage, PIN vault, SW cache)
- Shell: apps/android WebView, applicationId shop.molido.hamsafar
- Editions: base / family / pro with 12-month seasonal multipliers
- Trust: device PIN vault != APK cert != update.json HTTPS
- Release: signed APK on GitHub Release, pointer in docs/update.json
- Not in model yet: payments, SMS SOS, multi-device live track, Play store

Preview: https://molidoai.github.io/Hamsafar-Ai/more.html
