import { ProjectDefinitionCollection } from '@angular-devkit/core/src/workspace';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { ProjectDefinition, WorkspaceDefinition } from '@schematics/angular/utility';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'loader-overlay-size-attr';

const getProjectContentPaths = (project: ProjectDefinition) => {
    return {
        templatePath: `/${project.root}/src/app/app.component.html`,
        tsPath: `/${project.root}/src/app/app.component.ts`,
        stylesPath: `/${project.root}/src/styles.scss`
    };
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: ProjectDefinitionCollection;
    let workspace: WorkspaceDefinition;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });
        workspace = await getWorkspace(appTree);
        projects = workspace.projects as unknown as ProjectDefinitionCollection;
    });

    it('should run migration for specified project', async () => {
        const [firstProjectKey] = projects.keys();
        await runner.runSchematic(SCHEMATIC_NAME, { project: firstProjectKey } satisfies Schema, appTree);
    });

    it('should run migration for external html', async () => {
        const [firstProjectKey] = projects.keys();
        const { templatePath } = getProjectContentPaths(projects.get(firstProjectKey)!);

        const template =
            '<div>' +
            '<kbq-loader-overlay [compact]="false"></kbq-loader-overlay>' +
            '<kbq-loader-overlay [compact]="true"></kbq-loader-overlay>' +
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
        const { templatePath } = getProjectContentPaths(projects.get(firstProjectKey)!);

        // Set up the template with a non-static attribute value
        const nonStaticTemplate = '<div><kbq-loader-overlay [compact]="VARIABLE"></kbq-loader-overlay></div>';
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
