import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'empty-state-size-attr';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
    });

    it('should run migration for specified project', async () => {
        await runner.runSchematic(SCHEMATIC_NAME);
    });
});
