import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'form-field-signals';

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

    it('rewrites content-query reads on a parameter typed KbqFormField (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    read(formField: KbqFormField) {\n' +
                '        return formField.cleaner && formField?.hint;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('formField.cleaner() && formField?.hint()');
    });

    it('rewrites has* getter reads on a @ContentChild field (this.formField)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ContentChild } from '@angular/core';\n" +
                "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    @ContentChild(KbqFormField) formField: KbqFormField;\n' +
                '    get withCleaner() {\n' +
                '        return this.formField.hasCleaner;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.formField.hasCleaner();');
    });

    it('does NOT rewrite control/stepper, which were already signals', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    read(formField: KbqFormField) {\n' +
                '        return formField.control() && formField.stepper();\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('formField.control() && formField.stepper()');
        expect(updated).not.toContain('control()()');
    });

    it('rewrites fillTextOff / compact reads on the hint family', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqError, KbqHint } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    read(hint: KbqHint, error: KbqError) {\n' +
                '        return hint.fillTextOff || error.compact;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('hint.fillTextOff() || error.compact()');
    });

    it('warns about the QueryList API lost by the content queries', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    watch(formField: KbqFormField) {\n' +
                '        return formField.hint.changes;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const all = messages.join('\n');

        expect(all).toContain('readonly array instead of a QueryList');
        expect(all).toContain('hint.changes');
    });

    it('warns that cleaner / passwordToggle now return undefined instead of null', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    read(formField: KbqFormField) {\n' +
                '        return formField.passwordToggle;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('`undefined` instead of `null`');
    });

    it('warns about an assignment to a now read-only signal input', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqHint } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    disable(hint: KbqHint) {\n' +
                '        hint.fillTextOff = true;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        // left untouched — the consumer has to replace it with a binding
        expect(updated).toContain('hint.fillTextOff = true;');
        expect(messages.join('\n')).toContain('signal inputs now');
    });

    it.each(['cleaner', 'passwordToggle', 'hint', 'prefix', 'suffix'])(
        'warns about an assignment to the now read-only %s content query',
        async (member) => {
            const ts = firstTsPath();
            const assignment = `formField.${member} = fake;`;

            appTree.overwrite(
                ts,
                "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                    'class Demo {\n' +
                    `    fake(formField: KbqFormField, fake: any) {\n` +
                    `        ${assignment}\n` +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(ts);

            // left untouched — the assignment has to go, there is nothing to rewrite it to
            expect(updated).toContain(assignment);
            expect(messages.join('\n')).toContain('signal content queries now');
        }
    );

    it('does NOT warn about a read of a read-only member', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    read(formField: KbqFormField) {\n' +
                '        return formField.prefix;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return formField.prefix();');
        expect(messages.join('\n')).not.toContain('can no longer be assigned');
    });

    it('warns about the removed mixinColor', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { mixinColor } from '@koobiq/components/core';\n" +
                "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                'const Base = mixinColor(class {});\n'
        );

        await run();

        expect(messages.join('\n')).toContain('`mixinColor` was removed');
    });

    it('warns that CanColor went with CanColorCtor', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { CanColorCtor } from '@koobiq/components/core';\n" + 'export type Ctor = CanColorCtor;\n'
        );

        await run();

        const all = messages.join('\n');

        expect(all).toContain('so was the `CanColor` interface');
        expect(all).not.toContain('still exported');
    });

    it('warns about the new required keys of KbqA11yLocaleConfiguration', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { kbqA11yLocaleConfigurationProvider } from '@koobiq/components/core';\n" +
                'const provider = kbqA11yLocaleConfigurationProvider({} as never);\n'
        );

        await run();

        expect(messages.join('\n')).toContain('clear');
    });

    it('leaves unrelated .hint / .compact on non-form-field receivers untouched', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqFormField } from '@koobiq/components/form-field';\n" +
            'class Demo {\n' +
            '    other(formField: KbqFormField) {\n' +
            '        const cfg = { hint: true };\n' +
            '        return cfg.hint;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return cfg.hint;');
        expect(updated).not.toContain('cfg.hint()');
    });

    it('rewrites reads of a control state to calls and a write to its writable disabled to .set()', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqSelect } from '@koobiq/components/select';\n" +
                'class Demo {\n' +
                '    apply(select: KbqSelect) {\n' +
                '        const empty = select.empty;\n' +
                '        select.disabled = true;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('const empty = select.empty();');
        expect(updated).toContain('select.disabled.set(true);');
    });

    it.each([
        { type: 'KbqSelect', entry: 'select' },
        { type: 'KbqTimezoneSelect', entry: 'timezone' }
    ])('rewrites a write to the writable value of $type to .set()', async ({ type, entry }) => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            `import { ${type} } from '@koobiq/components/${entry}';\n` +
                'class Demo {\n' +
                `    apply(select: ${type}) {\n` +
                "        select.value = 'koobiq';\n" +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain("select.value.set('koobiq');");
        expect(messages.join('\n')).not.toContain('can no longer be assigned');
    });

    it.each([
        { type: 'KbqTreeSelect', entry: 'tree-select' },
        { type: 'KbqTimepicker', entry: 'timepicker' },
        { type: 'KbqDatepickerInput', entry: 'datepicker' }
    ])('leaves a write to the read-only value of $type and reports it', async ({ type, entry }) => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            `import { ${type} } from '@koobiq/components/${entry}';\n` +
                'class Demo {\n' +
                `    apply(control: ${type}) {\n` +
                '        control.value = null;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('control.value = null;');
        expect(messages.join('\n')).toContain('`value` can no longer be assigned');
    });

    it('turns a write to value through a ref on <kbq-select> and <kbq-timezone-select> into .set()', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-select #select></kbq-select>\n' +
                '<kbq-timezone-select #zone="kbqTimezoneSelect"></kbq-timezone-select>\n' +
                '<kbq-tree-select #tree></kbq-tree-select>\n' +
                '<button (click)="select.value = null; zone.value = null; tree.value = null">Reset</button>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('(click)="select.value.set(null); zone.value.set(null); tree.value = null"');
    });

    it('leaves a nested declaration that shadows a typed receiver alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqSelect } from '@koobiq/components/select';\n" +
                'class Demo {\n' +
                '    read(select: KbqSelect) {\n' +
                '        const options = [1].map((select: HTMLSelectElement) => {\n' +
                '            select.required = true;\n' +
                '            return select.value;\n' +
                '        });\n' +
                '        return [select.empty, options];\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('            select.required = true;\n            return select.value;\n');
        expect(updated).toContain('return [select.empty(), options];');
        expect(messages.join('\n')).not.toContain('can no longer be assigned');
    });

    it('leaves this.<field> inside a function that rebinds this alone, and rewrites it inside an arrow', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqSelect } from '@koobiq/components/select';\n" +
                'class Demo {\n' +
                '    select: KbqSelect;\n' +
                '    read() {\n' +
                '        [1].forEach(function (this: any) {\n' +
                '            return this.select.value;\n' +
                '        });\n' +
                '        return [1].map(() => this.select.value);\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('            return this.select.value;\n');
        expect(updated).toContain('return [1].map(() => this.select.value());');
    });

    it('rewrites reads and writes on a receiver typed by inject()', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { inject } from '@angular/core';\n" +
                "import { KbqInput } from '@koobiq/components/input';\n" +
                "import { KbqSelect } from '@koobiq/components/select';\n" +
                'class Demo {\n' +
                '    private readonly select = inject(KbqSelect);\n' +
                '    read() {\n' +
                '        const input = inject(KbqInput);\n' +
                "        input.value = '';\n" +
                '        this.select.disabled = input.empty;\n' +
                '        return this.select.value;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain("input.value.set('');");
        expect(updated).toContain('this.select.disabled.set(input.empty());');
        expect(updated).toContain('return this.select.value();');
    });

    it('leaves a compound assignment, an increment, delete and a destructuring target untouched and reports them', async () => {
        const ts = firstTsPath();
        const body =
            "        input.value += 'x';\n" +
            '        input.placeholder ??= data.value;\n' +
            '        input.id++;\n' +
            '        --input.id;\n' +
            '        delete input.placeholder;\n' +
            '        ({ value: input.value } = data);\n' +
            '        [input.placeholder] = [data.value];\n';

        appTree.overwrite(
            ts,
            "import { KbqInput } from '@koobiq/components/input';\n" +
                'class Demo {\n' +
                '    write(input: KbqInput, data: { value: string }) {\n' +
                body +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);
        const all = messages.join('\n');

        expect(updated).toContain(body);
        expect(all).toContain('`id` can no longer be assigned');
        expect(all).toContain('`value`, `placeholder` are writable signals now');
    });

    it('rewrites a read under a prefix operator that does not write', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqInput } from '@koobiq/components/input';\n" +
                'class Demo {\n' +
                '    read(input: KbqInput) {\n' +
                '        return [!input.focused, -input.value, +input.placeholder, ~input.id];\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return [!input.focused(), -input.value(), +input.placeholder(), ~input.id()];');
    });

    it.each(['KbqInput', 'KbqInputPassword', 'KbqTextarea'])(
        'rewrites %s value and placeholder writes to .set() and warns about a write to its read-only disabled',
        async (type) => {
            const ts = firstTsPath();

            appTree.overwrite(
                ts,
                `import { ${type} } from '@koobiq/components/input';\n` +
                    'class Demo {\n' +
                    `    apply(input: ${type}) {\n` +
                    "        input.value = 'koobiq';\n" +
                    "        input.placeholder = 'Name';\n" +
                    '        input.disabled = true;\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(ts);

            expect(updated).toContain("input.value.set('koobiq');");
            expect(updated).toContain("input.placeholder.set('Name');");
            // left untouched — the consumer has to replace it with a binding
            expect(updated).toContain('input.disabled = true;');
            expect(messages.join('\n')).toContain('`disabled` can no longer be assigned');
        }
    );

    it('rewrites reads via a template reference variable on <kbq-select>', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-select #select></kbq-select>\n<span>{{ select.disabled }}</span>\n');

        const updated = (await run()).readText(html);

        expect(updated).toContain('{{ select.disabled() }}');
    });

    it('leaves a property chain that ends in the name of a ref alone', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-select #country formControlName="country"></kbq-select>\n' +
                '<span>{{ form.controls.country.value }} {{ $any(form).country.disabled }} {{ country.value }}</span>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain(
            '{{ form.controls.country.value }} {{ $any(form).country.disabled }} {{ country.value() }}'
        );
    });

    it('turns a write through a ref to a writable member into .set() and leaves a read-only one', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-select #country></kbq-select>\n' +
                '<button (click)="country.disabled = !country.disabled; log(country.value)">Lock</button>\n' +
                '<button (click)="country.placeholder = \'Country\'">Rename</button>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('(click)="country.disabled.set(!country.disabled()); log(country.value())"');
        expect(updated).toContain('(click)="country.placeholder = \'Country\'"');
        expect(messages.join('\n')).toContain('`placeholder` can no longer be assigned');

        appTree.overwrite(html, updated);

        expect((await run()).readText(html)).toBe(updated);
    });

    it('keeps a two-way binding to a writable member through a ref and reports a read-only one', async () => {
        const html = firstHtmlPath();
        const template =
            '<kbq-tag-list #tags></kbq-tag-list>\n' +
            '<kbq-select #country></kbq-select>\n' +
            '<input [(ngModel)]="tags.value" />\n' +
            '<input [(ngModel)]="country.id" />\n';

        appTree.overwrite(html, template);

        const updated = (await run()).readText(html);

        expect(updated).toBe(template);
        expect(messages.join('\n')).toContain('`id` can no longer be assigned');
    });

    it('leaves a compound write or an increment through a ref alone and reports it', async () => {
        const html = firstHtmlPath();
        const template =
            '<kbq-select #country></kbq-select>\n' +
            '<input kbqInput #name="kbqInput" />\n' +
            "<button (click)=\"name.value += '!'; name.placeholder ??= 'Name'; country.id ||= 'c'\">Mark</button>\n" +
            '<button (click)="country.value++; --country.value; log(country.value - 1, country.value >= 2)">Step</button>\n';

        appTree.overwrite(html, template);

        const updated = (await run()).readText(html);
        const all = messages.join('\n');

        expect(updated).toBe(
            template.replace(
                'log(country.value - 1, country.value >= 2)',
                'log(country.value() - 1, country.value() >= 2)'
            )
        );
        expect(all).toContain('`id` can no longer be assigned');
        expect(all).toContain('`value`, `placeholder` are writable signals now');
    });

    it('rewrites reads of KbqTagInput state on a typed receiver and reports a write to it', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqTagInput } from '@koobiq/components/tags';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqTagInput) input: KbqTagInput;\n' +
                '    describe() {\n' +
                '        return [this.input.focused, this.input.empty, this.input.placeholder, this.input.id];\n' +
                '    }\n' +
                '    rename() {\n' +
                "        this.input.placeholder = 'Tags';\n" +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain(
            'return [this.input.focused(), this.input.empty(), this.input.placeholder(), this.input.id()];'
        );
        expect(updated).toContain("this.input.placeholder = 'Tags';");
        expect(messages.join('\n')).toContain('`placeholder` can no longer be assigned');
    });

    it('rewrites reads of KbqTagInput state through a ref naming its exportAs, not through a bare ref', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-tag-list #list></kbq-tag-list>\n' +
                '<input [kbqTagInputFor]="list" #tagInput="kbqTagInput" #native />\n' +
                '<input [kbqTagInputFor]="list" #other="kbqTagInputFor" />\n' +
                '<span>{{ tagInput.placeholder }} {{ tagInput.focused }} {{ other.empty }} {{ native.id }}</span>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('{{ tagInput.placeholder() }} {{ tagInput.focused() }} {{ other.empty() }}');
        expect(updated).toContain('{{ native.id }}');
    });

    const REF_DIRECTIVES = [
        { exportAs: 'kbqInput', markup: '<input kbqInput #own="kbqInput" #native />' },
        { exportAs: 'kbqInputPassword', markup: '<input kbqInputPassword #own="kbqInputPassword" #native />' },
        { exportAs: 'kbqTextarea', markup: '<textarea kbqTextarea #own="kbqTextarea" #native></textarea>' },
        { exportAs: 'kbqTimepicker', markup: '<input kbqTimepicker #own="kbqTimepicker" #native />' },
        {
            exportAs: 'kbqDatepickerInput',
            markup: '<input [kbqDatepicker]="picker" #own="kbqDatepickerInput" #native />'
        }
    ];

    it.each(REF_DIRECTIVES)(
        'rewrites reads via a #ref naming $exportAs, not via a bare #ref on the native element',
        async ({ markup }) => {
            const html = firstHtmlPath();

            appTree.overwrite(
                html,
                `${markup}\n` + '@if (own.empty) {\n' + '    <span>{{ own.value }} {{ native.value }}</span>\n' + '}\n'
            );

            const updated = (await run()).readText(html);

            expect(updated).toContain('@if (own.empty()) {');
            expect(updated).toContain('{{ own.value() }} {{ native.value }}');
        }
    );

    it('turns a write through a #ref naming kbqDatepickerInput into .set() and reports a read-only one', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<input [kbqDatepicker]="picker" #dp="kbqDatepickerInput" />\n' +
                '<button (click)="dp.disabled = true; dp.value = null">Reset</button>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('(click)="dp.disabled.set(true); dp.value = null"');
        expect(messages.join('\n')).toContain('`value` can no longer be assigned');
    });

    it('rewrites reads via a #ref naming kbqInput in an inline template of a component', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "import { KbqInputModule } from '@koobiq/components/input';\n" +
                '@Component({\n' +
                '    imports: [KbqInputModule],\n' +
                '    template: `<input kbqInput #name="kbqInput" />@if (name.empty) { <span>{{ name.value }}</span> }`\n' +
                '})\n' +
                'export class Demo {}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('@if (name.empty()) { <span>{{ name.value() }}</span> }');
    });

    it('warns about a custom KbqFormFieldControl implementation', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFormFieldControl } from '@koobiq/components/form-field';\n" +
                'export abstract class CustomControl implements KbqFormFieldControl<string> {}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('`KbqFormFieldControl` is signal-based');
    });

    it('warns about the changed KbqErrorStateTracker', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqErrorStateTracker } from '@koobiq/components/core';\n" +
                'export const tracker = KbqErrorStateTracker;\n'
        );

        await run();

        expect(messages.join('\n')).toContain('no longer takes a `stateChanges` subject');
    });

    it('is idempotent — a second run does not double the call', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    read(formField: KbqFormField) {\n' +
                '        return formField.hasHint;\n' +
                '    }\n' +
                '}\n'
        );

        const once = (await run()).readText(ts);

        appTree.overwrite(ts, once);

        const twice = (await run()).readText(ts);

        expect(twice).toBe(once);
        expect(twice).not.toContain('hasHint()()');
    });

    it('rewrites reads via a template reference variable on <kbq-form-field>', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-form-field #field="kbqFormField"><input kbqInput /></kbq-form-field>\n' +
                '<span>{{ field.hasHint }}</span>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('{{ field.hasHint() }}');
    });

    const REF_ELEMENTS = [
        { element: 'kbq-form-field', exportAs: 'kbqFormField', member: 'hasHint' },
        { element: 'kbq-hint', exportAs: 'kbqHint', member: 'compact' },
        { element: 'kbq-error', exportAs: 'kbqError', member: 'compact' },
        { element: 'kbq-reactive-password-hint', exportAs: 'kbqReactivePasswordHint', member: 'compact' },
        { element: 'kbq-select', exportAs: 'kbqSelect', member: 'disabled' },
        { element: 'kbq-tree-select', exportAs: 'kbqTreeSelect', member: 'disabled' },
        { element: 'kbq-timezone-select', exportAs: 'kbqTimezoneSelect', member: 'disabled' },
        { element: 'kbq-tag-list', exportAs: 'kbqTagList', member: 'disabled' }
    ];

    it.each(REF_ELEMENTS)(
        'rewrites reads via a bare #ref and a #ref naming $exportAs on <$element>',
        async ({ element, exportAs, member }) => {
            const html = firstHtmlPath();

            appTree.overwrite(
                html,
                `<${element} #bare></${element}>\n` +
                    `<${element} #own="${exportAs}"></${element}>\n` +
                    `<span>{{ bare.${member} }} {{ own.${member} }}</span>\n`
            );

            const updated = (await run()).readText(html);

            expect(updated).toContain(`{{ bare.${member}() }} {{ own.${member}() }}`);
        }
    );

    it.each(REF_ELEMENTS)(
        'leaves reads via a #ref naming another directive on <$element> untouched',
        async ({ element, member }) => {
            const html = firstHtmlPath();
            const template =
                `<${element} #model="ngModel" [(ngModel)]="value" cdkOverlayOrigin #origin="cdkOverlayOrigin">` +
                `</${element}>\n` +
                `@if (model.value && !model.disabled) {\n` +
                `    <span>{{ model.${member} }} {{ origin.${member} }}</span>\n` +
                '}\n';

            appTree.overwrite(html, template);

            const updated = (await run()).readText(html);

            expect(updated).toBe(template);
        }
    );

    it('moves [attr.aria-label] on <kbq-cleaner> to the [aria-label] input', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-form-field>\n' +
                '    <input kbqInput />\n' +
                '    <kbq-cleaner [attr.aria-label]="clearLabel" />\n' +
                '</kbq-form-field>\n'
        );

        const updated = (await run()).readText(html);

        expect(updated).toContain('<kbq-cleaner [aria-label]="clearLabel" />');
        expect(updated).not.toContain('[attr.aria-label]');
    });

    it('renames the misspelled fiedset-theme stylesheet import', async () => {
        const [first] = projects.keys();
        const scss = `/${projects.get(first)!.root}/src/styles.scss`;

        appTree.overwrite(scss, "@use '@koobiq/components/form-field/fiedset-theme';\n");

        const updated = (await run()).readText(scss);

        expect(updated).toContain('form-field/fieldset-theme');
        expect(updated).not.toContain('fiedset-theme');
    });

    it('does not write files in dry-run mode (fix = false) but reports would-update', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqFormField } from '@koobiq/components/form-field';\n" +
            'class Demo {\n' +
            '    read(formField: KbqFormField) {\n' +
            '        return formField.hasHint;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        const updated = (await run(false)).readText(ts);

        expect(updated).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqFormField } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    read(formField: KbqFormField) {\n' +
                '        return formField.cleaner;\n' +
                '    }\n' +
                '}\n'
        );

        // Run from migrations.json with no options, as `ng update` does: no schema default applies there.
        const migrationsRunner = new SchematicTestRunner('migrations', migrationsPath);

        migrationsRunner.logger.subscribe((entry) => messages.push(entry.message));

        const updated = await migrationsRunner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        expect(updated.readText(ts)).toContain('return formField.cleaner();');
        expect(messages.join('\n')).not.toContain('would update');
    });
});
