import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'radio-signals-and-aria';
const IMPORTS = "import { KbqRadioButton, KbqRadioGroup } from '@koobiq/components/radio';\n";

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
            scss: `${root}/radio-overrides.scss`
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

    /** Writes `source` into the app's TypeScript file, runs the migration, returns the result. */
    async function migrateTs(source: string): Promise<{ content: string; messages: string[] }> {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, source);

        const tree = await run(first);

        return { content: tree.readContent(ts), messages };
    }

    describe('signal members', () => {
        it('turns a read of a group signal input into a call', async () => {
            const { content } = await migrateTs(
                IMPORTS + 'export class App { n(g: KbqRadioGroup) { return g.name; } }\n'
            );

            expect(content).toContain('return g.name();');
        });

        it('rewrites labelPosition and required on the group', async () => {
            const { content } = await migrateTs(
                IMPORTS + 'export class App { p(g: KbqRadioGroup) { return [g.labelPosition, g.required]; } }\n'
            );

            expect(content).toContain('g.labelPosition()');
            expect(content).toContain('g.required()');
        });

        /**
         * The reason the rewrite is scoped by receiver type: all three names exist on the button too, where
         * they stayed accessors because each folds in the group's value.
         */
        it('leaves the same member names alone on a radio button', async () => {
            const { content } = await migrateTs(
                IMPORTS +
                    'export class App {\n' +
                    '    both(g: KbqRadioGroup, b: KbqRadioButton) {\n' +
                    '        return [g.required, b.required, g.name, b.name, g.labelPosition, b.labelPosition];\n' +
                    '    }\n' +
                    '}\n'
            );

            expect(content).toContain('g.required()');
            expect(content).toContain('b.required,');
            expect(content).toContain('g.name()');
            expect(content).toContain('b.name,');
            expect(content).toContain('g.labelPosition()');
            expect(content).toContain('b.labelPosition]');
        });

        it('turns id and inputId on the button into calls', async () => {
            const { content } = await migrateTs(
                IMPORTS + 'export class App { ids(b: KbqRadioButton) { return [b.id, b.inputId]; } }\n'
            );

            expect(content).toContain('b.id()');
            expect(content).toContain('b.inputId()');
        });

        it('is idempotent — a read that is already a call is left alone', async () => {
            const source = IMPORTS + 'export class App { n(g: KbqRadioGroup) { return g.name(); } }\n';
            const { content } = await migrateTs(source);

            expect(content).toBe(source);
        });

        it('leaves the accessor inputs of the group untouched', async () => {
            const source =
                IMPORTS +
                'export class App { v(g: KbqRadioGroup) { g.disabled = true; return [g.value, g.selected]; } }\n';
            const { content } = await migrateTs(source);

            expect(content).toBe(source);
        });
    });

    describe('reports', () => {
        it('reports an [isFocused] binding, which never had an effect and no longer exists', async () => {
            const { messages } = await migrateTs('const template = `<kbq-radio-button [isFocused]="true" />`;\n');

            expect(messages.join('\n')).toContain('isFocused was removed');
        });

        it('reports a radioGroup access, which is nullable now', async () => {
            const { messages } = await migrateTs(
                IMPORTS + 'export class App { g(r: KbqRadioButton) { return r.radioGroup; } }\n'
            );

            expect(messages.join('\n')).toContain('KbqRadioGroup | null');
        });

        it('reports a programmatic write to the now read-only id', async () => {
            const { messages } = await migrateTs(
                IMPORTS + "export class App { set(b: KbqRadioButton) { b.id = 'custom'; } }\n"
            );

            expect(messages.join('\n')).toContain('read-only input()');
        });

        it('reports an override of a removed custom property', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.create(scss, '.kbq-radio-button {\n    --kbq-radio-size-big-top: 2px;\n}\n');

            await run(first);

            expect(messages.join('\n')).toContain('custom properties were removed');
        });

        it('reports the behaviour changes that have no call site once a consumer is found', async () => {
            const { messages } = await migrateTs(
                'const template = `<kbq-radio-group><kbq-radio-button /></kbq-radio-group>`;\n'
            );

            expect(messages.join('\n')).toContain('used outside a <kbq-radio-group> is independent now');
        });

        it('says nothing at all when the project does not use the radio', async () => {
            const { messages } = await migrateTs('export class App { name(r: any) { return r.radioGroup.name; } }\n');

            expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
        });
    });
});
