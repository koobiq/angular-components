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

    it(`should report when specified 'project' is not found`, async () => {
        await expect(runner.runSchematic('ng-add', { project: 'test' }, appTree)).rejects.toThrow(
            "Unable to find project 'test' in the workspace"
        );
    });
});
