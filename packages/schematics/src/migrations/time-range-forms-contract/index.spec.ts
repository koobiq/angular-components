import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'time-range-forms-contract';

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

        return {
            ts: appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`,
            scss: `${root}/app.scss`
        };
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports a read of the removed timepicker query', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTimeRangeEditor } from '@koobiq/components/time-range';\n" +
                'export class App { count(e: KbqTimeRangeEditor<Date>) { return e.timepickerList().length; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('timepickerList was removed');
    });

    it('reports a write to a form-field adapter member that became derived', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTimeRangeTitleAsControl } from '@koobiq/components/time-range';\n" +
                'export class App { mark(c: KbqTimeRangeTitleAsControl) { c.errorState = true; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer takes assignments');
    });

    it('reports a valueCorrected handler, whose emissions changed', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-time-range (valueCorrected)="onCorrected($event)" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('fires only when the correction produced a different range');
    });

    it('reports a stylesheet keyed on the editor markup that moved', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(scss, '.kbq-time-range .kbq-radio-group .kbq-time-range-editor__range { gap: 0; }\n');

        await run(first);

        expect(messages.join('\n')).toContain('The editor markup changed');
    });

    it('says nothing at all when the project does not use the time-range', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { count(e: any) { return e.timepickerList().length; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[time-range-forms-contract]');
    });
});
