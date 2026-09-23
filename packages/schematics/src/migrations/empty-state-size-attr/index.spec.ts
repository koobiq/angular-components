import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'empty-state-size-attr';

/**
 * `@schematics/angular:application` changed file names across major versions
 * (`app.component.{ts,html}` ↔ `app.{ts,html}`); pick whichever generator produced.
 */
const getProjectContentPaths = (project: workspaces.ProjectDefinition, tree: Tree | UnitTestTree) => {
    const root = `/${project.root}/src/app`;

    return {
        templatePath: tree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`,
        tsPath: tree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`,
        stylesPath: `/${project.root}/src/styles.scss`
    };
};

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

    it('leaves a project that does not use the component untouched', async () => {
        const snapshot = (tree: UnitTestTree) =>
            tree.files.filter((file) => /\.(ts|html|scss)$/.test(file)).map((file) => `${file}:${tree.readText(file)}`);
        const before = snapshot(appTree as UnitTestTree);

        const [firstProjectKey] = projects.keys();

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(snapshot(updatedTree)).toEqual(before);
    });

    it('should run migration for external html', async () => {
        const [firstProjectKey] = projects.keys();
        const { templatePath } = getProjectContentPaths(projects.get(firstProjectKey)!, appTree);

        const template =
            '<div>' +
            '<kbq-empty-state [big]="false"></kbq-empty-state>' +
            '<kbq-empty-state [big]="true"></kbq-empty-state>' +
            '</div>';

        appTree.overwrite(templatePath, template);

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(updatedTree.read(templatePath)?.toString()).toMatchSnapshot(`project ${firstProjectKey}: after changes`);
    });

    it('should throw message if replaced attr value is not static', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const [firstProjectKey] = projects.keys();
        const { templatePath } = getProjectContentPaths(projects.get(firstProjectKey)!, appTree);

        // Set up the template with a non-static attribute value
        const nonStaticTemplate = '<div><kbq-empty-state [big]="VARIABLE"></kbq-empty-state></div>';

        appTree.overwrite(templatePath, nonStaticTemplate);
        const templateBeforeUpdate = appTree.read(templatePath)?.toString();

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(templateBeforeUpdate).toBe(updatedTree.read(templatePath)?.toString());
        expect(warnSpy.mock.calls.some(([msg]) => msg.includes(templatePath))).toBe(true);
    });

    it('migrates an inline template', async () => {
        const [firstProjectKey] = projects.keys();
        const { tsPath } = getProjectContentPaths(projects.get(firstProjectKey)!, appTree);

        appTree.overwrite(
            tsPath,
            "import { Component } from '@angular/core';\n" +
                '@Component({\n' +
                "    selector: 'app-root',\n" +
                '    template: \'<kbq-empty-state [big]="false"></kbq-empty-state>\'\n' +
                '})\n' +
                'export class App {}\n'
        );

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(updatedTree.readText(tsPath)).toContain('size="compact"');
    });
});
