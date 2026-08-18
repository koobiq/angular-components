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
                    "        saveChanges: 'Save changes',\n" +
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
                    "        saveChanges: 'Save changes',\n" +
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
                    "        saveChanges: 'Save changes',\n" +
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
                    "        saveChanges: 'Save changes',\n" +
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
                    "    'saveChanges': 'Save changes',\n" +
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
                "    saveChanges: 'Save changes',\n" +
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

    describe('warnings', () => {
        it('reports a read of the removed key the fix could not rewrite', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(ts, 'export const caption = configuration.filters.name;\n');

            await run(first);

            expect(messages.join('\n')).toContain('Manual migration required');
        });

        it('reports a read of popoverHeader', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(ts, 'export const header = popover.popoverHeader;\n');

            await run(first);

            expect(messages.join('\n')).toContain('no longer depends on the mode');
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
