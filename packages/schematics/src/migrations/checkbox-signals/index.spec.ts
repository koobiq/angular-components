import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'checkbox-signals';

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

    it('rewrites id reads on a parameter typed KbqCheckbox (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    read(checkbox: KbqCheckbox) {\n' +
                '        return checkbox.id ?? checkbox?.id;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('checkbox.id() ?? checkbox?.id()');
    });

    it('rewrites reads on a @ViewChild field (this.checkbox)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqCheckbox) checkbox: KbqCheckbox;\n' +
                '    read() {\n' +
                '        return this.checkbox.id;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.checkbox.id();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
            'class Other {\n' +
            "    id = 'x';\n" +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.id;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
            'class Demo {\n' +
            '    read(checkbox: KbqCheckbox) {\n' +
            '        return checkbox.id();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('warns about a programmatic write and leaves it alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    write(checkbox: KbqCheckbox) {\n' +
                "        checkbox.id = 'custom';\n" +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain("checkbox.id = 'custom';");
    });

    it('rewrites template reference reads in an external template', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-checkbox #checkbox />\n<span>{{ checkbox.id }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ checkbox.id() }}');
    });

    it('rewrites template reference reads inside an inline template', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "@Component({ template: '<kbq-checkbox #checkbox></kbq-checkbox>{{ checkbox.id }}' })\n" +
                'class Demo {}\n'
        );

        expect((await run()).readText(ts)).toContain('{{ checkbox.id() }}');
    });

    it('leaves a template reference on an unrelated element alone', async () => {
        const html = firstHtmlPath();
        const source = '<other-thing #checkbox></other-thing>\n<span>{{ checkbox.id }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('warns about the template plumbing that became protected', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    read(checkbox: KbqCheckbox) {\n' +
                '        return checkbox.inputId + checkbox.inputElement + checkbox.getAriaChecked;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('inputId');
        expect(logged).toContain('inputElement');
        expect(logged).toContain('getAriaChecked');
    });

    it('warns about a view query returning the instance', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    readonly checkbox = viewChild(KbqCheckbox);\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('double call');
    });

    it('leaves the checkable-backed accessors alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
            'class Demo {\n' +
            '    read(checkbox: KbqCheckbox) {\n' +
            '        checkbox.checked = true;\n' +
            '        return checkbox.checked && checkbox.disabled && checkbox.indeterminate && checkbox.tabIndex;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('reports the id, attribute and value changes once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    read(checkbox: KbqCheckbox) {\n' +
                '        return checkbox.id;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('_IdGenerator');
        expect(summary).toContain('booleanAttribute');
        expect(summary).toContain('string | undefined');
        expect(summary.match(/_IdGenerator/g)!.length).toBe(1);
    });

    it('reports the summary for a template-only consumer with nothing to rewrite', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-checkbox checked>Agree</kbq-checkbox>\n');

        await run();

        expect(messages.join('\n')).toContain('booleanAttribute');
    });

    it('stays silent for a workspace that does not use the checkbox', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
            'class Demo {\n' +
            '    read(checkbox: KbqCheckbox) {\n' +
            '        return checkbox.id;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
});
