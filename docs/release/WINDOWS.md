# اجرا روی ویندوز

`bash` لازم نیست. Node.js لازم است: https://nodejs.org

در CMD عادی نه Administrator:

```bat
cd %USERPROFILE%\Desktop
git clone https://github.com/molidoai/Hamsafar-Ai.git
cd Hamsafar-Ai
cd services\api
npx --yes tsx src/server.ts
```

بعد در همان کامپیوتر: http://127.0.0.1:8080
