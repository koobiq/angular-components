'use strict';

const { execFileSync } = require('child_process');
const { existsSync, readFileSync, statSync } = require('fs');
const { resolve } = require('path');
const { pathToFileURL } = require('url');

const repoRoot = resolve(__dirname, '..', '..', '..');
const distCliRoot = resolve(repoRoot, 'dist', 'cli');
const releaseEntry = resolve(distCliRoot, 'dist', 'release', 'index.js');

const REQUIRED_EXPORTS = ['extractReleaseNotes', 'parseTag', 'resolveChangelogPath'];
const MIN_CLI_JS_SIZE = 100 * 1024;

let failed = false;

const fail = (path, problem) => {
    console.error(`CLI build output check failed: ${path} ${problem}`);
    failed = true;
};

const verify = async () => {
    // bin/cli must point at the bundled entry with a Node shebang.
    const binCliPath = resolve(distCliRoot, 'bin', 'cli');

    if (!existsSync(binCliPath)) {
        fail('bin/cli', 'does not exist');
    } else {
        const binCli = readFileSync(binCliPath, 'utf8');

        if (!binCli.startsWith('#!/usr/bin/env node')) {
            fail('bin/cli', 'does not start with "#!/usr/bin/env node"');
        }

        // The bundle no longer self-executes (it is guarded by `require.main === module`), so
        // bin/cli has to call `.runCliCommands()` itself — a substring check cannot tell that
        // apart from a bin that silently exits 0 with empty stdout. Run the binary instead.
        try {
            const helpOutput = execFileSync(process.execPath, [binCliPath, '--help'], { encoding: 'utf8' });

            if (!helpOutput.includes('koobiq-cli')) {
                fail('bin/cli', '`--help` output does not contain "koobiq-cli"');
            }
        } catch (error) {
            fail('bin/cli', `\`--help\` exited with an error: ${error.message}`);
        }
    }

    // The bundled entry must be a non-trivial CommonJS file.
    const cliJsPath = resolve(distCliRoot, 'dist', 'cli.js');

    if (!existsSync(cliJsPath)) {
        fail('dist/cli.js', 'does not exist');
    } else {
        const cliJs = readFileSync(cliJsPath, 'utf8');

        if (statSync(cliJsPath).size <= MIN_CLI_JS_SIZE) {
            fail('dist/cli.js', 'size is not greater than 100 KB');
        }

        if (!cliJs.includes('"use strict"')) {
            fail('dist/cli.js', 'does not contain "use strict"');
        }

        if (!cliJs.includes('require(')) {
            fail('dist/cli.js', 'does not contain a CommonJS require()');
        }
    }

    // The release entry point and its typings must both be present.
    const releaseEntryExists = existsSync(releaseEntry);

    if (!releaseEntryExists) {
        fail('dist/release/index.js', 'does not exist');
    }

    if (!existsSync(resolve(distCliRoot, 'dist', 'release', 'index.d.ts'))) {
        fail('dist/release/index.d.ts', 'does not exist');
    }

    // The packed manifest must carry the real root version, not the placeholder.
    const distCliPkgPath = resolve(distCliRoot, 'package.json');
    const rootVersion = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8')).version;

    if (!existsSync(distCliPkgPath)) {
        fail('package.json', 'does not exist');
    } else {
        const version = JSON.parse(readFileSync(distCliPkgPath, 'utf8')).version;

        if (version === '{{VERSION}}') {
            fail('package.json', 'version is the unresolved "{{VERSION}}" placeholder');
        } else if (version !== rootVersion) {
            fail('package.json', `version "${version}" does not match root package.json version "${rootVersion}"`);
        }
    }

    // require() proves CommonJS consumers can load the entry.
    if (releaseEntryExists) {
        try {
            const cjsExports = require(releaseEntry);

            for (const name of REQUIRED_EXPORTS) {
                if (typeof cjsExports[name] !== 'function') {
                    fail(
                        'dist/release/index.js',
                        `CommonJS export "${name}" is not a function (got ${typeof cjsExports[name]})`
                    );
                }
            }
        } catch (error) {
            fail('dist/release/index.js', `require() threw: ${error.message}`);
        }

        // dynamic import() proves ESM consumers can import the CommonJS entry.
        try {
            const esmNamespace = await import(pathToFileURL(releaseEntry).href);

            for (const name of REQUIRED_EXPORTS) {
                if (typeof esmNamespace[name] !== 'function') {
                    fail(
                        'dist/release/index.js',
                        `ESM namespace export "${name}" is not a function (got ${typeof esmNamespace[name]})`
                    );
                }
            }
        } catch (error) {
            fail('dist/release/index.js', `dynamic import() threw: ${error.message}`);
        }
    }

    if (failed) {
        process.exit(1);
    }

    console.log('CLI build output OK');
};

verify().catch((error) => {
    console.error(`CLI build output check failed: unexpected error: ${error.message}`);
    process.exit(1);
});
