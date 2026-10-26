const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');

// Runs both builders unconditionally, even if one fails, so a single pass reports every stale
// output at once instead of a `&&` chain stopping at the first failure and leaving the builder
// after it silently unregenerated — `build-guides` failing used to leave `history.json` untouched.

const root = resolve(__dirname, '..', '..', '..');
// The tsx CLI runs under this node rather than through `node_modules/.bin/tsx`: on Windows that shim
// is a shell script, which spawnSync cannot start without a shell (ENOENT, and EINVAL for `tsx.cmd`).
const tsxCli = require.resolve('tsx/cli');
const builders = ['build-guides', 'build-history'];

const failed = builders.filter((name) => {
    const result = spawnSync(
        process.execPath,
        [tsxCli, resolve(root, 'packages', 'mcp', 'src', 'indexer', `${name}.ts`)],
        { cwd: root, stdio: 'inherit' }
    );

    if (result.error) {
        process.stderr.write(`${name}: ${result.error.message}\n`);
    }

    return result.status !== 0;
});

if (failed.length > 0) {
    process.stderr.write(`\n${failed.length} of ${builders.length} builder(s) failed: ${failed.join(', ')}\n`);
    process.exit(1);
}
