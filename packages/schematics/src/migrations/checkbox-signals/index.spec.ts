import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import checkboxSignals from './index';
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
        expect(messages.join('\n')).toContain('read-only signal inputs');
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

    it('advises the optional spelling for a signal query without .required', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    readonly checkbox = viewChild(KbqCheckbox);\n' +
                '    read() {\n' +
                '        return this.checkbox.id;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.checkbox.id;');
        expect(messages.join('\n')).toContain('this.checkbox()?.id()');
    });

    it('advises the plain spelling for a .required signal query', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    readonly checkbox = viewChild.required(KbqCheckbox);\n' +
                '    read() {\n' +
                '        return this.checkbox.id;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('this.checkbox().id()');
        expect(messages.join('\n')).not.toContain('?.id()');
    });

    it('does not warn about two calls for the decorator query form, which is auto-fixed', async () => {
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

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.checkbox.id();');
        expect(messages.join('\n')).not.toContain('needs two calls');
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
    it('leaves a compound assignment alone instead of appending () to its target', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    write(checkbox: KbqCheckbox) {\n' +
                "        checkbox.id += '-suffix';\n" +
                "        checkbox.clickAction ??= 'noop';\n" +
                '        delete (checkbox as any).name;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain("checkbox.id += '-suffix';");
        expect(updated).toContain("checkbox.clickAction ??= 'noop';");
        expect(messages.join('\n')).toContain('read-only signal inputs');
    });

    it('does not warn about a write on an unrelated receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    read(checkbox: KbqCheckbox) {\n' +
                '        return checkbox.id;\n' +
                '    }\n' +
                '    rename(el: HTMLElement) {\n' +
                "        el.id = 'x';\n" +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('read-only signal inputs');
    });

    it('leaves a same-named receiver of an unrelated type in a sibling block alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'function f(flag: boolean, a: KbqCheckbox, b: HTMLInputElement) {\n' +
                '    if (flag) {\n' +
                '        const checkbox: KbqCheckbox = a;\n' +
                '        return checkbox.value;\n' +
                '    } else {\n' +
                '        const checkbox: HTMLInputElement = b;\n' +
                '        return checkbox.value;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('const checkbox: KbqCheckbox = a;\n        return checkbox.value();');
        expect(updated).toContain('const checkbox: HTMLInputElement = b;\n        return checkbox.value;');
    });

    it('rewrites reads on an inject() receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { inject } from '@angular/core';\n" +
                "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    private readonly checkbox = inject(KbqCheckbox);\n' +
                '    read() {\n' +
                '        return this.checkbox.value;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.checkbox.value();');
    });

    it('reports a union-typed field it cannot resolve to a receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqCheckbox) checkbox: KbqCheckbox | undefined;\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('cannot resolve to a single receiver');
    });

    it('leaves a ref bound to another directive through exportAs alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-checkbox #ctrl="ngModel" [(ngModel)]="agree" required>I agree</kbq-checkbox>\n' +
            '<p>{{ ctrl.value }} / {{ ctrl.name }}</p>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('rewrites an optional-chain read through a template reference', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-checkbox #cb />\n<span>{{ cb?.value }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ cb?.value() }}');
    });

    it('rewrites a read written with whitespace around the dot', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-checkbox #cb />\n<span>{{ cb . value }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ cb . value() }}');
    });

    it('leaves a template assignment target alone', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-checkbox #cb />\n<button (click)="cb.id = \'x\'">rename</button>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a member access on something else that ends in the ref name alone', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-checkbox #checkbox />\n<span>{{ form.checkbox.value }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves prose, comments and static attributes that mention the ref alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-checkbox #checkbox />\n' +
            '<p>Set checkbox.name in the config.</p>\n' +
            '<!-- checkbox.id -->\n' +
            '<img alt="checkbox.value" />\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a @for variable that shares the ref name alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-checkbox #checkbox />\n' +
            '@for (checkbox of boxes; track checkbox.id) {\n' +
            '    <span>{{ checkbox.value }}</span>\n' +
            '}\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('reports a protected member read through a template reference', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-checkbox #cb />\n<label [attr.for]="cb.inputId">Label</label>\n');

        await run();

        expect(messages.join('\n')).toContain('are `protected` now');
    });

    it('reports a template that renders the checkbox but cannot be parsed', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-checkbox #cb>text</div>\n');

        await run();

        expect(messages.join('\n')).toContain('could not be parsed');
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            "import { KbqCheckbox } from '@koobiq/components/checkbox';\n" +
                'class Demo {\n' +
                '    read(checkbox: KbqCheckbox) {\n' +
                '        return checkbox.value;\n' +
                '    }\n' +
                '}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(runner.callRule(checkboxSignals({ project: first } as Schema), appTree));

        expect(updated.readText(ts)).toContain('return checkbox.value();');
        expect(messages.join('\n')).not.toContain('would update');
    });
});
