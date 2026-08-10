import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'scrollbar-deprecated-path';

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

    it('rewrites a bare @koobiq/components/scrollbar import to /deprecated', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { KbqScrollbarModule } from '@koobiq/components/scrollbar';\n" +
                'const x: any = KbqScrollbarModule;\n'
        );

        const updated = (await run(first)).readText(ts);

        expect(updated).toContain("from '@koobiq/components/scrollbar/deprecated'");
        expect(updated).not.toMatch(/from '@koobiq\/components\/scrollbar';/);
    });

    it('rewrites both single- and double-quoted specifiers', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            'import { KbqScrollbarModule } from "@koobiq/components/scrollbar";\n' +
                'const x: any = KbqScrollbarModule;\n'
        );

        const updated = (await run(first)).readText(ts);

        expect(updated).toContain('from "@koobiq/components/scrollbar/deprecated"');
    });

    it('does not touch an already-migrated /deprecated import (idempotent)', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original =
            "import { KbqScrollbarModule } from '@koobiq/components/scrollbar/deprecated';\n" +
            'const x: any = KbqScrollbarModule;\n';

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    it('running the migration twice does not double-append /deprecated', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { KbqScrollbarModule } from '@koobiq/components/scrollbar';\n" +
                'const x: any = KbqScrollbarModule;\n'
        );

        const once = (await run(first)).readText(ts);

        appTree.overwrite(ts, once);

        const twice = (await run(first)).readText(ts);

        expect(twice).toBe(once);
        expect(twice).not.toContain('/deprecated/deprecated');
    });

    it('leaves the new @koobiq/components/scrollbar/private path untouched (already internal-only)', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original =
            "import { KbqScrollbar } from '@koobiq/components/scrollbar/private';\nconst x: any = KbqScrollbar;\n";

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    it('does not touch an unrelated sibling package whose name merely starts with "scrollbar"', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original = "import { Whatever } from '@koobiq/components/scrollbar-x';\nconst x: any = Whatever;\n";

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    describe('ng update entry point', () => {
        it('applies the fix when invoked without options', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KbqScrollbarModule } from '@koobiq/components/scrollbar';\n" +
                    'const x: any = KbqScrollbarModule;\n'
            );

            // `ng update` passes no options, and migrations.json declares no schema, so the
            // schema default never reaches the rule — it has to default `fix` itself.
            const runnerFromMigrations = new SchematicTestRunner('migrations', migrationsPath);
            const result = await runnerFromMigrations.runSchematic(SCHEMATIC_NAME, {}, appTree);

            expect(result.readText(ts)).toContain("from '@koobiq/components/scrollbar/deprecated'");
        });
    });

    describe('dry run', () => {
        it('reports without writing when fix is false', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const original =
                "import { KbqScrollbarModule } from '@koobiq/components/scrollbar';\n" +
                'const x: any = KbqScrollbarModule;\n';
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
        const original =
            "import { KbqScrollbarModule } from '@koobiq/components/scrollbar';\nconst x: any = KbqScrollbarModule;\n";

        appTree.overwrite(firstTs, original);
        appTree.overwrite(secondTs, original);

        const result = await run(first);

        expect(result.readText(firstTs)).toContain('/deprecated');
        expect(result.readText(secondTs)).toBe(original);
    });
});
