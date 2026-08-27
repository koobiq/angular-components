import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'list-tree-multiple-input';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;
    let firstProject: string;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const workspace = await getWorkspace(appTree);

        projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
        [firstProject] = projects.keys();
    });

    function paths(project = firstProject) {
        // The exact file names from @schematics/angular:application vary across versions
        // (app.ts vs app.component.ts), so discover them from the tree.
        const root = `/${projects.get(project)!.root}/src/app`;
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const html = appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;

        return { ts, html };
    }

    function run(project = firstProject, fix = true) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    /** Wraps a template in the inline `@Component({ template })` of a `.ts` source. */
    function inlineComponent(template: string): string {
        return [
            "import { Component } from '@angular/core';",
            '',
            '@Component({',
            "    selector: 'app-root',",
            '    template: `',
            `        ${template}`,
            '    `',
            '})',
            'export class App {}',
            ''
        ].join('\n');
    }

    describe('single-intent values are removed', () => {
        it.each(['false', 'single'])('removes multiple="%s" from a list', async (value) => {
            const { html } = paths();

            appTree.overwrite(html, `<kbq-list-selection multiple="${value}"></kbq-list-selection>`);

            const result = await run();

            expect(result.readText(html)).toBe('<kbq-list-selection></kbq-list-selection>');
        });

        it.each(['false', 'single'])('removes multiple="%s" from a tree', async (value) => {
            const { html } = paths();

            appTree.overwrite(html, `<kbq-tree-selection multiple="${value}"></kbq-tree-selection>`);

            const result = await run();

            expect(result.readText(html)).toBe('<kbq-tree-selection></kbq-tree-selection>');
        });

        it('takes the attribute line with it when it is written on its own line', async () => {
            const { html } = paths();

            appTree.overwrite(
                html,
                ['<kbq-list-selection', '    multiple="false"', '    [disabled]="true"', '></kbq-list-selection>'].join(
                    '\n'
                )
            );

            const result = await run();

            expect(result.readText(html)).toBe(
                ['<kbq-list-selection', '    [disabled]="true"', '></kbq-list-selection>'].join('\n')
            );
        });

        it('reports the removal as a behaviour change', async () => {
            const { html } = paths();
            const messages = collectLogs();

            appTree.overwrite(html, '<kbq-list-selection multiple="false"></kbq-list-selection>');

            await run();

            const log = messages.join('\n');

            expect(log).toContain('BEHAVIOUR CHANGE');
            expect(log).toContain('multiple="checkbox"');
        });
    });

    describe('every other unrecognized value becomes checkbox', () => {
        it.each(['multiple', 'yes', 'Checkbox', '1'])(
            'rewrites multiple="%s", which used to enable multiple selection',
            async (value) => {
                const { html } = paths();

                appTree.overwrite(html, `<kbq-list-selection multiple="${value}"></kbq-list-selection>`);

                const result = await run();

                expect(result.readText(html)).toBe('<kbq-list-selection multiple="checkbox"></kbq-list-selection>');
            }
        );

        it('reports the rewrite as behaviour-preserving', async () => {
            const { html } = paths();
            const messages = collectLogs();

            appTree.overwrite(html, '<kbq-list-selection multiple="yes"></kbq-list-selection>');

            await run();

            expect(messages.join('\n')).toContain('preserves the');
        });
    });

    describe('inline templates', () => {
        it('removes the attribute inside an inline template', async () => {
            const { ts } = paths();

            appTree.overwrite(ts, inlineComponent('<kbq-list-selection multiple="single"></kbq-list-selection>'));

            const result = await run();

            expect(result.readText(ts)).toBe(inlineComponent('<kbq-list-selection></kbq-list-selection>'));
        });

        it('rewrites an unrecognized value inside an inline template', async () => {
            const { ts } = paths();

            appTree.overwrite(ts, inlineComponent('<kbq-tree-selection multiple="multiple"></kbq-tree-selection>'));

            const result = await run();

            expect(result.readText(ts)).toBe(
                inlineComponent('<kbq-tree-selection multiple="checkbox"></kbq-tree-selection>')
            );
        });
    });

    describe('files it must not touch', () => {
        it.each(['', ' multiple', ' multiple=""', ' multiple="true"', ' multiple="checkbox"', ' multiple="keyboard"'])(
            'leaves <kbq-list-selection%s> alone',
            async (attribute) => {
                const { html } = paths();
                const template = `<kbq-list-selection${attribute}></kbq-list-selection>`;

                appTree.overwrite(html, template);

                const result = await run();

                expect(result.readText(html)).toBe(template);
            }
        );

        it('leaves multiple on other elements alone', async () => {
            const { html } = paths();
            const template = [
                '<kbq-tree-select multiple="true"></kbq-tree-select>',
                '<select multiple="multiple"></select>'
            ].join('\n');

            appTree.overwrite(html, template);

            const result = await run();

            expect(result.readText(html)).toBe(template);
        });

        it.each(['true', 'false', 'null', 'undefined'])(
            'leaves [multiple]="%s" alone and says nothing about it',
            async (expression) => {
                const { html } = paths();
                const messages = collectLogs();
                const template = `<kbq-list-selection [multiple]="${expression}"></kbq-list-selection>`;

                appTree.overwrite(html, template);

                const result = await run();

                expect(result.readText(html)).toBe(template);
                expect(messages.join('\n')).not.toContain('runtime expression');
            }
        );

        it('is idempotent', async () => {
            const { html } = paths();

            appTree.overwrite(html, '<kbq-list-selection multiple="yes"></kbq-list-selection>');

            const once = await run();
            const migrated = once.readText(html);

            appTree.overwrite(html, migrated);

            const twice = await run();

            expect(twice.readText(html)).toBe(migrated);
        });

        it('leaves the second project untouched when scoped to the first', async () => {
            const second = [...projects.keys()][1];
            const { html } = paths(second);
            const template = '<kbq-list-selection multiple="false"></kbq-list-selection>';

            appTree.overwrite(html, template);

            const result = await run(firstProject);

            expect(result.readText(html)).toBe(template);
        });
    });

    describe('warnings', () => {
        it('skips a dynamic binding and says why', async () => {
            const { html } = paths();
            const messages = collectLogs();
            const template = '<kbq-list-selection [multiple]="mode()"></kbq-list-selection>';

            appTree.overwrite(html, template);

            const result = await run();

            expect(result.readText(html)).toBe(template);
            expect(messages.join('\n')).toContain('runtime expression');
        });

        it('warns about an assignment to multipleMode', async () => {
            const { ts } = paths();
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                inlineComponent('<kbq-list-selection multiple="checkbox"></kbq-list-selection>').replace(
                    'export class App {}',
                    'export class App {\n    list: any;\n\n    toggle() {\n        this.list.multipleMode = null;\n    }\n}'
                )
            );

            await run();

            expect(messages.join('\n')).toContain('multipleMode is now an accessor');
        });

        it('warns about a selectionModel.changed subscription', async () => {
            const { ts } = paths();
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                inlineComponent('<kbq-tree-selection multiple="checkbox"></kbq-tree-selection>').replace(
                    'export class App {}',
                    'export class App {\n    tree: any;\n\n    ngOnInit() {\n        this.tree.selectionModel.changed.subscribe(() => {});\n    }\n}'
                )
            );

            await run();

            expect(messages.join('\n')).toContain('replaces the SelectionModel instance');
        });
    });

    describe('dry run', () => {
        it('writes nothing but reports what would change', async () => {
            const { html } = paths();
            const messages = collectLogs();
            const template = '<kbq-list-selection multiple="false"></kbq-list-selection>';

            appTree.overwrite(html, template);

            const result = await run(firstProject, false);

            expect(result.readText(html)).toBe(template);
            expect(messages.join('\n')).toContain('would update');
        });
    });

    describe('ng update entry point', () => {
        it('applies the fix when invoked without options', async () => {
            const { html } = paths();

            appTree.overwrite(html, '<kbq-list-selection multiple="single"></kbq-list-selection>');

            // `ng update` passes no options, and migrations.json declares no schema, so the schema
            // default never reaches the rule — it has to default `fix` itself.
            const runnerFromMigrations = new SchematicTestRunner('migrations', migrationsPath);
            const result = await runnerFromMigrations.runSchematic(SCHEMATIC_NAME, {}, appTree);

            expect(result.readText(html)).toBe('<kbq-list-selection></kbq-list-selection>');
        });
    });
});
