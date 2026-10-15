#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export npm_config_cache=/workspace/.npm-cache
npm ci
npm run build
