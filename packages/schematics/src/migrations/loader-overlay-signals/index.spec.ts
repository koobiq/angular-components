import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import loaderOverlaySignals from './index';
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

    it('advises the optional spelling for a signal query without .required', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    readonly loaderOverlay = viewChild(KbqLoaderOverlay);\n' +
                '    read() {\n' +
                '        return this.loaderOverlay.text;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.loaderOverlay.text;');
        expect(messages.join('\n')).toContain('this.overlay()?.text()');
    });

    it('advises the plain spelling for a .required signal query', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    readonly loaderOverlay = viewChild.required(KbqLoaderOverlay);\n' +
                '    read() {\n' +
                '        return this.loaderOverlay.text;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('this.overlay().text()');
        expect(messages.join('\n')).not.toContain('?.text()');
    });

    it('does not warn about two calls for the decorator query form, which is auto-fixed', async () => {
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

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.loaderOverlay.text();');
        expect(messages.join('\n')).not.toContain('needs two calls');
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

    it('reports the summary for a template-only consumer with nothing to rewrite', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-loader-overlay transparent />\n');

        await run();

        expect(messages.join('\n')).toContain('booleanAttribute');
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
    it('reports a programmatic write instead of passing over it silently', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    write(overlay: KbqLoaderOverlay) {\n' +
                "        overlay.text = 'Loading';\n" +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain("overlay.text = 'Loading';");
        expect(messages.join('\n')).toContain('a programmatic write no longer compiles');
    });

    it('leaves a compound assignment alone instead of appending () to its target', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    write(overlay: KbqLoaderOverlay) {\n' +
                "        overlay.text += ' (retrying)';\n" +
                "        overlay.caption ??= 'Loading';\n" +
                '        delete (overlay as any).text;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain("overlay.text += ' (retrying)';");
        expect(updated).toContain("overlay.caption ??= 'Loading';");
        expect(updated).toContain('delete (overlay as any).text;');
    });

    it('leaves a callback parameter that shadows the receiver name alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'interface Row {\n' +
                '    text: string;\n' +
                '}\n' +
                'class Demo {\n' +
                '    render(overlay: KbqLoaderOverlay, rows: Row[]) {\n' +
                '        return rows.map((overlay: Row) => overlay.text).concat(overlay.text);\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('rows.map((overlay: Row) => overlay.text)');
        expect(updated).toContain('.concat(overlay.text())');
    });

    it('does not let a parameter in a type position widen the receiver scope to the file', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'export type OverlayReady = (overlay: KbqLoaderOverlay) => void;\n' +
                'export class Grid {\n' +
                '    render(overlay: { text: string }) {\n' +
                '        return overlay.text;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return overlay.text;');
    });

    it('rewrites reads on an inject() receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { inject } from '@angular/core';\n" +
                "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    private readonly overlay = inject(KbqLoaderOverlay);\n' +
                '    read() {\n' +
                '        return this.overlay.caption;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.overlay.caption();');
    });

    it('reports a union-typed field it cannot resolve to a receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqLoaderOverlay) overlay: KbqLoaderOverlay | undefined;\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('cannot resolve to a single receiver');
    });

    it('calls the content queries private rather than protected', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    read(overlay: KbqLoaderOverlay) {\n' +
                '        return [overlay.externalText, overlay.isEmpty];\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const log = messages.join('\n');

        expect(log).toContain('content queries are `private` now');
        expect(log).toContain('members are `protected` now: isEmpty');
    });

    it('rewrites an optional-chain read through a template reference', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-loader-overlay #overlay />\n<span>{{ overlay?.text }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ overlay?.text() }}');
    });

    it('leaves a template assignment target alone', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-loader-overlay #overlay />\n' + '<button (click)="overlay.text = null">clear</button>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a @for variable that shares the ref name alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-loader-overlay #overlay />\n' +
            '@for (overlay of overlays; track overlay.id) {\n' +
            '    <span>{{ overlay.text }}</span>\n' +
            '}\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves prose, comments, links and static attributes that mention the ref alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-loader-overlay #overlay />\n' +
            '<p>Set overlay.text to change the label.</p>\n' +
            '<!-- overlay.text is the input -->\n' +
            '<a href="/api#overlay.text">docs</a>\n' +
            '<span data-doc="overlay.text"></span>\n' +
            '<span>{{ vm.overlay.text }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('reports a hidden member read through a template reference', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-loader-overlay #o />\n<span>{{ o.isEmpty }}</span>\n');

        await run();

        expect(messages.join('\n')).toContain('members are `protected` now: isEmpty');
    });

    it('reports a valueless transparent attribute per file', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-loader-overlay transparent />\n');

        await run();

        const log = messages.join('\n');

        expect(log).toContain('renders the transparent background now');
        // The file is a consumer even though nothing in it was rewritten, so the summary prints too.
        expect(log).toContain('booleanAttribute');
    });

    it('does not report transparent when the attribute is bound', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-loader-overlay [transparent]="flag" />\n');

        await run();

        expect(messages.join('\n')).not.toContain('renders the transparent background now');
    });

    it('reports a template that renders the overlay but cannot be parsed', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-loader-overlay #o>text</div>\n');

        await run();

        expect(messages.join('\n')).toContain('could not be parsed');
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            "import { KbqLoaderOverlay } from '@koobiq/components/loader-overlay';\n" +
                'class Demo {\n' +
                '    read(overlay: KbqLoaderOverlay) {\n' +
                '        return overlay.text;\n' +
                '    }\n' +
                '}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(
            runner.callRule(loaderOverlaySignals({ project: first } as Schema), appTree)
        );

        expect(updated.readText(ts)).toContain('return overlay.text();');
        expect(messages.join('\n')).not.toContain('would update');
    });
});
