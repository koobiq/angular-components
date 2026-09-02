import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'progress-spinner-signals';

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

    it('rewrites size reads on a parameter typed KbqProgressSpinner (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    read(spinner: KbqProgressSpinner) {\n' +
                '        return spinner.size ?? spinner?.size;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('spinner.size() ?? spinner?.size()');
    });

    it('rewrites reads on a @ViewChild field (this.spinner)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqProgressSpinner) spinner: KbqProgressSpinner;\n' +
                '    read() {\n' +
                '        return this.spinner.size;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.spinner.size();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
            'class Other {\n' +
            "    size = 'big';\n" +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.size;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
            'class Demo {\n' +
            '    read(spinner: KbqProgressSpinner) {\n' +
            '        return spinner.size();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the input is read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    write(spinner: KbqProgressSpinner) {\n' +
                "        spinner.size = 'big';\n" +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain("spinner.size = 'big';");
    });

    it('rewrites template reference reads in an external template', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-progress-spinner #spinner />\n<span>{{ spinner.size }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ spinner.size() }}');
    });

    it('rewrites template reference reads inside an inline template', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "@Component({ template: '<kbq-progress-spinner #spinner></kbq-progress-spinner>{{ spinner.size }}' })\n" +
                'class Demo {}\n'
        );

        expect((await run()).readText(ts)).toContain('{{ spinner.size() }}');
    });

    it('leaves a template reference on an unrelated element alone', async () => {
        const html = firstHtmlPath();
        const source = '<other-thing #spinner></other-thing>\n<span>{{ spinner.size }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('warns about the derived members that became protected', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    read(spinner: KbqProgressSpinner) {\n' +
                '        return spinner.percentage + spinner.dashOffsetPercent + spinner.svgCircleRadius;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('percentage');
        expect(logged).toContain('dashOffsetPercent');
        expect(logged).toContain('svgCircleRadius');
    });

    it('warns about a view query returning the instance', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    readonly spinner = viewChild(KbqProgressSpinner);\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('double call');
    });

    it('reports the size narrowing and the numberAttribute change once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    read(spinner: KbqProgressSpinner) {\n' +
                '        return spinner.size;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('ProgressSpinnerSize');
        expect(summary).toContain('numberAttribute');
        expect(summary.match(/numberAttribute/g)!.length).toBe(1);
    });

    it('stays silent for a workspace that does not use the spinner', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
            'class Demo {\n' +
            '    read(spinner: KbqProgressSpinner) {\n' +
            '        return spinner.size;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
