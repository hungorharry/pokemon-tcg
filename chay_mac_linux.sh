#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
 echo 'Cần cài Node.js 20+ từ https://nodejs.org/'
 exit 1
fi
if [ ! -f .env ]; then cp .env.example .env; fi
printf '\nMở trình duyệt tại http://127.0.0.1:4173\n'
node server.js
