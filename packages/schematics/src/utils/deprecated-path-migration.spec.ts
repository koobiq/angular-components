import { logging } from '@angular-devkit/core';
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { deprecatedPathMigration, DeprecatedPathMigrationOptions } from './deprecated-path-migration';

// A made-up entry point, so nothing here can pass because of something specific to a real one.
const LABEL = '[example-deprecated-path]';
const IMPORT = "import { KbqExample } from '@koobiq/components/example';\n";

/**
 * Runs the migration straight on `tree` and returns what it logged. Called directly rather than through
 * `SchematicTestRunner.callRule`, whose context either has no logger or fails to create a child one.
 */
async function run(tree: Tree, options: DeprecatedPathMigrationOptions = {}): Promise<string[]> {
    const logger = new logging.Logger('deprecated-path-migration');
    const messages: string[] = [];

    logger.subscribe(({ message }) => messages.push(message));

    await deprecatedPathMigration('example')(options)(tree, { logger } as unknown as SchematicContext);

    return messages;
}

describe('deprecatedPathMigration', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = Tree.empty();
    });

    it('rewrites every bare specifier of the entry point it is built for, whatever the quotes', async () => {
        tree.create(
            '/src/app.ts',
            [
                "import { KbqExample } from '@koobiq/components/example';",
                'export * from "@koobiq/components/example";',
                "jest.mock('@koobiq/components/example');"
            ].join('\n')
        );

        await run(tree);

        expect(tree.readText('/src/app.ts')).toBe(
            [
                "import { KbqExample } from '@koobiq/components/example/deprecated';",
                'export * from "@koobiq/components/example/deprecated";',
                "jest.mock('@koobiq/components/example/deprecated');"
            ].join('\n')
        );
    });

    it('leaves every other specifier as it is', async () => {
        const content = [
            "import { A } from '@koobiq/components/example/deprecated';",
            "import { B } from '@koobiq/components/example/private';",
            "import { C } from '@koobiq/components/example-x';",
            "import { D } from '@koobiq/components/other';",
            '// Unquoted, as in a comment: @koobiq/components/example'
        ].join('\n');

        tree.create('/src/app.ts', content);

        await run(tree);

        expect(tree.readText('/src/app.ts')).toBe(content);
    });

    it('visits only TypeScript files outside node_modules and dist', async () => {
        const skipped = ['/src/app.html', '/src/config.json', '/node_modules/lib/index.ts', '/dist/app/main.ts'];

        skipped.forEach((path) => tree.create(path, IMPORT));
        tree.create('/src/app.ts', IMPORT);

        await run(tree);

        skipped.forEach((path) => expect(tree.readText(path)).toBe(IMPORT));
        expect(tree.readText('/src/app.ts')).toContain("'@koobiq/components/example/deprecated'");
    });

    it('applies the fix without options and counts the files it updated', async () => {
        tree.create('/src/a.ts', IMPORT);
        tree.create('/src/b.ts', IMPORT);
        tree.create('/src/c.ts', "import { D } from '@koobiq/components/other';\n");

        const messages = await run(tree);

        expect(tree.readText('/src/a.ts')).toContain('/deprecated');
        expect(tree.readText('/src/b.ts')).toContain('/deprecated');
        expect(messages).toContain(`${LABEL} processed tree under "<workspace root>", updated 2 file(s).`);
    });

    it('only reports what it would change when fix is false', async () => {
        tree.create('/src/app.ts', IMPORT);

        const messages = await run(tree, { fix: false });

        expect(tree.readText('/src/app.ts')).toBe(IMPORT);
        expect(messages).toContain(`${LABEL} would update /src/app.ts (run with --fix to apply)`);
        expect(messages).toContain(`${LABEL} processed tree under "<workspace root>", would update 1 file(s).`);
    });

    it('stays inside the root of the project it is given', async () => {
        tree.create(
            '/angular.json',
            JSON.stringify({
                version: 1,
                projects: {
                    first: { root: 'projects/first', projectType: 'application' },
                    second: { root: 'projects/second', projectType: 'application' }
                }
            })
        );
        tree.create('/projects/first/src/main.ts', IMPORT);
        tree.create('/projects/second/src/main.ts', IMPORT);

        const messages = await run(tree, { project: 'first' });

        expect(tree.readText('/projects/first/src/main.ts')).toContain('/deprecated');
        expect(tree.readText('/projects/second/src/main.ts')).toBe(IMPORT);
        expect(messages).toContain(`${LABEL} processed tree under "projects/first", updated 1 file(s).`);
    });
});
