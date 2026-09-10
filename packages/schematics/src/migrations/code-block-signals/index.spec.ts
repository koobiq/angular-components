import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import codeBlockSignals from './index';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'code-block-signals';

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
        return paths(projects.get([...projects.keys()][0])!).ts;
    }

    function firstHtmlPath(): string {
        return paths(projects.get([...projects.keys()][0])!).html;
    }

    it('rewrites reads on a receiver typed KbqCodeBlock', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
                'class Demo {\n' +
                '    read(block: KbqCodeBlock) {\n' +
                '        return block.softWrap && block.viewAll && block.files.length + block.activeFileIndex;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('block.softWrap() && block.viewAll()');
        expect(updated).toContain('block.files().length + block.activeFileIndex()');
    });

    it('rewrites a plain write to a set call', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
                'class Demo {\n' +
                '    write(block: KbqCodeBlock) {\n' +
                '        block.activeFileIndex = 2;\n' +
                '        block.softWrap = true;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('block.activeFileIndex.set(2);');
        expect(updated).toContain('block.softWrap.set(true);');
    });

    it('reports a compound assignment instead of rewriting it', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
            'class Demo {\n' +
            '    wrap = false;\n' +
            '    write(block: KbqCodeBlock) {\n' +
            '        block.softWrap ||= this.wrap;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        // `block.softWrap.set(block.softWrap() || this.wrap)` would spell the receiver twice.
        expect((await run()).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('left untouched');
    });

    it('rewrites a read under a negation rather than treating it as a write', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
                'class Demo {\n' +
                '    read(block: KbqCodeBlock) {\n' +
                '        return !block.softWrap;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return !block.softWrap();');
    });

    it('rewrites a read through a template reference variable', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-code-block #block="kbqCodeBlock" [files]="files" />\n' + '<div>{{ block.activeFileIndex }}</div>\n'
        );

        expect((await run()).readText(html)).toContain('{{ block.activeFileIndex() }}');
    });

    it('reports the backing inputs, which cannot be written any more', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
                'class Demo {\n' +
                '    read(block: KbqCodeBlock) {\n' +
                '        return block.softWrapInput;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('backing inputs now');
    });

    it('is idempotent - an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
            'class Demo {\n' +
            '    read(block: KbqCodeBlock) {\n' +
            '        block.softWrap.set(true);\n' +
            '        return block.softWrap();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a shadowing binding of another type alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
                'class Demo {\n' +
                '    blocks: { files: unknown[] }[] = [];\n' +
                '    read(block: KbqCodeBlock) {\n' +
                '        this.blocks.forEach((block: { files: unknown[] }) => console.log(block.files));\n' +
                '        return block.files;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('console.log(block.files)');
        expect(updated).toContain('return block.files();');
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
            'class Demo {\n' +
            '    read(block: KbqCodeBlock) {\n' +
            '        return block.softWrap;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
                'class Demo {\n' +
                '    read(block: KbqCodeBlock) {\n' +
                '        return block.softWrap;\n' +
                '    }\n' +
                '}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(runner.callRule(codeBlockSignals({ project: first }), appTree));

        expect(updated.readText(ts)).toContain('return block.softWrap();');
    });

    it('stays silent for a workspace that does not use the code block', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
