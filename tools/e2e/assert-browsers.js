/**
 * Asserts that the browsers baked into the Playwright base image are the ones the installed
 * playwright-core expects. Run at image build time by tools/e2e/Dockerfile.
 *
 * The image ships its browsers under /ms-playwright, so `playwright install` never runs in the
 * container. That only holds while the image tag matches @playwright/test exactly. When it does
 * not, nothing fails loudly: `playwright`'s postinstall quietly downloads a second browser set,
 * the tests run against a different Chromium than CI, and the result is an unexplained diff in
 * every screenshot — the baselines are compared with `threshold: 0`, so a different browser build
 * invalidates all of them at once.
 *
 * This check turns all of that into one build failure with an actionable message.
 */

const { existsSync, readFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

// playwright-core does not list browsers.json in its "exports" map, so requiring it by subpath
// throws ERR_PACKAGE_PATH_NOT_EXPORTED. package.json is exported; resolve that and read the file
// next to it, which stays correct wherever the package is installed.
const { browsers } = JSON.parse(
    readFileSync(join(dirname(require.resolve('playwright-core/package.json')), 'browsers.json'), 'utf8')
);

// Both matter: Playwright launches chromium-headless-shell whenever `headless` is set, which is
// the default, but the full chromium build is what a headed debugging run would use.
const required = ['chromium', 'chromium-headless-shell'];
const missing = [];

for (const name of required) {
    const browser = browsers.find((candidate) => candidate.name === name);

    if (!browser) {
        missing.push(`${name} (absent from playwright-core/browsers.json)`);
        continue;
    }

    // playwright-core stores revisions per browser name; on disk the directories use underscores.
    const directory = `/ms-playwright/${name.replace(/-/g, '_')}-${browser.revision}`;

    if (existsSync(directory)) {
        console.log(`ok ${directory}`);
    } else {
        missing.push(directory);
    }
}

if (missing.length > 0) {
    console.error(
        [
            'The base image does not ship the browsers this @playwright/test expects.',
            `Missing: ${missing.join(', ')}`,
            '',
            'The pinned digest in tools/e2e/Dockerfile is stale relative to the @playwright/test',
            'version in package.json. Refresh it with:',
            '',
            '  docker buildx imagetools inspect mcr.microsoft.com/playwright:v<version>-noble \\',
            "    --format '{{.Manifest.Digest}}'",
            '',
            'and regenerate the screenshot baselines in the same pull request.'
        ].join('\n')
    );

    process.exit(1);
}
