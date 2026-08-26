import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'read-state-dwell-handlers';

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

    const hostFile = (body: string) =>
        "import { inject } from '@angular/core';\n" +
        "import { KbqReadStateDirective } from '@koobiq/components/core';\n" +
        'export class Host {\n' +
        '    protected readonly readState = inject(KbqReadStateDirective, { host: true });\n' +
        `    run() { ${body} }\n` +
        '}\n';

    it('renames both handlers on a field injected with inject()', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(ts, hostFile('this.readState.mouseenterHandler(); this.readState.mouseleaveHandler();'));

        const updated = (await run(first)).readText(ts);

        expect(updated).toContain('this.readState.startDwell()');
        expect(updated).toContain('this.readState.endDwell()');
        expect(updated).not.toContain('Handler(');
    });

    it('renames handlers on an explicitly typed parameter', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);

        appTree.overwrite(
            ts,
            "import { KbqReadStateDirective } from '@koobiq/components/core';\n" +
                'export function enter(readState: KbqReadStateDirective) { readState.mouseenterHandler(); }\n'
        );

        expect((await run(first)).readText(ts)).toContain('readState.startDwell()');
    });

    it('leaves a same-named method on an unrelated receiver alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        // The file names the directive, so it is visited — but nothing in it is typed as one.
        const original =
            "import { KbqReadStateDirective } from '@koobiq/components/core';\n" +
            'export type Marker = KbqReadStateDirective;\n' +
            'export function enter(other: { mouseenterHandler(): void }) { other.mouseenterHandler(); }\n';

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    it('is idempotent on an already renamed call', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original = hostFile('this.readState.startDwell();');

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    it('reports a timestamp access instead of rewriting it', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();
        const original = hostFile('const started = this.readState.timestamp; return started;');

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
        expect(messages.join('\n')).toContain('read-only getter');
    });

    it('reports the new keyboard dwell channel for a host that declares the directive', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "import { KbqReadStateDirective } from '@koobiq/components/core';\n" +
                "@Component({ selector: 'host', template: '', hostDirectives: [KbqReadStateDirective] })\n" +
                'export class Host {}\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('keyboard dwell');
    });

    it('never touches a file that does not name the directive', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original = 'export function enter(other: { mouseenterHandler(): void }) { other.mouseenterHandler(); }\n';

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    describe('ng update entry point', () => {
        it('applies the fix when invoked without options', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(ts, hostFile('this.readState.mouseleaveHandler();'));

            // `ng update` passes no options, and migrations.json declares no schema, so the
            // schema default never reaches the rule — it has to default `fix` itself.
            const runnerFromMigrations = new SchematicTestRunner('migrations', migrationsPath);
            const result = await runnerFromMigrations.runSchematic(SCHEMATIC_NAME, {}, appTree);

            expect(result.readText(ts)).toContain('this.readState.endDwell()');
        });
    });

    describe('dry run', () => {
        it('reports without writing when fix is false', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();
            const original = hostFile('this.readState.mouseenterHandler();');

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
        const original = hostFile('this.readState.mouseenterHandler();');

        appTree.overwrite(firstTs, original);
        appTree.overwrite(secondTs, original);

        const result = await run(first);

        expect(result.readText(firstTs)).toContain('startDwell()');
        expect(result.readText(secondTs)).toBe(original);
    });
});
