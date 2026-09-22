import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'autocomplete-panel-width-auto';

/**
 * `@schematics/angular:application` changed file names across major versions
 * (`app.component.{ts,html}` ↔ `app.{ts,html}`); pick whichever generator produced.
 */
const getProjectContentPaths = (project: workspaces.ProjectDefinition, tree: Tree | UnitTestTree) => {
    const root = `/${project.root}/src/app`;

    return {
        templatePath: tree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`,
        tsPath: tree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`
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
            '<kbq-autocomplete panelWidth="auto"></kbq-autocomplete>' +
            '<kbq-autocomplete [panelWidth]="\'auto\'"></kbq-autocomplete>' +
            '</div>';

        appTree.overwrite(templatePath, template);

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(updatedTree.read(templatePath)?.toString()).toMatchSnapshot(`project ${firstProjectKey}: after changes`);
    });

    it('should leave an autocomplete without panelWidth untouched', async () => {
        const [firstProjectKey] = projects.keys();
        const { templatePath } = getProjectContentPaths(projects.get(firstProjectKey)!, appTree);

        const template = '<div><kbq-autocomplete></kbq-autocomplete></div>';

        appTree.overwrite(templatePath, template);

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(updatedTree.read(templatePath)?.toString()).toBe(template);
    });

    it('should throw message if replaced attr value is not static', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const [firstProjectKey] = projects.keys();
        const { templatePath } = getProjectContentPaths(projects.get(firstProjectKey)!, appTree);

        const nonStaticTemplate = '<div><kbq-autocomplete [panelWidth]="VARIABLE"></kbq-autocomplete></div>';

        appTree.overwrite(templatePath, nonStaticTemplate);
        const templateBeforeUpdate = appTree.read(templatePath)?.toString();

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(templateBeforeUpdate).toBe(updatedTree.read(templatePath)?.toString());
        expect(warnSpy.mock.calls.some(([msg]) => msg.includes(templatePath))).toBe(true);
        expect(warnSpy.mock.calls.some(([msg]) => msg.includes('dynamic value'))).toBe(true);
    });

    it('should leave a static, non-matching panelWidth value untouched and warn without calling it dynamic', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const [firstProjectKey] = projects.keys();
        const { templatePath } = getProjectContentPaths(projects.get(firstProjectKey)!, appTree);

        const template = '<div><kbq-autocomplete panelWidth="500px"></kbq-autocomplete></div>';

        appTree.overwrite(templatePath, template);

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(updatedTree.read(templatePath)?.toString()).toBe(template);
        expect(warnSpy.mock.calls.some(([msg]) => msg.includes('500px'))).toBe(true);
        expect(warnSpy.mock.calls.some(([msg]) => msg.includes('dynamic value'))).toBe(false);
    });

    it('migrates an inline template', async () => {
        const [firstProjectKey] = projects.keys();
        const { tsPath } = getProjectContentPaths(projects.get(firstProjectKey)!, appTree);

        appTree.overwrite(
            tsPath,
            "import { Component } from '@angular/core';\n" +
                '@Component({\n' +
                "    selector: 'app-root',\n" +
                '    template: \'<kbq-autocomplete panelWidth="auto"></kbq-autocomplete>\'\n' +
                '})\n' +
                'export class App {}\n'
        );

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(updatedTree.readText(tsPath)).toContain('panelWidth="fit-content"');
    });

    it('migrates an inline template in a file saved with a byte order mark', async () => {
        const [firstProjectKey] = projects.keys();
        const { tsPath } = getProjectContentPaths(projects.get(firstProjectKey)!, appTree);

        appTree.overwrite(
            tsPath,
            '\uFEFF' +
                "import { Component } from '@angular/core';\n" +
                '@Component({\n' +
                "    selector: 'app-root',\n" +
                '    template: \'<kbq-autocomplete panelWidth="auto"></kbq-autocomplete>\'\n' +
                '})\n' +
                'export class App {}\n'
        );

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(updatedTree.readText(tsPath)).toContain('panelWidth="fit-content"');
    });

    it('migrates the whole workspace under ng update, which passes no options', async () => {
        const templatePaths = [...projects.values()].map(
            (project) => getProjectContentPaths(project, appTree).templatePath
        );

        templatePaths.forEach((templatePath) =>
            appTree.overwrite(templatePath, '<kbq-autocomplete panelWidth="auto"></kbq-autocomplete>')
        );

        const updatedTree = await new SchematicTestRunner('migrations', migrationsPath).runSchematic(
            SCHEMATIC_NAME,
            {},
            appTree
        );

        expect(templatePaths.map((templatePath) => updatedTree.readText(templatePath))).toEqual(
            templatePaths.map(() => '<kbq-autocomplete panelWidth="fit-content"></kbq-autocomplete>')
        );
    });
});
