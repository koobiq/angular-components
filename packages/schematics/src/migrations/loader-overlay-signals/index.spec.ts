import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'loader-overlay-signals';

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

    it('rewrites text and caption reads on a parameter typed KbqLoaderOverlay (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    read(loaderOverlay: KbqLoaderOverlay) {\n' +
                '        return loaderOverlay.text ?? loaderOverlay?.caption;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('loaderOverlay.text() ?? loaderOverlay?.caption()');
    });

    it('rewrites reads on a @ViewChild field (this.loaderOverlay)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqLoaderOverlay) loaderOverlay: KbqLoaderOverlay;\n' +
                '    read() {\n' +
                '        return this.loaderOverlay.text;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.loaderOverlay.text();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
            'class Other {\n' +
            "    text = 'x';\n" +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.text;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
            'class Demo {\n' +
            '    read(loaderOverlay: KbqLoaderOverlay) {\n' +
            '        return loaderOverlay.text();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the input is read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    write(loaderOverlay: KbqLoaderOverlay) {\n' +
                "        loaderOverlay.text = 'Loading';\n" +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain("loaderOverlay.text = 'Loading';");
    });

    it('rewrites template reference reads in an external template', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-loader-overlay #loaderOverlay />\n<span>{{ loaderOverlay.text }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ loaderOverlay.text() }}');
    });

    it('rewrites template reference reads inside an inline template', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "@Component({ template: '<kbq-loader-overlay #loaderOverlay></kbq-loader-overlay>{{ loaderOverlay.text }}' })\n" +
                'class Demo {}\n'
        );

        expect((await run()).readText(ts)).toContain('{{ loaderOverlay.text() }}');
    });

    it('leaves a template reference on an unrelated element alone', async () => {
        const html = firstHtmlPath();
        const source = '<other-thing #loaderOverlay></other-thing>\n<span>{{ loaderOverlay.text }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('warns about the template helpers that left the public surface', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    read(loaderOverlay: KbqLoaderOverlay) {\n' +
                '        return loaderOverlay.isEmpty + loaderOverlay.spinnerSize + loaderOverlay.externalText;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('isEmpty');
        expect(logged).toContain('spinnerSize');
        expect(logged).toContain('externalText');
    });

    it('warns about a view query returning the instance', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    readonly loaderOverlay = viewChild(KbqLoaderOverlay);\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('double call');
    });

    it('reports the optional inputs and the booleanAttribute change once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    read(loaderOverlay: KbqLoaderOverlay) {\n' +
                '        return loaderOverlay.text;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('string | undefined');
        expect(summary).toContain('booleanAttribute');
        expect(summary.match(/booleanAttribute/g)!.length).toBe(1);
    });

    it('stays silent for a workspace that does not use the loaderOverlay', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
            'class Demo {\n' +
            '    read(loaderOverlay: KbqLoaderOverlay) {\n' +
            '        return loaderOverlay.text;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
