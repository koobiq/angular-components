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

    it('rewrites toBoolean(x) call to booleanAttribute(x)', async () => {
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
});
