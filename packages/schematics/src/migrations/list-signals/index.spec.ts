import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'list-signals';

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
        file = `/${projects.get(project)!.root}/src/app/list.ts`;
        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    const run = () => runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

    it('reports writes to the list and option inputs', async () => {
        appTree.create(
            file,
            "import { KbqListOption, KbqListSelection } from '@koobiq/components/list';\n" +
                'export function set(l: KbqListSelection, o: KbqListOption) { l.autoSelect = false; o.disabled = true; }\n'
        );

        await run();

        const log = messages.join('\n');

        expect(log).toContain('KbqListSelection.autoSelect, .noUnselectLast');
        expect(log).toContain('The value, disabled, draggable and showCheckbox of KbqListOption');
    });

    it('says nothing when the inputs are only read', async () => {
        appTree.create(
            file,
            "import { KbqListOption } from '@koobiq/components/list';\n" +
                'export function get(o: KbqListOption) { o.selected = true; return o.value === 5; }\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('[list-signals]');
    });
});
