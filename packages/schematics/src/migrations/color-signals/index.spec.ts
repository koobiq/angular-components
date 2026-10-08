import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'color-signals';
const IMPORTS =
    "import { Component } from '@angular/core';\n" +
    "import { KbqButton } from '@koobiq/components/button';\n" +
    "import { KbqComponentColors } from '@koobiq/components/core';\n" +
    "import { KbqIcon } from '@koobiq/components/icon';\n";

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

    /** Writes `source` into the app's TypeScript file, runs the migration, returns the result. */
    async function migrateTs(source: string): Promise<{ content: string; messages: string[] }> {
        const [first] = projects.keys();
        // The exact file names from @schematics/angular:application vary across versions.
        const root = `/${projects.get(first)!.root}/src/app`;
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));
        appTree.overwrite(ts, source);

        const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: first } satisfies Schema, appTree);

        return { content: tree.readContent(ts), messages };
    }

    it('turns a read of color into a call', async () => {
        const { content } = await migrateTs(
            IMPORTS + 'export class App { c(icon: KbqIcon) { return icon.color === KbqComponentColors.Error; } }\n'
        );

        expect(content).toContain('icon.color() === KbqComponentColors.Error');
    });

    it('turns a write of color into .set()', async () => {
        const { content } = await migrateTs(
            IMPORTS + 'export class App { c(button: KbqButton) { button.color = KbqComponentColors.Theme; } }\n'
        );

        expect(content).toContain('button.color.set(KbqComponentColors.Theme)');
    });

    it('rewrites reads through a bare reference on a component claimed by attribute', async () => {
        const { content } = await migrateTs(
            IMPORTS +
                '@Component({ template: `<button kbq-button #b></button>{{ b.color }}` })\n' +
                'export class App {}\n'
        );

        expect(content).toContain('{{ b.color() }}');
    });

    it('rewrites reads through an element and an exportAs reference', async () => {
        const { content } = await migrateTs(
            IMPORTS +
                '@Component({ template: `<kbq-progress-bar #p /><kbq-checkbox #c="kbqCheckbox" />{{ p.color }} {{ c.color }}` })\n' +
                'export class App {}\n'
        );

        expect(content).toContain('{{ p.color() }} {{ c.color() }}');
    });

    it('leaves the color of an unrelated type alone', async () => {
        const source =
            IMPORTS + 'export class App { c(icon: KbqIcon, other: { color: string }) { return other.color; } }\n';
        const { content } = await migrateTs(source);

        expect(content).toBe(source);
    });

    it('reports a subclass of a colored component', async () => {
        const { messages } = await migrateTs(IMPORTS + 'export class MyIcon extends KbqIcon {}\n');

        expect(messages.join('\n')).toContain('setDefaultColor(x)');
    });
});
