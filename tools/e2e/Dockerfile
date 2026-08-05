# syntax=docker/dockerfile:1.7
#
# Runs the Playwright component suite in the same browser, operating system and font stack as CI,
# so that `expect.toHaveScreenshot` produces identical pixels on any developer machine.
#
# Build it through `yarn run e2e:docker` (tools/e2e/run.js), which derives PLAYWRIGHT_VERSION from
# package.json so the image tag cannot drift from the installed @playwright/test.
ARG PLAYWRIGHT_VERSION

# Digest-pinned deliberately. The suite compares with `threshold: 0`, which makes the base image
# part of the compiler: were Microsoft to re-push this tag over a newer apt snapshot, every
# committed screenshot would change with no commit to blame it on.
#
# Once a digest is present Docker resolves it and ignores the tag, so the tag is documentation and
# the browser-revision assertion below is what actually keeps the two honest. When bumping
# @playwright/test, bump this digest in the same pull request and regenerate the baselines there:
#
#   docker buildx imagetools inspect mcr.microsoft.com/playwright:v<version>-noble --format '{{.Manifest.Digest}}'
#
# noble is Ubuntu 24.04, matching the `ubuntu-latest` runner the current baselines came from.
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble@sha256:b27e719ecbfef153e13fd24e8341736733bf2658b229677eb21ff57ff5d7fb29

WORKDIR /app

# CI=true selects the same Playwright behavior as the runner: retries: 2, forbidOnly, and
# reuseExistingServer: false. It would also mean workers: '100%', which is wrong in a container —
# see the PLAYWRIGHT_WORKERS note in tools/e2e/docker-compose.yml.
#
# forbidOnly is the one that surprises people: `test.only` is rejected here rather than honoured, so
# a run is narrowed with a path and `-g`. Parity is worth more than the convenience — the whole
# point of this image is that a local run and the runner cannot disagree — but it is documented in
# docs/guides/06-testing.md rather than left to be discovered.
#
# TZ is belt-and-braces rather than a fix: the base image currently resolves to Etc/UTC, matching
# the runner, even though it is built with `ARG TZ=America/Los_Angeles`. Since it is the build
# argument and not the image that says otherwise, that agreement is incidental — and
# playwright.config.ts pins neither `locale` nor `timezoneId`, so the datepicker, timepicker and
# timezone screenshots would silently follow the base image if it ever changed. Stating it costs
# nothing. LANG and LC_ALL are already C.UTF-8 in the base image.
#
# HUSKY=0 because `prepare: husky` runs during `yarn install` and there is no .git in the context.
ENV CI=true \
    TZ=UTC \
    HUSKY=0 \
    YARN_ENABLE_TELEMETRY=0

# Body text is bundled woff2 (@fontsource/inter, @fontsource/jetbrains-mono), so system fonts only
# matter for glyphs Inter lacks — but the select and tree-select captions render the macOS modifier
# symbols ⌘ (U+2318) and ⌥ (U+2325). The base image covers neither in a Latin face, so fontconfig
# falls through to IPAGothic and they come out visibly different from the baselines. ubuntu-latest
# ships DejaVu, which is what the committed screenshots were rendered with; without this line six
# of them fail for reasons that have nothing to do with the components.
#
# The two fc-match calls are the assertion, not a demonstration: they are what stops this layer
# from being "cleaned up" later on the reasonable-sounding grounds that the fonts are bundled. A
# regression here is otherwise silent until six screenshots disagree for no visible reason.
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/* \
    && fc-cache -f \
    && for codepoint in 2318 2325; do \
        fc-match ":charset=$codepoint" family | grep -q '^DejaVu Sans$' \
            || { echo "U+$codepoint falls back to '$(fc-match ":charset=$codepoint" family)', expected DejaVu Sans." >&2; exit 1; }; \
    done

# The base image ships Node 22 from NodeSource. Every other CI job runs the .nvmrc version, so
# install that rather than accept a second Node major for this one job. Its own layer, ahead of the
# manifests, so that editing package.json does not reinstall Node.
# `n` keeps every version it fetches under /usr/local/n, which is 202 MB of no use once the binary
# is in place. Dropped in the same layer, so the bytes are never committed in the first place.
COPY .nvmrc ./
RUN set -eux; \
    node_version="$(tr -d '\r\n' < .nvmrc)"; \
    npm install --global n; \
    n "$node_version"; \
    npm remove --global n; \
    rm -rf /usr/local/n; \
    npm cache clean --force; \
    test "v$node_version" = "$(node --version)"; \
    node --version

COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn/releases/ .yarn/releases/

# The base image has Yarn 1 classic on PATH from its own `npm install -g yarn`. It cannot read a
# Berry lockfile, and playwright.config.ts's webServer command (`yarn run dev:e2e ...`) shells out
# to whatever `yarn` resolves to at test time — so replacing it is required, not a convenience.
#
# A shell script rather than a symlink: the executable bit on the committed .cjs is not guaranteed
# to survive a COPY from a Windows build context. The path is read out of .yarnrc.yml, so this
# cannot drift from `yarnPath`.
RUN set -eux; \
    yarn_path="$(sed -n 's/^yarnPath: *//p' .yarnrc.yml | tr -d '\r')"; \
    test -f "/app/$yarn_path"; \
    printf '#!/bin/sh\nexec node "/app/%s" "$@"\n' "$yarn_path" > /usr/local/bin/yarn; \
    chmod +x /usr/local/bin/yarn; \
    test "4" = "$(yarn --version | cut -d . -f 1)"; \
    yarn --version

# package.json's postinstall compiles these into node_modules/@koobiq/builders.
COPY tools/builders/ tools/builders/
COPY tools/e2e/assert-browsers.js tools/e2e/

# For whoever debugs a failure here: `xlsx` resolves to https://cdn.sheetjs.com/, not the npm
# registry, so this layer needs that host reachable as well as the registry.
#
# The cache is cleaned in the same layer rather than a later one: node_modules is already
# materialised by then (nodeLinker: node-modules), and Yarn's global cache is another 640 MB that
# would otherwise be committed and then paid for again on every image export and pull.
RUN yarn install --immutable && yarn cache clean --all

# Fails the build if the image's browsers are not the ones this @playwright/test expects, which is
# otherwise silent and surfaces much later as an unexplained diff in every screenshot.
RUN node tools/e2e/assert-browsers.js

COPY . .

CMD ["yarn", "run", "e2e:components"]
