import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'textarea-signals';

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

    it('rewrites maxRows reads on a parameter typed KbqTextarea (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
                'class Demo {\n' +
                '    read(textarea: KbqTextarea) {\n' +
                '        return textarea.maxRows ?? textarea?.maxRows;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('textarea.maxRows() ?? textarea?.maxRows()');
    });

    it('rewrites reads on a @ViewChild field (this.textarea)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqTextarea) textarea: KbqTextarea;\n' +
                '    read() {\n' +
                '        return this.textarea.maxRows;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.textarea.maxRows();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
            'class Other {\n' +
            '    maxRows = 3;\n' +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.maxRows;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
            'class Demo {\n' +
            '    read(textarea: KbqTextarea) {\n' +
            '        return textarea.maxRows();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the input is read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
                'class Demo {\n' +
                '    write(textarea: KbqTextarea) {\n' +
                '        textarea.maxRows = 3;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('textarea.maxRows = 3;');
    });

    it('warns about canGrow instead of rewriting it', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
            'class Demo {\n' +
            '    read(textarea: KbqTextarea) {\n' +
            '        return textarea.canGrow;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toContain('return textarea.canGrow;');
        expect(messages.join('\n')).toContain('maxRows');
    });

    it('warns about a write to freeRowsHeight', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
                'class Demo {\n' +
                '    resize(textarea: KbqTextarea) {\n' +
                '        textarea.freeRowsHeight = 20;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('read-only signal inputs');
    });

    it('reports the optional types, the self-write and the id shape once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
                'class Demo {\n' +
                '    read(textarea: KbqTextarea) {\n' +
                '        return textarea.maxRows;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('number | undefined');
        expect(summary).toContain('no longer writes itself');
        expect(summary).toContain('_IdGenerator');
        expect(summary.match(/_IdGenerator/g)!.length).toBe(1);
    });

    it('stays silent for a workspace that does not use the textarea', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
            'class Demo {\n' +
            '    read(textarea: KbqTextarea) {\n' +
            '        return textarea.maxRows;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
