import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'navbar-signals-and-aria';

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
        // (app.ts vs app.component.ts), so discover them from the tree.
        const root = `/${project.root}/src/app`;
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const html = appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;
        const scss = `${root}/app.scss`;

        return { ts, html, scss };
    }

    function firstProject() {
        const [first] = projects.keys();

        return { name: first, ...paths(projects.get(first)!) };
    }

    function run(project: string, fix = true) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    /** A `.ts` file that declares a field of the given navbar type around the given body. */
    const withReceiver = (type: string, body: string): string => [
            `import { ${type} } from '@koobiq/components/navbar';`,
            '',
            'export class Host {',
            `    navbar: ${type};`,
            '',
            '    run() {',
            `        ${body}`,
            '    }',
            '}',
            ''
        ].join('\n');

    describe('KbqVerticalNavbar.expanded (auto-fixed)', () => {
        it('rewrites a read into a call', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withReceiver('KbqVerticalNavbar', 'const open = this.navbar.expanded;'));

            const tree = await run(name);

            expect(tree.read(ts)!.toString()).toContain('const open = this.navbar.expanded();');
        });

        it('rewrites a write into a set', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withReceiver('KbqVerticalNavbar', 'this.navbar.expanded = true;'));

            const tree = await run(name);

            expect(tree.read(ts)!.toString()).toContain('this.navbar.expanded.set(true);');
        });

        it('leaves an already migrated access alone', async () => {
            const { name, ts } = firstProject();
            const source = withReceiver('KbqVerticalNavbar', 'this.navbar.expanded.set(!this.navbar.expanded());');

            appTree.overwrite(ts, source);

            const tree = await run(name);

            expect(tree.read(ts)!.toString()).toBe(source);
        });

        it('rewrites configuration and tabIndex too', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(
                ts,
                withReceiver('KbqVerticalNavbar', 'const label = this.navbar.configuration.toggle.expand;')
            );

            const tree = await run(name);

            expect(tree.read(ts)!.toString()).toContain('this.navbar.configuration().toggle.expand');
        });
    });

    describe('KbqNavbarItem (auto-fixed)', () => {
        it('rewrites isCollapsed and collapsable reads into calls', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(
                ts,
                withReceiver('KbqNavbarItem', 'const hidden = this.navbar.isCollapsed && this.navbar.collapsable;')
            );

            const tree = await run(name);

            expect(tree.read(ts)!.toString()).toContain('this.navbar.isCollapsed() && this.navbar.collapsable()');
        });
    });

    describe('KbqNavbarRectangleElement (auto-fixed)', () => {
        it('rewrites an orientation write', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withReceiver('KbqNavbarRectangleElement', 'this.navbar.vertical = true;'));

            const tree = await run(name);

            expect(tree.read(ts)!.toString()).toContain("this.navbar.orientation = 'vertical';");
        });

        it('rewrites an orientation read', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withReceiver('KbqNavbarRectangleElement', 'const h = this.navbar.horizontal;'));

            const tree = await run(name);

            expect(tree.read(ts)!.toString()).toContain('const h = this.navbar.isHorizontal();');
        });
    });

    describe('template reference variables', () => {
        it('rewrites reads through #ref="KbqVerticalNavbar" in an external template', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(
                html,
                '<kbq-vertical-navbar #nav="KbqVerticalNavbar">@if (nav.expanded) { <span>x</span> }</kbq-vertical-navbar>'
            );

            const tree = await run(name);

            expect(tree.read(html)!.toString()).toContain('@if (nav.expanded())');
        });

        it('rewrites reads through #ref="kbqNavbarItem" in an inline template', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(
                ts,
                [
                    "import { Component } from '@angular/core';",
                    "import { KbqNavbarModule } from '@koobiq/components/navbar';",
                    '',
                    '@Component({',
                    "    selector: 'app-root',",
                    '    template: `<kbq-navbar-item #item="kbqNavbarItem">{{ item.isCollapsed }}</kbq-navbar-item>`',
                    '})',
                    'export class App {}',
                    ''
                ].join('\n')
            );

            const tree = await run(name);

            expect(tree.read(ts)!.toString()).toContain('{{ item.isCollapsed() }}');
        });
    });

    describe('warnings', () => {
        it('warns about the removed disabled member', async () => {
            const { name, ts } = firstProject();
            const messages = collectLogs();

            appTree.overwrite(ts, withReceiver('KbqNavbarItem', 'const d = this.navbar.disabled;'));

            await run(name);

            expect(messages.join('\n')).toContain('navbarFocusableItem.disabled');
        });

        it('warns about the removed KbqNavbarContainerPositionType', async () => {
            const { name, ts } = firstProject();
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "import { KbqNavbarContainerPositionType } from '@koobiq/components/navbar';\nexport const x: KbqNavbarContainerPositionType = 'left';\n"
            );

            await run(name);

            expect(messages.join('\n')).toContain('KbqNavbarContainerPositionType');
        });

        it('warns about a stylesheet matching the removed disabled attribute', async () => {
            const { name, scss } = firstProject();
            const messages = collectLogs();

            appTree.overwrite(scss, '.kbq-navbar-item[disabled] { opacity: 0.5; }\n');

            await run(name);

            expect(messages.join('\n')).toContain('aria-disabled');
        });

        it('prints the behaviour note once per run', async () => {
            const { name } = firstProject();
            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).toContain('Ctrl+/ now toggles one vertical navbar');
        });
    });

    it('does not write files in dry-run mode', async () => {
        const { name, ts } = firstProject();
        const source = withReceiver('KbqVerticalNavbar', 'const open = this.navbar.expanded;');

        appTree.overwrite(ts, source);

        const tree = await run(name, false);

        expect(tree.read(ts)!.toString()).toBe(source);
    });
});
