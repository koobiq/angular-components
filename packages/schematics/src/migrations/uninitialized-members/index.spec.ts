import type { workspaces } from '@angular-devkit/core';
import type { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import type { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'uninitialized-members';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let project: string;
    let root: string;
    let messages: string[];

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const projects = (await getWorkspace(appTree)).projects as unknown as workspaces.ProjectDefinitionCollection;

        [project] = projects.keys();
        root = `/${projects.get(project)!.root}/src/app`;
        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    const run = async () => {
        await runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

        return messages.join('\n');
    };

    it('reports a read of a member that may be undefined now', async () => {
        appTree.create(
            `${root}/select.ts`,
            "import { KbqSelect } from '@koobiq/components/select';\n" +
                'export const count = (select: KbqSelect) => select.selectionModel.selected.length;\n'
        );

        const log = await run();

        expect(log).toContain(`[${SCHEMATIC_NAME}] ${root}/select.ts`);
        expect(log).toContain('KbqSelect.selectionModel and KbqTreeSelect.selectionModel are `| undefined`');
    });

    it('reports an event created without arguments and a subclass of an abstract contract', async () => {
        appTree.create(
            `${root}/control.ts`,
            "import { KbqCheckboxChange } from '@koobiq/components/checkbox';\n" +
                "import { KbqFormFieldControl } from '@koobiq/components/form-field';\n" +
                'export const change = new KbqCheckboxChange();\n' +
                'export abstract class Control extends KbqFormFieldControl<string> {}\n'
        );

        const log = await run();

        expect(log).toContain('take `source` and `checked`');
        expect(log).toContain('The members of KbqFormFieldControl are abstract now');
    });

    it('reports a read in an inline template of a component that imports the module', async () => {
        appTree.create(
            `${root}/inline.ts`,
            "import { KbqSelectModule } from '@koobiq/components/select';\n" +
                '@Component({ imports: [KbqSelectModule], template: `<kbq-select #select multiple></kbq-select>' +
                '{{ select.selectionModel.selected.length }}` })\n' +
                'export class Inline {}\n'
        );

        expect(await run()).toContain('KbqSelect.selectionModel and KbqTreeSelect.selectionModel are `| undefined`');
    });

    it('reports a read through a trigger or an event', async () => {
        appTree.create(
            `${root}/trigger.ts`,
            "import { KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';\n" +
                'export const next = (trigger: KbqAutocompleteTrigger) => trigger.autocomplete().keyManager.setNextItemActive();\n'
        );

        expect(await run()).toContain('The keyManager of KbqAccordion');
    });

    it('reports a read in a template', async () => {
        appTree.create(
            `${root}/tabs.html`,
            '<kbq-tab-group (selectedTabChange)="onChange($event.tab.label)"></kbq-tab-group>\n'
        );

        expect(await run()).toContain(`[${SCHEMATIC_NAME}] ${root}/tabs.html`);
    });

    it('says nothing about a file without the library types', async () => {
        appTree.create(
            `${root}/other.ts`,
            'export const read = (x: { selectionModel: unknown }) => x.selectionModel;\n'
        );

        expect(await run()).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
