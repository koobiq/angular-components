import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'mandatory-peer-dependencies';

const getDependencies = (tree: UnitTestTree) => JSON.parse(tree.get('/package.json')!.content.toString()).dependencies;

/** Everything the migration warns about, in the order it was logged. */
const collectWarnings = (runner: SchematicTestRunner): string[] => {
    const warnings: string[] = [];

    runner.logger.subscribe((entry) => {
        if (entry.level === 'warn') {
            warnings.push(entry.message);
        }
    });

    return warnings;
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: UnitTestTree;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner);
    });

    it('should add the peers that became mandatory', async () => {
        const tree = await runner.runSchematic(SCHEMATIC_NAME, {}, appTree);
        const dependencies = getDependencies(tree);

        // Versions are injected by rollup at build time, so they read as the `^0.0.0` source default
        // in this suite; only the presence of the entry is meaningful.
        expect(dependencies['overlayscrollbars']).toBeDefined();
        expect(dependencies['@koobiq/date-adapter']).toBeDefined();
        expect(dependencies['@angular/animations']).toBeDefined();
    });

    it(`should take '@angular/animations' from the project's own '@angular/core'`, async () => {
        const angularCore = getDependencies(appTree)['@angular/core'];
        const tree = await runner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        expect(angularCore).toBeDefined();
        expect(getDependencies(tree)['@angular/animations']).toBe(angularCore);
    });

    it('should leave a dependency the project already declares untouched', async () => {
        const before = JSON.parse(appTree.get('/package.json')!.content.toString());

        before.dependencies['@koobiq/date-adapter'] = '3.0.1';
        appTree.overwrite('/package.json', JSON.stringify(before, null, 2));

        const warnings = collectWarnings(runner);
        const tree = await runner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        // The migration must not silently rewrite a pin the project chose; it warns instead.
        expect(getDependencies(tree)['@koobiq/date-adapter']).toBe('3.0.1');
        expect(warnings.join('\n')).toContain('3.0.1');
    });

    it('should not warn about a dependency it added itself', async () => {
        const warnings = collectWarnings(runner);

        await runner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        // The project declared no `@koobiq/date-adapter`, so it just got the current range and has
        // nothing to act on — warning here sends every upgraded project after a problem it has not got.
        expect(warnings.join('\n')).not.toContain('@koobiq/date-adapter');
    });
});
