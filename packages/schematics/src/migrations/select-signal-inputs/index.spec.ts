import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'select-signal-inputs';

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

    it('reports a write to the now signal-backed hiddenItemsText', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSelect } from '@koobiq/components/select';\n" +
                "export class App { label(s: KbqSelect) { s.hiddenItemsText = 'and {{ number }} more'; } }\n"
        );

        await run(first);

        expect(messages.join('\n')).toContain('an input() has no .set()');
    });

    it('reports a read of hiddenItemsText separately from a write', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSelect } from '@koobiq/components/select';\n" +
                'export class App { label(s: KbqSelect) { return s.hiddenItemsText; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('read it as `hiddenItemsText()`');
        expect(messages.join('\n')).not.toContain('an input() has no .set()');
    });

    it('reports the formatter that became an input', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSelect } from '@koobiq/components/select';\n" +
                'export class App { fmt(s: KbqSelect) { return s.hiddenItemsTextFormatter("{{ number }}", 2); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('is an input holding the function');
    });

    it('reports the removed selectEvents module', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { selectEvents } from '@koobiq/components/core';\n" + 'export const token = selectEvents;\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('were removed');
    });

    it('says nothing at all when the project does not use the select', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { label(s: any) { return s.hiddenItemsText; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[select-signal-inputs]');
    });
});
