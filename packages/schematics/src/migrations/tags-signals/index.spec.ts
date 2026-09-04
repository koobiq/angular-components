import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'tags-signals';

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

    it('rewrites addOnBlur reads on a parameter typed KbqTagInput (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTagInput } from '@koobiq/components/tags';\n" +
                'class Demo {\n' +
                '    read(tagInput: KbqTagInput) {\n' +
                '        return tagInput.addOnBlur ?? tagInput?.addOnBlur;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('tagInput.addOnBlur() ?? tagInput?.addOnBlur()');
    });

    it('rewrites reads on a @ViewChild field (this.tagInput)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqTagInput } from '@koobiq/components/tags';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqTagInput) tagInput: KbqTagInput;\n' +
                '    read() {\n' +
                '        return this.tagInput.addOnBlur;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.tagInput.addOnBlur();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTagInput } from '@koobiq/components/tags';\n" +
            'class Other {\n' +
            '    addOnBlur = false;\n' +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.addOnBlur;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTagInput } from '@koobiq/components/tags';\n" +
            'class Demo {\n' +
            '    read(tagInput: KbqTagInput) {\n' +
            '        return tagInput.addOnBlur();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the input is read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTagInput } from '@koobiq/components/tags';\n" +
                'class Demo {\n' +
                '    write(tagInput: KbqTagInput) {\n' +
                '        tagInput.addOnBlur = true;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('tagInput.addOnBlur = true;');
    });

    it('rewrites separators reads too', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTagInput } from '@koobiq/components/tags';\n" +
                'class Demo {\n' +
                '    read(tagInput: KbqTagInput) {\n' +
                '        return tagInput.separators.length;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return tagInput.separators().length;');
    });

    it('warns about a write to separatorKeyCodes', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTagInput } from '@koobiq/components/tags';\n" +
                'class Demo {\n' +
                '    configure(tagInput: KbqTagInput) {\n' +
                '        tagInput.separatorKeyCodes = [13];\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('read-only signal inputs');
    });

    it('leaves the interface-constrained accessors alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTag, KbqTagList } from '@koobiq/components/tags';\n" +
            'class Demo {\n' +
            '    read(tag: KbqTag, list: KbqTagList) {\n' +
            '        tag.disabled = true;\n' +
            '        return tag.selected && tag.removable && list.value && list.placeholder;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('reports the booleanAttribute change and the id shape once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTagInput } from '@koobiq/components/tags';\n" +
                'class Demo {\n' +
                '    read(tagInput: KbqTagInput) {\n' +
                '        return tagInput.addOnBlur;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('booleanAttribute');
        expect(summary).toContain('_IdGenerator');
        expect(summary.match(/_IdGenerator/g)!.length).toBe(1);
    });

    it('stays silent for a workspace that does not use the tagInput', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTagInput } from '@koobiq/components/tags';\n" +
            'class Demo {\n' +
            '    read(tagInput: KbqTagInput) {\n' +
            '        return tagInput.addOnBlur;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
