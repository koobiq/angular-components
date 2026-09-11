import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'filter-bar-state-saving-default';

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

    /** Runs the migration over a single file and returns everything it logged. */
    async function report(source: string): Promise<string> {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, source);

        await run(first);

        return messages.join('\n');
    }

    it('reports a filter bar that never mentions useStateSaving', async () => {
        const messages = await report('const template = `<kbq-filter-bar />`;\n');

        expect(messages).toContain('Filter bars remember the selected filter');
    });

    it('stays quiet when the file already opts out', async () => {
        const messages = await report('const template = `<kbq-filter-bar [useStateSaving]="false" />`;\n');

        expect(messages).not.toContain('Filter bars remember the selected filter');
    });

    it('reports a bound filter, which a restore now overrides at initialization', async () => {
        const messages = await report('const template = `<kbq-filter-bar [filter]="activeFilter" />`;\n');

        expect(messages).toContain('A restored filter overrides the value this [filter] binding supplies');
    });

    it('reports the two-way form of that binding too', async () => {
        const messages = await report('const template = `<kbq-filter-bar [(filter)]="activeFilter" />`;\n');

        expect(messages).toContain('A restored filter overrides the value this [filter] binding supplies');
    });

    it('reports that a saved filter is identified by its name', async () => {
        const messages = await report(
            'const template = `<kbq-filter-bar><kbq-filters [filters]="filters" /></kbq-filter-bar>`;\n'
        );

        expect(messages).toContain('A filter is identified by its name');
    });

    it('reports a compareWith, which restored values depend on', async () => {
        const messages = await report(
            'import { KbqFilterBar } from "@koobiq/components/filter-bar";\n' +
                'const templates = [{ compareWith: (a, b) => a.id === b.id }];\n'
        );

        expect(messages).toContain('Restored pipe values come back as new objects');
    });

    it('separates the in-memory snapshot from persistence', async () => {
        const messages = await report(
            'import { KbqFilterBar } from "@koobiq/components/filter-bar";\n' +
                'declare const bar: KbqFilterBar;\nbar.restoreFilterState();\n'
        );

        expect(messages).toContain('saveFilterState()/restoreFilterState() are unchanged');
    });

    it('says nothing at all about a project with no filter bar', async () => {
        const messages = await report('export const nothing = 1;\n');

        expect(messages).not.toContain(SCHEMATIC_NAME);
    });
});
