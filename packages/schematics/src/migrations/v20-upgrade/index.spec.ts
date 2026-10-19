import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'v20-upgrade';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });
        const workspace = await getWorkspace(appTree);

        projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
    });

    function paths(project: workspaces.ProjectDefinition) {
        // The exact file names from @schematics/angular:application vary across versions
        // (app.ts vs app.component.ts, app.html vs app.component.html). Discover them
        // from the tree to stay robust.
        const root = `/${project.root}/src/app`;
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const html = appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;

        return {
            ts,
            html,
            scss: `/${project.root}/src/styles.scss`
        };
    }

    it('rewrites @koobiq/cdk/{a11y,keycodes,testing} imports to @koobiq/components/core', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { FocusKeyManager } from '@koobiq/cdk/a11y';\n" +
                "import { ENTER } from '@koobiq/cdk/keycodes';\n" +
                "import { dispatchKeyboardEvent } from '@koobiq/cdk/testing';\n" +
                'const x: any = [FocusKeyManager, ENTER, dispatchKeyboardEvent];\n'
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        expect(updated).not.toContain('@koobiq/cdk');
        expect(updated).toContain("from '@koobiq/components/core'");
    });

    it('rewrites @koobiq/components/navbar-ic imports to @koobiq/components/navbar', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { KbqNavbarIcModule } from '@koobiq/components/navbar-ic';\nconst x: any = KbqNavbarIcModule;\n"
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        expect(updated).toContain("from '@koobiq/components/navbar'");
        expect(updated).not.toContain("from '@koobiq/components/navbar-ic'");
        expect(updated).toContain('KbqNavbarModule');
        expect(updated).not.toContain('KbqNavbarIcModule');
    });

    it('rewrites <kbq-filter-search> → <kbq-search-expandable> in templates', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<kbq-filter-search></kbq-filter-search>\n');

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('<kbq-search-expandable>');
        expect(updated).toContain('</kbq-search-expandable>');
        expect(updated).not.toContain('kbq-filter-search');
    });

    it('rewrites the KbqFilterBarSearch input bindings onto their kbq-search-expandable names', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(
            html,
            '<kbq-filter-search [emitValueByEnter]="true" [onSearchTimeout]="300"></kbq-filter-search>\n'
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('[isEmitValueByEnterEnabled]="true"');
        expect(updated).toContain('[emitValueTimeout]="300"');
        expect(updated).not.toContain('emitValueByEnter');
        expect(updated).not.toContain('onSearchTimeout');
    });

    it('rewrites the static and bare attribute forms of the KbqFilterBarSearch inputs', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<kbq-filter-search emitValueByEnter onSearchTimeout="300"></kbq-filter-search>\n');

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('<kbq-search-expandable isEmitValueByEnterEnabled emitValueTimeout="300">');
    });

    it('rewrites the bare attribute in an inline template without touching a TypeScript declaration', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            'export class App {\n' +
                '    template = `<kbq-filter-search emitValueByEnter></kbq-filter-search>`;\n' +
                '    emitValueByEnter = false;\n' +
                '}\n'
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        expect(updated).toContain('<kbq-search-expandable isEmitValueByEnterEnabled>');
        expect(updated).toContain('emitValueByEnter = false;');
    });

    it('leaves a TypeScript read of emitValueByEnter alone while still rewriting the inline template', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            'export class App {\n' +
                '    emitValueByEnter = false;\n' +
                '    other = true;\n' +
                '    readonly enabled = this.emitValueByEnter && this.other;\n' +
                '    template = `<kbq-filter-search emitValueByEnter></kbq-filter-search>`;\n' +
                '}\n'
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        expect(updated).toContain('readonly enabled = this.emitValueByEnter && this.other;');
        expect(updated).toContain('<kbq-search-expandable isEmitValueByEnterEnabled>');
    });

    it('rewrites the KbqFilterBarSearch tooltip input without touching tooltip attributes elsewhere', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(
            html,
            '<kbq-filter-search [tooltip]="hint"></kbq-filter-search>\n' +
                '<kbq-filter-search tooltip="Search"></kbq-filter-search>\n' +
                '<span [tooltip]="hint">untouched</span>\n'
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('<kbq-search-expandable [tooltipText]="hint">');
        expect(updated).toContain('<kbq-search-expandable tooltipText="Search">');
        expect(updated).toContain('<span [tooltip]="hint">untouched</span>');
    });

    it('warns about initialValue and (onSearch), which have no counterpart, without auto-fixing them', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const original =
            '<kbq-filter-search [initialValue]="seed" (onSearch)="onSearch($event)"></kbq-filter-search>\n';

        appTree.overwrite(html, original);

        const messages: string[] = [];

        runner.logger.subscribe((entry) => {
            if (entry.message) messages.push(entry.message);
        });

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('[initialValue]="seed"');
        expect(updated).toContain('(onSearch)="onSearch($event)"');
        expect(messages.some((m) => m.includes('initialValue'))).toBe(true);
        expect(messages.some((m) => m.includes('onSearch'))).toBe(true);
    });

    it('warns about kbq-filter-search used as an attribute, which has no element-only counterpart', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const original = '<div kbq-filter-search></div>\n';

        appTree.overwrite(html, original);

        const messages: string[] = [];

        runner.logger.subscribe((entry) => {
            if (entry.message) messages.push(entry.message);
        });

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(html)).toBe(original);
        expect(messages.some((m) => m.includes('element-only'))).toBe(true);
    });

    it('does not raise the attribute warning for the element form it rewrites', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<kbq-filter-search></kbq-filter-search>\n');

        const messages: string[] = [];

        runner.logger.subscribe((entry) => {
            if (entry.message) messages.push(entry.message);
        });

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(html)).toContain('<kbq-search-expandable>');
        expect(messages.some((m) => m.includes('element-only'))).toBe(false);
    });

    it('warns that the emit timeout default changed from 0 to 200', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<kbq-filter-search></kbq-filter-search>\n');

        const messages: string[] = [];

        runner.logger.subscribe((entry) => {
            if (entry.message) messages.push(entry.message);
        });

        await runner.runSchematic(SCHEMATIC_NAME, { project: first, fix: true } satisfies Schema, appTree);

        expect(messages.some((m) => m.includes('defaults to 200'))).toBe(true);
    });

    it('rewrites kbqFormFieldWithoutBorders → noBorders', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<kbq-form-field kbqFormFieldWithoutBorders></kbq-form-field>\n');

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('noBorders');
        expect(updated).not.toContain('kbqFormFieldWithoutBorders');
    });

    it('rewrites [kbqWarningTooltip] to kbqTooltipModifier + [kbqTooltip]', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<kbq-form-field [kbqWarningTooltip]="msg"></kbq-form-field>\n');

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('kbqTooltipModifier="warning"');
        expect(updated).toContain('[kbqTooltip]="msg"');
        expect(updated).not.toContain('[kbqWarningTooltip]');
    });

    it('rewrites toBoolean(x) call to booleanAttribute(x), injects @angular/core import, and removes the stale toBoolean import', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(ts, "import { toBoolean } from '@koobiq/components/core';\nconst v = toBoolean('true');\n");

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        expect(updated).toContain('booleanAttribute(');
        expect(updated).not.toContain('toBoolean(');
        // Import injection — the rewrite would otherwise leave booleanAttribute undefined.
        expect(updated).toMatch(/import\s*\{[^}]*\bbooleanAttribute\b[^}]*\}\s*from\s*['"]@angular\/core['"]/);
        // The stale `toBoolean` import must be dropped — that symbol no longer exists in v20.
        expect(updated).not.toMatch(/import\s*\{[^}]*\btoBoolean\b[^}]*\}/);
    });

    it('keeps sibling imports when removing a stale symbol from a multi-symbol clause', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\nimport { KbqColorDirective, toBoolean, ThemePalette } from '@koobiq/components/core';\nconst v = toBoolean('x');\n"
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        // toBoolean stripped, the other two named imports kept.
        expect(updated).not.toMatch(/\btoBoolean\b/);
        expect(updated).toMatch(
            /import\s*\{[^}]*\bKbqColorDirective\b[^}]*\bThemePalette\b[^}]*\}\s*from\s*['"]@koobiq\/components\/core['"]/
        );
    });

    it('keeps the layout of a multi-line import clause it removes a stale symbol from', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            [
                "import { booleanAttribute } from '@angular/core';",
                'import {',
                '    KbqColorDirective,',
                '    toBoolean,',
                '    kbqErrorStateMatcherProvider',
                "} from '@koobiq/components/core';",
                '',
                "export const v = [toBoolean('x'), booleanAttribute, KbqColorDirective, kbqErrorStateMatcherProvider];",
                ''
            ].join('\n')
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(
            [
                "import { booleanAttribute } from '@angular/core';",
                'import {',
                '    KbqColorDirective,',
                '    kbqErrorStateMatcherProvider',
                "} from '@koobiq/components/core';",
                '',
                "export const v = [booleanAttribute('x'), booleanAttribute, KbqColorDirective, kbqErrorStateMatcherProvider];",
                ''
            ].join('\n')
        );
    });

    it('drops an import line entirely when the removed symbol was the only specifier', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { KbqCommonModule } from '@koobiq/components/core';\nexport const imports = [KbqCommonModule];\n"
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe('export const imports = [];\n');
    });

    it('leaves a removed symbol used outside a list untouched and reports it', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages: string[] = [];
        const legacy = [
            "import { Inject, NgModule, Optional } from '@angular/core';",
            "import { KBQ_VALIDATION, KbqValidationOptions } from '@koobiq/components/core';",
            'export class Legacy {',
            '    constructor(@Optional() @Inject(KBQ_VALIDATION) private validation: KbqValidationOptions) {}',
            '}',
            ''
        ].join('\n');

        appTree.overwrite(
            ts,
            legacy.replace('import { KBQ_VALIDATION, ', 'import { KbqCommonModule, KBQ_VALIDATION, ') +
                '@NgModule({ imports: [KbqCommonModule] })\nexport class LegacyModule {}\n'
        );
        runner.logger.subscribe((entry) => messages.push(entry.message));

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );
        const log = messages.join('\n');

        expect(result.readText(ts)).toBe(`${legacy}@NgModule({ imports: [] })\nexport class LegacyModule {}\n`);
        expect(log).toContain('`KBQ_VALIDATION` was removed in 20.0.0');
        expect(log).toContain('`KbqValidationOptions` was removed in 20.0.0');
        expect(log).not.toContain('`KbqCommonModule` was removed in 20.0.0');
    });

    it('keeps one import specifier when a rename gives two the same name', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            [
                "import { KbqDatepickerToggle, KbqDatepickerToggleIconComponent } from '@koobiq/components/datepicker';",
                'import {',
                '    KbqFormField,',
                '    KbqFormFieldRef,',
                '    KbqFormFieldModule',
                "} from '@koobiq/components/form-field';",
                "import { type KbqWarningTooltipTrigger, KbqTooltipTrigger } from '@koobiq/components/tooltip';",
                'export const toggles = [KbqDatepickerToggle, KbqDatepickerToggleIconComponent];',
                'export const fields = [KbqFormField, KbqFormFieldRef, KbqFormFieldModule];',
                'export const tooltip: KbqWarningTooltipTrigger = new KbqTooltipTrigger();',
                ''
            ].join('\n')
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(
            [
                "import { KbqDatepickerToggleIconComponent } from '@koobiq/components/datepicker';",
                'import {',
                '    KbqFormField,',
                '    KbqFormFieldModule',
                "} from '@koobiq/components/form-field';",
                "import { KbqTooltipTrigger } from '@koobiq/components/tooltip';",
                'export const toggles = [KbqDatepickerToggleIconComponent, KbqDatepickerToggleIconComponent];',
                'export const fields = [KbqFormField, KbqFormField, KbqFormFieldModule];',
                'export const tooltip: KbqTooltipTrigger = new KbqTooltipTrigger();',
                ''
            ].join('\n')
        );
    });

    it('rewrites the static-attribute form kbqWarningTooltip="text" to kbqTooltipModifier + kbqTooltip', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<span kbqWarningTooltip="watch out"></span>\n');

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('kbqTooltipModifier="warning"');
        expect(updated).toContain('kbqTooltip="watch out"');
        expect(updated).not.toContain('kbqWarningTooltip=');
    });

    it('extends an existing @angular/core import clause rather than duplicating the import line', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\nimport { toBoolean } from '@koobiq/components/core';\nconst v = toBoolean('x');\n"
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        // Only one @angular/core import line, containing both symbols.
        const angularCoreImports = updated.match(/from\s*['"]@angular\/core['"]/g) ?? [];

        expect(angularCoreImports.length).toBe(1);
        expect(updated).toMatch(
            /import\s*\{[^}]*\bComponent\b[^}]*\bbooleanAttribute\b[^}]*\}\s*from\s*['"]@angular\/core['"]/
        );
    });

    it('extends an import clause that ends in a comma without doubling it', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            [
                'import {',
                '    Component,',
                '    Input,',
                "} from '@angular/core';",
                "import { toBoolean } from '@koobiq/components/core';",
                "const v = toBoolean('x');",
                ''
            ].join('\n')
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(
            [
                'import {',
                '    Component,',
                "    Input, booleanAttribute } from '@angular/core';",
                "const v = booleanAttribute('x');",
                ''
            ].join('\n')
        );
    });

    it('rewrites selectors in @Component inline templates inside .ts files', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "@Component({ selector: 'x', template: '<kbq-filter-search></kbq-filter-search>' })\n" +
                'export class X {}\n'
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        expect(updated).toContain('<kbq-search-expandable>');
        expect(updated).toContain('</kbq-search-expandable>');
        expect(updated).not.toContain('kbq-filter-search');
    });

    it('warns about kbqComponentParams: needing inject(KBQ_MODAL_DATA) in the child component', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(ts, "const opts = { kbqComponentParams: { title: 'x' } };\n");

        const messages: string[] = [];

        runner.logger.subscribe((entry) => {
            if (entry.message) messages.push(entry.message);
        });

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        // Caller-side gets rewritten…
        expect(updated).toContain('data:');
        expect(updated).not.toContain('kbqComponentParams:');
        // …and the user is told the child must change too.
        expect(messages.some((m) => m.includes('KBQ_MODAL_DATA'))).toBe(true);
    });

    it('rewrites .kbq-risk-level CSS class to .kbq-badge', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);

        appTree.overwrite(scss, '.kbq-risk-level { color: red; }\n');

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(scss);

        expect(updated).toContain('.kbq-badge');
        expect(updated).not.toContain('.kbq-risk-level');
    });

    it('rewrites DropdownPositionX / DropdownPositionY type aliases to the Kbq-prefixed names', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { DropdownPositionX, DropdownPositionY } from '@koobiq/components/dropdown';\n" +
                "const x: DropdownPositionX = 'before';\n" +
                "const y: DropdownPositionY = 'below';\n"
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        expect(updated).toContain('KbqDropdownPositionX');
        expect(updated).toContain('KbqDropdownPositionY');
        // Old (un-prefixed) names are gone; `\b` boundaries leave the new
        // `Kbq…` names intact (no double-rewrite).
        expect(updated).not.toMatch(/\bDropdownPositionX\b/);
        expect(updated).not.toMatch(/\bDropdownPositionY\b/);
    });

    it('rewrites KbqCodeBlock [canLoad]/[codeFiles] bindings to [canDownload]/[files]', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<kbq-code-block [canLoad]="x" [codeFiles]="files"></kbq-code-block>\n');

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('[canDownload]="x"');
        expect(updated).toContain('[files]="files"');
        expect(updated).not.toContain('[canLoad]');
        expect(updated).not.toContain('[codeFiles]');
    });

    it('rewrites the static canLoad="true" attribute form to canDownload', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<kbq-code-block canLoad="true"></kbq-code-block>\n');

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(html)).toContain('canDownload="true"');
    });

    it('rewrites the static codeFiles="…" attribute form to files', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);

        appTree.overwrite(html, '<kbq-code-block codeFiles="a.ts"></kbq-code-block>\n');

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(html);

        expect(updated).toContain('files="a.ts"');
        expect(updated).not.toContain('codeFiles=');
    });

    it('rewrites canLoad/codeFiles only on <kbq-code-block>, past a > inside a quoted value', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const template = [
            '<kbq-code-block *ngIf="a > b" [canLoad]="x" codeFiles="a.ts"></kbq-code-block>',
            '<kbq-code-block canLoad [codeFiles]="files"></kbq-code-block>',
            '<my-loader [canLoad]="x" canLoad="true" [codeFiles]="files" codeFiles="a.ts"></my-loader>',
            ''
        ].join('\n');

        appTree.overwrite(html, template);

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(html)).toBe(
            [
                '<kbq-code-block *ngIf="a > b" [canDownload]="x" files="a.ts"></kbq-code-block>',
                '<kbq-code-block canDownload [files]="files"></kbq-code-block>',
                '<my-loader [canLoad]="x" canLoad="true" [codeFiles]="files" codeFiles="a.ts"></my-loader>',
                ''
            ].join('\n')
        );
    });

    it('keeps and reports an alias on a <kbq-code-block> that binds its replacement too', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const template = [
            '<kbq-code-block [canLoad]="x" *ngIf="a > b" [canDownload]="y" [codeFiles]="f"></kbq-code-block>',
            '<kbq-code-block codeFiles="a.ts" [title]="n > 0 ? \'a\' : \'b\'" [files]="files"></kbq-code-block>',
            ''
        ].join('\n');
        const messages: string[] = [];

        appTree.overwrite(html, template);
        runner.logger.subscribe((entry) => messages.push(entry.message));

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(html)).toBe(template.replace('[codeFiles]="f"', '[files]="f"'));
        expect(messages.some((m) => m.includes('binds `canLoad` next to `canDownload`'))).toBe(true);
    });

    it('does not report a <kbq-code-block> that binds each input once', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const messages: string[] = [];

        appTree.overwrite(
            html,
            '<kbq-code-block [canLoad]="allowed && canDownload" [codeFiles]="all ? files : []">canDownload files</kbq-code-block>\n'
        );
        runner.logger.subscribe((entry) => messages.push(entry.message));

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(html)).toBe(
            '<kbq-code-block [canDownload]="allowed && canDownload" [files]="all ? files : []">canDownload files</kbq-code-block>\n'
        );
        expect(messages.some((m) => m.includes('binds `canLoad` next to `canDownload`'))).toBe(false);
    });

    it('warns about KbqCodeBlock.scrollableCodeContent (use scrollTo())', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(ts, 'const el = cb.scrollableCodeContent();\n');

        const messages: string[] = [];

        runner.logger.subscribe((entry) => {
            if (entry.message) messages.push(entry.message);
        });

        await runner.runSchematic(SCHEMATIC_NAME, { project: first, fix: true } satisfies Schema, appTree);

        expect(messages.some((m) => m.includes('scrollableCodeContent'))).toBe(true);
    });

    it('warns about programmatic KbqCodeBlock.canLoad/.codeFiles access (TS) without auto-fixing', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        // Property access (`.canLoad` / `.codeFiles`) must be warned, but NOT auto-migrated
        // (only template attribute bindings are rewritten).
        appTree.overwrite(ts, 'const a = cb.canLoad;\nconst b = cb.codeFiles;\n');

        const messages: string[] = [];

        runner.logger.subscribe((entry) => {
            if (entry.message) messages.push(entry.message);
        });

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        expect(updated).toContain('cb.canLoad');
        expect(updated).toContain('cb.codeFiles');
        expect(messages.some((m) => m.includes('canDownload'))).toBe(true);
    });

    it('warns about deprecated KbqFilter.required without auto-fixing it', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original = "const f = { name: 'x', required: true, cleanable: true };\n";

        appTree.overwrite(ts, original);

        const messages: string[] = [];

        runner.logger.subscribe((entry) => {
            if (entry.message) messages.push(entry.message);
        });

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toContain('required: true'); // not auto-fixed
        expect(messages.some((m) => m.includes('required'))).toBe(true);
    });

    it('warns about (onSaveAsNew) without auto-fixing', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const original = '<kbq-filters (onSaveAsNew)="handler($event)"></kbq-filters>\n';

        appTree.overwrite(html, original);

        const messages: string[] = [];

        runner.logger.subscribe((entry) => {
            if (entry.message) messages.push(entry.message);
        });

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(html)).toContain('(onSaveAsNew)'); // not auto-fixed
        expect(messages.some((m) => m.includes('(onSaveAsNew)'))).toBe(true);
    });

    it('reports instead of writing with fix: false', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const original = '<kbq-filter-search></kbq-filter-search>\n';
        const messages: string[] = [];

        appTree.overwrite(html, original);
        runner.logger.subscribe((entry) => messages.push(entry.message));

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: false } satisfies Schema,
            appTree
        );
        const log = messages.join('\n');

        expect(result.readText(html)).toBe(original);
        expect(log).toContain(`[v20-upgrade] would update ${html} (run with --fix to apply)`);
        expect(log).toMatch(/\[v20-upgrade\] processed tree under "[^"]+", would update 1 file\(s\)\./);
    });

    it('strips kbqDisableLegacyValidationDirectiveProvider call sites and the stale import', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        // Three call-site positions in a single array (first, middle, last) plus a
        // sole-occupant case, all paired with an import that contains the symbol
        // alongside others — the removal must leave the array, the sibling
        // providers, and the import clause healthy.
        appTree.overwrite(
            ts,
            "import { kbqDisableLegacyValidationDirectiveProvider, kbqErrorStateMatcherProvider, KbqColorDirective } from '@koobiq/components/core';\n" +
                'const a = () => null;\n' +
                'const b = () => null;\n' +
                'const middle = { providers: [a(), kbqDisableLegacyValidationDirectiveProvider(), b()] };\n' +
                'const first = { providers: [kbqDisableLegacyValidationDirectiveProvider(), a()] };\n' +
                'const last = { providers: [a(), kbqDisableLegacyValidationDirectiveProvider()] };\n' +
                'const sole = { providers: [kbqDisableLegacyValidationDirectiveProvider()] };\n' +
                'const _color: KbqColorDirective | null = null;\n'
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        // No call sites or imports survive.
        expect(updated).not.toContain('kbqDisableLegacyValidationDirectiveProvider');
        // Siblings inside the arrays survive.
        expect(updated).toMatch(/providers:\s*\[a\(\), b\(\)\]/); // middle
        expect(updated).toMatch(/providers:\s*\[a\(\)\]/); // first + last collapse to same shape
        // The sole-occupant array is left as `providers: []` — empty but legal; the
        // schematic's note tells the user to drop the key manually if desired.
        expect(updated).toMatch(/providers:\s*\[\s*\]/);
        // Sibling imports kept; symbol gone.
        expect(updated).toMatch(/import\s*\{[^}]*\bkbqErrorStateMatcherProvider\b[^}]*\bKbqColorDirective\b[^}]*\}/);
    });

    it('removes a symbol with one of its commas from any place in a list', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            [
                'import {',
                '    KbqCommonModule,',
                '    KbqColorDirective,',
                '    type KbqValidationOptions,',
                '    kbqErrorStateMatcherProvider,',
                "} from '@koobiq/components/core';",
                "import type { KbqFileUploadModule, KbqInputFile } from '@koobiq/components/file-upload';",
                "import { KBQ_SIDEPANEL_WITH_SHADOW } from '@koobiq/components/sidepanel';",
                'export const first = [KbqCommonModule, KbqColorDirective];',
                'export const middle = [KbqColorDirective, KbqCommonModule, kbqErrorStateMatcherProvider];',
                'export const last = [KbqColorDirective, KbqCommonModule];',
                'export const only = [KbqCommonModule];',
                'export const lines = [',
                '    KbqColorDirective,',
                '    KbqCommonModule,',
                '];',
                'export type Upload = KbqFileUploadModule;',
                ''
            ].join('\n')
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(
            [
                'import {',
                '    KbqColorDirective,',
                '    kbqErrorStateMatcherProvider,',
                "} from '@koobiq/components/core';",
                "import type { KbqFileUploadModule } from '@koobiq/components/file-upload';",
                'export const first = [KbqColorDirective];',
                'export const middle = [KbqColorDirective, kbqErrorStateMatcherProvider];',
                'export const last = [KbqColorDirective];',
                'export const only = [];',
                'export const lines = [',
                '    KbqColorDirective,',
                '];',
                'export type Upload = KbqFileUploadModule;',
                ''
            ].join('\n')
        );
    });

    it('leaves the commas of the rest of a file alone when it removes a symbol', async () => {
        const [first] = projects.keys();
        const { ts, html } = paths(projects.get(first)!);
        const rest = [
            'const pair = [1, 2];',
            'export const [, second] = pair;',
            'export const values = (m: Record<string, number>) => Object.entries(m).map(([, v]) => v);',
            'export const words = (s: string) => s.split(/[\\s,]+/);',
            'export const separator = /[,;]/;',
            "export const doubled = 'a,,b';",
            'export const options = {',
            '    a: 1,',
            '};',
            'export const list = [',
            '    1,',
            '];',
            ''
        ].join('\n');
        const markup = '<input pattern="[,;]+" />\n<p>a,,b</p>\n';

        appTree.overwrite(
            ts,
            "import { KbqColorDirective, KbqCommonModule } from '@koobiq/components/core';\n" +
                'export const imports = [KbqCommonModule, KbqColorDirective];\n' +
                rest
        );
        appTree.overwrite(html, `<kbq-divider [inset]="true"></kbq-divider>\n${markup}`);

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(
            "import { KbqColorDirective } from '@koobiq/components/core';\n" +
                'export const imports = [KbqColorDirective];\n' +
                rest
        );
        expect(result.readText(html)).toBe(`<kbq-divider></kbq-divider>\n${markup}`);
    });

    it('imports a symbol it writes as a value past a type-only import or an alias of it', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const typeClause = ts.replace(/[^/]+$/, 'type-clause.ts');

        appTree.overwrite(
            ts,
            [
                "import { booleanAttribute as toBool } from '@angular/core';",
                "import { toBoolean } from '@koobiq/components/core';",
                'export const flags = (value: unknown) => [toBool(value), toBoolean(value)];',
                ''
            ].join('\n')
        );
        appTree.create(
            typeClause,
            [
                "import type { Signal } from '@angular/core';",
                "import { toBoolean } from '@koobiq/components/core';",
                'export const flag = (value: Signal<unknown>) => toBoolean(value());',
                ''
            ].join('\n')
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(
            [
                "import { booleanAttribute as toBool, booleanAttribute } from '@angular/core';",
                'export const flags = (value: unknown) => [toBool(value), booleanAttribute(value)];',
                ''
            ].join('\n')
        );
        expect(result.readText(typeClause)).toBe(
            [
                "import { booleanAttribute } from '@angular/core';",
                "import type { Signal } from '@angular/core';",
                'export const flag = (value: Signal<unknown>) => booleanAttribute(value());',
                ''
            ].join('\n')
        );
    });

    it('drops inset only on a <kbq-divider>', async () => {
        const [first] = projects.keys();
        const { ts, html } = paths(projects.get(first)!);
        const code = [
            "import { Component } from '@angular/core';",
            '',
            '@Component({',
            '    template: \'<kbq-divider inset /><mat-divider [inset]="true" />{{ inset ? 8 : 0 }}\'',
            '})',
            'export class Dividers {',
            '    readonly inset = 8;',
            '}',
            ''
        ].join('\n');
        const markup = '<mat-divider [inset]="true"></mat-divider>\n<p class="inset">{{ inset }}</p>\n';

        appTree.overwrite(ts, code);
        appTree.overwrite(html, `<kbq-divider class="list" inset="true"></kbq-divider>\n${markup}`);

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(code.replace('<kbq-divider inset />', '<kbq-divider />'));
        expect(result.readText(html)).toBe(`<kbq-divider class="list"></kbq-divider>\n${markup}`);
    });

    it('renames AnimationCurves and openPanel() of Koobiq only, not of Angular Material', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const material = ts.replace(/[^/]+$/, 'material.ts');
        const materialCode = [
            "import { AnimationCurves } from '@angular/material/core';",
            "import { MatAutocompleteTrigger } from '@angular/material/autocomplete';",
            'export const curve = AnimationCurves.STANDARD_CURVE;',
            'export const open = (trigger: MatAutocompleteTrigger) => trigger.openPanel();',
            ''
        ].join('\n');

        appTree.overwrite(
            ts,
            [
                "import { AnimationCurves } from '@koobiq/components/core';",
                "import { KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';",
                'export const curve = AnimationCurves.StandardCurve;',
                'export const open = (trigger: KbqAutocompleteTrigger) => trigger.openPanel();',
                ''
            ].join('\n')
        );
        appTree.create(material, materialCode);

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(
            [
                "import { KbqAnimationCurves } from '@koobiq/components/core';",
                "import { KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';",
                'export const curve = KbqAnimationCurves.StandardCurve;',
                'export const open = (trigger: KbqAutocompleteTrigger) => trigger.open();',
                ''
            ].join('\n')
        );
        expect(result.readText(material)).toBe(materialCode);
    });

    it('drops a re-export it empties', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            [
                "export { KbqCommonModule } from '@koobiq/components/core';",
                "export type { KbqValidationOptions } from '@koobiq/components/core';",
                "export { KbqColorDirective, KBQ_VALIDATION } from '@koobiq/components/core';",
                'export class App {}',
                ''
            ].join('\n')
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(
            ["export { KbqColorDirective } from '@koobiq/components/core';", 'export class App {}', ''].join('\n')
        );
    });

    it('adds a symbol past a line comment that ends an import clause', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const source = (input: string) => [
                'import {',
                '    Component,',
                `    ${input} // the input`,
                "} from '@angular/core';",
                "import { toBoolean } from '@koobiq/components/core';",
                "export const v = toBoolean('x');",
                ''
            ].join('\n');
        const comma = ts.replace(/[^/]+$/, 'comma.ts');

        appTree.overwrite(ts, source('Input'));
        appTree.create(comma, source('Input,'));

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );
        const expected = [
            'import {',
            '    Component,',
            '    Input, // the input',
            '    booleanAttribute',
            "} from '@angular/core';",
            "export const v = booleanAttribute('x');",
            ''
        ].join('\n');

        expect(result.readText(ts)).toBe(expected);
        expect(result.readText(comma)).toBe(expected);
    });

    it('keeps the line endings of a CRLF file when it adds an import', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            ["import { toBoolean } from '@koobiq/components/core';", "export const v = toBoolean('x');", ''].join(
                '\r\n'
            )
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        expect(result.readText(ts)).toBe(
            ["import { booleanAttribute } from '@angular/core';", "export const v = booleanAttribute('x');", ''].join(
                '\r\n'
            )
        );
    });

    it('applies the migration when `fix` is absent, as it is under `ng update`', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { FocusKeyManager } from '@koobiq/cdk/a11y';\n" + 'const x: any = [FocusKeyManager];\n'
        );

        // Run from migrations.json with no options, as `ng update` does: no schema default applies there.
        const migrationsRunner = new SchematicTestRunner('migrations', migrationsPath);

        const updated = await migrationsRunner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        expect(updated.readText(ts)).toContain("from '@koobiq/components/core'");
    });
});
