import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'popover-leave-delay';

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

    it('reports a programmatic leaveDelay assignment', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqPopoverTrigger } from '@koobiq/components/popover';\n" +
                'export class App { slow(t: KbqPopoverTrigger) { t.leaveDelay = 500; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer sticks');
    });

    it('does not report a read of leaveDelay', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqPopoverTrigger } from '@koobiq/components/popover';\n" +
                'export class App { current(t: KbqPopoverTrigger) { return t.leaveDelay; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('no longer sticks');
    });

    it('reports a write to the readonly onConfirm', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqPopoverConfirmComponent } from '@koobiq/components/popover';\n" +
                'export class App { swap(c: KbqPopoverConfirmComponent, s: any) { c.onConfirm = s; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('onConfirm is readonly');
    });

    it('says nothing at all when the project does not use popovers', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { slow(t: any) { t.leaveDelay = 500; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[popover-leave-delay]');
    });
});
