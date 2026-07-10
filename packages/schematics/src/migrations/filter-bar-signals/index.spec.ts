import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'filter-bar-signals';

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

    function paths(project: workspaces.ProjectDefinition) {
        // The exact file names from @schematics/angular:application vary across versions
        // (app.ts vs app.component.ts, app.html vs app.component.html). Discover them from the tree.
        const root = `/${project.root}/src/app`;
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const html = appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;

        return { ts, html };
    }

    async function run(fix: boolean = true): Promise<Tree> {
        const [first] = projects.keys();

        return runner.runSchematic(SCHEMATIC_NAME, { project: first, fix } satisfies Schema, appTree);
    }

    function firstTsPath(): string {
        const [first] = projects.keys();

        return paths(projects.get(first)!).ts;
    }

    function firstHtmlPath(): string {
        const [first] = projects.keys();

        return paths(projects.get(first)!).html;
    }

    it('rewrites reads on a parameter typed KbqFilterBar (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    check(filterBar: KbqFilterBar) {\n' +
                '        return filterBar.filter?.name;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('filterBar.filter()?.name');
        expect(updated).not.toMatch(/filterBar\.filter\?\./);
    });

    it('rewrites a `filter` write to `filter.set(...)`', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFilterBar, KbqFilter } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    apply(filterBar: KbqFilterBar, next: KbqFilter) {\n' +
                '        filterBar.filter = next;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('filterBar.filter.set(next);');
    });

    it('rewrites reads on a @ViewChild field (this.filterBar) and the computed signal getters', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqFilterBar) filterBar: KbqFilterBar;\n' +
                '    get changed() {\n' +
                '        return this.filterBar.isChanged && this.filterBar.filter;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('this.filterBar.isChanged() && this.filterBar.filter()');
    });

    it('leaves unrelated .filter (e.g. Array.prototype.filter) untouched', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
            'class Demo {\n' +
            '    ids(filterBar: KbqFilterBar) {\n' +
            '        const list = [1, 2, 3];\n' +
            '        return list.filter((x) => x > 1);\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        const updated = (await run()).readText(ts);

        expect(updated).toContain('list.filter((x) => x > 1)');
        expect(updated).not.toContain('list.filter()');
    });

    it('is idempotent — a second run does not double the call', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    check(filterBar: KbqFilterBar) {\n' +
                '        return filterBar.filter?.name;\n' +
                '    }\n' +
                '}\n'
        );

        const once = (await run()).readText(ts);

        appTree.overwrite(ts, once);

        const twice = (await run()).readText(ts);

        expect(twice).toBe(once);
        expect(twice).not.toContain('filter()()');
    });

    it('rewrites reads via a template reference variable on <kbq-filter-bar>', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-filter-bar #filterBar></kbq-filter-bar>\n' + '<span>{{ filterBar.isChanged }}</span>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('{{ filterBar.isChanged() }}');
    });

    it('renames KbqFilterBarRefresher to KbqFilterRefresher', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFilterBar, KbqFilterBarRefresher } from '@koobiq/components/filter-bar';\n" +
                'const refs = [KbqFilterBar, KbqFilterBarRefresher];\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('KbqFilterRefresher');
        expect(updated).not.toContain('KbqFilterBarRefresher');
    });

    it('warns about the deprecated `changes` and the removed `preparePopover`', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    wire(filterBar: KbqFilterBar) {\n' +
                '        filterBar.changes.subscribe(() => {});\n' +
                '        filterBar.preparePopover();\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const all = messages.join('\n');

        expect(all).toContain('KbqFilterBar.changes is deprecated');
        expect(all).toContain('preparePopover() was removed');
    });

    it('does not write files in dry-run mode (fix = false) but reports would-update', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
            'class Demo {\n' +
            '    check(filterBar: KbqFilterBar) {\n' +
            '        return filterBar.filter;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        const updated = (await run(false)).readText(ts);

        expect(updated).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
