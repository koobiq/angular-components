import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
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

    it('warns about a view query returning the instance', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqLink } from '@koobiq/components/link';\n" +
                'class Demo {\n' +
                '    readonly link = viewChild(KbqLink);\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('double call');
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
