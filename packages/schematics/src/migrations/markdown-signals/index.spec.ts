import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'markdown-signals';

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

    it('rewrites markdownText reads on a parameter typed KbqMarkdown (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqMarkdown } from '@koobiq/components/markdown';\n" +
                'class Demo {\n' +
                '    read(markdown: KbqMarkdown) {\n' +
                '        return markdown.markdownText ?? markdown?.markdownText;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('markdown.markdownText() ?? markdown?.markdownText()');
    });

    it('rewrites reads on a @ViewChild field (this.markdown)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqMarkdown } from '@koobiq/components/markdown';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqMarkdown) markdown: KbqMarkdown;\n' +
                '    read() {\n' +
                '        return this.markdown.markdownText;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.markdown.markdownText();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqMarkdown } from '@koobiq/components/markdown';\n" +
            'class Other {\n' +
            "    markdownText = 'x';\n" +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.markdownText;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqMarkdown } from '@koobiq/components/markdown';\n" +
            'class Demo {\n' +
            '    read(markdown: KbqMarkdown) {\n' +
            '        return markdown.markdownText();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the input is read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqMarkdown } from '@koobiq/components/markdown';\n" +
                'class Demo {\n' +
                '    write(markdown: KbqMarkdown) {\n' +
                "        markdown.markdownText = 'x';\n" +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain("markdown.markdownText = 'x';");
    });

    it('rewrites template reference reads in an external template', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-markdown #markdown />\n<span>{{ markdown.markdownText }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ markdown.markdownText() }}');
    });

    it('rewrites template reference reads inside an inline template', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "@Component({ template: '<kbq-markdown #markdown></kbq-markdown>{{ markdown.markdownText }}' })\n" +
                'class Demo {}\n'
        );

        expect((await run()).readText(ts)).toContain('{{ markdown.markdownText() }}');
    });

    it('leaves a template reference on an unrelated element alone', async () => {
        const html = firstHtmlPath();
        const source = '<other-thing #markdown></other-thing>\n<span>{{ markdown.markdownText }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('warns when a subclass writes to resultHtml', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqMarkdown } from '@koobiq/components/markdown';\n" +
                'class Demo extends KbqMarkdown {\n' +
                '    render() {\n' +
                "        this.resultHtml.set('<p></p>');\n" +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('read-only `computed`');
    });

    it('warns about a view query returning the instance', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqMarkdown } from '@koobiq/components/markdown';\n" +
                'class Demo {\n' +
                '    readonly markdown = viewChild(KbqMarkdown);\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('double call');
    });

    it('reports the two behavior fixes once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqMarkdown } from '@koobiq/components/markdown';\n" +
                'class Demo {\n' +
                '    read(markdown: KbqMarkdown) {\n' +
                '        return markdown.markdownText;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('clears the rendered output');
        expect(summary).toContain('projected content');
        expect(summary.match(/clears the rendered output/g)!.length).toBe(1);
    });

    it('reports the summary for a template-only consumer with nothing to rewrite', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-markdown># Title</kbq-markdown>\n');

        await run();

        expect(messages.join('\n')).toContain('clears the rendered output');
    });

    it('stays silent for a workspace that does not use the markdown', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqMarkdown } from '@koobiq/components/markdown';\n" +
            'class Demo {\n' +
            '    read(markdown: KbqMarkdown) {\n' +
            '        return markdown.markdownText;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
