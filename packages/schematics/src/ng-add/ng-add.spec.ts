import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createTestApp } from '../utils/testing';

const getPackageJsonDependencies = (tree: UnitTestTree) => {
    return JSON.parse(tree.get('/package.json')!.content.toString()).dependencies;
};

/**
 * The peers `@koobiq/components` cannot run without, read from the manifest rather than listed here,
 * so a peer added there without teaching `ng add` about it fails this suite instead of the consumer.
 */
const getMandatoryPeers = (): string[] => {
    const manifest = JSON.parse(
        readFileSync(join(__dirname, '..', '..', '..', 'components', 'package.json'), { encoding: 'utf-8' })
    );

    return Object.keys(manifest.peerDependencies).filter((peer) => !manifest.peerDependenciesMeta?.[peer]?.optional);
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

    it(`should leave every mandatory peer of '@koobiq/components' present in 'package.json'`, async () => {
        const tree = await runner.runSchematic('ng-add', {}, appTree);
        const dependencies = getPackageJsonDependencies(tree);

        // A mandatory peer the application ends up without breaks it later, at bundle time, with
        // "Module not found" — so each one has to be either shipped by `ng new` or added here. The
        // versions themselves are injected by rollup at build time, so they read as the `^0.0.0`
        // source default in this suite; only the presence of the entry is meaningful.
        expect(getMandatoryPeers().filter((peer) => dependencies[peer] === undefined)).toEqual([]);
    });

    it(`should install '@angular/animations' at the range the application uses for '@angular/core'`, async () => {
        const angularCore = getPackageJsonDependencies(appTree)['@angular/core'];
        const tree = await runner.runSchematic('ng-add', {}, appTree);

        // Every `@angular/animations` release pins `@angular/core` exactly, so installing the range
        // this repository builds with would produce ERESOLVE for applications on any other version.
        expect(angularCore).toBeDefined();
        expect(getPackageJsonDependencies(tree)['@angular/animations']).toBe(angularCore);
    });

    it(`should report when specified 'project' is not found`, async () => {
        await expect(runner.runSchematic('ng-add', { project: 'test' }, appTree)).rejects.toThrow(
            "Unable to find project 'test' in the workspace"
        );
    });
});
