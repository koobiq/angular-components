import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'split-button-optional-disabled';

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

    it('reports a read of the now optional disabled', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSplitButton } from '@koobiq/components/split-button';\n" +
                'export class App { locked(control: KbqSplitButton): boolean { return control.disabled; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('reports `boolean | undefined`');
    });

    it('reports the QueryList API lost by the buttons query in a subclass', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSplitButton } from '@koobiq/components/split-button';\n" +
                'export class MySplit extends KbqSplitButton { count() { return this.buttons.length; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('is a signal query');
    });

    it('does not report the buttons query outside a subclass', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSplitButton } from '@koobiq/components/split-button';\n" +
                'export class App { count(other: { buttons: unknown[] }) { return other.buttons.length; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('is a signal query');
    });

    it('leaves a file that never mentions the component alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { locked(other: any) { return other.disabled; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[split-button-optional-disabled]');
    });
});
