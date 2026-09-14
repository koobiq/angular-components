import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'actions-panel-overlay-container';

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

    it('reports an open() call that passes overlayContainer', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqActionsPanel } from '@koobiq/components/actions-panel';\n" +
                'export class App { open(p: KbqActionsPanel, t: any, e: any) { p.open(t, { overlayContainer: e }); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('rendered inside that element');
    });

    it('reports maxWidth, which used to be ignored alongside overlayContainer', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqActionsPanel } from '@koobiq/components/actions-panel';\n" +
                'export class App { open(p: KbqActionsPanel, t: any) { p.open(t, { maxWidth: 400 }); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('used to be ignored');
    });

    it('does not report a panel opened without the option', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqActionsPanel } from '@koobiq/components/actions-panel';\n" +
                'export class App { open(p: KbqActionsPanel, t: any) { p.open(t); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('rendered inside that element');
    });

    it('says nothing at all when the project does not use the actions panel', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            'export class App { open(p: any, t: any, e: any) { p.open(t, { overlayContainer: e }); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
