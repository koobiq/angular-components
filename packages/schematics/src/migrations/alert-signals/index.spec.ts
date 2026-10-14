import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'alert-signals';

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

    it('rewrites value-safe reads on a parameter typed KbqAlert (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    read(alert: KbqAlert) {\n' +
                '        return alert.compact && alert?.alertStyle;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('alert.compact() && alert?.alertStyle()');
    });

    it('rewrites reads on a @ViewChild field (this.alert)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqAlert) alert: KbqAlert;\n' +
                '    get dense() {\n' +
                '        return this.alert.compact;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.alert.compact();');
    });

    it('does NOT auto-rewrite alertColor, but warns about its value change and read-only nature', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
            'class Demo {\n' +
            '    read(alert: KbqAlert) {\n' +
            '        return alert.alertColor;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        const updated = (await run()).readText(ts);

        // left untouched (no blind `()` append that would silently change the value)
        expect(updated).toContain('return alert.alertColor;');
        expect(updated).not.toContain('alert.alertColor()');
        expect(messages.join('\n')).toContain('`alertColor` is now a read-only InputSignal');
    });

    it('leaves an assignment to a read-only signal input and reports it', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    densify(alert: KbqAlert) {\n' +
                '        alert.compact = true;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('alert.compact = true;');
        expect(messages.join('\n')).toContain('`compact` can no longer be assigned');
    });

    it('leaves a compound write or an increment in code alone and reports it', async () => {
        const ts = firstTsPath();
        const body =
            '        alert.compact ||= true;\n' + "        alert.alertStyle += '';\n" + '        alert.compact++;\n';

        appTree.overwrite(
            ts,
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    densify(alert: KbqAlert) {\n' +
                body +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain(body);
        expect(messages.join('\n')).toContain('`compact`, `alertStyle` can no longer be assigned');
    });

    it('leaves a nested declaration that shadows a typed receiver alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    read(alert: KbqAlert) {\n' +
                '        const sizes = [1].map((alert: { compact: boolean; icon: string }) => {\n' +
                '            alert.compact = true;\n' +
                '            return alert.icon;\n' +
                '        });\n' +
                '        return [alert.alertStyle, sizes];\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);
        const all = messages.join('\n');

        expect(updated).toContain('            alert.compact = true;\n');
        expect(updated).toContain('return [alert.alertStyle(), sizes];');
        expect(all).not.toContain('can no longer be assigned');
        expect(all).not.toContain('now `protected`');
    });

    it('leaves this.<field> inside a function that rebinds this alone, and rewrites it inside an arrow', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    alert: KbqAlert;\n' +
                '    read() {\n' +
                '        [1].forEach(function (this: any) {\n' +
                '            return this.alert.compact;\n' +
                '        });\n' +
                '        return [1].map(() => this.alert.compact);\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('            return this.alert.compact;\n');
        expect(updated).toContain('return [1].map(() => this.alert.compact());');
    });

    it('rewrites reads on a receiver typed by inject()', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { inject } from '@angular/core';\n" +
                "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    private readonly alert = inject(KbqAlert);\n' +
                '    read() {\n' +
                '        return this.alert.compact;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.alert.compact();');
    });

    it('warns about now-protected content-query members read on an alert receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    peek(alert: KbqAlert) {\n' +
                '        return alert.icon || alert.isColored;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const all = messages.join('\n');

        expect(all).toContain('now `protected`');
        expect(all).toContain('icon');
        expect(all).toContain('isColored');
    });

    it('leaves unrelated .compact / .alertStyle on non-alert receivers untouched', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
            'class Demo {\n' +
            '    other(alert: KbqAlert) {\n' +
            '        const cfg = { compact: true };\n' +
            '        return cfg.compact;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return cfg.compact;');
        expect(updated).not.toContain('cfg.compact()');
    });

    it('is idempotent — a second run does not double the call', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    read(alert: KbqAlert) {\n' +
                '        return alert.compact;\n' +
                '    }\n' +
                '}\n'
        );

        const once = (await run()).readText(ts);

        appTree.overwrite(ts, once);

        const twice = (await run()).readText(ts);

        expect(twice).toBe(once);
        expect(twice).not.toContain('compact()()');
    });

    it('rewrites reads via a template reference variable on <kbq-alert>', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-alert #alert></kbq-alert>\n' + '<span>{{ alert.compact }}</span>\n');

        const updated = (await run()).readText(html);

        expect(updated).toContain('{{ alert.compact() }}');
    });

    it('rewrites reads via a template reference variable naming kbqAlert', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-alert #alert="kbqAlert"></kbq-alert>\n<span>{{ alert.alertStyle }}</span>\n');

        const updated = (await run()).readText(html);

        expect(updated).toContain('{{ alert.alertStyle() }}');
    });

    it('leaves a property chain that ends in the name of a ref alone', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-alert #alert></kbq-alert>\n<span>{{ state.alert.compact }} {{ alert.compact }}</span>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('{{ state.alert.compact }} {{ alert.compact() }}');
    });

    it('leaves a write through a ref to a read-only member and reports it', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-alert #alert></kbq-alert>\n<button (click)="alert.compact = !alert.compact">Toggle</button>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('(click)="alert.compact = !alert.compact()"');
        expect(messages.join('\n')).toContain('`compact` can no longer be assigned');
    });

    it('leaves reads via a template reference variable naming another directive on <kbq-alert> untouched', async () => {
        const html = firstHtmlPath();
        const template =
            '<kbq-alert #model="ngModel" cdkOverlayOrigin #origin="cdkOverlayOrigin"></kbq-alert>\n' +
            '<span>{{ model.compact }} {{ origin.alertStyle }}</span>\n';

        appTree.overwrite(html, template);

        const updated = (await run()).readText(html);

        expect(updated).toBe(template);
    });

    it('leaves a ref named in prose, a comment or a plain attribute alone', async () => {
        const html = firstHtmlPath();
        const template =
            '<kbq-alert #alert></kbq-alert>\n' +
            '<!-- alert.compact is read below -->\n' +
            '<p title="Use alert.compact for dense views">alert.compact = true makes it dense</p>\n' +
            '<span>{{ alert.compact }}</span>\n';

        appTree.overwrite(html, template);

        expect((await run()).readText(html)).toBe(template.replace('{{ alert.compact }}', '{{ alert.compact() }}'));
        expect(messages.join('\n')).not.toContain('can no longer be assigned');
    });

    it('leaves the reads of a @for variable that shares the name of a ref alone', async () => {
        const html = firstHtmlPath();
        const template =
            '<kbq-alert #alert></kbq-alert>\n' +
            '@for (alert of alerts; track alert.id) {\n' +
            '    <span>{{ alert.compact }}</span>\n' +
            '}\n';

        appTree.overwrite(html, template);

        expect((await run()).readText(html)).toBe(template);
    });

    it('warns that KbqAlertModule no longer re-exports A11yModule / PlatformModule', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAlertModule } from '@koobiq/components/alert';\n" + 'const mods = [KbqAlertModule];\n'
        );

        await run();

        expect(messages.join('\n')).toContain('KbqAlertModule no longer re-exports');
    });

    it('does not write files in dry-run mode (fix = false) but reports would-update', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
            'class Demo {\n' +
            '    read(alert: KbqAlert) {\n' +
            '        return alert.compact;\n' +
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
            "import { KbqAlert } from '@koobiq/components/alert';\n" +
                'class Demo {\n' +
                '    read(alert: KbqAlert) {\n' +
                '        return alert.compact;\n' +
                '    }\n' +
                '}\n'
        );

        // Run from migrations.json with no options, as `ng update` does: no schema default applies there.
        const migrationsRunner = new SchematicTestRunner('migrations', migrationsPath);

        migrationsRunner.logger.subscribe((entry) => messages.push(entry.message));

        const updated = await migrationsRunner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        expect(updated.readText(ts)).toContain('return alert.compact();');
        expect(messages.join('\n')).not.toContain('would update');
    });
});
