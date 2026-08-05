import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { createTestApp } from '../utils/testing';

const getPackageJsonDependencies = (tree: UnitTestTree) => {
    return JSON.parse(tree.get('/package.json')!.content.toString()).dependencies;
};

describe(`ng add '@koobiq/components'`, () => {
    let runner: SchematicTestRunner;
    let appTree: UnitTestTree;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', join(__dirname, '../collection.json'));
        appTree = await createTestApp(runner);
    });

    it(`should add missing dependencies to 'package.json'`, async () => {
        expect(getPackageJsonDependencies(appTree)).toMatchSnapshot('before running schematics');
        const tree = await runner.runSchematic('ng-add', {}, appTree);

        expect(getPackageJsonDependencies(tree)).toMatchSnapshot('after running schematics');
    });

    it(`should add every mandatory peer of '@koobiq/components'`, async () => {
        const tree = await runner.runSchematic('ng-add', {}, appTree);
        const dependencies = getPackageJsonDependencies(tree);

        // A mandatory peer that `ng add` skips leaves the consumer with a package.json that never
        // recorded it, so the app only breaks later, at bundle time, with "Module not found".
        // The versions themselves are injected by rollup at build time, so they read as the
        // `^0.0.0` source default here — only the presence of the entry is meaningful.
        ['@angular/animations', '@angular/cdk', 'overlayscrollbars'].forEach((dependency) => {
            expect(dependencies[dependency]).toBeDefined();
        });
    });

    it(`should report when specified 'project' is not found`, async () => {
        await expect(runner.runSchematic('ng-add', { project: 'test' }, appTree)).rejects.toThrow(
            "Unable to find project 'test' in the workspace"
        );
    });
});
