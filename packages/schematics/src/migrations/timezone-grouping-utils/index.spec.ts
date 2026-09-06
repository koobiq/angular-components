import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'timezone-grouping-utils';

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

    it('reports a call that still passes the dropped label and priority country', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { getZonesGroupedByCountry } from '@koobiq/components/timezone';\n" +
                "export class App { groups = getZonesGroupedByCountry(zones, 'Other', 'ru'); }\n"
        );

        await run(first);

        expect(messages.join('\n')).toContain('now takes only the zones');
    });

    it('reports a single-argument call, whose meaning changed without a compile error', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { getZonesGroupedByCountry } from '@koobiq/components/timezone';\n" +
                'export class App { groups = getZonesGroupedByCountry(zones); }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer reads the host time zone');
    });

    it('reports the comparator, whose result and tiebreak both changed', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { timezonesSortComparator } from '@koobiq/components/timezone';\n" +
                'export class App { sorted = zones.sort(timezonesSortComparator); }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('returns the difference of the two offsets');
    });

    it('reports a [multiple] binding, which is rejected now', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-timezone-select [multiple]="true" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('rejects multiple selection');
    });

    it('says nothing at all when the project does not use the timezone package', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { groups = groupBy(zones); }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[timezone-grouping-utils]');
    });
});
