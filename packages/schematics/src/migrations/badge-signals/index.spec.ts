import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import badgeSignals from './index';
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
        // Not `kbq-badge_<color>`: the per-project summary carries that string too, so the assertion would
        // pass with the receiver warning gone entirely.
        expect(messages.join('\n')).toContain('read it as `badge.badgeColor()`');
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

        // Not `isIconButton`: the file-scoped KbqBadgeCssStyler pattern names it too, so the assertion would
        // pass with the receiver-scoped warning gone entirely.
        expect(messages.join('\n')).toContain('These KbqBadgeCssStyler members are now `private`: isIconButton');
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

    it('warns about a view query that prettier wrapped across lines', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    readonly badge = viewChild(\n' +
                '        KbqBadge\n' +
                '    );\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('double call');
    });

    it('does not warn about a double call for the decorator query form, which is auto-fixed', async () => {
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
        expect(messages.join('\n')).not.toContain('double call');
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
    it('leaves a compound assignment alone instead of appending () to its target', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    write(badge: KbqBadge) {\n' +
                '        badge.compact ||= true;\n' +
                '        badge.outline &&= false;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('badge.compact ||= true;');
        expect(updated).toContain('badge.outline &&= false;');
    });

    it('leaves an increment on a signal member alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    write(badge: KbqBadge) {\n' +
                '        badge.compact++;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('badge.compact++;');
    });

    it('leaves a local that shadows the receiver name alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    read(badge: KbqBadge) {\n' +
                '        const inner = () => {\n' +
                "            const badge = { compact: 'plain' };\n" +
                '            return badge.compact;\n' +
                '        };\n' +
                '        return inner() + badge.compact;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain("const badge = { compact: 'plain' };");
        expect(updated.match(/badge\.compact\(\)/g)!.length).toBe(1);
    });

    it('leaves `this.badge` inside a nested function alone — it is a different `this`', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqBadge) badge: KbqBadge;\n' +
                '    read() {\n' +
                '        function inner(this: { badge: { compact: string } }) {\n' +
                '            return this.badge.compact;\n' +
                '        }\n' +
                '        return inner.call(this as any) + this.badge.compact;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated.match(/this\.badge\.compact\(\)/g)!.length).toBe(1);
    });

    it('does not let a parameter of a method signature widen the receiver scope to the file', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'interface Api {\n' +
                '    read(badge: KbqBadge): void;\n' +
                '}\n' +
                'class Demo implements Api {\n' +
                '    read(badge: any) {\n' +
                '        return badge.compact;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return badge.compact;');
    });

    it('reports a KbqBadge mention it cannot resolve to a single receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { QueryList, ViewChildren } from '@angular/core';\n" +
                "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    @ViewChildren(KbqBadge) badges: QueryList<KbqBadge>;\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('cannot resolve to a single receiver');
    });

    it('does not report an unresolved mention for a plainly annotated receiver', async () => {
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

        expect(messages.join('\n')).not.toContain('cannot resolve to a single receiver');
    });

    it('leaves a member access on something else that ends in the ref name alone', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-badge #badge>5</kbq-badge>\n<span>{{ item.badge.compact }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves prose and comments that merely mention the ref alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-badge #badge>5</kbq-badge>\n' +
            '<!-- badge.compact is a signal now -->\n' +
            '<p>Read badge.compact as a call.</p>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a template assignment target alone', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-badge #badge></kbq-badge>\n<button (click)="badge.compact = true">x</button>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('skips a ref whose name a @for variable also introduces', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-badge #badge>5</kbq-badge>\n' +
            '@for (badge of items; track badge) {\n' +
            '    <span>{{ badge.compact }}</span>\n' +
            '}\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('reports badgeColor read through a template reference', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-badge #badge [class]="badge.badgeColor">5</kbq-badge>\n');

        await run();

        expect(messages.join('\n')).toContain('read it as `badge.badgeColor()`');
    });

    it('reports a template that renders the badge but cannot be parsed', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-badge #badge>5</div>\n');

        await run();

        expect(messages.join('\n')).toContain('could not be parsed');
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    read(badge: KbqBadge) {\n' +
                '        return badge.compact;\n' +
                '    }\n' +
                '}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(runner.callRule(badgeSignals({ project: first } as Schema), appTree));

        expect(updated.readText(ts)).toContain('return badge.compact();');
        expect(messages.join('\n')).not.toContain('would update');
    });
    it('rewrites a read behind a non-null assertion', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqBadge) badge?: KbqBadge;\n' +
                '    read() {\n' +
                '        return this.badge!.compact;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.badge!.compact();');
    });

    it('rewrites reads on a receiver imported under an alias', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge as Badge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    read(badge: Badge) {\n' +
                '        return badge.compact;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return badge.compact();');
    });

    it('reports an index access it cannot rewrite', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    read(badge: KbqBadge) {\n' +
                "        return badge['compact'];\n" +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('cannot resolve to a single receiver');
    });

    it('reports a destructured read it cannot rewrite', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqBadge } from '@koobiq/components/badge';\n" +
                'class Demo {\n' +
                '    read(badge: KbqBadge) {\n' +
                '        const { compact } = badge;\n' +
                '        return compact;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('cannot resolve to a single receiver');
    });

    it('leaves a ref read outside the embedded view that declares it alone', async () => {
        const html = firstHtmlPath();
        const source =
            '@if (visible) {\n' +
            '    <kbq-badge #badge>5</kbq-badge>\n' +
            '}\n' +
            '<span>{{ badge.compact }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('still rewrites a ref read inside the embedded view that declares it', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '@if (visible) {\n' + '    <kbq-badge #badge>{{ badge.compact }}</kbq-badge>\n' + '}\n'
        );

        expect((await run()).readText(html)).toContain('{{ badge.compact() }}');
    });
});
