#!/bin/bash
set -e
cd "$(dirname "$0")/../services/api"
echo "Starting HAMSAFAR local API on http://127.0.0.1:8080"
exec npx --yes tsx src/server.ts
