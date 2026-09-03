import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'splitter-signals';

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

    it('rewrites disabled reads on a parameter typed KbqSplitterComponent (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqSplitterComponent } from '@koobiq/components/splitter';\n" +
                'class Demo {\n' +
                '    read(splitter: KbqSplitterComponent) {\n' +
                '        return splitter.disabled ?? splitter?.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('splitter.disabled() ?? splitter?.disabled()');
    });

    it('rewrites reads on a @ViewChild field (this.splitter)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqSplitterComponent } from '@koobiq/components/splitter';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqSplitterComponent) splitter: KbqSplitterComponent;\n' +
                '    read() {\n' +
                '        return this.splitter.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.splitter.disabled();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqSplitterComponent } from '@koobiq/components/splitter';\n" +
            'class Other {\n' +
            '    disabled = false;\n' +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.disabled;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqSplitterComponent } from '@koobiq/components/splitter';\n" +
            'class Demo {\n' +
            '    read(splitter: KbqSplitterComponent) {\n' +
            '        return splitter.disabled();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the input is read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqSplitterComponent } from '@koobiq/components/splitter';\n" +
                'class Demo {\n' +
                '    write(splitter: KbqSplitterComponent) {\n' +
                '        splitter.disabled = true;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('splitter.disabled = true;');
    });

    it('rewrites template reference reads in an external template', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-splitter #splitter />\n<span>{{ splitter.disabled }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ splitter.disabled() }}');
    });

    it('rewrites template reference reads inside an inline template', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "@Component({ template: '<kbq-splitter #splitter></kbq-splitter>{{ splitter.disabled }}' })\n" +
                'class Demo {}\n'
        );

        expect((await run()).readText(ts)).toContain('{{ splitter.disabled() }}');
    });

    it('leaves a template reference on an unrelated element alone', async () => {
        const html = firstHtmlPath();
        const source = '<other-thing #splitter></other-thing>\n<span>{{ splitter.disabled }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('warns about the layout bookkeeping that left the public surface', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqSplitterComponent } from '@koobiq/components/splitter';\n" +
                'class Demo {\n' +
                '    read(splitter: KbqSplitterComponent) {\n' +
                '        return splitter.resizing + splitter.areas + splitter.elementRef;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('resizing');
        expect(logged).toContain('areas');
        expect(logged).toContain('elementRef');
    });

    it('warns about a view query returning the instance', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqSplitterComponent } from '@koobiq/components/splitter';\n" +
                'class Demo {\n' +
                '    readonly splitter = viewChild(KbqSplitterComponent);\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('double call');
    });

    it('rewrites gutter reads on a KbqGutterDirective receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqGutterDirective } from '@koobiq/components/splitter';\n" +
                'class Demo {\n' +
                '    read(gutter: KbqGutterDirective) {\n' +
                '        return gutter.order + gutter.size + gutter.direction;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('gutter.order() + gutter.size() + gutter.direction()');
    });

    it('rewrites a write to the gutter dragged signal', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqGutterDirective } from '@koobiq/components/splitter';\n" +
                'class Demo {\n' +
                '    reset(gutter: KbqGutterDirective) {\n' +
                '        gutter.dragged = false;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('gutter.dragged.set(false);');
    });

    it('warns about the ghost directive losing its inputs', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqGutterGhostDirective } from '@koobiq/components/splitter';\n" +
                'class Demo {\n' +
                '    place(ghost: KbqGutterGhostDirective) {\n' +
                '        ghost.x = 10;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('in name only');
    });

    it('reports the attribute, fallback, layout and teardown notes once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqSplitterComponent } from '@koobiq/components/splitter';\n" +
                'class Demo {\n' +
                '    read(splitter: KbqSplitterComponent) {\n' +
                '        return splitter.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('booleanAttribute');
        expect(summary).toContain('gutterSize');
        expect(summary).toContain('gutterPositionChange');
        expect(summary.match(/booleanAttribute/g)!.length).toBe(1);
    });

    it('reports the summary for a template-only consumer with nothing to rewrite', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-splitter disabled><div kbq-splitter-area></div></kbq-splitter>\n');

        await run();

        expect(messages.join('\n')).toContain('booleanAttribute');
    });

    it('stays silent for a workspace that does not use the splitter', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqSplitterComponent } from '@koobiq/components/splitter';\n" +
            'class Demo {\n' +
            '    read(splitter: KbqSplitterComponent) {\n' +
            '        return splitter.disabled;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
