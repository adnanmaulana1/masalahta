#!/bin/bash
set -e
ROOT=$(cd "$(dirname "$0")" && pwd)

echo "🚀 Starting Fastwork (Go + sqlite3 + React)"

# backend
cd $ROOT/backend
if [ ! -f fastwork-server ]; then
  echo "Building backend..."
  go build -o fastwork-server ./cmd/server
fi
PORT=8080 ./fastwork-server > /tmp/fastwork-backend.log 2>&1 &
echo $! > /tmp/fastwork-backend.pid
echo "Backend PID $(cat /tmp/fastwork-backend.pid) on http://localhost:8080"

# frontend
cd $ROOT/frontend
if [ ! -d node_modules ]; then npm install; fi
npm run dev -- --host 0.0.0.0 --port 3000 > /tmp/fastwork-frontend.log 2>&1 &
echo $! > /tmp/fastwork-frontend.pid
echo "Frontend PID $(cat /tmp/fastwork-frontend.pid) on http://localhost:3000"

echo "Logs: tail -f /tmp/fastwork-backend.log /tmp/fastwork-frontend.log"
echo "Stop: kill $(cat /tmp/fastwork-backend.pid) $(cat /tmp/fastwork-frontend.pid)"
