import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import linkSignals from './index';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'link-signals';

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

    it('rewrites disabled reads on a parameter typed KbqLink (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    read(link: KbqLink) {\n' +
                '        return link.disabled ?? link?.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('link.disabled() ?? link?.disabled()');
    });

    it('rewrites reads on a @ViewChild field (this.link)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqLink) link: KbqLink;\n' +
                '    read() {\n' +
                '        return this.link.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.link.disabled();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqLink } from '@koobiq/components/link';\n" +
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
            "import { KbqLink } from '@koobiq/components/link';\n" +
            'class Demo {\n' +
            '    read(link: KbqLink) {\n' +
            '        return link.disabled();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the input is read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    write(link: KbqLink) {\n' +
                '        link.disabled = true;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('link.disabled = true;');
    });

    it('warns about the icon and print bookkeeping that left the public surface', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    read(link: KbqLink) {\n' +
                '        return link.hasIcon + link.printMode + link.printUrl;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('hasIcon');
        expect(logged).toContain('printMode');
        expect(logged).toContain('printUrl');
    });

    it('warns about a read through a signal query instead of rewriting it', async () => {
        const ts = firstTsPath();
        const source =
            "import { viewChild } from '@angular/core';\n" +
            "import { KbqLink } from '@koobiq/components/link';\n" +
            'class Demo {\n' +
            '    readonly link = viewChild(KbqLink);\n' +
            '    read() {\n' +
            '        return this.link.disabled;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        // A single `()` would be wrong in both halves: the query is a signal holding the directive.
        expect((await run()).readText(ts)).toBe(source);

        const logged = messages.join('\n');

        expect(logged).toContain('double call');
        expect(logged).toContain('this.link()?.disabled()');
    });

    it('drops the `?.` from the advice for a required signal query', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    readonly link = viewChild.required(KbqLink);\n' +
                '    read() {\n' +
                '        return this.link.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('this.link().disabled()');
    });

    it('reports a compound assignment instead of rewriting it into invalid syntax', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqLink } from '@koobiq/components/link';\n" +
            'class Demo {\n' +
            '    formDisabled = false;\n' +
            '    write(link: KbqLink) {\n' +
            '        link.disabled ||= this.formDisabled;\n' +
            '        link.disabled &&= this.formDisabled;\n' +
            '        link.disabled ??= this.formDisabled;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        // `link.disabled() ||= x` is not assignable to, so the file would stop parsing.
        expect((await run()).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('a programmatic write no longer compiles');
    });

    it('reports an increment instead of rewriting it into invalid syntax', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqLink } from '@koobiq/components/link';\n" +
            'class Demo {\n' +
            '    write(link: KbqLink) {\n' +
            '        link.tabIndex++;\n' +
            '        --link.tabIndex;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('a programmatic write no longer compiles');
    });

    it('leaves a shadowing binding of another type alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqButton } from '@koobiq/components/button';\n" +
                "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    buttons: KbqButton[] = [];\n' +
                '    read(link: KbqLink) {\n' +
                '        this.buttons.forEach((link: KbqButton) => console.log(link.disabled));\n' +
                '        return link.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        // The inner `link` is a KbqButton, whose `disabled` stays a plain boolean.
        expect(updated).toContain('console.log(link.disabled)');
        expect(updated).toContain('return link.disabled();');
    });

    it('rewrites a read through a non-null assertion, a cast and parentheses', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqLink) link!: KbqLink;\n' +
                '    read(other: KbqLink) {\n' +
                '        return !this.link!.disabled && (other).disabled && (other as KbqLink).disabled;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('!this.link!.disabled()');
        expect(updated).toContain('(other).disabled()');
        expect(updated).toContain('(other as KbqLink).disabled()');
    });

    it('reports the members that were removed outright, including the lifecycle hook', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo extends KbqLink {\n' +
                '    read(link: KbqLink) {\n' +
                '        link.ngAfterContentInit();\n' +
                '        return link.icon ?? link.destroyRef;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('ngAfterContentInit');
        expect(logged).toContain('are gone');
    });

    it('reports the members that became private separately from the protected ones', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    read(link: KbqLink) {\n' +
                '        return link.icons.length + link.nativeElement.id;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('`private` now');
        expect(logged).toContain('getHostElement()');
    });

    it('reports the disabled caveat next to the file it rewrote', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    read(link: KbqLink) {\n' +
                '        return link.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const fileReport = messages.find((message) => message.includes(ts))!;

        expect(fileReport).toContain('disabledSignal');
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    read(link: KbqLink) {\n' +
                '        return link.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(runner.callRule(linkSignals({ project: first } as Schema), appTree));

        expect(updated.readText(ts)).toContain('return link.disabled();');
        expect(messages.join('\n')).not.toContain('would update');
    });

    it('warns about tabIndex instead of rewriting it', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqLink } from '@koobiq/components/link';\n" +
            'class Demo {\n' +
            '    read(link: KbqLink) {\n' +
            '        return link.tabIndex;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toContain('return link.tabIndex;');
        expect(messages.join('\n')).toContain('disabled state');
    });

    it('warns about a write to the write-only print input', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    write(link: KbqLink) {\n' +
                "        link.print = 'https://koobiq.io';\n" +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('write-only input');
    });

    it('reports the print and disabledSignal notes once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    read(link: KbqLink) {\n' +
                '        return link.disabled;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('kbq-link_print');
        expect(summary).toContain('disabledSignal()');
        expect(summary.match(/kbq-link_print/g)!.length).toBe(1);
    });

    it('stays silent for a workspace that does not use the link', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqLink } from '@koobiq/components/link';\n" +
            'class Demo {\n' +
            '    read(link: KbqLink) {\n' +
            '        return link.disabled;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
