import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
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

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqTimepicker } from '@koobiq/components/timepicker';\n" +
            'class Other {\n' +
            "    format = 'HH:mm';\n" +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.format;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
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
        expect(messages.join('\n')).toContain('date adapter had parsed');
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

        expect(messages.join('\n')).toContain('read-only signal inputs');
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

        expect(summary).toContain('unsubscribes');
        expect(summary).toContain('locale change');
        expect(summary).toContain('_IdGenerator');
        expect(summary.match(/_IdGenerator/g)!.length).toBe(1);
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
