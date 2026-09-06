import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'inline-edit-a11y-and-types';

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

        return { ts: appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts` };
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports the removed focus region sentinel directive', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqFocusRegionItem } from '@koobiq/components/inline-edit';\n" +
                'export class App { item?: KbqFocusRegionItem; }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('KbqFocusRegionItem was removed');
    });

    it('reports a value handler typed against the concrete value', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqInlineEditModule } from '@koobiq/components/inline-edit';\n" +
                'export class App { setValueHandler = (value: string) => value; }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('takes `(value: unknown) => void`');
    });

    it('reports the new required key of the a11y locale configuration', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqA11yLocaleConfiguration } from '@koobiq/components/core';\n" +
                'export class App { configuration?: KbqA11yLocaleConfiguration; }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('gained a required `edit` key');
    });

    it('reports a selector that targeted the host as the tab stop', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const styles = `.kbq-inline-edit[tabindex="0"] { outline: none; }`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('no longer the tab stop');
    });

    it('says nothing at all when the project does not use the inline edit', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { handler = (value: any) => value; }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
