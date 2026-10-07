import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'controls-signal-inputs';

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
        file = `/${projects.get(project)!.root}/src/app/control.ts`;
        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    const run = () => runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

    it('reports a subclass of a control', async () => {
        appTree.create(
            file,
            "import { KbqIconButton } from '@koobiq/components/icon';\n" +
                'export class MyIconButton extends KbqIconButton {}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('has to call super.ngOnChanges(changes)');
    });

    it('says nothing when the inputs are only read', async () => {
        appTree.create(
            file,
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'export function set(c: KbqCheckbox) { c.checked = true; return c.disabled; }\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('[controls-signal-inputs]');
    });
});
