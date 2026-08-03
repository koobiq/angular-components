import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { readFileSync } from 'fs';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'button-state-and-styles';

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

        return { ts, html, scss: `/${project.root}/src/styles.scss` };
    }

    function run(project: string, fix = true) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    describe('removed border-radius mixins', () => {
        it('rewrites every physical mixin to its logical counterpart', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);

            appTree.overwrite(
                scss,
                '.a {\n' +
                    '    @include border-right-radius(0);\n' +
                    '    @include border-left-radius(0);\n' +
                    '    @include border-top-radius(var(--kbq-size-border-radius));\n' +
                    '    @include border-bottom-radius(4px);\n' +
                    '}\n'
            );

            const updated = (await run(first)).readText(scss);

            expect(updated).toBe(
                '.a {\n' +
                    '    @include border-inline-end-radius(0);\n' +
                    '    @include border-inline-start-radius(0);\n' +
                    '    @include border-block-start-radius(var(--kbq-size-border-radius));\n' +
                    '    @include border-block-end-radius(4px);\n' +
                    '}\n'
            );
        });

        it('keeps the namespace of a namespaced include', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);

            appTree.overwrite(
                scss,
                "@use '@koobiq/components/core/styles/common/groups-mixins';\n" +
                    '.a {\n' +
                    '    @include groups-mixins.border-right-radius(0);\n' +
                    '}\n'
            );

            expect((await run(first)).readText(scss)).toContain('@include groups-mixins.border-inline-end-radius(0);');
        });

        it('leaves real CSS properties and unrelated text alone', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);
            const content =
                '.a {\n' +
                '    border-top-left-radius: 4px;\n' +
                '    border-bottom-right-radius: 4px;\n' +
                '    // border-right-radius used to live here\n' +
                '    --border-top-radius: 4px;\n' +
                '}\n';

            appTree.overwrite(scss, content);

            // Only `@include` calls are rewritten, so a CSS declaration, a custom
            // property and a comment survive untouched.
            expect((await run(first)).readText(scss)).toBe(content);
        });

        it('does not write in dry-run mode but reports the file', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);
            const content = '.a {\n    @include border-right-radius(0);\n}\n';

            appTree.overwrite(scss, content);

            const messages = collectLogs();
            const updated = (await run(first, false)).readText(scss);

            expect(updated).toBe(content);
            expect(messages.join('\n')).toContain('would update');
        });
    });

    describe('button group ownership', () => {
        it('reports a nested button that sets its own kbqStyle', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(
                html,
                '<div kbqButtonGroupRoot [kbqStyle]="groupStyle">\n' +
                    '    <button kbq-button [kbqStyle]="ownStyle">Overridden</button>\n' +
                    '    <button kbq-button>Inherited</button>\n' +
                    '</div>\n'
            );

            const messages = collectLogs();

            await run(first);

            const joined = messages.join('\n');

            expect(joined).toContain('`kbqStyle`');
            expect(joined).toContain('treats the button as the owner');
            // The button on line 3 declares nothing of its own.
            expect(joined).toContain(`${html}:2`);
            expect(joined).not.toContain(`${html}:3`);
        });

        it('reports every owned input of a button in one message', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(
                html,
                '<kbq-button-group>\n' +
                    '    <button kbq-button [color]="c" [disabled]="d">Both</button>\n' +
                    '</kbq-button-group>\n'
            );

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('`color` / `disabled`');
        });

        it('ignores a button that is not inside a group', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(
                html,
                '<button kbq-button [kbqStyle]="ownStyle">Standalone</button>\n' +
                    '<div kbqButtonGroupRoot>\n' +
                    '    <button kbq-button>Inherited</button>\n' +
                    '</div>\n'
            );

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).not.toContain('treats the button as the owner');
        });

        it('finds a button nested deeper inside the group', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(
                html,
                '<div kbqButtonGroupRoot>\n' +
                    '    @if (visible) {\n' +
                    '        <button kbq-button [color]="c">Conditional</button>\n' +
                    '    }\n' +
                    '</div>\n'
            );

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('treats the button as the owner');
        });

        it('reports inline templates with a line number pointing into the file', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'import { Component } from "@angular/core";\n' +
                    '\n' +
                    '@Component({\n' +
                    '    template: `\n' +
                    '        <div kbqButtonGroupRoot>\n' +
                    '            <button kbq-button [color]="c">Owned</button>\n' +
                    '        </div>\n' +
                    '    `\n' +
                    '})\n' +
                    'export class App {}\n'
            );

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain(`${ts}:6`);
        });
    });

    describe('warnings', () => {
        it('warns about the removed custom properties', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);

            appTree.overwrite(scss, '.a {\n    --kbq-button-icon-size-content-padding: 2px;\n}\n');

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('already inert');
        });

        it('warns about a [disabled] selector in a stylesheet that mentions kbq-button', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);

            appTree.overwrite(scss, 'a[kbq-button][disabled] {\n    opacity: 0.5;\n}\n');

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('never matches now');
        });

        it('warns that .kbq-progress moved out of the common animation import', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);

            appTree.overwrite(scss, "@use '@koobiq/components/core/styles/common/animation';\n");

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('kbq-progress()');
        });

        it('warns about the button group and styler API changes in ts', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'import { KbqButtonCssStyler, KbqButtonGroupRoot } from "@koobiq/components/button";\n' +
                    'export class App { a: KbqButtonGroupRoot; b: KbqButtonCssStyler; }\n'
            );

            const messages = collectLogs();

            await run(first);

            const joined = messages.join('\n');

            expect(joined).toContain('boolean | undefined');
            expect(joined).toContain('readonly');
        });

        it('warns about disabled attribute assertions', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export const check = (el: HTMLElement) => el.hasAttribute("disabled");\n' +
                    '// covers <a kbq-button>\n'
            );

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('The disabled attribute moved');
        });

        it('warns about custom locale data missing the a11y section', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'import { KBQ_LOCALE_DATA } from "@koobiq/components/core";\n' +
                    'export const providers = [{ provide: KBQ_LOCALE_DATA, useValue: {} }];\n'
            );

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('a11y');
        });

        it('prints the behaviour note once per run', async () => {
            const [first] = projects.keys();
            const messages = collectLogs();

            await run(first);

            const joined = messages.join('\n');

            expect(joined).toContain('Rendered attributes changed for [kbq-button]');
            expect(joined.match(/Rendered attributes changed/g)).toHaveLength(1);
        });
    });

    describe('registration', () => {
        it('is registered as a 20.3.0 migration', async () => {
            const migrations = JSON.parse(readFileSync(migrationsPath, 'utf8'));

            expect(migrations.schematics[SCHEMATIC_NAME].version).toBe('20.3.0-0');
        });

        it('runs through the migrations collection', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);
            const migrationRunner = new SchematicTestRunner('migrations', migrationsPath);

            appTree.overwrite(scss, '.a {\n    @include border-left-radius(0);\n}\n');

            const tree = await migrationRunner.runSchematic(SCHEMATIC_NAME, { project: first }, appTree);

            expect(tree.readText(scss)).toContain('border-inline-start-radius');
        });
    });
});
