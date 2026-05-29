import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
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

    it('drops an import line entirely when the removed symbol was the only specifier', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { KbqValidationOptions } from '@koobiq/components/core';\nconst x: KbqValidationOptions | null = null;\n"
        );

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: true } satisfies Schema,
            appTree
        );

        const updated = result.readText(ts);

        // Neither the symbol nor its (now-empty) import line should remain.
        expect(updated).not.toMatch(/\bKbqValidationOptions\b/);
        expect(updated).not.toMatch(/import\s*\{[^}]*\}\s*from\s*['"]@koobiq\/components\/core['"]/);
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

    it('does nothing when fix=false', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const original = '<kbq-filter-search></kbq-filter-search>\n';

        appTree.overwrite(html, original);

        const result = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: first, fix: false } satisfies Schema,
            appTree
        );

        expect(result.readText(html)).toBe(original);
    });

    it('strips kbqDisableLegacyValidationDirectiveProvider call sites and the stale import', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        // Three call-site positions in a single array (first, middle, last) plus a
        // sole-occupant case, all paired with an import that contains the symbol
        // alongside others — the cleanup must leave the array, the sibling
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
});
