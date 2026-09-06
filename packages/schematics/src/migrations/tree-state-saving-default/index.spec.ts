import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'tree-state-saving-default';

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

    /** Runs the migration over a single file and returns everything it logged. */
    async function report(source: string): Promise<string> {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, source);

        await run(first);

        return messages.join('\n');
    }

    it('reports a tree that never mentions useStateSaving', async () => {
        const messages = await report('const template = `<kbq-tree-selection></kbq-tree-selection>`;\n');

        expect(messages).toContain('Trees persist their expanded nodes by default now');
    });

    it('reports a bare kbq-tree as well', async () => {
        const messages = await report('const template = `<kbq-tree [treeControl]="c"></kbq-tree>`;\n');

        expect(messages).toContain('Trees persist their expanded nodes by default now');
    });

    it('stays quiet when the file already opts out', async () => {
        const messages = await report(
            'const template = `<kbq-tree-selection [useStateSaving]="false"></kbq-tree-selection>`;\n'
        );

        expect(messages).not.toContain('Trees persist their expanded nodes by default now');
    });

    it('stays quiet when the file already opts in', async () => {
        const messages = await report(
            'const template = `<kbq-tree-selection useStateSaving stateSavingKey="catalog"></kbq-tree-selection>`;\n'
        );

        expect(messages).not.toContain('Trees persist their expanded nodes by default now');
    });

    it('reports the tree control that decides how a node is identified', async () => {
        const messages = await report(
            "import { FlatTreeControl } from '@koobiq/components/tree';\n" +
                'export class App { control = new FlatTreeControl(getLevel, isExpandable, getValue, getViewValue); }\n'
        );

        expect(messages).toContain('Expansion is persisted by the value getValue returns');
    });

    it('does not report the tree control of a tree that opts out', async () => {
        const messages = await report(
            "import { FlatTreeControl } from '@koobiq/components/tree';\n" +
                'const template = `<kbq-tree-selection [useStateSaving]="false"></kbq-tree-selection>`;\n' +
                'export class App { control = new FlatTreeControl(getLevel, isExpandable, getValue, getViewValue); }\n'
        );

        expect(messages).not.toContain('Expansion is persisted by the value getValue returns');
    });

    it('reports expansion the application performs itself', async () => {
        const messages = await report(
            "import { KbqTreeSelection } from '@koobiq/components/tree';\n" +
                'export class App { open(tree: KbqTreeSelection) { tree.treeControl.expandAll(); } }\n'
        );

        expect(messages).toContain('Expansion the application performs itself is not persisted');
    });

    it('reports writing to the expansion model directly', async () => {
        const messages = await report(
            "import { KbqTreeSelection } from '@koobiq/components/tree';\n" +
                'export class App { open(tree: KbqTreeSelection) { tree.treeControl.expansionModel.clear(); } }\n'
        );

        expect(messages).toContain('Expansion the application performs itself is not persisted');
    });

    it('does not report a tree that only renders', async () => {
        const messages = await report('const template = `<kbq-tree-selection></kbq-tree-selection>`;\n');

        expect(messages).not.toContain('Expansion the application performs itself is not persisted');
    });

    it('reports a nested tree control as persisting nothing', async () => {
        const messages = await report(
            "import { NestedTreeControl } from '@koobiq/components/tree';\n" +
                'export class App { control = new NestedTreeControl(getChildren); }\n'
        );

        expect(messages).toContain('A tree on a NestedTreeControl persists nothing');
    });

    it('says nothing at all when the project does not use trees', async () => {
        const messages = await report('export class App {}\n');

        expect(messages).not.toContain('[tree-state-saving-default]');
    });
});
