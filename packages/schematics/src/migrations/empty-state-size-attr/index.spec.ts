import { ProjectDefinitionCollection } from '@angular-devkit/core/src/workspace';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { ProjectDefinition } from '@schematics/angular/utility';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'empty-state-size-attr';

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

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const workspace = await getWorkspace(appTree);
        projects = workspace.projects as unknown as ProjectDefinitionCollection;
        projects.forEach((project) => {
            const { templatePath } = getProjectContentPaths(project);

            const template =
                '<div>' +
                '<kbq-empty-state [big]="false"></kbq-empty-state>' +
                '<kbq-empty-state [big]="true"></kbq-empty-state>' +
                '</div>';

            appTree.overwrite(templatePath, template);
        });
    });

    it('should run migration for specified project', async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const workspace = await getWorkspace(appTree);
        projects = workspace.projects as unknown as ProjectDefinitionCollection;

        const [firstProjectKey] = projects.keys();
        await runner.runSchematic(SCHEMATIC_NAME, { project: firstProjectKey } satisfies Schema, appTree);
    });

    it('should run migration for external html', async () => {
        const workspace = await getWorkspace(appTree);
        projects = workspace.projects as unknown as ProjectDefinitionCollection;

        const [firstProjectKey] = projects.keys();
        const { templatePath } = getProjectContentPaths(projects.get(firstProjectKey)!);

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey } satisfies Schema,
            appTree
        );

        expect(updatedTree.read(templatePath)?.toString()).toMatchSnapshot(`project ${firstProjectKey}: after changes`);
    });
});
