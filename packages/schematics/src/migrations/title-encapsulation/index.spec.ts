import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'title-encapsulation';

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

    it('reports a push into the removed resizeStream', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTitleDirective } from '@koobiq/components/title';\n" +
                'export class App { remeasure(title: KbqTitleDirective, event: Event) { title.resizeStream.next(event); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('KbqTitleDirective.resizeStream was removed');
    });

    it('reports a read of a measurement member that became protected', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTitleDirective } from '@koobiq/components/title';\n" +
                'export class App { clipped(title: KbqTitleDirective) { return title.isHorizontalOverflown; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('are protected');
    });

    it('reports super.ngOnDestroy() in a subclass', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTitleDirective } from '@koobiq/components/title';\n" +
                'export class MyTitle extends KbqTitleDirective { ngOnDestroy() { super.ngOnDestroy(); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer declares ngOnDestroy');
    });

    it('leaves a file that never mentions the directive alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        // `resizeStream` on something unrelated: the anchor is what keeps this quiet.
        appTree.overwrite(
            ts,
            'export class App { constructor(private other: any) { this.other.resizeStream.next(); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('resizeStream was removed');
    });

    it('says nothing at all when the project does not use kbq-title', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App {}\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[title-encapsulation]');
    });
});
