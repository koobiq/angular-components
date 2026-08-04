import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'button-supported-colors';

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

    describe('templates', () => {
        it('removes an unsupported color written as a plain attribute on its own line', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(
                html,
                '<button\n    kbq-button\n    color="error"\n    type="button"\n>\n    Go\n</button>\n'
            );

            const updated = (await run(first)).readText(html);

            expect(updated).toBe('<button\n    kbq-button\n    type="button"\n>\n    Go\n</button>\n');
        });

        it('removes an unsupported color bound as a string literal', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(html, '<button kbq-button [color]="\'warning\'" type="button">Go</button>\n');

            const updated = (await run(first)).readText(html);

            expect(updated).toBe('<button kbq-button type="button">Go</button>\n');
        });

        it('removes the canonical bind- form', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(html, '<button kbq-button bind-color="\'success\'">Go</button>\n');

            expect((await run(first)).readText(html)).toBe('<button kbq-button>Go</button>\n');
        });

        it.each(['theme', 'theme-fade', 'contrast', 'contrast-fade'])('keeps the supported color %s', async (color) => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const original = `<button kbq-button color="${color}">Go</button>\n`;

            appTree.overwrite(html, original);

            expect((await run(first)).readText(html)).toBe(original);
        });

        it('leaves color on an element that is not a button host', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const original = '<i kbq-icon="kbq-plus_16" color="error"></i>\n';

            appTree.overwrite(html, original);

            expect((await run(first)).readText(html)).toBe(original);
        });

        it.each(['kbq-button-group', 'kbq-split-button'])('migrates the %s host too', async (element) => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(html, `<${element} color="error"><button kbq-button>Go</button></${element}>\n`);

            expect((await run(first)).readText(html)).toBe(`<${element}><button kbq-button>Go</button></${element}>\n`);
        });

        it('reports every removal', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(html, '<button kbq-button color="error">Go</button>\n');

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('removed `color="error"`');
        });

        it('warns without rewriting when the color comes from an enum member', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const original = '<button kbq-button [color]="colors.Error">Go</button>\n';

            appTree.overwrite(html, original);

            const messages = collectLogs();

            expect((await run(first)).readText(html)).toBe(original);
            expect(messages.join('\n')).toContain('colors.Error');
        });

        it('leaves an enum member that still resolves to a supported color', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const original = '<button kbq-button [color]="colors.Contrast">Go</button>\n';

            appTree.overwrite(html, original);

            const messages = collectLogs();

            expect((await run(first)).readText(html)).toBe(original);
            expect(messages.join('\n')).not.toContain('colors.Contrast');
        });

        it('migrates an inline template', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { Component } from '@angular/core';\n" +
                    '@Component({\n' +
                    '    template: `<button kbq-button color="error">Go</button>`\n' +
                    '})\n' +
                    'export class App {}\n'
            );

            expect((await run(first)).readText(ts)).toContain('<button kbq-button>Go</button>');
        });

        it('does not write in dry-run mode', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const original = '<button kbq-button color="error">Go</button>\n';

            appTree.overwrite(html, original);

            const messages = collectLogs();

            expect((await run(first, false)).readText(html)).toBe(original);
            expect(messages.join('\n')).toContain('run with --fix to apply');
        });
    });

    describe('warnings', () => {
        it('flags a stylesheet targeting the old transparent default color', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);

            appTree.overwrite(scss, '.kbq-button_transparent.kbq-contrast-fade {\n    color: red;\n}\n');

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('no longer matches');
        });

        it('flags a programmatic assignment of an unsupported color', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(ts, 'button.color = KbqComponentColors.Error;\n');

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('assigns an unsupported color programmatically');
        });

        it('flags kbqOkType', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(ts, 'const options = { kbqOkType: someColor };\n');

            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('`kbqOkType`');
        });

        it('always prints the non-auto-fixable behaviour note', async () => {
            const [first] = projects.keys();
            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('renders in `contrast` instead of `contrast-fade`');
        });
    });
});
