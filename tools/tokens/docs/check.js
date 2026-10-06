/**
 * Asserts that the committed design tokens docs data matches what the generator produces from the
 * installed @koobiq/design-tokens. Run by the Linters workflow.
 *
 * The data under apps/docs is generated but committed, and nothing in the docs build regenerates
 * it: `docs:build` compiles the app from whatever is in the working tree, so a stale file is
 * rendered on the site as if it were current. It goes stale on a @koobiq/design-tokens bump — which
 * arrives as a Dependabot pull request that cannot run a post-update command — and also on a change
 * to the generator itself, a local build of the tokens linked in, or a hand edit. Comparing the
 * package version would catch only the first of those, and not reliably: the same version can
 * resolve to different output after the formatters change.
 *
 * So the comparison is on content. The build runs into a throwaway directory rather than over the
 * working tree, which keeps the check side-effect free and lets it report every stale file at once.
 * Prettier ignores the generated directory (.prettierignore), so the bytes are comparable as they
 * are written.
 */

const { readdirSync, readFileSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const CHECK_PATH = 'dist/tokens-docs-check/';

// Must be set before index.js pulls in sdConfig, which reads it to resolve the build path.
process.env.KBQ_TOKENS_DOCS_OUT = CHECK_PATH;

rmSync(CHECK_PATH, { force: true, recursive: true });

require('./index');

const { BUILD_PATH } = require('./config');
const sdConfig = require('./sdConfig');

const read = (path, file) => readFileSync(join(path, file), 'utf8');

const generated = sdConfig.platforms.css.files.map(({ destination }) => destination);
const committed = readdirSync(BUILD_PATH).filter((file) => file.endsWith('.ts'));

const stale = generated.filter(
    (file) => !committed.includes(file) || read(BUILD_PATH, file) !== read(CHECK_PATH, file)
);
// A destination dropped from sdConfig leaves its file behind, and the docs app keeps importing it.
const orphaned = committed.filter((file) => !generated.includes(file));

if (stale.length === 0 && orphaned.length === 0) {
    rmSync(CHECK_PATH, { force: true, recursive: true });
    console.log(`\n✅ ${BUILD_PATH} is up to date.`);

    process.exit(0);
}

console.error('\n❌ design tokens docs data is out of date:\n');
stale.forEach((file) => console.error(`  - ${join(BUILD_PATH, file)} differs from the generated output`));
orphaned.forEach((file) => console.error(`  - ${join(BUILD_PATH, file)} is no longer generated`));
console.error(
    [
        '',
        'Run `yarn run build:tokens:data` and commit the result.',
        `The freshly generated files are kept in ${CHECK_PATH} for comparison.`,
        ''
    ].join('\n')
);

process.exit(1);
