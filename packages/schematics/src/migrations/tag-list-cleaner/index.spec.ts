import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'tag-list-cleaner';

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

    describe('handlers inside a tag list are removed', () => {
        it.each(['(click)', 'on-click'])('removes a %s handler', async (name) => {
            const { html } = paths();

            appTree.overwrite(html, `<kbq-tag-list><kbq-cleaner ${name}="clear()" /></kbq-tag-list>`);

            const result = await run();

            expect(result.readText(html)).toBe('<kbq-tag-list><kbq-cleaner /></kbq-tag-list>');
        });

        it('keeps the other bindings of the cleaner', async () => {
            const { html } = paths();

            appTree.overwrite(
                html,
                '<kbq-tag-list><kbq-cleaner (click)="clear()" [aria-label]="label" /></kbq-tag-list>'
            );

            const result = await run();

            expect(result.readText(html)).toBe('<kbq-tag-list><kbq-cleaner [aria-label]="label" /></kbq-tag-list>');
        });

        it('takes the attribute line with it when it is written on its own line', async () => {
            const { html } = paths();

            appTree.overwrite(
                html,
                [
                    '<kbq-tag-list>',
                    '    <kbq-cleaner',
                    '        (click)="clear()"',
                    '        [aria-label]="label"',
                    '    />',
                    '</kbq-tag-list>'
                ].join('\n')
            );

            const result = await run();

            expect(result.readText(html)).toBe(
                [
                    '<kbq-tag-list>',
                    '    <kbq-cleaner',
                    '        [aria-label]="label"',
                    '    />',
                    '</kbq-tag-list>'
                ].join('\n')
            );
        });

        it('reaches a cleaner nested deeper inside the list', async () => {
            const { html } = paths();

            appTree.overwrite(html, '<kbq-tag-list>@if (show) {<kbq-cleaner (click)="clear()" />}</kbq-tag-list>');

            const result = await run();

            expect(result.readText(html)).toBe('<kbq-tag-list>@if (show) {<kbq-cleaner />}</kbq-tag-list>');
        });

        it('removes the handler inside an inline template', async () => {
            const { ts } = paths();

            appTree.overwrite(ts, inlineComponent('<kbq-tag-list><kbq-cleaner (click)="clear()" /></kbq-tag-list>'));

            const result = await run();

            expect(result.readText(ts)).toBe(inlineComponent('<kbq-tag-list><kbq-cleaner /></kbq-tag-list>'));
        });

        it('reports the expression it removed', async () => {
            const { html } = paths();
            const messages = collectLogs();

            appTree.overwrite(html, '<kbq-tag-list><kbq-cleaner (click)="reset(); log()" /></kbq-tag-list>');

            await run();

            expect(messages.join('\n')).toContain('removed (click)="reset(); log()"');
        });
    });

    describe('everything else is left alone', () => {
        it('keeps a handler on a cleaner outside a tag list', async () => {
            const { html } = paths();
            const template = '<kbq-form-field><kbq-cleaner (click)="clear()" /></kbq-form-field>';

            appTree.overwrite(html, template);

            const result = await run();

            expect(result.readText(html)).toBe(template);
        });

        it('keeps a handler on a cleaner written after the list', async () => {
            const { html } = paths();
            const template = '<kbq-tag-list></kbq-tag-list><kbq-cleaner (click)="clear()" />';

            appTree.overwrite(html, template);

            const result = await run();

            expect(result.readText(html)).toBe(template);
        });

        it('leaves a cleaner that carries no handler', async () => {
            const { html } = paths();
            const template = '<kbq-tag-list><kbq-cleaner /></kbq-tag-list>';

            appTree.overwrite(html, template);

            const result = await run();

            expect(result.readText(html)).toBe(template);
        });

        it('writes nothing when fix is false', async () => {
            const { html } = paths();
            const template = '<kbq-tag-list><kbq-cleaner (click)="clear()" /></kbq-tag-list>';
            const messages = collectLogs();

            appTree.overwrite(html, template);

            const result = await run(firstProject, false);

            expect(result.readText(html)).toBe(template);
            expect(messages.join('\n')).toContain('would update');
        });
    });
});
