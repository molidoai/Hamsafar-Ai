@echo off
cd /d "%~dp0..\services\api"
echo Starting HAMSAFAR on http://127.0.0.1:8080
npx --yes tsx src/server.ts
