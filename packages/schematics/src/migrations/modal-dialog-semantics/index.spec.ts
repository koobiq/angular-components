import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'modal-dialog-semantics';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });
        const workspace = await getWorkspace(appTree);

        projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
    });

    function paths(project: workspaces.ProjectDefinition) {
        // The exact file names from @schematics/angular:application vary across versions
        // (app.ts vs app.component.ts), so discover them from the tree.
        const root = `/${project.root}/src/app`;

        return { ts: appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts` };
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports a (kbqOnCancel) binding, which no longer keeps the dialog open', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-modal (kbqOnCancel)="onCancel()" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('no longer keeps the dialog open');
    });

    it('reports a removed member', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqModalComponent } from '@koobiq/components/modal';\n" +
                'export class App { origin(m: KbqModalComponent) { return m.transformOrigin; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('were removed');
    });

    it('reports a member that became protected', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqModalComponent } from '@koobiq/components/modal';\n" +
                "export class App { cancel(m: KbqModalComponent) { m.onClickOkCancel('cancel'); } }\n"
        );

        await run(first);

        expect(messages.join('\n')).toContain('are protected now');
    });

    it('reports a removed style hook', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const styles = `.kbq-modal-open { overflow: hidden; }`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('neither had a single reader');
    });

    it('says nothing at all when the project does not use the modal', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { origin(m: any) { return m.transformOrigin; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[modal-dialog-semantics]');
    });
});
