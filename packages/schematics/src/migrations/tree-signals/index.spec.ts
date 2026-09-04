import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'tree-signals';

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

    it('reports a write to the now read-only toggle disabled', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTreeNodeToggleComponent } from '@koobiq/components/tree';\n" +
                'export class App { lock(toggle: KbqTreeNodeToggleComponent<unknown>) { toggle.disabled = true; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('KbqTreeNodeToggle.disabled is a read-only getter');
    });

    it('reports the QueryList API lost by nodeDefs', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTreeSelection } from '@koobiq/components/tree';\n" +
                'export class App { watch(tree: KbqTreeSelection) { tree.nodeDefs.changes.subscribe(); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('nodeDefs.changes` no longer exists');
    });

    it('reports pushing into the option focus streams', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTreeOption } from '@koobiq/components/tree';\n" +
                'export class App { emit(option: KbqTreeOption) { option.onFocus.next({ option }); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('onFocus and onBlur are Observables now');
    });

    it('stays quiet for a file that writes an unrelated disabled', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { lock(button: { disabled: boolean }) { button.disabled = true; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(SCHEMATIC_NAME);
    });

    it('never writes to the tree', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original =
            "import { KbqTreeNodeToggleComponent } from '@koobiq/components/tree';\n" +
            'export class App { lock(toggle: KbqTreeNodeToggleComponent<unknown>) { toggle.disabled = true; } }\n';

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    it('summarises the read-only members for a project that renders a tree', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, "import { KbqTreeModule } from '@koobiq/components/tree';\nexport class App {}\n");

        await run(first);

        expect(messages.join('\n')).toContain('became read-only and cannot be assigned');
    });

    it('leaves the second project unreported when scoped to the first', async () => {
        const [first, second] = projects.keys();
        const { ts: secondTs } = paths(projects.get(second)!);
        const messages = collectLogs();

        appTree.overwrite(
            secondTs,
            "import { KbqTreeOption } from '@koobiq/components/tree';\n" +
                'export class App { emit(option: KbqTreeOption) { option.onFocus.next({ option }); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain(secondTs);
    });

    describe('ng update entry point', () => {
        it('runs when invoked without options', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "import { KbqTreeNodePadding } from '@koobiq/components/tree';\n" +
                    'export class App { read(padding: KbqTreeNodePadding<unknown>) { return padding.indentUnits; } }\n'
            );

            const runnerFromMigrations = new SchematicTestRunner('migrations', migrationsPath);

            runnerFromMigrations.logger.subscribe((entry) => messages.push(entry.message));

            await runnerFromMigrations.runSchematic(SCHEMATIC_NAME, {}, appTree);

            expect(messages.join('\n')).toContain('KbqTreeNodePadding.indent is an InputSignal');
        });
    });
});
