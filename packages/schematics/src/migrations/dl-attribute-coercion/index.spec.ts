import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'dl-attribute-coercion';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;
    let messages: string[];

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });
        const workspace = await getWorkspace(appTree);

        projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;

        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    function firstHtmlPath(): string {
        const [first] = projects.keys();
        const root = `/${projects.get(first)!.root}/src/app`;

        return appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;
    }

    async function run(): Promise<Tree> {
        const [first] = projects.keys();

        return runner.runSchematic(SCHEMATIC_NAME, { project: first } satisfies Schema, appTree);
    }

    it('reports a valueless wide attribute without touching the file', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-dl wide><kbq-dt>a</kbq-dt><kbq-dd>b</kbq-dd></kbq-dl>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
        expect(messages.join('\n')).toContain('valueless `wide` or `vertical`');
    });

    it('reports a valueless vertical attribute', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl vertical></kbq-dl>\n');

        await run();

        expect(messages.join('\n')).toContain('valueless `wide` or `vertical`');
    });

    it('reports a static numeric width attribute', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl dtMinWidth="120"></kbq-dl>\n');

        await run();

        expect(messages.join('\n')).toContain('numeric inputs now');
    });

    it('leaves a bound wide alone', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl [wide]="isWide"></kbq-dl>\n');

        await run();

        expect(messages.join('\n')).not.toContain('valueless `wide` or `vertical`');
    });

    it('prints the summary once for a consumer', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl></kbq-dl>\n');

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('number | undefined');
        expect(summary.match(/number \| undefined/g)!.length).toBe(1);
    });

    it('stays silent for a workspace that does not use the description list', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
