#!/usr/bin/env bash
# Starts the docs-next dev server from a git worktree, which has no installed dependencies or built libraries of its own:
# they are linked from the main checkout. Usage: tools/worktree-dev.sh [port]
set -euo pipefail

cd "$(dirname "$0")/.."

port="${1:-4325}"
main="$(git worktree list --porcelain | awk 'NR == 1 { print $2 }')"

if [ "$PWD" != "$main" ]; then
    [ -e node_modules ] || ln -s "$main/node_modules" node_modules
    mkdir -p dist

    for entry in "$main"/dist/*; do
        ln -sfn "$entry" "dist/$(basename "$entry")"
    done
fi

yarn run docs-next:content
exec npx ng serve koobiq-docs-next --port "$port"
