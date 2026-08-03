import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
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

    it('rewrites a KbqPasswordHint.regex write to .set()', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqPasswordHint } from '@koobiq/components/form-field';\n" +
                'class Demo {\n' +
                '    apply(hint: KbqPasswordHint) {\n' +
                '        hint.regex = /koobiq/;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('hint.regex.set(/koobiq/);');
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

    it.each(['cleaner', 'passwordToggle', 'hint', 'passwordHints', 'prefix', 'suffix'])(
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
});
