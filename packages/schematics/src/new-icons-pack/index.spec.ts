import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { createTestApp } from '../utils/testing';

const collectionPath = path.join(__dirname, '../collection.json');

describe('new-icons-pack', () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;


    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner);
        console.log(appTree);
    });

    it('should skip changes if koobiq icons package with breaking changes is not installed', () => {

    })

    it('should update prefixes for kbq icons in templates and components', () => {

    });

    it('should update prefixes for kbq icons in templates and components', () => {

    });

    it('works', async () => {
       /* const tree = await runner.runSchematic('new-icons-pack', {}, appTree);

        expect(tree.files).toEqual([]);*/
    });
});
