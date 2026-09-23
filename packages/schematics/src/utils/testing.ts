import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

function createWorkspace(runner: SchematicTestRunner): Promise<UnitTestTree> {
    return runner.runExternalSchematic('@schematics/angular', 'workspace', {
        name: 'workspace',
        version: '17.0.0',
        newProjectRoot: 'projects'
    });
}

/**
 * Base trees already generated in this worker, keyed by the options they were generated with.
 *
 * Kept on `globalThis` rather than in module scope because `resetModules` gives every test a fresh
 * module registry, which would throw the cache away between tests in the same file.
 */
const cache: Map<string, Promise<UnitTestTree>> = ((globalThis as any).__kbqSchematicsTestApps ??= new Map());

async function generate(runner: SchematicTestRunner, appOptions: object, second: boolean): Promise<UnitTestTree> {
    let tree = await createWorkspace(runner);

    tree = await runner.runExternalSchematic(
        '@schematics/angular',
        'application',
        { name: 'app', ...appOptions },
        tree
    );

    if (!second) return tree;

    return runner.runExternalSchematic(
        '@schematics/angular',
        'application',
        { name: 'second-app', ...appOptions },
        tree
    );
}

/**
 * Creates a sample workspace with two applications: 'app' (default) and 'second-app'.
 *
 * Generating it runs three external `@schematics/angular` schematics, and every call site does this
 * from `beforeEach`. The tree is therefore generated once per worker per option set and handed out as
 * a branch: a branch shares the base host copy-on-write, so what a test writes stays in its own copy.
 */
export async function createTestApp(runner: SchematicTestRunner, appOptions = {}): Promise<UnitTestTree> {
    return branchOf(runner, appOptions, true);
}

async function branchOf(runner: SchematicTestRunner, appOptions: object, second: boolean): Promise<UnitTestTree> {
    const key = `${second ? 'two' : 'one'}:${JSON.stringify(appOptions)}`;

    cache.set(key, cache.get(key) ?? generate(runner, appOptions, second));

    return new UnitTestTree((await cache.get(key)!).branch());
}
