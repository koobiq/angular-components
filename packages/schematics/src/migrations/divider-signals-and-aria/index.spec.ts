import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'divider-signals-and-aria';

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

    it('separates a write to a signal input from a read', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqDivider } from '@koobiq/components/divider';\n" +
                'export class App { pin(d: KbqDivider) { d.vertical = true; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('take no assignment');
        expect(messages.join('\n')).not.toContain('read them as calls');
    });

    it('reports a read of a signal input', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqDivider } from '@koobiq/components/divider';\n" +
                'export class App { isVertical(d: KbqDivider) { return d.vertical; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('read them as calls');
    });

    it('reports a hand-rolled separator role on the element', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-divider role="separator" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('is a duplicate');
    });

    it('points a hand-rolled aria-hidden at the decorative input', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-divider aria-hidden="true" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('decorative');
    });

    it('reports the vertical sizing change once per project', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-divider [vertical]="true" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('--kbq-divider-size-vertical-height');
    });

    it('says nothing at all when the project does not use the divider', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { isVertical(d: any) { return d.vertical; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
