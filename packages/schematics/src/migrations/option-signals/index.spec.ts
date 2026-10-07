import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'option-signals';
const IMPORTS =
    "import { Component } from '@angular/core';\n" +
    "import { KbqOptgroup, KbqOption } from '@koobiq/components/core';\n";

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        projects = (await getWorkspace(appTree)).projects as unknown as workspaces.ProjectDefinitionCollection;
    });

    /** Writes `source` into the app's TypeScript file, runs the migration, returns the result. */
    async function migrateTs(source: string): Promise<{ content: string; messages: string[] }> {
        const [first] = projects.keys();
        const root = `/${projects.get(first)!.root}/src/app`;
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));
        appTree.overwrite(ts, source);

        const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: first } satisfies Schema, appTree);

        return { content: tree.readContent(ts), messages };
    }

    it('turns a read of the group disabled state into a call', async () => {
        const { content } = await migrateTs(
            IMPORTS + 'export class App { d(g: KbqOptgroup) { return g.disabled; } }\n'
        );

        expect(content).toContain('return g.disabled();');
    });

    it('rewrites reads through a reference on the group element', async () => {
        const { content } = await migrateTs(
            IMPORTS + '@Component({ template: `<kbq-optgroup #g />{{ g.disabled }}` })\nexport class App {}\n'
        );

        expect(content).toContain('{{ g.disabled() }}');
    });

    it('leaves reads of the option state alone', async () => {
        const source =
            IMPORTS + 'export class App { v(o: KbqOption) { return [o.value, o.disabled, o.viewValue]; } }\n';
        const { content } = await migrateTs(source);

        expect(content).toBe(source);
    });

    it('reports a programmatic write to the option state', async () => {
        const { messages } = await migrateTs(IMPORTS + 'export class App { d(o: KbqOption) { o.disabled = true; } }\n');

        expect(messages.join('\n')).toContain('a programmatic write no longer compiles');
    });
});
