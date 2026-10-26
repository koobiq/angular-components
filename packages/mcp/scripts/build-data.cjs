const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');

// Runs both builders unconditionally, even if one fails, so a single pass reports every stale
// output at once instead of a `&&` chain stopping at the first failure and leaving the builder
// after it silently unregenerated — `build-guides` failing used to leave `history.json` untouched.

const root = resolve(__dirname, '..', '..', '..');
const tsx = resolve(root, 'node_modules', '.bin', 'tsx');
const builders = ['build-guides', 'build-history'];

const failed = builders.filter((name) => {
    const result = spawnSync(tsx, [resolve(root, 'packages', 'mcp', 'src', 'indexer', `${name}.ts`)], {
        cwd: root,
        stdio: 'inherit'
    });

    return result.status !== 0;
});

if (failed.length > 0) {
    process.stderr.write(`\n${failed.length} of ${builders.length} builder(s) failed: ${failed.join(', ')}\n`);
    process.exit(1);
}
