#!/bin/bash

# Print commands for debugging
if [[ "$RUNNER_DEBUG" = "1" ]]; then
  set -x
fi

# Fail fast on errors, unset variables, and failures in piped commands
set -Eeuo pipefail

echo "::group:: Build CDK ..."
    yarn run build:cdk
echo '::endgroup::'

echo "::group:: Build Components ..."
    yarn run build:components
echo '::endgroup::'

echo "::group:: Luxon Adapter ..."
    yarn run build:angular-luxon-adapter
echo '::endgroup::'

echo "::group:: Moment Adapter ..."
    yarn run build:angular-moment-adapter
echo '::endgroup::'

echo "::group:: SCSS Styles ..."
    yarn run styles:built-all
echo '::endgroup::'

echo "::group:: CLI ..."
    yarn run build:cli
echo '::endgroup::'

echo "::group:: Schematics  ..."
    yarn run build:schematics
echo '::endgroup::'
