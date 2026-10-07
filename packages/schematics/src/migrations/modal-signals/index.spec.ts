import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'modal-signals';

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
        file = `/${projects.get(project)!.root}/src/app/modal.ts`;
        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    const run = () => runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

    it('reports a subclass of KbqModalComponent', async () => {
        appTree.create(
            file,
            "import { KbqModalComponent } from '@koobiq/components/modal';\n" +
                'export class MyModal<T, R> extends KbqModalComponent<T, R> {}\n'
        );

        await run();

        const log = messages.join('\n');

        expect(log).toContain('A subclass of KbqModalComponent');
        expect(log).toContain('the options of KbqModalService, are unchanged');
    });

    it('reports a direct call of ngOnChanges, but not super.ngOnChanges', async () => {
        appTree.create(
            file,
            "import { SimpleChange } from '@angular/core';\n" +
                "import { KbqModalComponent } from '@koobiq/components/modal';\n" +
                'export function show(m: KbqModalComponent) { m.ngOnChanges({ kbqVisible: new SimpleChange(false, true, false) }); }\n'
        );

        await run();

        expect(messages.join('\n')).toContain('A direct call of ngOnChanges');

        messages = [];
        appTree.overwrite(
            file,
            "import { SimpleChanges } from '@angular/core';\n" +
                "import { KbqModalComponent } from '@koobiq/components/modal';\n" +
                'export class MyModal extends KbqModalComponent {\n' +
                '    override ngOnChanges(changes: SimpleChanges) { super.ngOnChanges(changes); }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('A direct call of ngOnChanges');
    });

    it('says nothing when the modal is only used', async () => {
        appTree.create(
            file,
            "import { KbqModalRef, KbqModalService } from '@koobiq/components/modal';\n" +
                'export function open(s: KbqModalService): KbqModalRef {\n' +
                "    const ref = s.create({ kbqTitle: 'Title', kbqOnOk: () => false });\n" +
                '    ref.getInstance().kbqMask = false;\n' +
                '    return ref;\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('[modal-signals]');
    });
});
