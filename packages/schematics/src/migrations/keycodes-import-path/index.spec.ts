import type { workspaces } from '@angular-devkit/core';
import type { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import type { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'keycodes-import-path';

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

    function run(project: string, fix = true) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('rewrites an import of only keycode constants to the CDK specifier', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { ENTER, SPACE } from '@koobiq/components/core';\n" + 'const x: number = ENTER + SPACE;\n'
        );

        const updated = (await run(first)).readText(ts);

        expect(updated).toContain("import { ENTER, SPACE } from '@angular/cdk/keycodes';");
        expect(updated).not.toContain("'@koobiq/components/core'");
    });

    it('splits a mixed import, keeping the other bindings on core', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { ENTER, KbqButtonModule, SPACE } from '@koobiq/components/core';\n" +
                'const x: number = ENTER + SPACE;\n'
        );

        const updated = (await run(first)).readText(ts);

        expect(updated).toContain("import { KbqButtonModule } from '@koobiq/components/core';");
        expect(updated).toContain("import { ENTER, SPACE } from '@angular/cdk/keycodes';");
    });

    it('matches multiline binding lists', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import {\n    ENTER,\n    KbqButtonModule,\n    TAB\n} from '@koobiq/components/core';\n" +
                'const x: number = ENTER + TAB;\n'
        );

        const updated = (await run(first)).readText(ts);

        expect(updated).toContain("import { KbqButtonModule } from '@koobiq/components/core';");
        expect(updated).toContain("import { ENTER, TAB } from '@angular/cdk/keycodes';");
    });

    it('moves an aliased binding with its alias', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { ENTER as RETURN, KbqButtonModule } from '@koobiq/components/core';\n" +
                'const x: number = RETURN;\n'
        );

        const updated = (await run(first)).readText(ts);

        expect(updated).toContain('import { ENTER as RETURN } from');
    });

    it('rewrites double-quoted specifiers in their quote style', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(ts, 'import { ENTER } from "@koobiq/components/core";\n' + 'const x: number = ENTER;\n');

        const updated = (await run(first)).readText(ts);

        expect(updated).toContain('import { ENTER } from "@angular/cdk/keycodes";');
    });

    it('rewrites an export ... from statement', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(ts, "export { ENTER, SPACE } from '@koobiq/components/core';\n");

        const updated = (await run(first)).readText(ts);

        expect(updated).toContain("export { ENTER, SPACE } from '@angular/cdk/keycodes';");
    });

    it('leaves a core import without keycode bindings untouched', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original =
            "import { KbqButtonModule } from '@koobiq/components/core';\nconst x: any = KbqButtonModule;\n";

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    it('does not touch a sibling specifier that merely starts with the same words', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original = "import { Whatever } from '@koobiq/components/core-x';\nconst x: any = Whatever;\n";

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    it('does not treat a name that merely contains a keycode name as a keycode', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original =
            "import { ENTERED_TEXT, KbqButtonModule } from '@koobiq/components/core';\n" +
            'const x: any = ENTERED_TEXT;\n';

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    it('running the migration twice changes nothing the second time', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { ENTER, KbqButtonModule } from '@koobiq/components/core';\n" + 'const x: number = ENTER;\n'
        );

        const once = (await run(first)).readText(ts);

        appTree.overwrite(ts, once);

        expect((await run(first)).readText(ts)).toBe(once);
    });

    describe('ng update entry point', () => {
        it('applies the fix when invoked without options', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { ENTER, KbqButtonModule } from '@koobiq/components/core';\n" + 'const x: number = ENTER;\n'
            );

            // `ng update` passes no options, and migrations.json declares no schema, so the
            // schema default never reaches the rule — it has to default `fix` itself.
            const runnerFromMigrations = new SchematicTestRunner('migrations', migrationsPath);
            const result = await runnerFromMigrations.runSchematic(SCHEMATIC_NAME, {}, appTree);

            expect(result.readText(ts)).toContain("import { ENTER } from '@angular/cdk/keycodes';");
        });
    });

    describe('dry run', () => {
        it('reports without writing when fix is false', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const original = "import { ENTER } from '@koobiq/components/core';\nconst x: number = ENTER;\n";
            const messages = collectLogs();

            appTree.overwrite(ts, original);

            const result = await run(first, false);

            expect(result.readText(ts)).toBe(original);
            expect(messages.join('\n')).toContain('would update');
        });
    });

    it('leaves the second project untouched when scoped to the first', async () => {
        const [first, second] = projects.keys();
        const { ts: firstTs } = paths(projects.get(first)!);
        const { ts: secondTs } = paths(projects.get(second)!);
        const original = "import { ENTER } from '@koobiq/components/core';\nconst x: number = ENTER;\n";

        appTree.overwrite(firstTs, original);
        appTree.overwrite(secondTs, original);

        const result = await run(first);

        expect(result.readText(firstTs)).toContain("'@angular/cdk/keycodes'");
        expect(result.readText(secondTs)).toBe(original);
    });
});
