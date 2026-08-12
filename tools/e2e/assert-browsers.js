/**
 * Asserts that the browsers baked into the Playwright base image are the ones the installed
 * playwright-core expects. Run at image build time by tools/e2e/Dockerfile.
 *
 * The image ships its browsers under /ms-playwright, so `playwright install` never runs in the
 * container. That only holds while the image tag matches @playwright/test exactly — which is not
 * something the Dockerfile can guarantee on its own. `FROM` carries both a tag derived from
 * package.json and a digest, and a digest wins: bumping @playwright/test without bumping the digest
 * in the same commit changes the tag, resolves the same old image, and leaves the browsers behind.
 *
 * When the two disagree, nothing fails loudly: `playwright`'s postinstall quietly downloads a
 * second browser set, the tests run against a different build than CI, and the result is an
 * unexplained diff in every screenshot — the baselines are compared with `threshold: 0`, so a
 * different browser build invalidates all of them at once.
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

// Everything `playwright install` would fetch, rather than a hand-maintained list. Chromium is the
// obvious one, but it is not the only browser this suite uses: the scrollbar and sidepanel specs
// select WebKit with `test.use({ browserName: 'webkit' })`, which overrides the project's browser
// per file and is easy to miss when reading playwright.config.ts alone. Deriving the list means a
// spec that reaches for Firefox tomorrow is covered without anyone remembering to edit this file.
//
// The excluded entries are the ones the image legitimately lacks: tip-of-tree and beta channels,
// `android`, and `winldd` (Windows-only).
const required = browsers.filter((browser) => browser.installByDefault);
const missing = [];

if (required.length === 0) {
    console.error('No installByDefault browsers in playwright-core/browsers.json — the check cannot be trusted.');
    process.exit(1);
}

for (const { name, revision } of required) {
    // playwright-core stores revisions per browser name; on disk the directories use underscores.
    const directory = `/ms-playwright/${name.replace(/-/g, '_')}-${revision}`;

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
