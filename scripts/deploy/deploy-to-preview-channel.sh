#!/usr/bin/env bash

set -o pipefail

FIREBASE_DEPLOY_RESPONSE=$(npx firebase hosting:channel:deploy sha-$CI_COMMIT_SHORT_SHA \
    --only next \
    --expires 5d \
    --token=${FIREBASE_DEPLOY_TOKEN} --json)
