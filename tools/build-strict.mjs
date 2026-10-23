/**
 * Runs an Angular CLI build target the way `ng build` does and fails when the builder reports a
 * warning. A build that succeeds with a warning ships what the warning is about: a CommonJS
 * dependency, an exceeded budget, a Sass deprecation. A warning that is expected is silenced where it
 * comes from instead: `allowedCommonJsDependencies`, the budgets,
 * `stylePreprocessorOptions.sass.silenceDeprecations`.
 *
 * Usage: node tools/build-strict.mjs <project>:<target>[:<configuration>]
 *
 * The target runs through the Architect API rather than `ng`: a builder hands every warning to its
 * logger, so warnings are told apart by their log level instead of by the text they are printed with.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { styleText } from 'node:util';

// The devkit packages are CommonJS without an `exports` map, so ESM cannot import their `/node` directories.
const require = createRequire(import.meta.url);
const { Architect } = require('@angular-devkit/architect');
const { WorkspaceNodeModulesArchitectHost } = require('@angular-devkit/architect/node');
const { schema, workspaces } = require('@angular-devkit/core');
const { createConsoleLogger, NodeJsSyncHost } = require('@angular-devkit/core/node');

const [targetString = '', ...rest] = process.argv.slice(2);
const [project, target, configuration] = targetString.split(':');

// Options are not forwarded to the builder, so one passed here is refused rather than dropped.
if (!project || !target || rest.length > 0) {
    console.error('Usage: node tools/build-strict.mjs <project>:<target>[:<configuration>]');
    process.exit(2);
}

// The colors `ng` gives each level.
const logger = createConsoleLogger(false, process.stdout, process.stderr, {
    warn: (message) => styleText(['yellow', 'bold'], message),
    error: (message) => styleText(['red', 'bold'], message),
    fatal: (message) => styleText(['red', 'bold'], message)
});

let warned = false;

logger.subscribe(({ level }) => {
    if (level === 'warn') warned = true;
});

const root = resolve(import.meta.dirname, '..');
const { workspace } = await workspaces.readWorkspace(
    resolve(root, 'angular.json'),
    workspaces.createWorkspaceHost(new NodeJsSyncHost())
);
const host = new WorkspaceNodeModulesArchitectHost(workspace, root);
const targetSpec = { project, target, configuration };
const registry = new schema.CoreSchemaRegistry();

// The transform `ng` picks. For an `@angular/build` target it fills in unset objects only:
// `addUndefinedDefaults` would also turn every unset array option into `[]`, and an empty
// `conditions` drops the `module` condition, so packages would resolve to their CommonJS builds.
registry.addPostTransform(
    (await host.getBuilderNameForTarget(targetSpec)).startsWith('@angular/build:')
        ? schema.transforms.addUndefinedObjectDefaults
        : schema.transforms.addUndefinedDefaults
);
registry.useXDeprecatedProvider((message) => logger.warn(message));

const run = await new Architect(host, registry).scheduleTarget(targetSpec, {}, { logger });
const { success, error } = await run.lastOutput;

await run.stop();

if (error) {
    logger.error(error);
}

if (success && warned) {
    logger.error(`${targetString} succeeded with warnings, and this build fails on them.`);
}

process.exit(success && !warned ? 0 : 1);
