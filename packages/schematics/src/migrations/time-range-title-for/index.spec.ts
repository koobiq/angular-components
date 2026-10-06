import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'time-range-title-for';

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

        return { ts, html };
    }

    function run(project: string, fix = true) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    describe('locale literals', () => {
        it('removes the key from the title of a provider argument', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export const providers = [\n' +
                    "    kbqTimeRangeLocaleConfigurationProvider({ title: { for: 'за', placeholder: 'Период' } })\n" +
                    '];\n'
            );

            expect((await run(first)).readText(ts)).toBe(
                'export const providers = [\n' +
                    "    kbqTimeRangeLocaleConfigurationProvider({ title: { placeholder: 'Период' } })\n" +
                    '];\n'
            );
        });

        it('removes the key from the timeRange section of locale data', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export const data = {\n' +
                    '    timeRange: {\n' +
                    '        title: {\n' +
                    "            placeholder: 'Период',\n" +
                    "            for: 'за'\n" +
                    '        }\n' +
                    '    }\n' +
                    '};\n'
            );

            expect((await run(first)).readText(ts)).toBe(
                'export const data = {\n' +
                    '    timeRange: {\n' +
                    '        title: {\n' +
                    "            placeholder: 'Период'\n" +
                    '        }\n' +
                    '    }\n' +
                    '};\n'
            );
        });

        it('removes a quoted key from a configuration with time-range siblings', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export const configuration = {\n' +
                    "    title: { 'for': 'for', placeholder: 'Period' },\n" +
                    "    editor: { apply: 'Apply' }\n" +
                    '};\n'
            );

            expect((await run(first)).readText(ts)).toBe(
                'export const configuration = {\n' +
                    "    title: { placeholder: 'Period' },\n" +
                    "    editor: { apply: 'Apply' }\n" +
                    '};\n'
            );
        });

        it('leaves a title outside a time-range configuration alone and reports it', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();
            const source = "export const page = { title: { for: 'guests', text: 'Welcome' } };\n";

            appTree.overwrite(ts, source);

            expect((await run(first)).readText(ts)).toBe(source);
            expect(messages.join('\n')).toContain('the fix did not rewrite');
        });
    });

    describe('warnings', () => {
        it('reports a read of the removed key', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(ts, 'export const prefix = configuration.title.for;\n');

            await run(first);

            expect(messages.join('\n')).toContain('Drop this read');
        });

        it('reports the key overridden in a template binding', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(html, `<kbq-time-range [localeOverrides]="{ timeRange: { title: { for: 'за' } } }" />\n`);

            await run(first);

            expect(messages.join('\n')).toContain('the fix did not rewrite');
        });

        it('does not report a fixed literal', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "export const providers = [kbqTimeRangeLocaleConfigurationProvider({ title: { for: 'за' } })];\n"
            );

            await run(first);

            expect(messages.join('\n')).not.toContain('the fix did not rewrite');
        });

        it('prints the behaviour note once per run', async () => {
            const [first] = projects.keys();
            const messages = collectLogs();

            await run(first);

            const note = messages.join('\n');

            expect(note).toContain('no longer prepends `title.for`');
            expect(note.split('Time-range title behaviour changed').length).toBe(2);
        });
    });

    describe('dry run', () => {
        it('reports the file without writing it when fix is false', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();
            const source =
                "export const providers = [kbqTimeRangeLocaleConfigurationProvider({ title: { for: 'за' } })];\n";

            appTree.overwrite(ts, source);

            expect((await run(first, false)).readText(ts)).toBe(source);
            expect(messages.join('\n')).toContain('run with --fix to apply');
        });
    });
});
