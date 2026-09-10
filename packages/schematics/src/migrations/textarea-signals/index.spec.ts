import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import textareaSignals from './index';
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

    function firstHtmlPath(): string {
        const [first] = projects.keys();

        return paths(projects.get(first)!).html;
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
            '    read(textarea: KbqTextarea, other: Other) {\n' +
            '        return textarea.maxRows + other.maxRows;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        const updated = (await run()).readText(ts);

        // Only the textarea receiver is rewritten; `other.maxRows` is a plain number on an unrelated class.
        expect(updated).toContain('textarea.maxRows() + other.maxRows');
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
        expect(messages.join('\n')).toContain('read-only InputSignal');
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

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
                'class Demo {\n' +
                '    read(textarea: KbqTextarea) {\n' +
                '        return textarea.maxRows;\n' +
                '    }\n' +
                '}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(runner.callRule(textareaSignals({ project: first }), appTree));

        expect(updated.readText(ts)).toContain('return textarea.maxRows();');
    });

    it('reports a compound assignment instead of rewriting it into invalid syntax', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
            'class Demo {\n' +
            '    rows = 2;\n' +
            '    write(textarea: KbqTextarea) {\n' +
            '        textarea.maxRows += 4;\n' +
            '        textarea.maxRows ??= this.rows;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        // `textarea.maxRows() += 4` is not assignable to, so the file would stop parsing.
        expect((await run()).readText(ts)).toBe(source);
    });

    it('reports an increment and a delete instead of rewriting them', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
            'class Demo {\n' +
            '    write(textarea: KbqTextarea) {\n' +
            '        textarea.maxRows++;\n' +
            '        delete (textarea as any).maxRows;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('rewrites a read under a negation rather than treating it as a write', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
                'class Demo {\n' +
                '    read(textarea: KbqTextarea) {\n' +
                '        return !textarea.maxRowLimitReached;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return !textarea.maxRowLimitReached();');
    });

    it('warns about freeRowsHeight instead of rewriting it', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
            'class Demo {\n' +
            '    read(textarea: KbqTextarea) {\n' +
            '        return textarea.freeRowsHeight;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        // The old `ngOnInit` assigned the measured line height into the input, so a mechanical `()` would
        // compile and start reporting `undefined`.
        expect((await run()).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('freeRowsHeight');
    });

    it('warns about a detached reference to grow', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTextarea } from '@koobiq/components/textarea';\n" +
                'class Demo {\n' +
                '    schedule(textarea: KbqTextarea) {\n' +
                '        setTimeout(textarea.grow, 0);\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('prototype method');
    });

    it('rewrites a read through a template reference variable', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<textarea kbqTextarea #t="kbqTextarea" [maxRows]="5"></textarea>\n' +
                '<div [class.at-limit]="t.maxRowLimitReached">{{ t.maxRows }}</div>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('[class.at-limit]="t.maxRowLimitReached()"');
        expect(updated).toContain('{{ t.maxRows() }}');
    });

    it('reports a value-changed member read through a template reference', async () => {
        const html = firstHtmlPath();
        const source = '<textarea kbqTextarea #t="kbqTextarea"></textarea>\n<div>{{ t.canGrow }}</div>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
        expect(messages.join('\n')).toContain('canGrow');
    });
});
