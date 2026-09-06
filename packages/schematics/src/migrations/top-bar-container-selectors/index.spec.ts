import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'top-bar-container-selectors';

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
            scss: appTree.exists(`${root}/app.scss`) ? `${root}/app.scss` : `${root}/app.component.scss`
        };
    }

    function run(project: string, fix?: boolean) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('renames the placement modifier classes in a stylesheet', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);

        appTree.overwrite(
            scss,
            '.kbq-top-bar-container__start { width: 100px; }\n.kbq-top-bar-container__end { gap: 0; }\n'
        );

        const tree = await run(first);

        expect(tree.readContent(scss)).toContain('.kbq-top-bar-container_start');
        expect(tree.readContent(scss)).toContain('.kbq-top-bar-container_end');
        expect(tree.readContent(scss)).not.toContain('__start');
    });

    it('renames the flex-basis token to the min-width token', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);

        appTree.overwrite(scss, '.kbq-top-bar { --kbq-top-bar-container-start-basis: 160px; }\n');

        const tree = await run(first);

        expect(tree.readContent(scss)).toContain('--kbq-top-bar-container-start-min-width: 160px');
    });

    it('renames the classes inside an inline template', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(ts, "const styles = '.kbq-top-bar-container__end { gap: 4px; }';\n");

        const tree = await run(first);

        expect(tree.readContent(ts)).toContain('.kbq-top-bar-container_end');
    });

    it('leaves the file untouched and only reports when fix is false', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();
        const source = '.kbq-top-bar-container__start { width: 100px; }\n';

        appTree.overwrite(scss, source);

        const tree = await run(first, false);

        expect(tree.readContent(scss)).toBe(source);
        expect(messages.join('\n')).toContain('would rename');
    });

    it('reports a rule that selects the container by its placement attribute', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(scss, ".kbq-top-bar-container[placement='start'] { min-width: 238px; }\n");

        await run(first);

        expect(messages.join('\n')).toContain('Select the class the directive applies instead');
    });

    it('says nothing at all when the project does not use the top bar', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(scss, '.my-container__start { width: 100px; }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
