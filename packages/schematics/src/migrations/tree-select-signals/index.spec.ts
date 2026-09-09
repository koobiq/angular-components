import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'tree-select-signals';

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

    it('reports a (valueChange) binding, which never fired and no longer exists', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-tree-select (valueChange)="onChange($event)" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('valueChange was removed');
    });

    it('reports a removed template helper', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTreeSelect } from '@koobiq/components/tree-select';\n" +
                'export class App { classes(s: KbqTreeSelect) { return s.getPanelClasses(); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('were removed');
    });

    it('separates a write to a signal member from a read', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTreeSelect } from '@koobiq/components/tree-select';\n" +
                "export class App { label(s: KbqTreeSelect) { s.hiddenItemsText = 'more'; } }\n"
        );

        await run(first);

        expect(messages.join('\n')).toContain('none of them takes an assignment');
        expect(messages.join('\n')).not.toContain('read them as calls');
    });

    it('reports a member that became protected', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTreeSelect } from '@koobiq/components/tree-select';\n" +
                'export class App { count(s: KbqTreeSelect) { return s.options.length; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('are protected');
    });

    it('says nothing at all when the project does not use the tree-select', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { classes(s: any) { return s.getPanelClasses(); } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[tree-select-signals]');
    });
});
