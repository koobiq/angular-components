import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import timepickerSignals from './index';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'timepicker-signals';

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

    const IMPORT = "import { KbqTimepicker } from '@koobiq/components/timepicker';\n";

    it('rewrites format reads on a parameter typed KbqTimepicker (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTimepicker } from '@koobiq/components/timepicker';\n" +
                'class Demo {\n' +
                '    read(timepicker: KbqTimepicker) {\n' +
                '        return timepicker.format ?? timepicker?.format;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('timepicker.format() ?? timepicker?.format()');
    });

    it('rewrites reads on a @ViewChild field (this.timepicker)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqTimepicker } from '@koobiq/components/timepicker';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqTimepicker) timepicker: KbqTimepicker;\n' +
                '    read() {\n' +
                '        return this.timepicker.format;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.timepicker.format();');
    });

    it('rewrites the timepicker receiver and leaves an unrelated one with the same member alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            IMPORT +
                "class Other {\n    format = 'HH:mm';\n}\n" +
                'class Demo {\n' +
                '    read(timepicker: KbqTimepicker<unknown>, other: Other) {\n' +
                '        return [timepicker.format, other.format];\n' +
                '    }\n' +
                '}\n'
        );

        // Both receivers in one file: with no timepicker receiver the pass bailed before discriminating at all.
        expect((await run()).readText(ts)).toContain('return [timepicker.format(), other.format];');
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTimepicker } from '@koobiq/components/timepicker';\n" +
            'class Demo {\n' +
            '    read(timepicker: KbqTimepicker) {\n' +
            '        return timepicker.format();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the input is read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTimepicker } from '@koobiq/components/timepicker';\n" +
                'class Demo {\n' +
                '    write(timepicker: KbqTimepicker) {\n' +
                "        timepicker.format = 'HH:mm';\n" +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain("timepicker.format = 'HH:mm';");
    });

    it('warns about min and max instead of rewriting them', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTimepicker } from '@koobiq/components/timepicker';\n" +
            'class Demo {\n' +
            '    read(timepicker: KbqTimepicker<unknown>) {\n' +
            '        return timepicker.min ?? timepicker.max;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toContain('return timepicker.min ?? timepicker.max;');

        const logged = messages.join('\n');

        // A read without the call is the signal itself, which is always truthy, so the report has to say so.
        expect(logged).toContain('These KbqTimepicker reads were left untouched: min, max.');
        expect(logged).toContain('Add `()`');
    });

    it('warns about a write to the validation tooltip input', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTimepicker } from '@koobiq/components/timepicker';\n" +
                'class Demo {\n' +
                '    wire(timepicker: KbqTimepicker<unknown>, tooltip: any) {\n' +
                '        timepicker.kbqValidationTooltip = tooltip;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('These KbqTimepicker members are read-only signals now');
    });

    it('reports the teardown, the locale reformat and the id shape once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqTimepicker } from '@koobiq/components/timepicker';\n" +
                'class Demo {\n' +
                '    read(timepicker: KbqTimepicker<unknown>) {\n' +
                '        return timepicker.format;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('no longer stacks subscriptions');
        expect(summary).toContain('locale change');
        expect(summary).toContain('_IdGenerator');
        expect(summary.match(/_IdGenerator/g)!.length).toBe(1);
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            IMPORT +
                'class Demo {\n    read(timepicker: KbqTimepicker<unknown>) {\n        return timepicker.format;\n    }\n}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(runner.callRule(timepickerSignals({ project: first }), appTree));

        expect(updated.readText(ts)).toContain('return timepicker.format();');
    });

    it('reports every write shape rather than rewriting it into source that no longer parses', async () => {
        const ts = firstTsPath();
        const source =
            IMPORT +
            'class Demo {\n' +
            '    write(timepicker: KbqTimepicker<unknown>, f: any, src: any) {\n' +
            '        timepicker.format ??= f;\n' +
            '        timepicker.format += f;\n' +
            '        delete timepicker.format;\n' +
            '        ({ format: timepicker.format } = src);\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        // `format() ??= f` is TS2364, `delete format()` TS2703.
        expect((await run()).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('These KbqTimepicker members are read-only signals now');
    });

    it('sees through `!`, parentheses, an aliased import and inject()', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { inject, ViewChild } from '@angular/core';\n" +
                "import { KbqTimepicker as TP } from '@koobiq/components/timepicker';\n" +
                'class Demo {\n' +
                '    @ViewChild(TP) timepicker!: TP<unknown>;\n' +
                '    readonly injected = inject(TP);\n' +
                '    read(tp: TP<unknown>) {\n' +
                '        return [this.timepicker!.format, (tp).format, this.injected.format];\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain(
            'return [this.timepicker!.format(), (tp).format(), this.injected.format()];'
        );
    });

    it('does not widen a receiver declared in a type position to the whole file', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            IMPORT +
                'type Attach = (timepicker: KbqTimepicker<unknown>) => void;\n' +
                'export function unrelated() {\n' +
                "    const timepicker = { format: 'HH:mm:ss' };\n" +
                '    return timepicker.format;\n' +
                '}\n'
        );

        // The parameter only exists inside the function type; a hand-rolled function test missed it and
        // fell back to the source file as its scope.
        expect((await run()).readText(ts)).toContain('    return timepicker.format;\n');
    });

    it('rewrites a template reference variable and reports min and max read through it', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<input kbqTimepicker #tp="kbqTimepicker" #el />\n' +
                '<span>{{ tp.format }}</span>\n' +
                '@if (tp.min) {\n    <span>min</span>\n}\n' +
                '<span>{{ el.format }}</span>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('{{ tp.format() }}');
        // `min` changed its value, so it is reported rather than rewritten.
        expect(updated).toContain('@if (tp.min) {');
        // A bare `#el` on the native `<input>` is the element itself.
        expect(updated).toContain('{{ el.format }}');
        expect(messages.join('\n')).toContain('These KbqTimepicker reads were left untouched: min.');
    });

    it("does not report a host's own field that merely shares a member name", async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            IMPORT + 'class Slider {\n    max = 10;\n    reset() {\n        this.max = 0;\n    }\n}\n'
        );

        await run();

        // The old regex matched any `.max =` in a file that named the timepicker. Matched on both phrasings:
        // the regex warning said "read-only signal inputs", the AST report says "read-only signals".
        expect(messages.join('\n')).not.toMatch(/read-only signal/);
    });

    it('stays silent for a workspace that does not use the timepicker', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTimepicker } from '@koobiq/components/timepicker';\n" +
            'class Demo {\n' +
            '    read(timepicker: KbqTimepicker) {\n' +
            '        return timepicker.format;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
