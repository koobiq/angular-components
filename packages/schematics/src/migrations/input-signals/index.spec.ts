import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'input-signals';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let project: string;
    let file: string;
    let messages: string[];

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const projects = (await getWorkspace(appTree)).projects as unknown as workspaces.ProjectDefinitionCollection;

        [project] = projects.keys();
        file = `/${projects.get(project)!.root}/src/app/field.ts`;
        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    const run = () => runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

    it('reports a write to the number input value and the input type', async () => {
        appTree.create(
            file,
            "import { KbqInput, KbqNumberInput } from '@koobiq/components/input';\n" +
                'export function set(n: KbqNumberInput, i: KbqInput) { n.value = 5; i.type = "email"; }\n'
        );

        await run();

        const log = messages.join('\n');

        expect(log).toContain('KbqNumberInput.value and .disabled are signal inputs');
        expect(log).toContain('KbqInput.type is a signal input');
    });

    it('says nothing when the inputs are only read', async () => {
        appTree.create(
            file,
            "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                'export function get(n: KbqNumberInput) { return n.value === 5; }\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('[input-signals]');
    });
});
