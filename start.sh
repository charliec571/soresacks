#!/bin/bash
# Find node/npm in PATH or NVM
if [ -d "$HOME/.nvm/versions/node" ]; then
  LATEST_NODE=$(ls -d $HOME/.nvm/versions/node/* 2>/dev/null | tail -n 1)
  if [ -n "$LATEST_NODE" ]; then
    export PATH="$LATEST_NODE/bin:$PATH"
  fi
fi

cd "$(dirname "$0")"

echo "=================================================="
echo "  ⛳️ SORE SACKS & SIX PACKS DISC GOLF WEBAPP"
echo "  9-Hole Private Layout • 3 Axiom Baskets • Par 28"
echo "=================================================="
echo ""
echo "Starting local dev server..."
npx vite --host --port 5173
