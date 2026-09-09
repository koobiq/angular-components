import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'empty-state-error-color';

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
            scss: `${root}/theme.scss`
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

    it('reports a call to the removed setErrorColor()', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqEmptyStateIcon } from '@koobiq/components/empty-state';\n" +
                'export class App { tint(icon: KbqEmptyStateIcon) { icon.setErrorColor(); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('setErrorColor() was removed');
    });

    it('reports a renamed theme token overridden from a stylesheet', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.create(scss, '.my-placeholder .kbq-empty-state {\n    --kbq-empty-state-color: red;\n}\n');

        await run(first);

        expect(messages.join('\n')).toContain('theme tokens were renamed');
    });

    it('reports a renamed theme token read with var() rather than overridden', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.create(scss, '.my-placeholder .kbq-empty-state {\n    color: var(--kbq-empty-state-color);\n}\n');

        await run(first);

        expect(messages.join('\n')).toContain('theme tokens were renamed');
    });

    it('does not mistake a read of the new token name for the old one', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.create(scss, '.my-placeholder .kbq-empty-state {\n    color: var(--kbq-empty-state-text-color);\n}\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('theme tokens were renamed');
    });

    it('does not mistake an already renamed token for the old one', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.create(
            scss,
            '.my-placeholder .kbq-empty-state {\n    --kbq-empty-state-title-color: red;\n' +
                '    --kbq-empty-state-error-text-color: red;\n}\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('theme tokens were renamed');
    });

    it('prints the notes that have no call site once the project uses the component', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-empty-state />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('<h2 kbq-empty-state-title>');
        expect(messages.join('\n')).toContain('role="status"');
    });

    it('says nothing at all when the project does not use the empty state', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { tint(icon: any) { icon.setErrorColor(); } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
