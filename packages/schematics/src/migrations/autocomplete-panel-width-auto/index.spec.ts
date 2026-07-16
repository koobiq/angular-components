import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
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

    it('should run migration for specified project', async () => {
        const [firstProjectKey] = projects.keys();

        await runner.runSchematic(SCHEMATIC_NAME, { project: firstProjectKey } satisfies Schema, appTree);
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
    });
});
