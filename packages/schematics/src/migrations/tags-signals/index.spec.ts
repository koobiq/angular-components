import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import tagInputSignals from './index';
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

    function firstHtmlPath(): string {
        const [first] = projects.keys();

        return paths(projects.get(first)!).html;
    }

    const IMPORT = "import { KbqTagInput } from '@koobiq/components/tags';\n";

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

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            IMPORT + 'class Demo {\n    read(tagInput: KbqTagInput) {\n        return tagInput.addOnBlur;\n    }\n}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(runner.callRule(tagInputSignals({ project: first }), appTree));

        expect(updated.readText(ts)).toContain('return tagInput.addOnBlur();');
    });

    it('reports every write shape rather than rewriting it into source that no longer parses', async () => {
        const ts = firstTsPath();
        const source =
            IMPORT +
            'class Demo {\n' +
            '    fallback = true;\n' +
            '    write(tagInput: KbqTagInput, src: any[]) {\n' +
            '        tagInput.addOnBlur ||= this.fallback;\n' +
            '        tagInput.separators += src;\n' +
            '        tagInput.separators++;\n' +
            '        delete tagInput.separators;\n' +
            '        [tagInput.separators] = src;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        // `addOnBlur() ||=` is TS2779, `separators() +=` TS2364, `separators()++` TS2357.
        expect((await run()).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('read-only signal inputs now');
    });

    it('still rewrites a read that only looks like a write, such as a negation', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            IMPORT + 'class Demo {\n    read(tagInput: KbqTagInput) {\n        return !tagInput.addOnBlur;\n    }\n}\n'
        );

        expect((await run()).readText(ts)).toContain('return !tagInput.addOnBlur();');
    });

    it('leaves a same-named binding that shadows the receiver alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            IMPORT +
                'class LegacyInput { addOnBlur = false; }\n' +
                'class Demo {\n' +
                '    legacy: LegacyInput[] = [];\n' +
                '    configure(tagInput: KbqTagInput) {\n' +
                '        this.legacy.forEach((tagInput: LegacyInput) => tagInput.addOnBlur);\n' +
                '        return tagInput.addOnBlur;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('(tagInput: LegacyInput) => tagInput.addOnBlur);');
        expect(updated).toContain('return tagInput.addOnBlur();');
    });

    it('does not let a module-level receiver leak into an unrelated class', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            IMPORT +
                'declare const tagInput: KbqTagInput;\n' +
                'class Other { addOnBlur = false; }\n' +
                'class Unrelated {\n' +
                '    read(tagInput: Other) {\n' +
                '        return tagInput.addOnBlur;\n' +
                '    }\n' +
                '}\n' +
                'export const top = tagInput.addOnBlur;\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('read(tagInput: Other) {\n        return tagInput.addOnBlur;\n');
        expect(updated).toContain('export const top = tagInput.addOnBlur();');
    });

    it('does not follow `this` into a function that rebinds it', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                IMPORT +
                'class Demo {\n' +
                '    @ViewChild(KbqTagInput) tagInput: KbqTagInput;\n' +
                '    read(items: any[]) {\n' +
                '        items.forEach(function (this: any) { return this.tagInput.addOnBlur; });\n' +
                '        return this.tagInput.addOnBlur;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('function (this: any) { return this.tagInput.addOnBlur; }');
        expect(updated).toContain('return this.tagInput.addOnBlur();');
    });

    it('sees through an aliased import, `!`, parentheses and `as`', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqTagInput as TagInput } from '@koobiq/components/tags';\n" +
                'class Demo {\n' +
                '    @ViewChild(TagInput) tagInput?: TagInput;\n' +
                '    read(t: TagInput, u: TagInput, loose: unknown) {\n' +
                '        return [t.addOnBlur, this.tagInput!.addOnBlur, (u).separators, (loose as TagInput).addOnBlur];\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain(
            'return [t.addOnBlur(), this.tagInput!.addOnBlur(), (u).separators(), (loose as TagInput).addOnBlur()];'
        );
    });

    it('rewrites reads through a `kbqTagInput` reference variable in an external template', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-tag-list #list>\n' +
                '    <input [kbqTagInputFor]="list" #ti="kbqTagInput" #el />\n' +
                '</kbq-tag-list>\n' +
                '@if (ti.addOnBlur) {\n' +
                '    <span>{{ ti.separators.length }}</span>\n' +
                '}\n' +
                '<span>{{ el.addOnBlur }}</span>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('@if (ti.addOnBlur()) {');
        expect(updated).toContain('{{ ti.separators().length }}');
        // A bare `#el` on the native `<input>` is the element, not the directive.
        expect(updated).toContain('{{ el.addOnBlur }}');
    });

    it('rewrites reads through a `kbqTagInputFor` reference variable in an inline template', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "import { KbqTagsModule } from '@koobiq/components/tags';\n" +
                '@Component({\n' +
                '    imports: [KbqTagsModule],\n' +
                '    template: `<kbq-tag-list #list><input [kbqTagInputFor]="list" #ti="kbqTagInputFor" /></kbq-tag-list>{{ ti.addOnBlur }}`\n' +
                '})\n' +
                'export class Demo {}\n'
        );

        expect((await run()).readText(ts)).toContain('{{ ti.addOnBlur() }}');
    });

    it('rewrites a @ViewChild field without advising the double call that would break it', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                IMPORT +
                'class Demo {\n' +
                '    @ViewChild(KbqTagInput) tagInput: KbqTagInput;\n' +
                '    read() {\n' +
                '        return this.tagInput.addOnBlur;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        // The decorator field holds the instance, so `this.tagInput().addOnBlur()` would not compile. Matched
        // on both phrasings: the old regex warning said "double call", the AST report says "two calls".
        expect(updated).toContain('return this.tagInput.addOnBlur();');
        expect(messages.join('\n')).not.toMatch(/double call|two calls/);
    });

    it('rewrites a read on a signal query that has already been called', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                IMPORT +
                'class Demo {\n' +
                '    readonly tagInput = viewChild(KbqTagInput);\n' +
                '    read() {\n' +
                '        return this.tagInput()?.addOnBlur;\n' +
                '    }\n' +
                '}\n'
        );

        // How a signal query is read in practice. The call already unwraps the signal, so the member read
        // takes one `()`; it used to be neither rewritten nor reported and kept the always-truthy signal.
        expect((await run()).readText(ts)).toContain('return this.tagInput()?.addOnBlur();');
    });

    it('reports a member read straight off an uncalled signal query', async () => {
        const ts = firstTsPath();
        const source =
            "import { viewChild } from '@angular/core';\n" +
            IMPORT +
            'class Demo {\n' +
            '    readonly tagInput = viewChild(KbqTagInput);\n' +
            '    read() {\n' +
            '        return (this.tagInput as any).addOnBlur;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        await run();

        expect(messages.join('\n')).toContain('needs two calls');
    });

    it("does not report a host's own field that merely shares a member name", async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            IMPORT + 'class Host {\n    addOnBlur = false;\n    enable() {\n        this.addOnBlur = true;\n    }\n}\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('read-only signal inputs now');
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
