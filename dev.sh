#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$ROOT_DIR/chatbot-mk-api"
CLIENT_DIR="$ROOT_DIR/chat-mk-studio"

API_PID=""
CLIENT_PID=""

cleanup() {
  echo ""
  echo "Shutting down..."
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null && echo "Stopped API (PID $API_PID)"
  [ -n "$CLIENT_PID" ] && kill "$CLIENT_PID" 2>/dev/null && echo "Stopped Client (PID $CLIENT_PID)"
  wait 2>/dev/null
  echo "Done."
  exit 0
}

trap cleanup SIGINT SIGTERM

start_api() {
  echo "Starting API server..."
  cd "$API_DIR"
  npx tsx watch src/server.ts &
  API_PID=$!
  echo "API running (PID $API_PID) → http://localhost:3001"
}

start_client() {
  echo "Starting Client dev server..."
  cd "$CLIENT_DIR"
  npx vite --port 8080 &
  CLIENT_PID=$!
  echo "Client running (PID $CLIENT_PID) → http://localhost:8080"
}

restart_api() {
  echo "Restarting API..."
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null
  wait "$API_PID" 2>/dev/null
  start_api
}

restart_client() {
  echo "Restarting Client..."
  [ -n "$CLIENT_PID" ] && kill "$CLIENT_PID" 2>/dev/null
  wait "$CLIENT_PID" 2>/dev/null
  start_client
}

restart_all() {
  restart_api
  restart_client
}

show_help() {
  echo ""
  echo "Commands:  [a]pi restart  |  [c]lient restart  |  [r]estart all  |  [q]uit"
  echo ""
}

# ── Main ──

echo "═══════════════════════════════════════════"
echo "  ChatBot MK — Local Dev Environment"
echo "═══════════════════════════════════════════"
echo ""

# Check .env
if [ ! -f "$API_DIR/.env" ]; then
  echo "No .env found — copying from .env.example"
  cp "$API_DIR/.env.example" "$API_DIR/.env"
  echo "Edit chatbot-mk-api/.env with your config before connecting to MongoDB/OpenAI."
  echo ""
fi

start_api
start_client

echo ""
echo "═══════════════════════════════════════════"
echo "  API:    http://localhost:3001/api/health"
echo "  Client: http://localhost:8080"
echo "═══════════════════════════════════════════"
show_help

while true; do
  read -rsn1 key
  case "$key" in
    a|A) restart_api; show_help ;;
    c|C) restart_client; show_help ;;
    r|R) restart_all; show_help ;;
    q|Q) cleanup ;;
    "?"|h|H) show_help ;;
  esac
done
