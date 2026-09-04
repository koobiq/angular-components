import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import autocompleteSignals from './index';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'autocomplete-signals';

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

    it('rewrites openOnFocus reads on a parameter typed KbqAutocomplete (incl. optional chain) to calls', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    read(autocomplete: KbqAutocomplete) {\n' +
                '        return autocomplete.openOnFocus ?? autocomplete?.openOnFocus;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('autocomplete.openOnFocus() ?? autocomplete?.openOnFocus()');
    });

    it('rewrites reads on a @ViewChild field (this.autocomplete)', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqAutocomplete) autocomplete: KbqAutocomplete;\n' +
                '    read() {\n' +
                '        return this.autocomplete.openOnFocus;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.autocomplete.openOnFocus();');
    });

    it('leaves reads on a receiver of an unrelated type alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
            'class Other {\n' +
            '    openOnFocus = true;\n' +
            '}\n' +
            'class Demo {\n' +
            '    read(other: Other) {\n' +
            '        return other.openOnFocus;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('is idempotent — an already migrated read is left alone', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
            'class Demo {\n' +
            '    read(autocomplete: KbqAutocomplete) {\n' +
            '        return autocomplete.openOnFocus();\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
    });

    it('leaves a programmatic write alone — the input is read-only', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    write(autocomplete: KbqAutocomplete) {\n' +
                '        autocomplete.openOnFocus = false;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('autocomplete.openOnFocus = false;');
    });

    it('rewrites template reference reads in an external template', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-autocomplete #autocomplete />\n<span>{{ autocomplete.openOnFocus }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ autocomplete.openOnFocus() }}');
    });

    it('rewrites template reference reads inside an inline template', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "@Component({ template: '<kbq-autocomplete #autocomplete></kbq-autocomplete>{{ autocomplete.openOnFocus }}' })\n" +
                'class Demo {}\n'
        );

        expect((await run()).readText(ts)).toContain('{{ autocomplete.openOnFocus() }}');
    });

    it('leaves a template reference on an unrelated element alone', async () => {
        const html = firstHtmlPath();
        const source = '<other-thing #autocomplete></other-thing>\n<span>{{ autocomplete.openOnFocus }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('warns about classList, which is internal now', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    read(autocomplete: KbqAutocomplete) {\n' +
                '        return autocomplete.classList;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('classList');
        expect(logged).toContain('overlay panel');
    });

    it('warns about a view query returning the instance', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { viewChild } from '@angular/core';\n" +
                "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    readonly autocomplete = viewChild(KbqAutocomplete);\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('double call');
    });

    it('rewrites autocompleteDisabled on a trigger receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    read(trigger: KbqAutocompleteTrigger) {\n' +
                '        return trigger.autocompleteDisabled;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return trigger.autocompleteDisabled();');
    });

    it('rewrites the isOpen and showPanel reads that became signals', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    read(autocomplete: KbqAutocomplete) {\n' +
                '        return autocomplete.isOpen && autocomplete.showPanel;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('autocomplete.isOpen() && autocomplete.showPanel()');
    });

    it('warns about a write to isOpen', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    open(autocomplete: KbqAutocomplete) {\n' +
                '        autocomplete.isOpen = true;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('attached');
    });

    it('reports the attribute, token and id notes once per project', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    read(autocomplete: KbqAutocomplete) {\n' +
                '        return autocomplete.openOnFocus;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('booleanAttribute');
        expect(summary).toContain('KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS');
        expect(summary).toContain('_IdGenerator');
        expect(summary.match(/_IdGenerator/g)!.length).toBe(1);
    });

    it('reports the summary for a template-only consumer with nothing to rewrite', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-autocomplete autoActiveFirstOption />\n');

        await run();

        expect(messages.join('\n')).toContain('booleanAttribute');
    });

    it('stays silent for a workspace that does not use the autocomplete', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('does not write when fix is false', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
            'class Demo {\n' +
            '    read(autocomplete: KbqAutocomplete) {\n' +
            '        return autocomplete.openOnFocus;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run(false)).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('would update');
    });
    it('rewrites a showPanel write to .set(), the one member with a writable half', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    write(autocomplete: KbqAutocomplete) {\n' +
                '        autocomplete.showPanel = true;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('autocomplete.showPanel.set(true);');
    });

    it('leaves a compound assignment alone instead of appending () to its target', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    write(autocomplete: KbqAutocomplete) {\n' +
                '        autocomplete.openOnFocus ||= false;\n' +
                '        autocomplete.displayWith ??= null;\n' +
                '        delete (autocomplete as any).showPanel;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('autocomplete.openOnFocus ||= false;');
        expect(updated).toContain('autocomplete.displayWith ??= null;');
        expect(updated).toContain('delete (autocomplete as any).showPanel;');
    });

    it('rewrites a displayWith invocation to a read followed by the call', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    label(autocomplete: KbqAutocomplete, value: string) {\n' +
                '        return autocomplete.displayWith ? autocomplete.displayWith(value) : value;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain(
            'return autocomplete.displayWith() ? autocomplete.displayWith()(value) : value;'
        );
    });

    it('leaves a signal-API call on a writable member alone', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-autocomplete #auto />\n<button (click)="auto.showPanel.set(true)">x</button>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a template assignment target alone', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-autocomplete #auto />\n<button (click)="auto.isOpen = false">x</button>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('rewrites a read through a trigger reference variable', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-autocomplete #auto />\n' +
                '<input #t="kbqAutocompleteTrigger" [kbqAutocomplete]="auto" />\n' +
                '@if (t.autocompleteDisabled) { <span>off</span> }\n'
        );

        expect((await run()).readText(html)).toContain('@if (t.autocompleteDisabled())');
    });

    it('does not rewrite a trigger member read through a panel reference', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-autocomplete #auto />\n<span>{{ auto.autocompleteDisabled }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('rewrites a read written with whitespace around the dot', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-autocomplete #auto />\n<span>{{ auto . isOpen }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ auto . isOpen() }}');
    });

    it('rewrites a read through a $-prefixed reference variable', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-autocomplete #$auto />\n<span>{{ $auto.isOpen }}</span>\n');

        expect((await run()).readText(html)).toContain('{{ $auto.isOpen() }}');
    });

    it('leaves a member access on something else that ends in the ref name alone', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-autocomplete #auto />\n<span>{{ item.auto.isOpen }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves prose and comments that merely mention the ref alone', async () => {
        const html = firstHtmlPath();
        const source =
            '<kbq-autocomplete #auto />\n' +
            '<!-- auto.isOpen is a signal now -->\n' +
            '<p>Read auto.isOpen as a call.</p>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a ref read outside the embedded view that declares it alone', async () => {
        const html = firstHtmlPath();
        const source = '@if (visible) {\n    <kbq-autocomplete #auto />\n}\n<span>{{ auto.isOpen }}</span>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
    });

    it('leaves a local that shadows the receiver name alone', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    read(autocomplete: KbqAutocomplete) {\n' +
                '        const inner = () => {\n' +
                '            const autocomplete = { isOpen: false };\n' +
                '            return autocomplete.isOpen;\n' +
                '        };\n' +
                '        return inner() || autocomplete.isOpen;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('const autocomplete = { isOpen: false };');
        expect(updated.match(/autocomplete\.isOpen\(\)/g)!.length).toBe(1);
    });

    it('rewrites a read behind a non-null assertion', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqAutocomplete) autocomplete?: KbqAutocomplete;\n' +
                '    read() {\n' +
                '        return this.autocomplete!.isOpen;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(ts)).toContain('return this.autocomplete!.isOpen();');
    });

    it('reports a union-typed field it cannot resolve to a receiver', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqAutocomplete) autocomplete: KbqAutocomplete | undefined;\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('cannot resolve to a single receiver');
    });

    it('does not warn about a double call for the decorator query form, which is auto-fixed', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { ViewChild } from '@angular/core';\n" +
                "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    @ViewChild(KbqAutocomplete) autocomplete: KbqAutocomplete;\n' +
                '    read() {\n' +
                '        return this.autocomplete.isOpen;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(ts);

        expect(updated).toContain('return this.autocomplete.isOpen();');
        expect(messages.join('\n')).not.toContain('double call');
    });

    it('warns about an isOpen write in a file that only imports KbqAutocompleteModule', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';\n" +
                '@Component({\n' +
                '    imports: [KbqAutocompleteModule],\n' +
                '    template: \'<kbq-autocomplete #auto="kbqAutocomplete" />\'\n' +
                '})\n' +
                'class Demo {\n' +
                '    close(auto: any) {\n' +
                '        auto.isOpen = false;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('read-only computed');
    });

    it('reports a template that renders the panel but cannot be parsed', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-autocomplete #auto>5</div>\n');

        await run();

        expect(messages.join('\n')).toContain('could not be parsed');
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const ts = firstTsPath();
        const [first] = projects.keys();

        appTree.overwrite(
            ts,
            "import { KbqAutocomplete } from '@koobiq/components/autocomplete';\n" +
                'class Demo {\n' +
                '    read(autocomplete: KbqAutocomplete) {\n' +
                '        return autocomplete.isOpen;\n' +
                '    }\n' +
                '}\n'
        );

        // Called through the rule rather than `runSchematic`: `ng update` runs the factory straight from
        // migrations.json, which carries no schema, so the `fix` default in schema.json never applies.
        const updated = await lastValueFrom(
            runner.callRule(autocompleteSignals({ project: first } as Schema), appTree)
        );

        expect(updated.readText(ts)).toContain('return autocomplete.isOpen();');
        expect(messages.join('\n')).not.toContain('would update');
    });
});
