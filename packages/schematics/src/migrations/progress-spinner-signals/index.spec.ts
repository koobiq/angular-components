import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import progressSpinnerSignals from './index';
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

    it('leaves reads on a same-named receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        // The unrelated receiver shares the spinner's name on purpose: with a different name the case
        // passes even when the type check is gone entirely.
        const source =
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
            'class Other {\n' +
            "    size = 'big';\n" +
            '}\n' +
            'class Demo {\n' +
            '    read(spinner: Other) {\n' +
            '        return spinner.size;\n' +
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
        // The spinner is rendered too, so the template passes the element guard and the case actually
        // exercises the collector rather than bailing before it.
        const source =
            '<kbq-progress-spinner />\n' +
            '<other-thing #spinner></other-thing>\n' +
            '<span>{{ spinner.size }}</span>\n';

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

    it('reports the summary for a template-only consumer with nothing to rewrite', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-progress-spinner value="40" />\n');

        await run();

        expect(messages.join('\n')).toContain('numberAttribute');
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
    it('rewrites the id, value and mode reads that became signals in 20.0.0', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    read(spinner: KbqProgressSpinner) {\n' +
                '        return [spinner.id, spinner.value, spinner.mode];\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('[spinner.id(), spinner.value(), spinner.mode()]');
    });

    it('leaves a compound assignment alone instead of appending () to its target', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    write(spinner: KbqProgressSpinner) {\n' +
                '        spinner.value += 1;\n' +
                '        spinner.value++;\n' +
                "        spinner.size ||= 'big';\n" +
                '        delete (spinner as any).mode;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('spinner.value += 1;');
        expect(updated).toContain('spinner.value++;');
        expect(updated).toContain("spinner.size ||= 'big';");
        expect(updated).toContain('delete (spinner as any).mode;');
    });

    it('does not let a parameter in a type position widen the receiver scope to the file', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'export type SpinnerReady = (spinner: KbqProgressSpinner) => void;\n' +
                'export class Grid {\n' +
                '    layout(spinner: { size: number }) {\n' +
                '        return spinner.size * 2;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return spinner.size * 2;');
    });

    it('leaves a local that shadows the receiver name alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    read(spinner: KbqProgressSpinner) {\n' +
                '        const inner = () => {\n' +
                "            const spinner = { size: 'plain' };\n" +
                '            return spinner.size;\n' +
                '        };\n' +
                '        return inner() + spinner.size;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain("const spinner = { size: 'plain' };");
        expect(updated.match(/spinner\.size\(\)/g)!.length).toBe(1);
    });

    it('rewrites and reports through a union-typed field', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqProgressSpinner) spinner: KbqProgressSpinner | undefined;\n' +
                '    read() {\n' +
                '        return this.spinner!.percentage;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('cannot resolve to a single receiver');
    });

    it('rewrites reads on an inject() receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { inject } from '@angular/core';\n" +
                "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    private readonly spinner = inject(KbqProgressSpinner);\n' +
                '    read() {\n' +
                '        return this.spinner.size;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.spinner.size();');
    });

    it('reports a protected read through an inject() receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { inject } from '@angular/core';\n" +
                "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    private readonly spinner = inject(KbqProgressSpinner);\n' +
                '    read() {\n' +
                '        return this.spinner.percentage;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('are `protected` now');
    });

    it('leaves a signal-query receiver to the warning rather than half-migrating it', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    readonly spinner = viewChild(KbqProgressSpinner);\n' +
                '    read() {\n' +
                '        return this.spinner.size;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.spinner.size;');
        expect(messages.join('\n')).toContain('double call');
    });

    it('does not warn about a double call for the decorator query form, which is auto-fixed', async () => {
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

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.spinner.size();');
        expect(messages.join('\n')).not.toContain('double call');
    });

    it('leaves a template assignment target alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-progress-spinner #spinner />\n' + '<button (click)="spinner.size = \'big\'">grow</button>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a @for variable that shares the ref name alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-progress-spinner #spinner />\n' +
            '@for (spinner of rows; track spinner) {\n' +
            '    <span>{{ spinner.size }}</span>\n' +
            '}\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a member access on something else that ends in the ref name alone', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-progress-spinner #spinner />\n<span [cfg]="state.spinner.size"></span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves prose, comments and attribute strings that mention the ref alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-progress-spinner #spinner />\n' +
            '<!-- spinner.size is derived -->\n' +
            '<p>Read spinner.size to get the size.</p>\n' +
            '<img alt="spinner.size" />\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a ref bound to another directive through exportAs alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-progress-spinner #spinner="cdkOverlayOrigin" cdkOverlayOrigin />\n' +
            '<span>{{ spinner.size }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('reports a protected member read through a template reference', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-progress-spinner #s />\n<span>{{ s.percentage }}</span>\n');

        await run();

        expect(messages.join('\n')).toContain('are `protected` now');
    });

    it('reports a template that renders the spinner but cannot be parsed', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-progress-spinner #s>5</div>\n');

        await run();

        expect(messages.join('\n')).toContain('could not be parsed');
    });

    it('reports the summary for a template whose only usage is a plain binding', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-progress-spinner [value]="42" />\n');

        await run();

        expect(messages.join('\n')).toContain('numberAttribute');
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            "import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';\n" +
                'class Demo {\n' +
                '    read(spinner: KbqProgressSpinner) {\n' +
                '        return spinner.size;\n' +
                '    }\n' +
                '}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(
            runner.callRule(progressSpinnerSignals({ project: first } as Schema), appTree)
        );

        expect(updated.readText(ts)).toContain('return spinner.size();');
        expect(messages.join('\n')).not.toContain('would update');
    });
});
