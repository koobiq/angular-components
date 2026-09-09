import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'table-cell-content';

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

        return {
            ts: appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`,
            scss: `${root}/app.scss`
        };
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports the removed cell directive', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTable, KbqTableCellContent } from '@koobiq/components/table';\n" +
                'export class App { readonly imports = [KbqTable, KbqTableCellContent]; }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('KbqTableCellContent was removed');
    });

    it('reports a stylesheet keyed on the removed modifier class', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(scss, '.kbq-table .kbq-table-cell_has-button { padding: 0; }\n');

        await run(first);

        expect(messages.join('\n')).toContain('no longer applied');
    });

    it('reports a sticky header pinned to the page background', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            scss,
            '.kbq-table_sticky-header > thead > tr > th { background: var(--kbq-background-bg); }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('sits directly on the page background');
    });

    // Regression: the pattern used to be a bare `--kbq-background-bg` with no way to exclude a longer
    // token sharing the prefix, so it also fired on `--kbq-background-bg-secondary`/`-tertiary`.
    it('does not report a differently-named token that merely shares the prefix', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            scss,
            '.kbq-table_sticky-header > thead > tr > th { background: var(--kbq-background-bg-secondary); }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('sits directly on the page background');
    });

    // The summary names the token unconditionally, so the discriminator is the per-file message.
    it('leaves the page background alone when no header is pinned', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(scss, '.kbq-table { background: var(--kbq-background-bg); }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('sits directly on the page background');
    });

    it('says nothing at all when the project does not use the table', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { readonly cell = "cell_has-button"; }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
