#!/usr/bin/env sh
# Conveniencia: lanza Commitizen dentro de `web/`
cd "$(dirname "$0")/.." || exit 1
cd web || exit 1
pnpm run commit
