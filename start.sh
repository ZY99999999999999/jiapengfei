#!/bin/bash
# 蒙古族纹样交互设计平台 - 一键启动脚本 (macOS / Linux)
cd "$(dirname "$0")"
PORT=8766

echo ""
echo "  ✨ 蒙古族纹样交互设计平台"
echo "  ─────────────────────────────────"

open_browser() {
  sleep 1
  if command -v open &>/dev/null; then open "http://localhost:$PORT"
  elif command -v xdg-open &>/dev/null; then xdg-open "http://localhost:$PORT"; fi
}

# 优先使用 Node.js（功能最完整）
if command -v node &>/dev/null; then
  open_browser &
  node server.js $PORT

# 其次使用 Python 3（macOS 自带）
elif command -v python3 &>/dev/null; then
  open_browser &
  python3 server.py $PORT

elif command -v python &>/dev/null; then
  open_browser &
  python server.py $PORT

# 兜底：直接用浏览器打开（file:// 协议，大部分功能可用）
else
  echo "  ⚠️  未检测到 Node.js 或 Python，直接用浏览器打开"
  echo "  （手势识别等高级功能可能受限）"
  if command -v open &>/dev/null; then open "$(pwd)/index.html"
  elif command -v xdg-open &>/dev/null; then xdg-open "$(pwd)/index.html"; fi
fi
