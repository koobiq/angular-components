import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
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
});
