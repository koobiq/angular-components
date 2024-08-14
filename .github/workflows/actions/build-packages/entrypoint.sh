#!/bin/bash

# Print commands for debugging
if [[ "$RUNNER_DEBUG" = "1" ]]; then
  set -x
fi

# Fail fast on errors, unset variables, and failures in piped commands
set -Eeuo pipefail

echo "::group:: Build CDK ..."
    pnpm run build:cdk
echo '::endgroup::'

echo "::group:: Build Components ..."
    pnpm run build:components
echo '::endgroup::'

echo "::group:: Luxon Adapter ..."
    pnpm run build:angular-luxon-adapter
echo '::endgroup::'

echo "::group:: Moment Adapter ..."
    pnpm run build:angular-moment-adapter
echo '::endgroup::'

echo "::group:: SCSS Styles ..."
    pnpm run styles:built-all
echo '::endgroup::'

echo "::group:: CLI ..."
    pnpm run build:cli
echo '::endgroup::'

echo "::group:: Schematics ..."
    pnpm run build:schematics
echo '::endgroup::'
