import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'badge-signals';

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

    it('rewrites value-safe reads on a parameter typed KbqBadge (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    read(badge: KbqBadge) {\n' +
                '        return badge.compact && badge?.outline;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('badge.compact() && badge?.outline()');
    });

    it('rewrites reads on a @ViewChild field (this.badge)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqBadge) badge: KbqBadge;\n' +
                '    read() {\n' +
                '        return this.badge.compact;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.badge.compact();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
            'class Other {\n' +
            '    compact = false;\n' +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.compact;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
            'class Demo {\n' +
            '    read(badge: KbqBadge) {\n' +
            '        return badge.compact();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the inputs are read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    write(badge: KbqBadge) {\n' +
                '        badge.compact = true;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('badge.compact = true;');
    });

    it('rewrites template reference reads on <kbq-badge> in an external template', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-badge #badge>5</kbq-badge>\n<span>{{ badge.compact }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ badge.compact() }}');
    });

    it('rewrites template reference reads inside an inline template', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "@Component({ template: '<kbq-badge #badge></kbq-badge>{{ badge.outline }}' })\n" +
                'class Demo {}\n'
        );

        expect((await run()).readText(ts)).toContain('{{ badge.outline() }}');
    });

    it('leaves a template reference on an unrelated element alone', async () => {
        const html = firstHtmlPath();
        const source = '<other-thing #badge></other-thing>\n<span>{{ badge.compact }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('warns about badgeColor instead of rewriting it', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
            'class Demo {\n' +
            '    read(badge: KbqBadge) {\n' +
            '        return badge.badgeColor;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toContain('return badge.badgeColor;');
        expect(messages.join('\n')).toContain('kbq-badge_<color>');
    });

    it('warns about the members that became protected', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    read(badge: KbqBadge) {\n' +
                '        return badge.iconItem;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('iconItem');
    });

    it('warns about KbqBadgeCssStyler members that became private', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadgeCssStyler } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    read(styler: KbqBadgeCssStyler) {\n' +
                '        return styler.isIconButton;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('isIconButton');
    });

    it('warns about a view query returning the instance', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    readonly badge = viewChild(KbqBadge);\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('double call');
    });

    it('reports the booleanAttribute change once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    read(badge: KbqBadge) {\n' +
                '        return badge.compact;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('booleanAttribute');
        expect(summary.match(/booleanAttribute/g)!.length).toBe(1);
    });

    it('reports the summary for a template-only consumer with nothing to rewrite', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-badge compact>5</kbq-badge>\n');

        await run();

        expect(messages.join('\n')).toContain('booleanAttribute');
    });

    it('does not warn about KbqBadgeCssStyler for a bare module import', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadgeCssStyler } from '@koobiq/components/badge';\n" +
                'export const declarations = [KbqBadgeCssStyler];\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('implementation detail');
    });

    it('stays silent for a workspace that does not use the badge', async () => {
        await run();

        expect(messages.join('\n')).not.toContain('[badge-signals]');
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
            'class Demo {\n' +
            '    read(badge: KbqBadge) {\n' +
            '        return badge.compact;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
