import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'divider-signals-and-aria';

const IMPORT = "import { KbqDivider } from '@koobiq/components/divider';\n";

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
            style: `${root}/app.scss`
        };
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    /** Writes `source` as the project's component file, runs the schematic, returns everything logged. */
    async function runWith(source: string, style?: string): Promise<string> {
        const [first] = projects.keys();
        const { ts, style: stylePath } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, source);

        if (style !== undefined) {
            if (appTree.exists(stylePath)) appTree.overwrite(stylePath, style);
            else appTree.create(stylePath, style);
        }

        await runner.runSchematic(SCHEMATIC_NAME, { project: first } satisfies Schema, appTree);

        return messages.join('\n');
    }

    describe('signal inputs', () => {
        it('separates a write to a signal input from a read', async () => {
            const log = await runWith(IMPORT + 'export class App { pin(d: KbqDivider) { d.vertical = true; } }\n');

            expect(log).toContain('take no assignment');
            expect(log).not.toContain('read them as calls');
        });

        it('reports a read of a signal input', async () => {
            const log = await runWith(
                IMPORT + 'export class App { isVertical(d: KbqDivider) { return d.vertical; } }\n'
            );

            expect(log).toContain('read them as calls');
            expect(log).not.toContain('take no assignment');
        });

        it('reports a compound assignment as the write it is', async () => {
            const log = await runWith(IMPORT + 'export class App { pin(d: KbqDivider) { d.paddings ||= true; } }\n');

            expect(log).toContain('take no assignment');
            expect(log).not.toContain('read them as calls');
        });

        it('reports a comparison as the read it is', async () => {
            const log = await runWith(
                IMPORT + 'export class App { isVertical(d: KbqDivider) { return d.vertical === true; } }\n'
            );

            expect(log).toContain('read them as calls');
            expect(log).not.toContain('take no assignment');
        });

        it('reports a read through a class field', async () => {
            const log = await runWith(
                IMPORT +
                    'export class App { private divider!: KbqDivider; isVertical() { return this.divider.vertical; } }\n'
            );

            expect(log).toContain('read them as calls');
        });

        it('says nothing about a member already read as a call', async () => {
            const log = await runWith(
                IMPORT + 'export class App { isVertical(d: KbqDivider) { return d.vertical(); } }\n'
            );

            expect(log).not.toContain('read them as calls');
            expect(log).not.toContain('take no assignment');
        });

        it('ignores a same-named member on an unrelated receiver', async () => {
            const log = await runWith(
                IMPORT +
                    'type ChartOptions = { vertical: boolean; paddings: boolean };\n' +
                    'export class App { setUp(o: ChartOptions) { o.vertical = true; return o.paddings; } }\n'
            );

            expect(log).not.toContain('read them as calls');
            expect(log).not.toContain('take no assignment');
        });

        it('ignores a divider name shadowed by an inner declaration', async () => {
            const log = await runWith(
                IMPORT +
                    'export class App { probe(d: KbqDivider) { return () => { const d = { vertical: 1 }; ' +
                    'return d.vertical; }; } }\n'
            );

            expect(log).not.toContain('read them as calls');
        });
    });

    describe('template attributes', () => {
        it('reports a hand-rolled separator role on the element', async () => {
            expect(await runWith('const template = `<kbq-divider role="separator" />`;\n')).toContain('is a duplicate');
        });

        it('points a hand-rolled aria-hidden at the decorative input', async () => {
            expect(await runWith('const template = `<kbq-divider aria-hidden="true" />`;\n')).toContain('decorative');
        });
    });

    describe('stylesheets', () => {
        it('reports a height override on a divider selector', async () => {
            const log = await runWith(
                'const template = `<kbq-divider [vertical]="true" />`;\n',
                '.toolbar .kbq-divider { height: 100%; }\n'
            );

            expect(log).toContain('--kbq-divider-size-vertical-height');
        });

        it('reports an !important margin that no longer needs to be one', async () => {
            const log = await runWith(
                'const template = `<kbq-divider />`;\n',
                '.toolbar .kbq-divider { margin-inline: 0 !important; }\n'
            );

            expect(log).toContain('no longer needed');
        });

        it('leaves a stylesheet that only themes the divider alone', async () => {
            const log = await runWith(
                'const template = `<kbq-divider />`;\n',
                '.toolbar .kbq-divider { background: red; }\n'
            );

            expect(log).not.toContain('no longer needed');
            expect(log).not.toContain('the override can go');
        });
    });

    it('reports the vertical sizing change once per project', async () => {
        expect(await runWith('const template = `<kbq-divider [vertical]="true" />`;\n')).toContain(
            '--kbq-divider-size-vertical-height'
        );
    });

    it('says nothing at all when the project does not use the divider', async () => {
        const log = await runWith('export class App { isVertical(d: any) { return d.vertical; } }\n');

        expect(log).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    it('never writes to the tree', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const source = IMPORT + 'export class App { pin(d: KbqDivider) { d.vertical = true; } }\n';

        appTree.overwrite(ts, source);

        const result = await runner.runSchematic(SCHEMATIC_NAME, { project: first } satisfies Schema, appTree);

        expect(result.readContent(ts)).toBe(source);
    });
});
