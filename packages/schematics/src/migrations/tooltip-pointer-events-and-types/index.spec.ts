import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'tooltip-pointer-events-and-types';

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

    it('reports a tooltip that never opts out of pointer events', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<button kbqTooltip="Delete">Delete</button>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('Tooltip panes take pointer events now');
    });

    it('stays quiet when the file already sets ignoreTooltipPointerEvents', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            'const template = `<button kbqTooltip="Delete" [ignoreTooltipPointerEvents]="true">Delete</button>`;\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('Tooltip panes take pointer events now');
    });

    it('reports a delay passed to getMouseLeaveListener', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTooltipTrigger } from '@koobiq/components/tooltip';\n" +
                'export class App { leave(t: KbqTooltipTrigger) { return t.getMouseLeaveListener(300); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer takes a delay');
    });

    it('does not report getMouseLeaveListener called without an argument', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTooltipTrigger } from '@koobiq/components/tooltip';\n" +
                'export class App { leave(t: KbqTooltipTrigger) { return t.getMouseLeaveListener(); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('no longer takes a delay');
    });

    it('reports the narrowed placementChange payload', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTooltipTrigger } from '@koobiq/components/tooltip';\n" +
                'export class App { watch(t: KbqTooltipTrigger) { t.placementChange.subscribe((p: string) => p); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('emits KbqPopUpPlacementValues instead of string');
    });

    it('says nothing at all when the project does not use tooltips', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App {}\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[tooltip-pointer-events-and-types]');
    });
});
