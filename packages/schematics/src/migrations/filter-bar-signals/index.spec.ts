import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
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

    it('leaves an assignment to the read-only pipeTemplates and reports it', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    reset(filterBar: KbqFilterBar) {\n' +
                '        filterBar.pipeTemplates = [];\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('filterBar.pipeTemplates = [];');
        expect(messages.join('\n')).toContain('`pipeTemplates` can no longer be assigned');
    });

    it('leaves a compound write in code alone and reports it', async () => {
        const ts = firstTsPath();
        const body = '        filterBar.filter ??= next;\n' + '        filterBar.pipeTemplates ||= [];\n';

        appTree.overwrite(
            ts,
            "import { KbqFilterBar, KbqFilter } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    apply(filterBar: KbqFilterBar, next: KbqFilter) {\n' +
                body +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);
        const all = messages.join('\n');

        expect(updated).toContain(body);
        expect(all).toContain('`pipeTemplates` can no longer be assigned');
        expect(all).toContain('`filter` is a writable signal now');
    });

    it('leaves a nested declaration that shadows a typed receiver alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    read(filterBar: KbqFilterBar) {\n' +
                '        const names = [1].map((filterBar: { filter: string; pipeTemplates: string[] }) => {\n' +
                '            filterBar.pipeTemplates = [];\n' +
                '            return filterBar.filter;\n' +
                '        });\n' +
                '        return [filterBar.isChanged, names];\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('            filterBar.pipeTemplates = [];\n            return filterBar.filter;\n');
        expect(updated).toContain('return [filterBar.isChanged(), names];');
        expect(messages.join('\n')).not.toContain('can no longer be assigned');
    });

    it('leaves this.<field> inside a function that rebinds this alone, and rewrites it inside an arrow', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    filterBar: KbqFilterBar;\n' +
                '    read() {\n' +
                '        [1].forEach(function (this: any) {\n' +
                '            return this.filterBar.filter;\n' +
                '        });\n' +
                '        return [1].map(() => this.filterBar.filter);\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('            return this.filterBar.filter;\n');
        expect(updated).toContain('return [1].map(() => this.filterBar.filter());');
    });

    it('rewrites reads and writes on a receiver typed by inject()', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { inject } from '@angular/core';\n" +
                "import { KbqFilterBar, KbqFilter } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    private readonly filterBar = inject(KbqFilterBar);\n' +
                '    apply(next: KbqFilter) {\n' +
                '        this.filterBar.filter = next;\n' +
                '        return this.filterBar.isChanged;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('this.filterBar.filter.set(next);');
        expect(updated).toContain('return this.filterBar.isChanged();');
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

    it('leaves a property chain that ends in the name of a ref alone', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-filter-bar #filterBar></kbq-filter-bar>\n' +
                '<span>{{ page.filterBar.isChanged }} {{ filterBar.isChanged }}</span>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('{{ page.filterBar.isChanged }} {{ filterBar.isChanged() }}');
    });

    it('turns a write through a ref to `filter` into .set() and leaves a read-only member', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-filter-bar #filterBar></kbq-filter-bar>\n' +
                '<button (click)="filterBar.filter = saved">Restore</button>\n' +
                '<button (click)="filterBar.pipeTemplates = []">Reset</button>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('(click)="filterBar.filter.set(saved)"');
        expect(updated).toContain('(click)="filterBar.pipeTemplates = []"');
        expect(messages.join('\n')).toContain('`pipeTemplates` can no longer be assigned');
    });

    it('leaves a compound write through a ref alone and reports it', async () => {
        const html = firstHtmlPath();
        const template =
            '<kbq-filter-bar #filterBar></kbq-filter-bar>\n' +
            '<button (click)="filterBar.filter ??= saved">Restore</button>\n' +
            '<button (click)="filterBar.pipeTemplates ||= []">Reset</button>\n';

        appTree.overwrite(html, template);

        const updated = (await run()).readText(html);
        const all = messages.join('\n');

        expect(updated).toBe(template);
        expect(all).toContain('`pipeTemplates` can no longer be assigned');
        expect(all).toContain('`filter` is a writable signal now');
    });

    it('leaves reads via a template reference variable naming a directive on <kbq-filter-bar> untouched', async () => {
        const html = firstHtmlPath();
        const template =
            '<kbq-filter-bar #model="ngModel" cdkOverlayOrigin #origin="cdkOverlayOrigin"></kbq-filter-bar>\n' +
            '<span>{{ model.filter }} {{ origin.isChanged }}</span>\n';

        appTree.overwrite(html, template);

        const updated = (await run()).readText(html);

        expect(updated).toBe(template);
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

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
                'class Demo {\n' +
                '    check(filterBar: KbqFilterBar) {\n' +
                '        return filterBar.filter;\n' +
                '    }\n' +
                '}\n'
        );

        // Run from migrations.json with no options, as `ng update` does: no schema default applies there.
        const migrationsRunner = new SchematicTestRunner('migrations', migrationsPath);

        migrationsRunner.logger.subscribe((entry) => messages.push(entry.message));

        const updated = await migrationsRunner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        expect(updated.readText(ts)).toContain('return filterBar.filter();');
        expect(messages.join('\n')).not.toContain('would update');
    });
});
