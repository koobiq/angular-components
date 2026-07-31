import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'button-toggle-signals-and-aria';

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

    /** The generated app may or may not already ship a component stylesheet. */
    function writeStyles(filePath: string, content: string) {
        if (appTree.exists(filePath)) appTree.overwrite(filePath, content);
        else appTree.create(filePath, content);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    /** A `.ts` file that declares a `KbqButtonToggleGroup`-typed field around the given body. */
    const withGroup = (body: string): string => [
            "import { KbqButtonToggleGroup } from '@koobiq/components/button-toggle';",
            '',
            'export class Host {',
            '    group: KbqButtonToggleGroup;',
            '',
            '    run() {',
            `        ${body}`,
            '    }',
            '}',
            ''
        ].join('\n');

    /** A `.ts` file that declares a `KbqButtonToggle`-typed field around the given body. */
    const withToggle = (body: string): string => [
            "import { KbqButtonToggle } from '@koobiq/components/button-toggle';",
            '',
            'export class Host {',
            '    toggle: KbqButtonToggle;',
            '',
            '    run() {',
            `        ${body}`,
            '    }',
            '}',
            ''
        ].join('\n');

    describe('vertical / multiple (auto-fixed)', () => {
        it('rewrites a read into a call', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withGroup('const isMultiple = this.group.multiple;'));

            expect((await run(name)).readText(ts)).toContain('const isMultiple = this.group.multiple();');
        });

        it('rewrites a read used as a condition', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withGroup('if (this.group.vertical) { return; }'));

            expect((await run(name)).readText(ts)).toContain('if (this.group.vertical()) { return; }');
        });

        it('rewrites a read on a typed parameter', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(
                ts,
                [
                    "import { KbqButtonToggleGroup } from '@koobiq/components/button-toggle';",
                    '',
                    'export function isStacked(group: KbqButtonToggleGroup) {',
                    '    return group.vertical;',
                    '}',
                    ''
                ].join('\n')
            );

            expect((await run(name)).readText(ts)).toContain('return group.vertical();');
        });

        it('is idempotent', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withGroup('const isMultiple = this.group.multiple;'));

            const once = (await run(name)).readText(ts);

            appTree.overwrite(ts, once);

            expect((await run(name)).readText(ts)).toBe(once);
        });

        it('leaves a receiver that is not typed as the group alone', async () => {
            const { name, ts } = firstProject();
            const original = [
                "import { KbqButtonToggle } from '@koobiq/components/button-toggle';",
                '',
                'export class Host {',
                '    state: { multiple?: boolean } = {};',
                '    toggles: KbqButtonToggle[] = [];',
                '',
                '    run() {',
                '        return this.state.multiple;',
                '    }',
                '}',
                ''
            ].join('\n');

            appTree.overwrite(ts, original);

            expect((await run(name)).readText(ts)).toBe(original);
        });

        it('reports a write instead of rewriting it, since an input() has no set()', async () => {
            const { name, ts } = firstProject();
            const original = withGroup('this.group.vertical = true;');

            appTree.overwrite(ts, original);

            const messages = collectLogs();

            expect((await run(name)).readText(ts)).toBe(original);
            expect(messages.join('\n')).toContain('cannot be assigned');
        });
    });

    describe('removed and narrowed members', () => {
        it.each([
            ['mcButton', 'const button = this.toggle.mcButton;'],
            ['buttonToggleGroup', 'const group = this.toggle.buttonToggleGroup;'],
            ['icons', 'const icons = this.toggle.icons;'],
            ['iconType', 'this.toggle.iconType = "-icon";']
        ])('reports %s', async (member, body) => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withToggle(body));

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).toContain(`\`KbqButtonToggle.${member}\``);
        });

        it('reports the narrowed selected getter on a group', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withGroup('const selected = this.group.selected;'));

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).toContain('`KbqButtonToggleGroup.selected` is typed');
        });
    });

    describe('templates', () => {
        it('rewrites a read through a #ref="kbqButtonToggleGroup" reference', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(
                html,
                '<kbq-button-toggle-group #group="kbqButtonToggleGroup" multiple>\n' +
                    '    <kbq-button-toggle [value]="1">One</kbq-button-toggle>\n' +
                    '</kbq-button-toggle-group>\n' +
                    '<span>{{ group.multiple }}</span>\n'
            );

            expect((await run(name)).readText(html)).toContain('{{ group.multiple() }}');
        });

        it('rewrites the canonical ref- form', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(
                html,
                '<kbq-button-toggle-group ref-group="kbqButtonToggleGroup">\n' +
                    '    <kbq-button-toggle [value]="1">One</kbq-button-toggle>\n' +
                    '</kbq-button-toggle-group>\n' +
                    '<span>{{ group.vertical }}</span>\n'
            );

            expect((await run(name)).readText(html)).toContain('{{ group.vertical() }}');
        });

        it('rewrites a read in an inline template', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(
                ts,
                [
                    "import { Component } from '@angular/core';",
                    '',
                    '@Component({',
                    "    selector: 'app-root',",
                    '    template: `',
                    '        <kbq-button-toggle-group #group="kbqButtonToggleGroup">',
                    '            <kbq-button-toggle [value]="1">One</kbq-button-toggle>',
                    '        </kbq-button-toggle-group>',
                    '        <span>{{ group.multiple }}</span>',
                    '    `',
                    '})',
                    'export class App {}',
                    ''
                ].join('\n')
            );

            expect((await run(name)).readText(ts)).toContain('{{ group.multiple() }}');
        });

        it('leaves the value accessor alone — it is still a getter', async () => {
            const { name, html } = firstProject();
            const original =
                '<kbq-button-toggle-group #group="kbqButtonToggleGroup">\n' +
                '    <kbq-button-toggle [value]="1">One</kbq-button-toggle>\n' +
                '</kbq-button-toggle-group>\n' +
                '<span>{{ group.value }}</span>\n';

            appTree.overwrite(html, original);

            expect((await run(name)).readText(html)).toBe(original);
        });
    });

    describe('icon-only toggles without an accessible name', () => {
        const iconOnly = (attrs = ''): string =>
            `<kbq-button-toggle-group>\n    <kbq-button-toggle ${attrs}[value]="1">\n` +
            '        <i kbq-icon="kbq-play_16"></i>\n' +
            '    </kbq-button-toggle>\n</kbq-button-toggle-group>\n';

        it('reports one with the line it sits on', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(html, iconOnly());

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).toContain('line 2: `<kbq-button-toggle>` projects icons only');
        });

        it.each([
            ['aria-label="Play" '],
            ['[aria-label]="label" '],
            ['[attr.aria-labelledby]="id" '],
            ['title="Play" ']
        ])('stays quiet when named with %s', async (attrs) => {
            const { name, html } = firstProject();

            appTree.overwrite(html, iconOnly(attrs));

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).not.toContain('projects icons only');
        });

        it('stays quiet when the toggle also projects a label', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(
                html,
                '<kbq-button-toggle-group>\n' +
                    '    <kbq-button-toggle [value]="1">\n' +
                    '        <i kbq-icon="kbq-play_16"></i>\n' +
                    '        Play\n' +
                    '    </kbq-button-toggle>\n' +
                    '</kbq-button-toggle-group>\n'
            );

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).not.toContain('projects icons only');
        });

        it('stays quiet when the label is an interpolation inside an element', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(
                html,
                '<kbq-button-toggle-group>\n' +
                    '    <kbq-button-toggle [value]="1">\n' +
                    '        <i kbqButtonPrefix kbq-icon="kbq-play_16"></i>\n' +
                    '        <span>{{ label }}</span>\n' +
                    '    </kbq-button-toggle>\n' +
                    '</kbq-button-toggle-group>\n'
            );

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).not.toContain('projects icons only');
        });

        it('reports one nested in a control-flow block', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(
                html,
                '<kbq-button-toggle-group>\n' +
                    '    @for (item of items; track item) {\n' +
                    '        <kbq-button-toggle [value]="item">\n' +
                    '            <i kbq-icon="kbq-play_16"></i>\n' +
                    '        </kbq-button-toggle>\n' +
                    '    }\n' +
                    '</kbq-button-toggle-group>\n'
            );

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).toContain('projects icons only');
        });
    });

    describe('stylesheets', () => {
        it('reports a copied theme selector that no longer matches', async () => {
            const { name, scss } = firstProject();

            writeStyles(scss, '.kbq-button-toggle-group .kbq-button-toggle > .kbq-icon-button { color: red; }\n');

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).toContain('`.kbq-button-icon`');
        });

        it('ignores a stylesheet that has nothing to do with the button-toggle', async () => {
            const { name, scss } = firstProject();

            writeStyles(scss, '.kbq-icon-button { color: red; }\n');

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).not.toContain('`.kbq-button-icon`');
        });
    });

    describe('dry run', () => {
        it('does not write when fix is false', async () => {
            const { name, ts } = firstProject();
            const original = withGroup('const isMultiple = this.group.multiple;');

            appTree.overwrite(ts, original);

            const messages = collectLogs();
            const result = await run(name, false);

            expect(result.readText(ts)).toBe(original);
            expect(messages.join('\n')).toContain('run with --fix to apply');
        });
    });

    it('prints the behaviour note once', async () => {
        const { name } = firstProject();
        const messages = collectLogs();

        await run(name);

        const joined = messages.join('\n');

        expect(joined).toContain('role="radiogroup"');
        expect(joined).toContain('Arrow keys now move focus and selection together');
    });
});
