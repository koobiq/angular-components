import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'filter-bar-rename-action';

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
        it('removes the name key from a filters section', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export const configuration = {\n' +
                    '    filters: {\n' +
                    "        saveAsNewFilter: 'Save as new filter',\n" +
                    "        change: 'Edit',\n" +
                    "        remove: 'Delete',\n" +
                    "        name: 'Name',\n" +
                    "        saveButton: 'Save'\n" +
                    '    }\n' +
                    '};\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toBe(
                'export const configuration = {\n' +
                    '    filters: {\n' +
                    "        saveAsNewFilter: 'Save as new filter',\n" +
                    "        change: 'Edit',\n" +
                    "        remove: 'Delete',\n" +
                    "        saveButton: 'Save'\n" +
                    '    }\n' +
                    '};\n'
            );
        });

        it('removes the name key when it is the last property of the section', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export const configuration = {\n' +
                    '    filters: {\n' +
                    "        saveAsNewFilter: 'Save as new filter',\n" +
                    "        change: 'Edit',\n" +
                    "        actionsTooltip: 'Filter actions',\n" +
                    "        name: 'Name'\n" +
                    '    }\n' +
                    '};\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toBe(
                'export const configuration = {\n' +
                    '    filters: {\n' +
                    "        saveAsNewFilter: 'Save as new filter',\n" +
                    "        change: 'Edit',\n" +
                    "        actionsTooltip: 'Filter actions'\n" +
                    '    }\n' +
                    '};\n'
            );
        });

        it('removes a quoted name key', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export const configuration = {\n' +
                    "    'saveAsNewFilter': 'Save as new filter',\n" +
                    "    'change': 'Edit',\n" +
                    "    'actionsTooltip': 'Filter actions',\n" +
                    "    'name': 'Name'\n" +
                    '};\n'
            );

            expect((await run(first)).readText(ts)).not.toContain('name');
        });

        it('leaves an object that only looks similar alone', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const source =
                'export const user = {\n' + "    name: 'Ada',\n" + "    saveChanges: 'yes',\n" + '    id: 1\n' + '};\n';

            appTree.overwrite(ts, source);

            // One fingerprint key is below the threshold, so nothing identifies this as a filters section.
            expect((await run(first)).readText(ts)).toBe(source);
        });

        it('leaves a shorthand name alone and reports it', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();
            const source =
                "const name = 'Name';\n" +
                'export const filters = {\n' +
                "    saveAsNewFilter: 'Save as new filter',\n" +
                "    change: 'Edit',\n" +
                "    actionsTooltip: 'Filter actions',\n" +
                '    name\n' +
                '};\n';

            appTree.overwrite(ts, source);

            expect((await run(first)).readText(ts)).toBe(source);
            expect(messages.join('\n')).toContain('carries `name` as a shorthand property');
        });

        it('does not report a shorthand name outside a filters literal', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(ts, "const name = 'Ada';\nexport const user = { name, id: 1 };\n");

            await run(first);

            expect(messages.join('\n')).not.toContain('shorthand property');
        });
    });

    describe('split keys', () => {
        it('splits saveChanges and saveAsNew into header and button keys carrying the old value', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                'export const configuration = {\n' +
                    '    filters: {\n' +
                    "        saveAsNewFilter: 'Save as new filter',\n" +
                    "        saveChanges: 'Save changes',\n" +
                    "        saveAsNew: 'Save as new',\n" +
                    "        change: 'Edit',\n" +
                    "        name: 'Name',\n" +
                    "        saveButton: 'Save'\n" +
                    '    }\n' +
                    '};\n'
            );

            expect((await run(first)).readText(ts)).toBe(
                'export const configuration = {\n' +
                    '    filters: {\n' +
                    "        saveAsNewFilter: 'Save as new filter',\n" +
                    "        saveChangesHeader: 'Save changes',\n" +
                    "        saveChangesButton: 'Save changes',\n" +
                    "        saveAsNewHeader: 'Save as new',\n" +
                    "        saveAsNewButton: 'Save as new',\n" +
                    "        change: 'Edit',\n" +
                    "        saveButton: 'Save'\n" +
                    '    }\n' +
                    '};\n'
            );
            expect(messages.join('\n')).not.toContain('did not rewrite');
        });

        it('splits a key of a single-line literal', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(ts, "export const filters = { saveAsNewFilter: 'A', saveChanges: 'B', change: 'C' };\n");

            expect((await run(first)).readText(ts)).toBe(
                "export const filters = { saveAsNewFilter: 'A', saveChangesHeader: 'B', saveChangesButton: 'B', change: 'C' };\n"
            );
        });

        it('keeps the quotes of a quoted key', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export const filters = {\n' +
                    "    'saveAsNewFilter': 'A',\n" +
                    "    'saveAsNew': 'B',\n" +
                    "    'change': 'C'\n" +
                    '};\n'
            );

            expect((await run(first)).readText(ts)).toBe(
                'export const filters = {\n' +
                    "    'saveAsNewFilter': 'A',\n" +
                    "    'saveAsNewHeader': 'B',\n" +
                    "    'saveAsNewButton': 'B',\n" +
                    "    'change': 'C'\n" +
                    '};\n'
            );
        });

        it('expands a shorthand key into two references to its variable', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "const saveChanges = 'B';\n" +
                    'export const filters = {\n' +
                    "    saveAsNewFilter: 'A',\n" +
                    "    change: 'C',\n" +
                    '    saveChanges\n' +
                    '};\n'
            );

            expect((await run(first)).readText(ts)).toBe(
                "const saveChanges = 'B';\n" +
                    'export const filters = {\n' +
                    "    saveAsNewFilter: 'A',\n" +
                    "    change: 'C',\n" +
                    '    saveChangesHeader: saveChanges,\n' +
                    '    saveChangesButton: saveChanges\n' +
                    '};\n'
            );
        });

        it('does not repeat a key the literal already has', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export const filters = {\n' +
                    "    saveAsNewFilter: 'A',\n" +
                    "    saveChanges: 'B',\n" +
                    "    saveChangesHeader: 'C',\n" +
                    "    saveAsNew: 'D',\n" +
                    "    saveAsNewHeader: 'E',\n" +
                    "    saveAsNewButton: 'F'\n" +
                    '};\n'
            );

            expect((await run(first)).readText(ts)).toBe(
                'export const filters = {\n' +
                    "    saveAsNewFilter: 'A',\n" +
                    "    saveChangesButton: 'B',\n" +
                    "    saveChangesHeader: 'C',\n" +
                    "    saveAsNewHeader: 'E',\n" +
                    "    saveAsNewButton: 'F'\n" +
                    '};\n'
            );
        });

        it('keeps the line endings of a CRLF file', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "export const filters = {\r\n    saveAsNewFilter: 'A',\r\n    saveAsNew: 'B',\r\n    change: 'C'\r\n};\r\n"
            );

            expect((await run(first)).readText(ts)).toBe(
                'export const filters = {\r\n' +
                    "    saveAsNewFilter: 'A',\r\n" +
                    "    saveAsNewHeader: 'B',\r\n" +
                    "    saveAsNewButton: 'B',\r\n" +
                    "    change: 'C'\r\n" +
                    '};\r\n'
            );
        });

        it('leaves a partial override alone and reports it', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();
            const source =
                'export const providers = [\n' +
                "    kbqFilterBarLocaleConfigurationProvider({ filters: { saveAsNew: 'Save as new' } })\n" +
                '];\n';

            appTree.overwrite(ts, source);

            expect((await run(first)).readText(ts)).toBe(source);
            expect(messages.join('\n')).toContain('did not rewrite');
        });
    });

    describe('warnings', () => {
        it('reports a read of the removed key the fix could not rewrite', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(ts, 'export const caption = configuration.filters.name;\n');

            await run(first);

            expect(messages.join('\n')).toContain('Manual migration required');
        });

        it('reports a read of a split key', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(ts, 'export const label = configuration.filters.saveChanges;\n');

            await run(first);

            expect(messages.join('\n')).toContain('were split: read');
        });

        it('does not report a call of the KbqFilters method sharing a split key name', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                html,
                '<kbq-filters #filters="kbqFilters" />\n<button (click)="filters.saveAsNew()">Save</button>\n'
            );

            await run(first);

            expect(messages.join('\n')).not.toContain('were split');
        });

        it('reports a split key overridden in a template binding', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                html,
                `<kbq-filter-bar [localeOverrides]="{ filterBar: { filters: { saveChanges: 'Save' } } }" />\n`
            );

            await run(first);

            expect(messages.join('\n')).toContain('did not rewrite');
        });

        it('reports a handler of the NewName save status', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                'export class Host {\n' +
                    '    onSave({ filter, status }) {\n' +
                    '        if (status === KbqSaveFilterStatuses.NewName) this.persist(filter);\n' +
                    '    }\n' +
                    '}\n'
            );

            await run(first);

            expect(messages.join('\n')).toContain('Persist the name only');
        });

        it('reports a read of the removed key left in a template', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(html, '<label>{{ localeData.name }}</label>\n');

            await run(first);

            expect(messages.join('\n')).toContain('was removed from the filters section');
        });

        it('prints the behaviour note once per run', async () => {
            const [first] = projects.keys();
            const messages = collectLogs();

            await run(first);

            const note = messages.join('\n');

            expect(note).toContain('only renames');
            expect(note).toContain('survives a rename');
            expect(note).toContain('split into a `…Header` key');
        });
    });

    describe('dry run', () => {
        it('reports the file without writing it when fix is false', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();
            const source =
                'export const filters = {\n' +
                "    saveAsNewFilter: 'Save as new filter',\n" +
                "    saveChanges: 'Save changes',\n" +
                "    actionsTooltip: 'Filter actions',\n" +
                "    name: 'Name'\n" +
                '};\n';

            appTree.overwrite(ts, source);

            expect((await run(first, false)).readText(ts)).toBe(source);
            expect(messages.join('\n')).toContain('run with --fix to apply');
        });
    });
});
